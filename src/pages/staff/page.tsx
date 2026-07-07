import { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import PageHeader from '@/components/base/PageHeader';
import PageSkeleton from '@/components/base/PageSkeleton';
import CustomSelect from '@/components/base/CustomSelect';
import { useAuth } from '@/contexts/AuthContext';
import { useRefresh } from '@/contexts/RefreshContext';
import { useOnboarding } from '@/contexts/OnboardingContext';
import { apiClient } from '@/api/client';

export type StaffRole = 'OWNER' | 'MANAGER' | 'STAFF';

export interface StaffMember {
  id: string;
  name: string;
  email: string;
  role: StaffRole;
  status: 'ACTIVE' | 'INACTIVE';
  createdAt: string;
  lastLoginAt: string | null;
}

type DeleteStep = 'idle' | 'confirm' | 'final' | null;

export default function Staff() {
  const { user } = useAuth();
  const { isRefreshing } = useRefresh();
  const { markStepComplete } = useOnboarding();
  const isManager = user?.role === 'MANAGER';
  const queryClient = useQueryClient();

  const { data: staff = [], isLoading } = useQuery<StaffMember[]>({
    queryKey: ['staff'],
    queryFn: async () => {
      const res = await apiClient.get('/staff');
      return res.data;
    }
  });

  const assignableRoles = isManager 
    ? [{ label: 'Staff', value: 'STAFF' }] 
    : [
        { label: 'Manager', value: 'MANAGER' },
        { label: 'Staff', value: 'STAFF' }
      ];

  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('All');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState<StaffMember | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<{ member: StaffMember; step: DeleteStep } | null>(null);
  const [toast, setToast] = useState('');

  // Add form state
  const [addName, setAddName] = useState('');
  const [addEmail, setAddEmail] = useState('');
  const [addRole, setAddRole] = useState<StaffRole>('STAFF');
  const [addPhone, setAddPhone] = useState('');
  const [generatedPwd, setGeneratedPwd] = useState('');
  const [newStaffCredentials, setNewStaffCredentials] = useState<{ name: string; email: string; password: string } | null>(null);
  const [pwdCopied, setPwdCopied] = useState(false);

  const uniqueRoles = ['All', 'OWNER', 'MANAGER', 'STAFF'];

  const filtered = useMemo(() => {
    return staff.filter((s) => {
      const matchSearch = s.name.toLowerCase().includes(search.toLowerCase()) || s.email.toLowerCase().includes(search.toLowerCase());
      const matchRole = roleFilter === 'All' || s.role === roleFilter;
      return matchSearch && matchRole;
    });
  }, [staff, search, roleFilter]);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(''), 3000);
  };

  const generatePassword = () => {
    const chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*";
    return Array.from(crypto.getRandomValues(new Uint32Array(10)))
      .map((x) => chars[x % chars.length])
      .join('');
  };

  const handleGeneratePassword = () => {
    setGeneratedPwd(generatePassword());
  };

  const createStaffMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await apiClient.post('/staff', data);
      return res.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['staff'] });
      setShowAddModal(false);
      setNewStaffCredentials({ name: variables.name, email: variables.email, password: variables.password });
      setAddName('');
      setAddEmail('');
      setAddPhone('');
      setAddRole('STAFF');
      setGeneratedPwd('');
      markStepComplete('invite_staff');
    },
    onError: (error: any) => {
      showToast(error.response?.data?.error || 'Failed to create staff');
    }
  });

  const handleAddStaff = () => {
    if (!addName || !addEmail || !generatedPwd) return;
    createStaffMutation.mutate({
      name: addName,
      email: addEmail,
      phone: addPhone || '0000000000',
      password: generatedPwd,
      role: addRole
    });
  };

  const deleteStaffMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiClient.delete(`/staff/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['staff'] });
      showToast(`Staff removed successfully`);
      setDeleteTarget(null);
    },
    onError: (error: any) => {
      showToast(error.response?.data?.error || 'Failed to delete staff');
    }
  });

  const handleDeleteStaff = () => {
    if (!deleteTarget || deleteTarget.step !== 'confirm') return;
    deleteStaffMutation.mutate(deleteTarget.member.id);
  };

  const updateStatusMutation = useMutation({
    mutationFn: async (data: { id: string, status: 'ACTIVE' | 'INACTIVE' }) => {
      await apiClient.patch(`/staff/${data.id}/status`, { status: data.status });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['staff'] });
      showToast(`Staff status updated`);
      setShowEditModal(null);
    },
    onError: (error: any) => {
      showToast(error.response?.data?.error || 'Failed to update status');
    }
  });

  const handleSaveEdit = () => {
    if (!showEditModal) return;
    updateStatusMutation.mutate({ id: showEditModal.id, status: showEditModal.status });
  };

  const getRoleColor = (role: string) => {
    if (role === 'OWNER') return 'bg-primary-50 text-primary-600 border-primary-200 dark:bg-primary-900/20 dark:text-primary-400 dark:border-primary-800/50';
    if (role === 'MANAGER') return 'bg-accent-50 text-accent-600 border-accent-200 dark:bg-accent-900/20 dark:text-accent-400 dark:border-accent-800/50';
    return 'bg-secondary-50 text-secondary-600 border-secondary-200 dark:bg-secondary-900/20 dark:text-secondary-400 dark:border-secondary-800/50';
  };

  const getRoleIcon = (role: StaffRole): string => {
    if (role === 'OWNER') return 'ri-vip-crown-line';
    if (role === 'MANAGER') return 'ri-user-star-line';
    return 'ri-user-line';
  };

  const AVATAR_GRADIENTS = [
    'from-primary-400 to-primary-600',
    'from-violet-400 to-purple-600',
    'from-teal-400 to-cyan-600',
    'from-rose-400 to-pink-600',
    'from-amber-400 to-orange-600',
    'from-indigo-400 to-blue-600',
    'from-emerald-400 to-green-600',
    'from-fuchsia-400 to-accent-600',
    'from-sky-400 to-blue-500',
    'from-red-400 to-rose-600',
  ];

  const getAvatarGradient = (id: string) => {
    const hash = id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return AVATAR_GRADIENTS[hash % AVATAR_GRADIENTS.length];
  };

  const formatDate = (d: string) => new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

  if (isRefreshing || isLoading) return <PageSkeleton />;

  return (
    <div className="flex flex-col gap-6 animate-fade-in">
      {toast && (
        <div className="fixed top-20 right-6 z-[100] bg-secondary-500 text-white px-5 py-3 rounded-lg shadow-lg toast-enter font-body text-sm whitespace-nowrap max-w-sm">
          <i className="ri-check-line mr-2"></i>{toast}
        </div>
      )}

      <PageHeader
        title="Staff Management"
        description="Manage team members, roles, and access permissions"
      >
        <button
          onClick={() => setShowAddModal(true)}
          className="px-4 py-2.5 text-sm font-semibold rounded-lg bg-primary-500 text-white hover:bg-primary-600 transition-all cursor-pointer whitespace-nowrap font-body"
        >
          <i className="ri-user-add-line mr-1.5"></i>Add Staff
        </button>
      </PageHeader>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 max-w-sm">
          <i className="ri-search-line absolute left-3 top-1/2 -translate-y-1/2 text-foreground-400 text-sm"></i>
          <input
            type="text"
            placeholder="Search by name or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 text-sm rounded-lg border border-background-200 dark:border-foreground-800 bg-white dark:bg-foreground-900 text-foreground-900 dark:text-foreground-100 placeholder:text-foreground-400 focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-400 font-body transition-all"
          />
        </div>
        <div className="w-full sm:w-48">
          <CustomSelect
            value={roleFilter}
            onChange={(val) => setRoleFilter(val)}
            options={uniqueRoles.map(r => ({ label: r === 'All' ? 'All Roles' : r, value: r }))}
          />
        </div>
      </div>

      {/* Staff Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {filtered.length === 0 ? (
          <div className="col-span-full flex flex-col items-center justify-center py-16 bg-white dark:bg-foreground-900 rounded-xl border border-background-200 dark:border-foreground-800">
            <div className="w-16 h-16 rounded-2xl bg-background-100 dark:bg-foreground-800 flex items-center justify-center mb-4">
              <i className="ri-team-line text-2xl text-foreground-400"></i>
            </div>
            <p className="text-sm font-medium text-foreground-400 font-body">No staff members found</p>
          </div>
        ) : (
          filtered.map((member, i) => (
            <div
              key={member.id}
              className={`stagger-${Math.min(i + 1, 8)} bg-white dark:bg-foreground-900 rounded-xl border border-background-200 dark:border-foreground-800 p-5 hover-lift`}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className={`w-11 h-11 rounded-full bg-gradient-to-br ${getAvatarGradient(member.id)} flex items-center justify-center flex-shrink-0 shadow-md`}>
                    <span className="text-sm font-bold text-white font-heading drop-shadow">
                      {member.name.split(' ').map(n => n[0]).join('')}
                    </span>
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-bold text-foreground-950 dark:text-foreground-100 font-body truncate">{member.name}</p>
                    <p className="text-xs text-foreground-400 font-body truncate">{member.email}</p>
                  </div>
                </div>
                <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold border font-body whitespace-nowrap ${member.status === 'ACTIVE' ? 'bg-secondary-50 text-secondary-600 border-secondary-200 dark:bg-secondary-900/20 dark:text-secondary-400 dark:border-secondary-800/50' : 'bg-foreground-100 text-foreground-400 border-foreground-200 dark:bg-foreground-800 dark:text-foreground-500 dark:border-foreground-700'}`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${member.status === 'ACTIVE' ? 'bg-secondary-500' : 'bg-foreground-400'}`}></span>
                  {member.status.charAt(0).toUpperCase() + member.status.slice(1).toLowerCase()}
                </span>
              </div>

              <div className="flex items-center gap-2 mb-3">
                <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold border font-body ${getRoleColor(member.role)}`}>
                  <i className={`${getRoleIcon(member.role)} text-xs`}></i>
                  {member.role}
                </span>
              </div>

              <div className="flex items-center gap-4 mb-4 text-xs text-foreground-400 font-body">
                <span>Joined {formatDate(member.createdAt)}</span>
                <span>Last login: {member.lastLoginAt ? new Date(member.lastLoginAt).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) : 'Never'}</span>
              </div>

              <div className="flex items-center gap-2">
                {(!isManager || (member.role !== 'OWNER' && member.role !== 'MANAGER')) ? (
                  <>
                    <button
                      onClick={() => setShowEditModal(member)}
                      className="flex-1 px-3 py-2 text-xs font-semibold rounded-lg bg-background-100 dark:bg-foreground-800 text-foreground-600 dark:text-foreground-300 hover:bg-background-200 dark:hover:bg-foreground-700 transition-all cursor-pointer whitespace-nowrap font-body"
                    >
                      <i className="ri-edit-line mr-1"></i>Edit
                    </button>
                    <button
                      onClick={() => setDeleteTarget({ member, step: 'confirm' })}
                      className="px-3 py-2 text-xs font-semibold rounded-lg bg-red-50 text-red-600 hover:bg-red-100 dark:bg-red-900/20 dark:text-red-400 dark:hover:bg-red-900/40 transition-all cursor-pointer whitespace-nowrap font-body"
                    >
                      <i className="ri-delete-bin-line mr-1"></i>Delete
                    </button>
                  </>
                ) : (
                  <div className="flex-1 px-3 py-2 text-xs font-semibold rounded-lg bg-background-50 dark:bg-foreground-800/50 text-foreground-400 text-center font-body cursor-not-allowed border border-background-200 dark:border-foreground-700">
                    <i className="ri-lock-line mr-1"></i>Restricted
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Add Staff Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-start justify-center p-4 pt-[10vh]">
          <div className="absolute inset-0 bg-black/40 modal-backdrop" onClick={() => { setShowAddModal(false); setGeneratedPwd(''); }}></div>
          <div className="relative bg-white dark:bg-foreground-900 rounded-2xl p-6 w-full max-w-lg shadow-xl animate-scale-in max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-lg font-bold text-foreground-950 dark:text-foreground-100 font-heading">Add New Staff</h3>
              <button onClick={() => { setShowAddModal(false); setGeneratedPwd(''); }} className="w-8 h-8 rounded-lg flex items-center justify-center text-foreground-400 hover:bg-background-100 dark:hover:bg-foreground-800 transition-all cursor-pointer">
                <i className="ri-close-line"></i>
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-foreground-600 dark:text-foreground-300 mb-1.5 font-body">Full Name</label>
                <input
                  type="text"
                  value={addName}
                  onChange={(e) => setAddName(e.target.value)}
                  className="w-full px-4 py-2.5 text-sm rounded-lg border border-background-200 dark:border-foreground-800 bg-white dark:bg-foreground-900 text-foreground-900 dark:text-foreground-100 focus:outline-none focus:ring-2 focus:ring-primary-500/30 font-body"
                  placeholder="e.g. Adwoa Mensah"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-foreground-600 dark:text-foreground-300 mb-1.5 font-body">Email Address</label>
                <input
                  type="email"
                  value={addEmail}
                  onChange={(e) => setAddEmail(e.target.value)}
                  className="w-full px-4 py-2.5 text-sm rounded-lg border border-background-200 dark:border-foreground-800 bg-white dark:bg-foreground-900 text-foreground-900 dark:text-foreground-100 focus:outline-none focus:ring-2 focus:ring-primary-500/30 font-body"
                  placeholder="e.g. adwoa@platera.app"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-foreground-600 dark:text-foreground-300 mb-1.5 font-body">Phone (optional)</label>
                <input
                  type="text"
                  value={addPhone}
                  onChange={(e) => setAddPhone(e.target.value)}
                  className="w-full px-4 py-2.5 text-sm rounded-lg border border-background-200 dark:border-foreground-800 bg-white dark:bg-foreground-900 text-foreground-900 dark:text-foreground-100 focus:outline-none focus:ring-2 focus:ring-primary-500/30 font-body"
                  placeholder="e.g. 0501234567"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-foreground-600 dark:text-foreground-300 mb-1.5 font-body">Role</label>
                <CustomSelect
                  value={addRole}
                  onChange={(val) => setAddRole(val as StaffRole)}
                  options={assignableRoles}
                />
              </div>

              <div className="p-4 rounded-xl bg-background-50 dark:bg-foreground-800/50 border border-background-200 dark:border-foreground-800">
                <p className="text-xs font-semibold text-foreground-600 dark:text-foreground-300 mb-2 font-body">Temporary Password</p>
                {generatedPwd ? (
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <code className="flex-1 px-3 py-2 bg-white dark:bg-foreground-900 rounded-lg text-sm font-mono text-foreground-900 dark:text-foreground-100 border border-background-200 dark:border-foreground-700 break-all">
                        {generatedPwd}
                      </code>
                      <button
                        onClick={() => { navigator.clipboard.writeText(generatedPwd); showToast('Password copied!'); }}
                        className="px-3 py-2 text-xs font-semibold rounded-lg bg-background-200 dark:bg-foreground-700 text-foreground-600 dark:text-foreground-300 hover:bg-background-300 transition-all cursor-pointer whitespace-nowrap font-body"
                      >
                        <i className="ri-file-copy-line"></i>
                      </button>
                    </div>
                    <button onClick={handleGeneratePassword} className="text-xs text-primary-500 hover:text-primary-600 font-semibold cursor-pointer font-body whitespace-nowrap">
                      <i className="ri-refresh-line mr-1"></i>Generate New Password
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={handleGeneratePassword}
                    className="px-4 py-2 text-sm font-semibold rounded-lg bg-primary-500 text-white hover:bg-primary-600 transition-all cursor-pointer whitespace-nowrap font-body"
                  >
                    <i className="ri-key-2-line mr-1.5"></i>Generate Password
                  </button>
                )}
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button onClick={() => { setShowAddModal(false); setGeneratedPwd(''); }} className="flex-1 px-4 py-2.5 text-sm font-semibold rounded-lg border border-background-200 dark:border-foreground-800 text-foreground-600 dark:text-foreground-300 hover:bg-background-50 dark:hover:bg-foreground-800 transition-all cursor-pointer whitespace-nowrap font-body">Cancel</button>
              <button onClick={handleAddStaff} disabled={!addName || !addEmail || !generatedPwd || createStaffMutation.isPending} className="flex-1 px-4 py-2.5 text-sm font-semibold rounded-lg bg-primary-500 text-white hover:bg-primary-600 disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer whitespace-nowrap font-body">
                {createStaffMutation.isPending ? 'Adding...' : 'Add Staff'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Staff Modal */}
      {showEditModal && (
        <div className="fixed inset-0 z-50 flex items-start justify-center p-4 pt-[8vh]">
          <div className="absolute inset-0 bg-black/40 modal-backdrop" onClick={() => setShowEditModal(null)}></div>
          <div className="relative bg-white dark:bg-foreground-900 rounded-2xl p-6 w-full max-w-lg shadow-xl animate-scale-in max-h-[88vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-lg font-bold text-foreground-950 dark:text-foreground-100 font-heading">Edit Staff Member</h3>
              <button onClick={() => setShowEditModal(null)} className="w-8 h-8 rounded-lg flex items-center justify-center text-foreground-400 hover:bg-background-100 dark:hover:bg-foreground-800 transition-all cursor-pointer">
                <i className="ri-close-line"></i>
              </button>
            </div>

            <div className="space-y-4 mb-6">
              <div className="flex items-center gap-3 p-3 rounded-xl bg-background-50 dark:bg-foreground-800/50 border border-background-200 dark:border-foreground-800">
                <div className={`w-12 h-12 rounded-full bg-gradient-to-br ${getAvatarGradient(showEditModal.id)} flex items-center justify-center flex-shrink-0 shadow-md`}>
                  <span className="text-base font-bold text-white font-heading drop-shadow">
                    {showEditModal.name.split(' ').map(n => n[0]).join('')}
                  </span>
                </div>
                <div>
                  <p className="text-sm font-bold text-foreground-900 dark:text-foreground-100 font-body">{showEditModal.name}</p>
                  <p className="text-xs text-foreground-400 font-body">{showEditModal.email}</p>
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-foreground-600 dark:text-foreground-300 mb-1.5 font-body">Status</label>
                <CustomSelect
                  value={showEditModal.status}
                  onChange={(val) => setShowEditModal({ ...showEditModal, status: val as 'ACTIVE' | 'INACTIVE' })}
                  options={[
                    { label: 'Active', value: 'ACTIVE' },
                    { label: 'Inactive', value: 'INACTIVE' }
                  ]}
                />
              </div>
            </div>

            <div className="flex gap-3 mt-4">
              <button onClick={() => setShowEditModal(null)} className="flex-1 px-4 py-2.5 text-sm font-semibold rounded-lg border border-background-200 dark:border-foreground-800 text-foreground-600 dark:text-foreground-300 hover:bg-background-50 dark:hover:bg-foreground-800 transition-all cursor-pointer whitespace-nowrap font-body">Cancel</button>
              <button onClick={handleSaveEdit} disabled={updateStatusMutation.isPending} className="flex-1 px-4 py-2.5 text-sm font-semibold rounded-lg bg-primary-500 text-white hover:bg-primary-600 transition-all cursor-pointer whitespace-nowrap font-body">
                {updateStatusMutation.isPending ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal - Step 1: Initial confirm */}
      {deleteTarget && deleteTarget.step === 'confirm' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40 modal-backdrop" onClick={() => setDeleteTarget(null)}></div>
          <div className="relative bg-white dark:bg-foreground-900 rounded-2xl p-6 w-full max-w-sm shadow-xl animate-scale-in">
            <div className="flex flex-col items-center text-center mb-5">
              <div className="w-14 h-14 rounded-2xl bg-red-50 dark:bg-red-900/20 flex items-center justify-center mb-4">
                <i className="ri-delete-bin-line text-2xl text-red-500"></i>
              </div>
              <h3 className="text-lg font-bold text-foreground-950 dark:text-foreground-100 font-heading">Delete Staff Member?</h3>
              <p className="text-sm text-foreground-500 mt-1 font-body">
                Are you sure you want to remove <strong className="text-foreground-800 dark:text-foreground-200">{deleteTarget.member.name}</strong>? This action cannot be undone.
              </p>
            </div>
            <div className="flex gap-3">
              <button onClick={() => setDeleteTarget(null)} className="flex-1 px-4 py-2.5 text-sm font-semibold rounded-lg border border-background-200 dark:border-foreground-800 text-foreground-600 dark:text-foreground-300 hover:bg-background-50 dark:hover:bg-foreground-800 transition-all cursor-pointer whitespace-nowrap font-body">Cancel</button>
              <button onClick={() => setDeleteTarget({ ...deleteTarget, step: 'final' })} className="flex-1 px-4 py-2.5 text-sm font-semibold rounded-lg bg-red-500 text-white hover:bg-red-600 transition-all cursor-pointer whitespace-nowrap font-body">Yes, Delete</button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal - Step 2: Final double-confirm */}
      {deleteTarget && deleteTarget.step === 'final' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40 modal-backdrop" onClick={() => setDeleteTarget(null)}></div>
          <div className="relative bg-white dark:bg-foreground-900 rounded-2xl p-6 w-full max-w-sm shadow-xl animate-scale-in">
            <div className="flex flex-col items-center text-center mb-5">
              <div className="w-14 h-14 rounded-2xl bg-red-100 dark:bg-red-900/30 flex items-center justify-center mb-4 critical-pulse">
                <i className="ri-error-warning-line text-2xl text-red-600"></i>
              </div>
              <h3 className="text-lg font-bold text-red-600 dark:text-red-400 font-heading">Final Confirmation</h3>
              <p className="text-sm text-foreground-500 mt-1 font-body">
                This is your last chance. Deleting <strong className="text-foreground-800 dark:text-foreground-200">{deleteTarget.member.name}</strong> will permanently remove their account, access, and all associated data.
              </p>
            </div>
            <div className="flex gap-3">
              <button onClick={() => setDeleteTarget(null)} className="flex-1 px-4 py-2.5 text-sm font-semibold rounded-lg border border-background-200 dark:border-foreground-800 text-foreground-600 dark:text-foreground-300 hover:bg-background-50 dark:hover:bg-foreground-800 transition-all cursor-pointer whitespace-nowrap font-body">Cancel</button>
              <button onClick={handleDeleteStaff} disabled={deleteStaffMutation.isPending} className="flex-1 px-4 py-2.5 text-sm font-semibold rounded-lg bg-red-600 text-white hover:bg-red-700 disabled:opacity-50 transition-all cursor-pointer whitespace-nowrap font-body">
                {deleteStaffMutation.isPending ? 'Deleting...' : 'Permanently Delete'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Staff Added Success Modal */}
      {newStaffCredentials && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40 modal-backdrop"></div>
          <div className="relative bg-white dark:bg-foreground-900 rounded-2xl p-6 w-full max-w-sm shadow-xl animate-scale-in">
            <div className="flex flex-col items-center text-center mb-5">
              <div className="w-14 h-14 rounded-2xl bg-secondary-50 dark:bg-secondary-900/20 flex items-center justify-center mb-4">
                <i className="ri-user-add-line text-2xl text-secondary-500"></i>
              </div>
              <h3 className="text-lg font-bold text-foreground-950 dark:text-foreground-100 font-heading">Staff Member Added!</h3>
              <p className="text-sm text-foreground-500 mt-1 font-body">
                <strong className="text-foreground-800 dark:text-foreground-200">{newStaffCredentials.name}</strong> has been added. Share their login credentials securely.
              </p>
            </div>

            <div className="space-y-3 mb-5">
              <div className="bg-background-50 dark:bg-foreground-800 rounded-lg p-3">
                <p className="text-xs font-semibold text-foreground-500 dark:text-foreground-400 uppercase tracking-wider font-body mb-1">Email</p>
                <p className="text-sm font-mono text-foreground-900 dark:text-foreground-100">{newStaffCredentials.email}</p>
              </div>
              <div className="bg-background-50 dark:bg-foreground-800 rounded-lg p-3">
                <p className="text-xs font-semibold text-foreground-500 dark:text-foreground-400 uppercase tracking-wider font-body mb-1">Temporary Password</p>
                <div className="flex items-center justify-between gap-2">
                  <p className="text-sm font-mono font-bold text-foreground-900 dark:text-foreground-100 tracking-widest">{newStaffCredentials.password}</p>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(newStaffCredentials.password);
                      setPwdCopied(true);
                      setTimeout(() => setPwdCopied(false), 2000);
                    }}
                    className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${pwdCopied ? 'bg-secondary-500 text-white' : 'bg-white dark:bg-foreground-700 border border-background-200 dark:border-foreground-600 text-foreground-600 dark:text-foreground-300 hover:bg-background-50 dark:hover:bg-foreground-600'}`}
                  >
                    <i className={pwdCopied ? 'ri-check-line' : 'ri-clipboard-line'}></i>
                    {pwdCopied ? 'Copied!' : 'Copy'}
                  </button>
                </div>
              </div>
            </div>

            <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800/50 rounded-lg px-3 py-2.5 mb-5 flex gap-2">
              <i className="ri-alert-line text-amber-600 dark:text-amber-400 text-sm flex-shrink-0 mt-0.5"></i>
              <p className="text-xs text-amber-700 dark:text-amber-300 font-body">
                This password will not be shown again.
              </p>
            </div>

            <button
              onClick={() => setNewStaffCredentials(null)}
              className="w-full px-4 py-2.5 text-sm font-semibold rounded-lg bg-primary-500 text-white hover:bg-primary-600 transition-all cursor-pointer font-body"
            >
              Done
            </button>
          </div>
        </div>
      )}
    </div>
  );
}