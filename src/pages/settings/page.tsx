import { useState } from 'react';
import { restaurantSettings, paymentProviders } from '@/mocks/settings';

type SettingTab = 'profile' | 'payments' | 'tax' | 'notifications' | 'appearance';

export default function Settings() {
  const [activeTab, setActiveTab] = useState<SettingTab>('profile');
  const [toast, setToast] = useState('');

  // Low-stock email alert state
  const [emailAlertsEnabled, setEmailAlertsEnabled] = useState(false);
  const [alertEmails, setAlertEmails] = useState<string[]>(['manager@platera.app', 'kitchen@platera.app']);
  const [newEmail, setNewEmail] = useState('');
  const [alertFrequency, setAlertFrequency] = useState('immediate');
  const [alertThreshold, setAlertThreshold] = useState(5);
  const [alertCategories, setAlertCategories] = useState<string[]>(['Proteins', 'Produce', 'Dry Goods']);
  const [testEmailSent, setTestEmailSent] = useState(false);

  // Toggle states
  const [paymentToggles, setPaymentToggles] = useState<Record<string, boolean>>({
    cash: true,
    momo: restaurantSettings.paymentMethods.momoEnabled,
    card: true,
    paystack: restaurantSettings.paymentMethods.paystackEnabled,
  });

  const [notificationToggles, setNotificationToggles] = useState<Record<string, boolean>>({
    newOrderSound: restaurantSettings.notifications.newOrderSound,
    newOrderNotify: restaurantSettings.notifications.newOrderNotify,
    lowStockNotify: restaurantSettings.notifications.lowStockNotify,
    negativeFeedbackNotify: restaurantSettings.notifications.negativeFeedbackNotify,
    dailyReportEmail: restaurantSettings.notifications.dailyReportEmail,
  });

  const tabs: { key: SettingTab; label: string; icon: string }[] = [
    { key: 'profile', label: 'Restaurant Profile', icon: 'ri-store-2-line' },
    { key: 'payments', label: 'Payments', icon: 'ri-bank-card-line' },
    { key: 'tax', label: 'Tax Settings', icon: 'ri-percent-line' },
    { key: 'notifications', label: 'Notifications', icon: 'ri-notification-3-line' },
    { key: 'appearance', label: 'Appearance', icon: 'ri-palette-line' },
  ];

  const handleSave = () => {
    setToast('Settings saved successfully!');
    setTimeout(() => setToast(''), 3000);
  };

  const handleSaveAlerts = () => {
    setToast('Low-stock alert settings saved!');
    setTimeout(() => setToast(''), 3000);
  };

  const addEmail = () => {
    const email = newEmail.trim();
    if (!email || alertEmails.includes(email)) return;
    setAlertEmails((prev) => [...prev, email]);
    setNewEmail('');
  };

  const removeEmail = (email: string) => {
    setAlertEmails((prev) => prev.filter((e) => e !== email));
  };

  const toggleAlertCategory = (cat: string) => {
    setAlertCategories((prev) =>
      prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat]
    );
  };

  const sendTestAlert = () => {
    setTestEmailSent(true);
    setToast('Test alert email sent to all recipients!');
    setTimeout(() => { setToast(''); setTestEmailSent(false); }, 4000);
  };

  return (
    <div className="animate-fade-in">
      {toast && (
        <div className="fixed top-20 right-6 z-50 bg-secondary-500 text-white px-5 py-3 rounded-lg shadow-lg toast-enter font-body text-sm whitespace-nowrap">
          <i className="ri-check-line mr-2"></i>{toast}
        </div>
      )}

      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground-950 dark:text-foreground-100 font-heading">Settings</h1>
        <p className="text-sm text-foreground-500 dark:text-foreground-400 mt-1 font-body">Manage your restaurant configuration and preferences</p>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Tab Navigation */}
        <div className="lg:w-56 flex-shrink-0">
          <div className="flex lg:flex-col gap-1 overflow-x-auto lg:overflow-visible pb-2 lg:pb-0">
            {tabs.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`flex items-center gap-2.5 px-4 py-2.5 rounded-lg text-sm font-semibold transition-all cursor-pointer whitespace-nowrap font-body ${
                  activeTab === tab.key
                    ? 'bg-primary-500 text-white'
                    : 'bg-white dark:bg-foreground-900 text-foreground-600 dark:text-foreground-300 border border-background-200 dark:border-foreground-800 hover:bg-background-50 dark:hover:bg-foreground-800'
                }`}
              >
                <i className={`${tab.icon} text-base`}></i>
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Tab Content */}
        <div className="flex-1 bg-white dark:bg-foreground-900 rounded-xl border border-background-200 dark:border-foreground-800 p-6">
          {/* Profile Tab */}
          {activeTab === 'profile' && (
            <div className="space-y-5">
              <div className="flex items-center gap-4 pb-5 border-b border-background-200 dark:border-foreground-800">
                <div className="w-16 h-16 rounded-xl bg-primary-500 flex items-center justify-center">
                  <span className="text-white text-xl font-bold font-heading">P</span>
                </div>
                <div>
                  <h3 className="text-base font-bold text-foreground-950 dark:text-foreground-100 font-heading">Restaurant Logo</h3>
                  <p className="text-xs text-foreground-400 mt-0.5 font-body">Upload a square image (recommended 512x512px)</p>
                  <button className="mt-2 px-3 py-1.5 text-xs font-semibold rounded-lg bg-background-100 dark:bg-foreground-800 text-foreground-600 dark:text-foreground-300 hover:bg-background-200 transition-all cursor-pointer whitespace-nowrap font-body">
                    <i className="ri-upload-2-line mr-1"></i>Upload Logo
                  </button>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-foreground-600 dark:text-foreground-300 mb-1.5 font-body">Restaurant Name</label>
                  <input
                    type="text"
                    defaultValue={restaurantSettings.profile.name}
                    className="w-full px-4 py-2.5 text-sm rounded-lg border border-background-200 dark:border-foreground-800 bg-white dark:bg-foreground-900 text-foreground-900 dark:text-foreground-100 focus:outline-none focus:ring-2 focus:ring-primary-500/30 font-body"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-foreground-600 dark:text-foreground-300 mb-1.5 font-body">Tagline</label>
                  <input
                    type="text"
                    defaultValue={restaurantSettings.profile.tagline}
                    className="w-full px-4 py-2.5 text-sm rounded-lg border border-background-200 dark:border-foreground-800 bg-white dark:bg-foreground-900 text-foreground-900 dark:text-foreground-100 focus:outline-none focus:ring-2 focus:ring-primary-500/30 font-body"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-xs font-semibold text-foreground-600 dark:text-foreground-300 mb-1.5 font-body">Address</label>
                  <input
                    type="text"
                    defaultValue={restaurantSettings.profile.address}
                    className="w-full px-4 py-2.5 text-sm rounded-lg border border-background-200 dark:border-foreground-800 bg-white dark:bg-foreground-900 text-foreground-900 dark:text-foreground-100 focus:outline-none focus:ring-2 focus:ring-primary-500/30 font-body"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-foreground-600 dark:text-foreground-300 mb-1.5 font-body">Phone</label>
                  <input
                    type="text"
                    defaultValue={restaurantSettings.profile.phone}
                    className="w-full px-4 py-2.5 text-sm rounded-lg border border-background-200 dark:border-foreground-800 bg-white dark:bg-foreground-900 text-foreground-900 dark:text-foreground-100 focus:outline-none focus:ring-2 focus:ring-primary-500/30 font-body"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-foreground-600 dark:text-foreground-300 mb-1.5 font-body">Email</label>
                  <input
                    type="email"
                    defaultValue={restaurantSettings.profile.email}
                    className="w-full px-4 py-2.5 text-sm rounded-lg border border-background-200 dark:border-foreground-800 bg-white dark:bg-foreground-900 text-foreground-900 dark:text-foreground-100 focus:outline-none focus:ring-2 focus:ring-primary-500/30 font-body"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-foreground-600 dark:text-foreground-300 mb-1.5 font-body">Website</label>
                  <input
                    type="text"
                    defaultValue={restaurantSettings.profile.website}
                    className="w-full px-4 py-2.5 text-sm rounded-lg border border-background-200 dark:border-foreground-800 bg-white dark:bg-foreground-900 text-foreground-900 dark:text-foreground-100 focus:outline-none focus:ring-2 focus:ring-primary-500/30 font-body"
                  />
                </div>
              </div>
              <div className="pt-4 border-t border-background-200 dark:border-foreground-800">
                <h4 className="text-sm font-bold text-foreground-900 dark:text-foreground-100 font-heading mb-3">Opening Hours</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {(Object.entries(restaurantSettings.profile.openingHours) as [string, { open: string; close: string }][]).map(([day, hours]) => (
                    <div key={day} className="flex items-center gap-3">
                      <span className="text-xs font-semibold text-foreground-600 dark:text-foreground-300 w-20 capitalize font-body">{day}</span>
                      <input type="time" defaultValue={hours.open} className="px-3 py-2 text-xs rounded-lg border border-background-200 dark:border-foreground-800 bg-white dark:bg-foreground-900 text-foreground-900 dark:text-foreground-100 focus:outline-none focus:ring-2 focus:ring-primary-500/30 font-body" />
                      <span className="text-xs text-foreground-400 font-body">to</span>
                      <input type="time" defaultValue={hours.close} className="px-3 py-2 text-xs rounded-lg border border-background-200 dark:border-foreground-800 bg-white dark:bg-foreground-900 text-foreground-900 dark:text-foreground-100 focus:outline-none focus:ring-2 focus:ring-primary-500/30 font-body" />
                    </div>
                  ))}
                </div>
              </div>
              <button onClick={handleSave} className="px-5 py-2.5 text-sm font-semibold rounded-lg bg-primary-500 text-white hover:bg-primary-600 transition-all cursor-pointer whitespace-nowrap font-body">
                <i className="ri-save-line mr-1.5"></i>Save Changes
              </button>
            </div>
          )}

          {/* Payments Tab */}
          {activeTab === 'payments' && (
            <div className="space-y-5">
              <h3 className="text-base font-bold text-foreground-950 dark:text-foreground-100 font-heading">Payment Methods</h3>
              {paymentProviders.map((provider) => (
                <div key={provider.id} className="flex items-center justify-between p-4 rounded-xl border border-background-200 dark:border-foreground-800">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-background-100 dark:bg-foreground-800 flex items-center justify-center">
                      <i className={`${provider.icon} text-lg text-foreground-500`}></i>
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-foreground-900 dark:text-foreground-100 font-body">{provider.name}</p>
                      <p className="text-xs text-foreground-400 font-body">{provider.description}</p>
                    </div>
                  </div>
                  <button 
                    onClick={() => setPaymentToggles(prev => ({ ...prev, [provider.id]: !prev[provider.id] }))}
                    className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${paymentToggles[provider.id] ? 'bg-primary-500' : 'bg-foreground-300 dark:bg-foreground-600'}`}
                  >
                    <span className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${paymentToggles[provider.id] ? 'translate-x-5' : 'translate-x-0'}`}></span>
                  </button>
                </div>
              ))}
              {restaurantSettings.paymentMethods.paystackEnabled && (
                <div>
                  <label className="block text-xs font-semibold text-foreground-600 dark:text-foreground-300 mb-1.5 font-body">Paystack Public Key</label>
                  <input type="text" defaultValue={restaurantSettings.paymentMethods.paystackPublicKey} className="w-full px-4 py-2.5 text-sm rounded-lg border border-background-200 dark:border-foreground-800 bg-background-50 dark:bg-foreground-800/50 text-foreground-600 dark:text-foreground-400 font-mono cursor-not-allowed" readOnly />
                </div>
              )}
              {restaurantSettings.paymentMethods.momoEnabled && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-foreground-600 dark:text-foreground-300 mb-1.5 font-body">MoMo Provider</label>
                    <input type="text" defaultValue={restaurantSettings.paymentMethods.momoProvider} className="w-full px-4 py-2.5 text-sm rounded-lg border border-background-200 dark:border-foreground-800 bg-white dark:bg-foreground-900 text-foreground-900 dark:text-foreground-100 focus:outline-none focus:ring-2 focus:ring-primary-500/30 font-body" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-foreground-600 dark:text-foreground-300 mb-1.5 font-body">MoMo Number</label>
                    <input type="text" defaultValue={restaurantSettings.paymentMethods.momoNumber} className="w-full px-4 py-2.5 text-sm rounded-lg border border-background-200 dark:border-foreground-800 bg-white dark:bg-foreground-900 text-foreground-900 dark:text-foreground-100 focus:outline-none focus:ring-2 focus:ring-primary-500/30 font-body" />
                  </div>
                </div>
              )}
              <button onClick={handleSave} className="px-5 py-2.5 text-sm font-semibold rounded-lg bg-primary-500 text-white hover:bg-primary-600 transition-all cursor-pointer whitespace-nowrap font-body">
                <i className="ri-save-line mr-1.5"></i>Save Changes
              </button>
            </div>
          )}

          {/* Tax Tab */}
          {activeTab === 'tax' && (
            <div className="space-y-5">
              <h3 className="text-base font-bold text-foreground-950 dark:text-foreground-100 font-heading">Tax Configuration</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-foreground-600 dark:text-foreground-300 mb-1.5 font-body">VAT Rate (%)</label>
                  <input type="number" step="0.5" defaultValue={restaurantSettings.taxSettings.vatRate} className="w-full px-4 py-2.5 text-sm rounded-lg border border-background-200 dark:border-foreground-800 bg-white dark:bg-foreground-900 text-foreground-900 dark:text-foreground-100 focus:outline-none focus:ring-2 focus:ring-primary-500/30 font-body" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-foreground-600 dark:text-foreground-300 mb-1.5 font-body">NHIL Rate (%)</label>
                  <input type="number" step="0.5" defaultValue={restaurantSettings.taxSettings.nhilRate} className="w-full px-4 py-2.5 text-sm rounded-lg border border-background-200 dark:border-foreground-800 bg-white dark:bg-foreground-900 text-foreground-900 dark:text-foreground-100 focus:outline-none focus:ring-2 focus:ring-primary-500/30 font-body" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-foreground-600 dark:text-foreground-300 mb-1.5 font-body">GETFund Rate (%)</label>
                  <input type="number" step="0.5" defaultValue={restaurantSettings.taxSettings.getfundRate} className="w-full px-4 py-2.5 text-sm rounded-lg border border-background-200 dark:border-foreground-800 bg-white dark:bg-foreground-900 text-foreground-900 dark:text-foreground-100 focus:outline-none focus:ring-2 focus:ring-primary-500/30 font-body" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-foreground-600 dark:text-foreground-300 mb-1.5 font-body">Service Charge (%)</label>
                  <input type="number" step="0.5" defaultValue={restaurantSettings.taxSettings.serviceCharge} className="w-full px-4 py-2.5 text-sm rounded-lg border border-background-200 dark:border-foreground-800 bg-white dark:bg-foreground-900 text-foreground-900 dark:text-foreground-100 focus:outline-none focus:ring-2 focus:ring-primary-500/30 font-body" />
                </div>
              </div>
              <div className="p-4 rounded-xl bg-background-50 dark:bg-foreground-800/30 border border-background-200 dark:border-foreground-800">
                <p className="text-xs text-foreground-500 font-body">
                  Total tax rate: <strong className="text-foreground-800 dark:text-foreground-200">{restaurantSettings.taxSettings.vatRate + restaurantSettings.taxSettings.nhilRate + restaurantSettings.taxSettings.getfundRate}%</strong> + Service Charge: <strong className="text-foreground-800 dark:text-foreground-200">{restaurantSettings.taxSettings.serviceCharge}%</strong>
                </p>
              </div>
              <button onClick={handleSave} className="px-5 py-2.5 text-sm font-semibold rounded-lg bg-primary-500 text-white hover:bg-primary-600 transition-all cursor-pointer whitespace-nowrap font-body">
                <i className="ri-save-line mr-1.5"></i>Save Changes
              </button>
            </div>
          )}

          {/* Notifications Tab */}
          {activeTab === 'notifications' && (
            <div className="space-y-5">
              <h3 className="text-base font-bold text-foreground-950 dark:text-foreground-100 font-heading">Notification Preferences</h3>
              <div className="space-y-3">
                {[
                  { key: 'newOrderSound', label: 'New Order Sound Alert', desc: 'Play a sound when a new order comes in' },
                  { key: 'newOrderNotify', label: 'New Order Notification', desc: 'Show a notification toast for new orders' },
                  { key: 'lowStockNotify', label: 'Low Stock Alerts', desc: 'Notify when inventory items run low' },
                  { key: 'negativeFeedbackNotify', label: 'Negative Feedback Alert', desc: 'Alert for reviews rated 2 stars or below' },
                  { key: 'dailyReportEmail', label: 'Daily Report Email', desc: 'Receive a daily summary via email' },
                ].map((item) => (
                  <div key={item.key} className="flex items-center justify-between p-4 rounded-xl border border-background-200 dark:border-foreground-800">
                    <div>
                      <p className="text-sm font-semibold text-foreground-900 dark:text-foreground-100 font-body">{item.label}</p>
                      <p className="text-xs text-foreground-400 font-body">{item.desc}</p>
                    </div>
                    <button 
                      onClick={() => setNotificationToggles(prev => ({ ...prev, [item.key]: !prev[item.key] }))}
                      className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${notificationToggles[item.key] ? 'bg-primary-500' : 'bg-foreground-300 dark:bg-foreground-600'}`}
                    >
                      <span className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${notificationToggles[item.key] ? 'translate-x-5' : 'translate-x-0'}`}></span>
                    </button>
                  </div>
                ))}
              </div>
              <div>
                <label className="block text-xs font-semibold text-foreground-600 dark:text-foreground-300 mb-1.5 font-body">Low Stock Threshold</label>
                <input type="number" defaultValue={restaurantSettings.notifications.lowStockThreshold} className="w-full max-w-[120px] px-4 py-2.5 text-sm rounded-lg border border-background-200 dark:border-foreground-800 bg-white dark:bg-foreground-900 text-foreground-900 dark:text-foreground-100 focus:outline-none focus:ring-2 focus:ring-primary-500/30 font-body" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-foreground-600 dark:text-foreground-300 mb-1.5 font-body">Daily Report Time</label>
                <input type="time" defaultValue={restaurantSettings.notifications.dailyReportTime} className="px-4 py-2.5 text-sm rounded-lg border border-background-200 dark:border-foreground-800 bg-white dark:bg-foreground-900 text-foreground-900 dark:text-foreground-100 focus:outline-none focus:ring-2 focus:ring-primary-500/30 font-body" />
              </div>

              {/* Low-Stock Email Alerts */}
              <div className="pt-5 border-t-2 border-background-200 dark:border-foreground-800">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h4 className="text-sm font-bold text-foreground-900 dark:text-foreground-100 font-heading">
                      <i className="ri-mail-unread-line mr-1.5 text-accent-500"></i>
                      Low-Stock Email Alerts
                    </h4>
                    <p className="text-xs text-foreground-400 mt-0.5 font-body">Get notified by email when inventory items drop below critical thresholds</p>
                  </div>
                  <button
                    onClick={() => setEmailAlertsEnabled(!emailAlertsEnabled)}
                    className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${emailAlertsEnabled ? 'bg-primary-500' : 'bg-foreground-300 dark:bg-foreground-600'}`}
                  >
                    <span className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${emailAlertsEnabled ? 'translate-x-5' : 'translate-x-0'}`} />
                  </button>
                </div>

                {emailAlertsEnabled && (
                  <div className="space-y-4 animate-fade-in-up">
                    {/* Email Recipients */}
                    <div>
                      <label className="block text-xs font-semibold text-foreground-600 dark:text-foreground-300 mb-2 font-body">
                        Alert Recipients
                      </label>
                      <div className="flex flex-wrap gap-2 mb-2">
                        {alertEmails.map((email) => (
                          <span key={email} className="inline-flex items-center gap-1.5 bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300 rounded-full px-3 py-1.5 text-xs font-medium font-body">
                            <i className="ri-mail-line text-xs"></i>
                            {email}
                            <button
                              onClick={() => removeEmail(email)}
                              className="text-primary-400 hover:text-red-500 transition-colors cursor-pointer ml-0.5"
                            >
                              <i className="ri-close-circle-line text-xs"></i>
                            </button>
                          </span>
                        ))}
                      </div>
                      <div className="flex gap-2">
                        <input
                          type="email"
                          value={newEmail}
                          onChange={(e) => setNewEmail(e.target.value)}
                          onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addEmail(); } }}
                          placeholder="Add email address..."
                          className="flex-1 px-3 py-2 text-sm rounded-lg border border-background-200 dark:border-foreground-800 bg-white dark:bg-foreground-900 text-foreground-900 dark:text-foreground-100 placeholder:text-foreground-400 focus:outline-none focus:ring-2 focus:ring-primary-500/30 font-body"
                        />
                        <button
                          onClick={addEmail}
                          className="px-4 py-2 text-sm font-semibold rounded-lg bg-primary-500 hover:bg-primary-600 text-white transition-all cursor-pointer whitespace-nowrap font-body"
                        >
                          <i className="ri-add-line mr-1"></i>Add
                        </button>
                      </div>
                    </div>

                    {/* Alert Frequency */}
                    <div>
                      <label className="block text-xs font-semibold text-foreground-600 dark:text-foreground-300 mb-2 font-body">
                        Alert Frequency
                      </label>
                      <div className="flex gap-2">
                        {[
                          { value: 'immediate', label: 'Immediate', desc: 'Send instantly' },
                          { value: 'hourly', label: 'Hourly', desc: 'Batched every hour' },
                          { value: 'daily', label: 'Daily', desc: 'Once per day at 9 AM' },
                        ].map((opt) => (
                          <button
                            key={opt.value}
                            onClick={() => setAlertFrequency(opt.value)}
                            className={`flex-1 p-3 rounded-lg border text-center transition-all cursor-pointer ${
                              alertFrequency === opt.value
                                ? 'border-primary-400 dark:border-primary-600 bg-primary-50 dark:bg-primary-900/20'
                                : 'border-background-200 dark:border-foreground-800 bg-white dark:bg-foreground-900 hover:border-background-300'
                            }`}
                          >
                            <p className={`text-sm font-semibold font-body ${alertFrequency === opt.value ? 'text-primary-600 dark:text-primary-400' : 'text-foreground-700 dark:text-foreground-300'}`}>
                              {opt.label}
                            </p>
                            <p className="text-[10px] text-foreground-400 mt-0.5 font-body">{opt.desc}</p>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Alert Threshold */}
                    <div className="flex items-center gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-foreground-600 dark:text-foreground-300 mb-1.5 font-body">
                          Trigger When Stock Falls Below
                        </label>
                        <div className="flex items-center gap-2">
                          <input
                            type="number"
                            min="1"
                            max="50"
                            value={alertThreshold}
                            onChange={(e) => setAlertThreshold(parseInt(e.target.value) || 1)}
                            className="w-20 px-3 py-2 text-sm rounded-lg border border-background-200 dark:border-foreground-800 bg-white dark:bg-foreground-900 text-foreground-900 dark:text-foreground-100 focus:outline-none focus:ring-2 focus:ring-primary-500/30 font-body text-center"
                          />
                          <span className="text-sm text-foreground-500 font-body">units</span>
                        </div>
                      </div>
                    </div>

                    {/* Categories to Monitor */}
                    <div>
                      <label className="block text-xs font-semibold text-foreground-600 dark:text-foreground-300 mb-2 font-body">
                        Monitor Categories
                      </label>
                      <div className="flex flex-wrap gap-2">
                        {['Drinks', 'Proteins', 'Dry Goods', 'Produce', 'Condiments'].map((cat) => (
                          <button
                            key={cat}
                            onClick={() => toggleAlertCategory(cat)}
                            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all cursor-pointer border ${
                              alertCategories.includes(cat)
                                ? 'bg-primary-500 text-white border-primary-500'
                                : 'bg-white dark:bg-foreground-900 text-foreground-600 dark:text-foreground-300 border-background-200 dark:border-foreground-700 hover:border-primary-300'
                            }`}
                          >
                            {cat}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Test + Save */}
                    <div className="flex gap-3 pt-2">
                      <button
                        onClick={sendTestAlert}
                        disabled={testEmailSent}
                        className={`px-4 py-2.5 text-sm font-semibold rounded-lg border transition-all cursor-pointer whitespace-nowrap font-body ${
                          testEmailSent
                            ? 'bg-secondary-50 dark:bg-secondary-900/20 text-secondary-600 dark:text-secondary-400 border-secondary-200 dark:border-secondary-800'
                            : 'border-background-200 dark:border-foreground-800 text-foreground-600 dark:text-foreground-300 hover:bg-background-50 dark:hover:bg-foreground-800'
                        }`}
                      >
                        <i className={`${testEmailSent ? 'ri-check-double-line' : 'ri-send-plane-line'} mr-1.5`}></i>
                        {testEmailSent ? 'Test Sent!' : 'Send Test Alert'}
                      </button>
                      <button onClick={handleSaveAlerts} className="flex-1 px-4 py-2.5 text-sm font-semibold rounded-lg bg-primary-500 text-white hover:bg-primary-600 transition-all cursor-pointer whitespace-nowrap font-body">
                        <i className="ri-save-line mr-1.5"></i>Save Alert Settings
                      </button>
                    </div>
                  </div>
                )}
              </div>

              <button onClick={handleSave} className="px-5 py-2.5 text-sm font-semibold rounded-lg bg-primary-500 text-white hover:bg-primary-600 transition-all cursor-pointer whitespace-nowrap font-body">
                <i className="ri-save-line mr-1.5"></i>Save Changes
              </button>
            </div>
          )}

          {/* Appearance Tab */}
          {activeTab === 'appearance' && (
            <div className="space-y-5">
              <h3 className="text-base font-bold text-foreground-950 dark:text-foreground-100 font-heading">Appearance Settings</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-foreground-600 dark:text-foreground-300 mb-1.5 font-body">Primary Color</label>
                  <div className="flex items-center gap-3">
                    <input type="color" defaultValue={restaurantSettings.appearance.primaryColor} className="w-10 h-10 rounded-lg border border-background-200 dark:border-foreground-800 cursor-pointer" />
                    <span className="text-sm text-foreground-600 dark:text-foreground-300 font-mono">{restaurantSettings.appearance.primaryColor}</span>
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-foreground-600 dark:text-foreground-300 mb-1.5 font-body">Display Language</label>
                  <select className="w-full px-4 py-2.5 text-sm rounded-lg border border-background-200 dark:border-foreground-800 bg-white dark:bg-foreground-900 text-foreground-900 dark:text-foreground-100 focus:outline-none focus:ring-2 focus:ring-primary-500/30 cursor-pointer font-body">
                    <option>English</option>
                    <option>Twi</option>
                    <option>Ga</option>
                    <option>Ewe</option>
                    <option>French</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-foreground-600 dark:text-foreground-300 mb-1.5 font-body">Currency</label>
                  <select defaultValue={restaurantSettings.appearance.currency} className="w-full px-4 py-2.5 text-sm rounded-lg border border-background-200 dark:border-foreground-800 bg-white dark:bg-foreground-900 text-foreground-900 dark:text-foreground-100 focus:outline-none focus:ring-2 focus:ring-primary-500/30 cursor-pointer font-body">
                    <option value="GHS">GHS (₵) - Ghana Cedi</option>
                    <option value="USD">USD ($) - US Dollar</option>
                    <option value="EUR">EUR (€) - Euro</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-foreground-600 dark:text-foreground-300 mb-1.5 font-body">Date Format</label>
                  <select defaultValue={restaurantSettings.appearance.dateFormat} className="w-full px-4 py-2.5 text-sm rounded-lg border border-background-200 dark:border-foreground-800 bg-white dark:bg-foreground-900 text-foreground-900 dark:text-foreground-100 focus:outline-none focus:ring-2 focus:ring-primary-500/30 cursor-pointer font-body">
                    <option>DD/MM/YYYY</option>
                    <option>MM/DD/YYYY</option>
                    <option>YYYY-MM-DD</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-foreground-600 dark:text-foreground-300 mb-1.5 font-body">Time Format</label>
                  <select defaultValue={restaurantSettings.appearance.timeFormat} className="w-full px-4 py-2.5 text-sm rounded-lg border border-background-200 dark:border-foreground-800 bg-white dark:bg-foreground-900 text-foreground-900 dark:text-foreground-100 focus:outline-none focus:ring-2 focus:ring-primary-500/30 cursor-pointer font-body">
                    <option>24-hour</option>
                    <option>12-hour (AM/PM)</option>
                  </select>
                </div>
              </div>
              <button onClick={handleSave} className="px-5 py-2.5 text-sm font-semibold rounded-lg bg-primary-500 text-white hover:bg-primary-600 transition-all cursor-pointer whitespace-nowrap font-body">
                <i className="ri-save-line mr-1.5"></i>Save Changes
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}