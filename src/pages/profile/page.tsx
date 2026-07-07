import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import PageSkeleton from '@/components/base/PageSkeleton';
import { useRefresh } from '@/contexts/RefreshContext';
import { useAuth } from '@/contexts/AuthContext';
import { apiClient } from '@/api/client';

export default function MyProfile() {
  const { isRefreshing } = useRefresh();
  const { user } = useAuth();
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [toast, setToast] = useState('');

  const { data: activityLog = [], isLoading: isActivityLoading } = useQuery<any[]>({
    queryKey: ['profile-activity'],
    queryFn: async () => {
      const res = await apiClient.get('/audit-logs');
      return res.data.slice(0, 5);
    },
    enabled: user?.role === 'OWNER',
    retry: false,
  });

  const profileData = {
    name: user?.name ?? 'Unknown User',
    email: user?.email ?? '',
    role: user?.role ?? 'STAFF',
    avatar: (user?.name ?? 'U').split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase(),
  };

  const showToast = (message: string) => {
    setToast(message);
    setTimeout(() => setToast(''), 3000);
  };

  const handleChangePassword = () => {
    if (!oldPassword || !newPassword || !confirmPassword) {
      showToast('Please fill in all password fields');
      return;
    }
    if (newPassword !== confirmPassword) {
      showToast('New passwords do not match');
      return;
    }
    if (newPassword.length < 8) {
      showToast('Password must be at least 8 characters');
      return;
    }
    showToast('Password change API is not available yet');
    setShowPasswordModal(false);
    setOldPassword('');
    setNewPassword('');
    setConfirmPassword('');
  };

  const formatDateTime = (value: string) => {
    const date = new Date(value);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) + ' at ' + date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  };

  if (isRefreshing) return <PageSkeleton />;

  return (
    <div className="animate-fade-in">
      {toast && (
        <div className={`fixed top-20 right-6 z-50 px-5 py-3 rounded-lg shadow-lg toast-enter font-body text-sm whitespace-nowrap ${toast.includes('success') || toast.includes('updated') ? 'bg-secondary-500 text-white' : 'bg-red-500 text-white'}`}>
          <i className={`mr-2 ${toast.includes('success') || toast.includes('updated') ? 'ri-check-line' : 'ri-error-warning-line'}`}></i>{toast}
        </div>
      )}

      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground-950 dark:text-foreground-100 font-heading">My Profile</h1>
        <p className="text-sm text-foreground-500 dark:text-foreground-400 mt-1 font-body">Manage your personal account settings and security</p>
      </div>

      <div className="bg-white dark:bg-foreground-900 rounded-xl border border-background-200 dark:border-foreground-800 p-6 mb-6">
        <div className="flex flex-col sm:flex-row items-start gap-5 mb-6 pb-6 border-b border-background-200 dark:border-foreground-800">
          <div className="w-20 h-20 rounded-2xl bg-primary-500 flex items-center justify-center flex-shrink-0">
            <span className="text-white text-2xl font-bold font-heading">{profileData.avatar}</span>
          </div>
          <div className="flex-1">
            <h2 className="text-xl font-bold text-foreground-950 dark:text-foreground-100 font-heading">{profileData.name}</h2>
            <p className="text-sm text-foreground-400 font-body">{profileData.email}</p>
            <div className="flex items-center gap-3 mt-2">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold bg-primary-50 text-primary-600 border border-primary-200 dark:bg-primary-900/20 dark:text-primary-400 dark:border-primary-800/50 font-body">
                <i className="ri-vip-crown-line text-xs"></i>
                {profileData.role}
              </span>
            </div>
          </div>
          <button
            onClick={() => setShowPasswordModal(true)}
            className="px-4 py-2.5 text-sm font-semibold rounded-lg border border-background-200 dark:border-foreground-800 text-foreground-600 dark:text-foreground-300 hover:bg-background-50 dark:hover:bg-foreground-800 transition-all cursor-pointer whitespace-nowrap font-body"
          >
            <i className="ri-lock-line mr-1.5"></i>Change Password
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-foreground-600 dark:text-foreground-300 mb-1.5 font-body">Full Name</label>
            <input type="text" value={profileData.name} readOnly className="w-full px-4 py-2.5 text-sm rounded-lg border border-background-200 dark:border-foreground-800 bg-background-50 dark:bg-foreground-800/50 text-foreground-600 dark:text-foreground-400 font-body cursor-not-allowed" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-foreground-600 dark:text-foreground-300 mb-1.5 font-body">Email Address</label>
            <input type="email" value={profileData.email} readOnly className="w-full px-4 py-2.5 text-sm rounded-lg border border-background-200 dark:border-foreground-800 bg-background-50 dark:bg-foreground-800/50 text-foreground-600 dark:text-foreground-400 font-body cursor-not-allowed" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-foreground-600 dark:text-foreground-300 mb-1.5 font-body">Role</label>
            <input type="text" value={profileData.role} readOnly className="w-full px-4 py-2.5 text-sm rounded-lg border border-background-200 dark:border-foreground-800 bg-background-50 dark:bg-foreground-800/50 text-foreground-600 dark:text-foreground-400 font-body cursor-not-allowed" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-foreground-600 dark:text-foreground-300 mb-1.5 font-body">Session</label>
            <input type="text" value="Active" readOnly className="w-full px-4 py-2.5 text-sm rounded-lg border border-background-200 dark:border-foreground-800 bg-background-50 dark:bg-foreground-800/50 text-foreground-600 dark:text-foreground-400 font-body cursor-not-allowed" />
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-foreground-900 rounded-xl border border-background-200 dark:border-foreground-800 p-5">
        <h3 className="text-base font-bold text-foreground-950 dark:text-foreground-100 font-heading mb-4">Recent Activity</h3>
        <div className="space-y-3">
          {isActivityLoading ? (
            <p className="text-sm text-foreground-400 font-body">Loading activity...</p>
          ) : activityLog.length === 0 ? (
            <p className="text-sm text-foreground-400 font-body">
              {user?.role === 'OWNER' ? 'No recent activity recorded yet.' : 'Recent activity is available to owners.'}
            </p>
          ) : activityLog.map((activity) => (
            <div key={activity.id} className="flex items-start gap-3 py-2.5 border-b border-background-100 dark:border-foreground-800 last:border-b-0">
              <div className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 text-primary-500 bg-primary-50 dark:bg-primary-900/20">
                <i className="ri-history-line text-sm"></i>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-foreground-900 dark:text-foreground-100 font-body">{activity.action}</p>
                <p className="text-xs text-foreground-400 font-body">{activity.entityType}</p>
              </div>
              <span className="text-xs text-foreground-400 font-body whitespace-nowrap">{formatDateTime(activity.createdAt)}</span>
            </div>
          ))}
        </div>
      </div>

      {showPasswordModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40 modal-backdrop" onClick={() => setShowPasswordModal(false)}></div>
          <div className="relative bg-white dark:bg-foreground-900 rounded-2xl p-6 w-full max-w-md shadow-xl animate-scale-in">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-lg font-bold text-foreground-950 dark:text-foreground-100 font-heading">Change Password</h3>
              <button onClick={() => setShowPasswordModal(false)} className="w-8 h-8 rounded-lg flex items-center justify-center text-foreground-400 hover:bg-background-100 dark:hover:bg-foreground-800 transition-all cursor-pointer">
                <i className="ri-close-line"></i>
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-foreground-600 dark:text-foreground-300 mb-1.5 font-body">Current Password</label>
                <input type="password" value={oldPassword} onChange={(e) => setOldPassword(e.target.value)} className="w-full px-4 py-2.5 text-sm rounded-lg border border-background-200 dark:border-foreground-800 bg-white dark:bg-foreground-900 text-foreground-900 dark:text-foreground-100 focus:outline-none focus:ring-2 focus:ring-primary-500/30 font-body" placeholder="Enter current password" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-foreground-600 dark:text-foreground-300 mb-1.5 font-body">New Password</label>
                <input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} className="w-full px-4 py-2.5 text-sm rounded-lg border border-background-200 dark:border-foreground-800 bg-white dark:bg-foreground-900 text-foreground-900 dark:text-foreground-100 focus:outline-none focus:ring-2 focus:ring-primary-500/30 font-body" placeholder="Min. 8 characters" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-foreground-600 dark:text-foreground-300 mb-1.5 font-body">Confirm New Password</label>
                <input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} className="w-full px-4 py-2.5 text-sm rounded-lg border border-background-200 dark:border-foreground-800 bg-white dark:bg-foreground-900 text-foreground-900 dark:text-foreground-100 focus:outline-none focus:ring-2 focus:ring-primary-500/30 font-body" placeholder="Re-enter new password" />
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={() => setShowPasswordModal(false)} className="flex-1 px-4 py-2.5 text-sm font-semibold rounded-lg border border-background-200 dark:border-foreground-800 text-foreground-600 dark:text-foreground-300 hover:bg-background-50 dark:hover:bg-foreground-800 transition-all cursor-pointer whitespace-nowrap font-body">Cancel</button>
              <button onClick={handleChangePassword} className="flex-1 px-4 py-2.5 text-sm font-semibold rounded-lg bg-primary-500 text-white hover:bg-primary-600 transition-all cursor-pointer whitespace-nowrap font-body">Update Password</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
