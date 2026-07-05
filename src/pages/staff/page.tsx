import { useState } from 'react';
import { staffMembers, allRoles, permissionLabels, permissionIcons, generatePassword } from '@/mocks/staff';
import type { StaffMember, StaffRole, PermissionSet } from '@/mocks/staff';

type DeleteStep = 'idle' | 'confirm' | 'final' | null;

export default function Staff() {
  const [staff, setStaff] = useState<StaffMember[]>(staffMembers);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('All');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState<StaffMember | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<{ member: StaffMember; step: DeleteStep } | null>(null);
  const [editPermissions, setEditPermissions] = useState<PermissionSet | null>(null);
  const [toast, setToast] = useState('');

  // Add form state
  const [addName, setAddName] = useState('');
  const [addEmail, setAddEmail] = useState('');
  const [addRole, setAddRole] = useState<StaffRole>('Waitress');
  const [generatedPwd, setGeneratedPwd] = useState('');

  const uniqueRoles = ['All', ...Array.from(new Set(staff.map(s => s.role)))];

  const filtered = staff.filter((s) => {
    const matchSearch = s.name.toLowerCase().includes(search.toLowerCase()) || s.email.toLowerCase().includes(search.toLowerCase());
    const matchRole = roleFilter === 'All' || s.role === roleFilter;
    return matchSearch && matchRole;
  });

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(''), 3000);
  };

  const handleGeneratePassword = () => {
    setGeneratedPwd(generatePassword());
  };

  const handleAddStaff = () => {
    if (!addName || !addEmail || !generatedPwd) return;
    const newMember: StaffMember = {
      id: Math.max(...staff.map(s => s.id)) + 1,
      name: addName,
      email: addEmail,
      role: addRole,
      status: 'active',
      joinedDate: new Date().toISOString().split('T')[0],
      lastLogin: new Date().toISOString(),
      generatedPassword: generatedPwd,
      firstLogin: true,
    };
    setStaff((prev) => [...prev, newMember]);
    setShowAddModal(false);
    setAddName('');
    setAddEmail('');
    setAddRole('Waitress');
    setGeneratedPwd('');
    showToast(`${addName} has been added! Generated password: ${generatedPwd}`);
  };

  const handleDeleteStaff = () => {
    if (!deleteTarget || deleteTarget.step !== 'confirm') return;
    setStaff((prev) => prev.filter((s) => s.id !== deleteTarget.member.id));
    showToast(`${deleteTarget.member.name} has been removed`);
    setDeleteTarget(null);
  };

  const openEditModal = (member: StaffMember) => {
    setShowEditModal(member);
    const roleDef = allRoles.find(r => r.role === member.role);
    setEditPermissions(roleDef ? { ...roleDef.permissions } : null);
  };

  const handleSaveEdit = () => {
    if (!showEditModal || !editPermissions) return;
    setStaff((prev) => prev.map((s) => s.id === showEditModal.id ? { ...s, role: showEditModal.role } : s));
    setShowEditModal(null);
    setEditPermissions(null);
    showToast(`${showEditModal.name}'s details updated`);
  };

  const togglePermission = (key: keyof PermissionSet) => {
    if (!editPermissions) return;
    setEditPermissions((prev) => prev ? { ...prev, [key]: !prev[key] } : null);
  };

  const getRoleColor = (role: string) => {
    if (role === 'Owner' || role === 'Manager') return 'bg-primary-50 text-primary-600 border-primary-200 dark:bg-primary-900/20 dark:text-primary-400 dark:border-primary-800/50';
    if (role.includes('Kitchen') || role === 'Cook') return 'bg-accent-50 text-accent-600 border-accent-200 dark:bg-accent-900/20 dark:text-accent-400 dark:border-accent-800/50';
    if (role === 'Accountant') return 'bg-secondary-50 text-secondary-600 border-secondary-200 dark:bg-secondary-900/20 dark:text-secondary-400 dark:border-secondary-800/50';
    return 'bg-background-100 text-foreground-600 border-background-300 dark:bg-foreground-800 dark:text-foreground-300 dark:border-foreground-700';
  };

  const getRoleIcon = (role: StaffRole): string => {
    const found = allRoles.find(r => r.role === role);
    return found ? found.icon : 'ri-user-line';
  };

  // Assign a vivid gradient per member ID (cycles through 10 palettes)
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

  const getAvatarGradient = (id: number) =>
    AVATAR_GRADIENTS[(id - 1) % AVATAR_GRADIENTS.length];

  const formatDate = (d: string) => new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

  return (
    <div className="animate-fade-in">
      {toast && (
        <div className="fixed top-20 right-6 z-50 bg-secondary-500 text-white px-5 py-3 rounded-lg shadow-lg toast-enter font-body text-sm whitespace-nowrap max-w-sm">
          <i className="ri-check-line mr-2"></i>{toast}
        </div>
      )}

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground-950 dark:text-foreground-100 font-heading">Staff Management</h1>
          <p className="text-sm text-foreground-500 dark:text-foreground-400 mt-1 font-body">Manage team members, roles, and access permissions</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="px-4 py-2.5 text-sm font-semibold rounded-lg bg-primary-500 text-white hover:bg-primary-600 transition-all cursor-pointer whitespace-nowrap font-body"
        >
          <i className="ri-user-add-line mr-1.5"></i>Add Staff
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
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
        <select
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
          className="px-4 py-2.5 text-sm rounded-lg border border-background-200 dark:border-foreground-800 bg-white dark:bg-foreground-900 text-foreground-900 dark:text-foreground-100 focus:outline-none focus:ring-2 focus:ring-primary-500/30 cursor-pointer font-body"
        >
          {uniqueRoles.map((r) => (
            <option key={r} value={r}>{r === 'All' ? 'All Roles' : r}</option>
          ))}
        </select>
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
                  {/* Colorful gradient avatar */}
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
                <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold border font-body whitespace-nowrap ${member.status === 'active' ? 'bg-secondary-50 text-secondary-600 border-secondary-200 dark:bg-secondary-900/20 dark:text-secondary-400 dark:border-secondary-800/50' : 'bg-foreground-100 text-foreground-400 border-foreground-200 dark:bg-foreground-800 dark:text-foreground-500 dark:border-foreground-700'}`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${member.status === 'active' ? 'bg-secondary-500' : 'bg-foreground-400'}`}></span>
                  {member.status.charAt(0).toUpperCase() + member.status.slice(1)}
                </span>
              </div>

              <div className="flex items-center gap-2 mb-3">
                <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold border font-body ${getRoleColor(member.role)}`}>
                  <i className={`${getRoleIcon(member.role as StaffRole)} text-xs`}></i>
                  {member.role}
                </span>
              </div>

              <div className="flex items-center gap-4 mb-4 text-xs text-foreground-400 font-body">
                <span>Joined {formatDate(member.joinedDate)}</span>
                <span>Last login: {new Date(member.lastLogin).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}</span>
              </div>

              {member.generatedPassword && member.firstLogin && (
                <div className="mb-4 p-2.5 rounded-lg bg-accent-50 dark:bg-accent-900/20 border border-accent-200 dark:border-accent-800/50">
                  <p className="text-xs font-semibold text-accent-700 dark:text-accent-300 font-body mb-1">Temporary Password</p>
                  <p className="text-sm font-mono text-foreground-900 dark:text-foreground-100 break-all">{member.generatedPassword}</p>
                  <p className="text-[10px] text-accent-600 dark:text-accent-400 mt-1 font-body">Share this with {member.name.split(' ')[0]}. They will be prompted to change it on first login.</p>
                </div>
              )}

              <div className="flex items-center gap-2">
                <button
                  onClick={() => openEditModal(member)}
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
              </div>
            </div>
          ))
        )}
      </div>

      {/* Add Staff Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-start justify-center p-4 pt-[10vh]">
          <div className="absolute inset-0 bg-black/40 modal-backdrop" onClick={() => { setShowAddModal(false); setGeneratedPwd(''); }}></div>
          <div className="relative bg-white dark:bg-foreground-900 rounded-2xl p-6 w-full max-w-md shadow-xl animate-scale-in max-h-[85vh] overflow-y-auto">
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
                <label className="block text-xs font-semibold text-foreground-600 dark:text-foreground-300 mb-1.5 font-body">Role</label>
                <select
                  value={addRole}
                  onChange={(e) => setAddRole(e.target.value as StaffRole)}
                  className="w-full px-4 py-2.5 text-sm rounded-lg border border-background-200 dark:border-foreground-800 bg-white dark:bg-foreground-900 text-foreground-900 dark:text-foreground-100 focus:outline-none focus:ring-2 focus:ring-primary-500/30 cursor-pointer font-body"
                >
                  {allRoles.map((r) => (
                    <option key={r.role} value={r.role}>{r.label}</option>
                  ))}
                </select>
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

              <p className="text-xs text-foreground-400 font-body">
                The staff member will be prompted to change this password on their first login.
              </p>
            </div>

            <div className="flex gap-3 mt-6">
              <button onClick={() => { setShowAddModal(false); setGeneratedPwd(''); }} className="flex-1 px-4 py-2.5 text-sm font-semibold rounded-lg border border-background-200 dark:border-foreground-800 text-foreground-600 dark:text-foreground-300 hover:bg-background-50 dark:hover:bg-foreground-800 transition-all cursor-pointer whitespace-nowrap font-body">Cancel</button>
              <button onClick={handleAddStaff} disabled={!addName || !addEmail || !generatedPwd} className="flex-1 px-4 py-2.5 text-sm font-semibold rounded-lg bg-primary-500 text-white hover:bg-primary-600 disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer whitespace-nowrap font-body">Add Staff</button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Staff Modal */}
      {showEditModal && editPermissions && (
        <div className="fixed inset-0 z-50 flex items-start justify-center p-4 pt-[8vh]">
          <div className="absolute inset-0 bg-black/40 modal-backdrop" onClick={() => { setShowEditModal(null); setEditPermissions(null); }}></div>
          <div className="relative bg-white dark:bg-foreground-900 rounded-2xl p-6 w-full max-w-lg shadow-xl animate-scale-in max-h-[88vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-lg font-bold text-foreground-950 dark:text-foreground-100 font-heading">Edit Staff Member</h3>
              <button onClick={() => { setShowEditModal(null); setEditPermissions(null); }} className="w-8 h-8 rounded-lg flex items-center justify-center text-foreground-400 hover:bg-background-100 dark:hover:bg-foreground-800 transition-all cursor-pointer">
                <i className="ri-close-line"></i>
              </button>
            </div>

            <div className="space-y-4 mb-6">
              {/* Colorful avatar preview in modal */}
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
                <label className="block text-xs font-semibold text-foreground-600 dark:text-foreground-300 mb-1.5 font-body">Name</label>
                <input type="text" value={showEditModal.name} readOnly className="w-full px-4 py-2.5 text-sm rounded-lg border border-background-200 dark:border-foreground-800 bg-background-50 dark:bg-foreground-800/50 text-foreground-900 dark:text-foreground-100 font-body cursor-not-allowed" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-foreground-600 dark:text-foreground-300 mb-1.5 font-body">Email</label>
                <input type="email" value={showEditModal.email} readOnly className="w-full px-4 py-2.5 text-sm rounded-lg border border-background-200 dark:border-foreground-800 bg-background-50 dark:bg-foreground-800/50 text-foreground-900 dark:text-foreground-100 font-body cursor-not-allowed" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-foreground-600 dark:text-foreground-300 mb-1.5 font-body">Role</label>
                <select
                  value={showEditModal.role}
                  onChange={(e) => {
                    const newRole = e.target.value as StaffRole;
                    setShowEditModal({ ...showEditModal, role: newRole });
                    const roleDef = allRoles.find(r => r.role === newRole);
                    setEditPermissions(roleDef ? { ...roleDef.permissions } : null);
                  }}
                  className="w-full px-4 py-2.5 text-sm rounded-lg border border-background-200 dark:border-foreground-800 bg-white dark:bg-foreground-900 text-foreground-900 dark:text-foreground-100 focus:outline-none focus:ring-2 focus:ring-primary-500/30 cursor-pointer font-body"
                >
                  {allRoles.map((r) => (
                    <option key={r.role} value={r.role}>{r.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-foreground-600 dark:text-foreground-300 mb-1.5 font-body">Status</label>
                <select
                  value={showEditModal.status}
                  onChange={(e) => setShowEditModal({ ...showEditModal, status: e.target.value as 'active' | 'inactive' })}
                  className="w-full px-4 py-2.5 text-sm rounded-lg border border-background-200 dark:border-foreground-800 bg-white dark:bg-foreground-900 text-foreground-900 dark:text-foreground-100 focus:outline-none focus:ring-2 focus:ring-primary-500/30 cursor-pointer font-body"
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
            </div>

            {/* Permission Toggles */}
            <div className="mb-6">
              <h4 className="text-sm font-bold text-foreground-900 dark:text-foreground-100 font-heading mb-3">Feature Permissions</h4>
              <p className="text-xs text-foreground-400 mb-3 font-body">Toggle which features this staff member can access. Role presets will be overridden by manual changes.</p>
              <div className="space-y-1.5">
                {(Object.keys(editPermissions) as Array<keyof PermissionSet>).map((key) => (
                  <label key={key} className="flex items-center justify-between py-2 px-3 rounded-lg hover:bg-background-50 dark:hover:bg-foreground-800/50 cursor-pointer transition-colors">
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-md bg-background-100 dark:bg-foreground-800 flex items-center justify-center">
                        <i className={`${permissionIcons[key]} text-xs text-foreground-500`}></i>
                      </div>
                      <span className="text-sm text-foreground-700 dark:text-foreground-300 font-body">{permissionLabels[key]}</span>
                    </div>
                    <button
                      type="button"
                      onClick={(e) => { e.preventDefault(); togglePermission(key); }}
                      className={`relative w-10 h-5 rounded-full transition-all cursor-pointer ${editPermissions[key] ? 'bg-primary-500' : 'bg-foreground-300 dark:bg-foreground-700'}`}
                    >
                      <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow-sm transition-all ${editPermissions[key] ? 'left-5' : 'left-0.5'}`}></span>
                    </button>
                  </label>
                ))}
              </div>
            </div>

            <div className="flex gap-3">
              <button onClick={() => { setShowEditModal(null); setEditPermissions(null); }} className="flex-1 px-4 py-2.5 text-sm font-semibold rounded-lg border border-background-200 dark:border-foreground-800 text-foreground-600 dark:text-foreground-300 hover:bg-background-50 dark:hover:bg-foreground-800 transition-all cursor-pointer whitespace-nowrap font-body">Cancel</button>
              <button onClick={handleSaveEdit} className="flex-1 px-4 py-2.5 text-sm font-semibold rounded-lg bg-primary-500 text-white hover:bg-primary-600 transition-all cursor-pointer whitespace-nowrap font-body">Save Changes</button>
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
              <button onClick={handleDeleteStaff} className="flex-1 px-4 py-2.5 text-sm font-semibold rounded-lg bg-red-600 text-white hover:bg-red-700 transition-all cursor-pointer whitespace-nowrap font-body">Permanently Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}