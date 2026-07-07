import { useState, useRef, useEffect } from 'react';
import { useUnsavedChanges } from '@/contexts/UnsavedChangesContext';
import PageHeader from '@/components/base/PageHeader';
import PageSkeleton from '@/components/base/PageSkeleton';
import CustomSelect from '@/components/base/CustomSelect';
import { useRefresh } from '@/contexts/RefreshContext';
import { useOnboarding } from '@/contexts/OnboardingContext';
import SubscriptionBillingSection from './components/SubscriptionBillingSection';

const DEFAULT_SETTINGS = {
  profile: {
    name: 'Platera Restaurant',
    tagline: 'Authentic Ghanaian Cuisine in the Heart of Accra',
    address: '15 Independence Avenue, Osu, Accra, Ghana',
    phone: '+233 24 567 8900',
    email: 'hello@platera.app',
    website: 'www.platera.app',
    openingHours: {
      monday: { open: '10:00', close: '22:00' },
      tuesday: { open: '10:00', close: '22:00' },
      wednesday: { open: '10:00', close: '22:00' },
      thursday: { open: '10:00', close: '23:00' },
      friday: { open: '10:00', close: '00:00' },
      saturday: { open: '09:00', close: '00:00' },
      sunday: { open: '12:00', close: '21:00' },
    },
  },
  paymentMethods: {
    momoEnabled: true,
    momoProvider: 'MTN Mobile Money',
    momoNumber: '024 567 8900',
    cashEnabled: true,
  },
  taxSettings: {
    vatRate: 12.5,
    nhilRate: 2.5,
    getfundRate: 2.5,
    covidRate: 1.0,
    tourismRate: 1.0,
    serviceCharge: 5,
  },
  notifications: {
    newOrderSound: true,
    newOrderNotify: true,
    lowStockNotify: true,
    lowStockThreshold: 5,
    negativeFeedbackNotify: true,
    dailyReportEmail: true,
    dailyReportTime: '22:00',
  },
  appearance: {
    primaryColor: '#FF6B35',
    displayLanguage: 'English',
    currency: 'GHS',
    dateFormat: 'DD/MM/YYYY',
    timeFormat: '24-hour',
  },
};

const getSavedSettings = () => {
  try {
    const saved = localStorage.getItem('platera_settings');
    if (saved) return JSON.parse(saved);
  } catch (e) {
    // Ignore error
  }
  return DEFAULT_SETTINGS;
};

const paymentProviders = [
  { id: 'momo', name: 'Mobile Money', icon: 'ri-smartphone-line', description: 'MTN, Telecel, AT' },
  { id: 'cash', name: 'Cash', icon: 'ri-money-dollar-circle-line', description: 'In-person cash payments' },
];

type SettingTab = 'profile' | 'payments' | 'tax' | 'notifications' | 'appearance' | 'subscription';

export default function Settings() {
  const [restaurantSettings, setRestaurantSettings] = useState(getSavedSettings);

  const { isRefreshing } = useRefresh();
  const { markStepComplete } = useOnboarding();
  const [activeTab, setActiveTab] = useState<SettingTab>('profile');
  const [toast, setToast] = useState('');

  const [profileState, setProfileState] = useState(restaurantSettings.profile);

  const logoInputRef = useRef<HTMLInputElement>(null);
  const [logoImage, setLogoImage] = useState<string | null>(null);

  // Low-stock email alert state
  const [emailAlertsEnabled, setEmailAlertsEnabled] = useState(false);
  const [alertEmails, setAlertEmails] = useState<string[]>(['manager@platera.app', 'kitchen@platera.app']);
  const [newEmail, setNewEmail] = useState('');
  const [alertFrequency, setAlertFrequency] = useState('immediate');
  const [alertThreshold, setAlertThreshold] = useState(5);
  const [alertCategories, setAlertCategories] = useState<string[]>(['Proteins', 'Produce', 'Dry Goods']);
  const [testEmailSent, setTestEmailSent] = useState(false);

  const [paymentToggles, setPaymentToggles] = useState<Record<string, boolean>>({
    cash: restaurantSettings.paymentMethods.cashEnabled,
    momo: restaurantSettings.paymentMethods.momoEnabled,
  });

  const [momoProviderState, setMomoProviderState] = useState(restaurantSettings.paymentMethods.momoProvider);
  const [momoNumberState, setMomoNumberState] = useState(restaurantSettings.paymentMethods.momoNumber);

  const [taxState, setTaxState] = useState(restaurantSettings.taxSettings);

  const [notificationToggles, setNotificationToggles] = useState<Record<string, boolean>>({
    newOrderSound: restaurantSettings.notifications.newOrderSound,
    newOrderNotify: restaurantSettings.notifications.newOrderNotify,
    lowStockNotify: restaurantSettings.notifications.lowStockNotify,
    negativeFeedbackNotify: restaurantSettings.notifications.negativeFeedbackNotify,
    dailyReportEmail: restaurantSettings.notifications.dailyReportEmail,
  });

  // Display Settings State
  const [primaryColorHex, setPrimaryColorHex] = useState(restaurantSettings.appearance.primaryColor);
  const [currency, setCurrency] = useState(restaurantSettings.appearance.currency);
  const [dateFormat, setDateFormat] = useState(restaurantSettings.appearance.dateFormat);
  const [timeFormat, setTimeFormat] = useState(restaurantSettings.appearance.timeFormat);

  const { setUnsavedDiff, unsavedDiff, checkUnsaved } = useUnsavedChanges();
  const hasChanges = unsavedDiff.length > 0;

  useEffect(() => {
    const diffs: string[] = [];

    // Profile diffs
    if (profileState.name !== restaurantSettings.profile.name) diffs.push(`Restaurant Name changed from <b>${restaurantSettings.profile.name}</b> to <b>${profileState.name}</b>`);
    if (profileState.tagline !== restaurantSettings.profile.tagline) diffs.push(`Tagline changed to <b>${profileState.tagline}</b>`);
    if (profileState.address !== restaurantSettings.profile.address) diffs.push(`Address changed to <b>${profileState.address}</b>`);
    if (profileState.phone !== restaurantSettings.profile.phone) diffs.push(`Phone changed to <b>${profileState.phone}</b>`);
    if (profileState.email !== restaurantSettings.profile.email) diffs.push(`Email changed to <b>${profileState.email}</b>`);
    if (profileState.website !== restaurantSettings.profile.website) diffs.push(`Website changed to <b>${profileState.website}</b>`);

    // Opening Hours
    (Object.entries(profileState.openingHours) as [keyof typeof profileState.openingHours, { open: string; close: string }][]).forEach(([day, hours]) => {
      const orig = restaurantSettings.profile.openingHours[day];
      if (hours.open !== orig.open || hours.close !== orig.close) {
        diffs.push(`Opening Hours for ${day} changed from <b>${orig.open}-${orig.close}</b> to <b>${hours.open}-${hours.close}</b>`);
      }
    });

    // Appearance diffs
    if (primaryColorHex !== restaurantSettings.appearance.primaryColor) diffs.push(`Primary Color changed to <b>${primaryColorHex}</b>`);
    if (currency !== restaurantSettings.appearance.currency) diffs.push(`Currency changed to <b>${currency}</b>`);
    if (dateFormat !== restaurantSettings.appearance.dateFormat) diffs.push(`Date Format changed to <b>${dateFormat}</b>`);
    if (timeFormat !== restaurantSettings.appearance.timeFormat) diffs.push(`Time Format changed to <b>${timeFormat}</b>`);

    // Toggles diffs
    if (paymentToggles.momo !== restaurantSettings.paymentMethods.momoEnabled) diffs.push(`MoMo Payment ${paymentToggles.momo ? 'Enabled' : 'Disabled'}`);
    if (paymentToggles.cash !== restaurantSettings.paymentMethods.cashEnabled) diffs.push(`Cash Payment ${paymentToggles.cash ? 'Enabled' : 'Disabled'}`);
    
    // Payment diffs
    if (momoProviderState !== restaurantSettings.paymentMethods.momoProvider) diffs.push(`MoMo Provider changed to <b>${momoProviderState}</b>`);
    if (momoNumberState !== restaurantSettings.paymentMethods.momoNumber) diffs.push(`MoMo Number changed to <b>${momoNumberState}</b>`);

    // Tax diffs
    if (taxState.vatRate !== restaurantSettings.taxSettings.vatRate) diffs.push(`VAT Rate changed to <b>${taxState.vatRate}%</b>`);
    if (taxState.nhilRate !== restaurantSettings.taxSettings.nhilRate) diffs.push(`NHIL Rate changed to <b>${taxState.nhilRate}%</b>`);
    if (taxState.getfundRate !== restaurantSettings.taxSettings.getfundRate) diffs.push(`GETFund Rate changed to <b>${taxState.getfundRate}%</b>`);
    if (taxState.covidRate !== restaurantSettings.taxSettings.covidRate) diffs.push(`COVID-19 Levy changed to <b>${taxState.covidRate}%</b>`);
    if (taxState.tourismRate !== restaurantSettings.taxSettings.tourismRate) diffs.push(`Tourism Levy changed to <b>${taxState.tourismRate}%</b>`);
    if (taxState.serviceCharge !== restaurantSettings.taxSettings.serviceCharge) diffs.push(`Service Charge changed to <b>${taxState.serviceCharge}%</b>`);

    // Notification diffs
    Object.keys(notificationToggles).forEach((key) => {
      const orig = restaurantSettings.notifications[key as keyof typeof restaurantSettings.notifications];
      if (notificationToggles[key] !== orig) {
        diffs.push(`Notification setting '${key}' changed to <b>${notificationToggles[key] ? 'On' : 'Off'}</b>`);
      }
    });

    setUnsavedDiff(diffs);
  }, [profileState, primaryColorHex, currency, dateFormat, timeFormat, paymentToggles, notificationToggles, setUnsavedDiff]);

  const playTestSound = () => {
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioCtx.createOscillator();
      const gainNode = audioCtx.createGain();
      oscillator.connect(gainNode);
      gainNode.connect(audioCtx.destination);
      oscillator.type = 'sine';
      oscillator.frequency.setValueAtTime(880, audioCtx.currentTime);
      gainNode.gain.setValueAtTime(0.1, audioCtx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.5);
      oscillator.start();
      oscillator.stop(audioCtx.currentTime + 0.5);
    } catch {
      // Audio context not supported — fail silently
    }
  };


  const tabs: { key: SettingTab; label: string; icon: string }[] = [
    { key: 'profile', label: 'Restaurant Profile', icon: 'ri-store-2-line' },
    { key: 'payments', label: 'Payments', icon: 'ri-bank-card-line' },
    { key: 'tax', label: 'Tax Settings', icon: 'ri-percent-line' },
    { key: 'notifications', label: 'Notifications', icon: 'ri-notification-3-line' },
    { key: 'appearance', label: 'Appearance', icon: 'ri-palette-line' },
    { key: 'subscription', label: 'Subscription', icon: 'ri-vip-crown-line' },
  ];

  const handleSave = () => {
    if (!hasChanges) return;
    
    // Save to localStorage
    const newSettings = {
      profile: profileState,
      paymentMethods: {
        momoEnabled: paymentToggles.momo ?? false,
        momoProvider: momoProviderState,
        momoNumber: momoNumberState,
        cashEnabled: paymentToggles.cash ?? true,
      },
      taxSettings: taxState,
      notifications: {
        ...restaurantSettings.notifications,
        ...notificationToggles,
      },
      appearance: {
        primaryColor: primaryColorHex,
        displayLanguage: 'English',
        currency: currency,
        dateFormat: dateFormat,
        timeFormat: timeFormat,
      }
    };
    
    localStorage.setItem('platera_settings', JSON.stringify(newSettings));
    setRestaurantSettings(newSettings);
    
    setToast('Settings saved successfully!');
    setTimeout(() => setToast(''), 3000);
    setUnsavedDiff([]);
    if (activeTab === 'profile') {
      markStepComplete('upload_logo');
    }
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

  if (isRefreshing) return <PageSkeleton />;

  return (
    <div className="flex flex-col gap-6 animate-fade-in">
      {toast && (
        <div className="fixed top-20 right-6 z-50 bg-secondary-500 text-white px-5 py-3 rounded-lg shadow-lg toast-enter font-body text-sm whitespace-nowrap">
          <i className="ri-check-line mr-2"></i>{toast}
        </div>
      )}

      <PageHeader
        title="Settings"
        description="Manage your restaurant configuration and preferences"
      />

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Tab Navigation */}
        <div className="lg:w-56 flex-shrink-0">
          <div className="flex lg:flex-col gap-1 overflow-x-auto lg:overflow-visible pb-2 lg:pb-0">
            {tabs.map((tab) => (
              <button
                key={tab.key}
                onClick={() => checkUnsaved(() => { setActiveTab(tab.key as SettingTab); setUnsavedDiff([]); })}
                className={`flex items-center gap-2.5 px-4 py-2.5 rounded-lg text-sm font-semibold transition-all cursor-pointer whitespace-nowrap font-body ${activeTab === tab.key
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
                <div className={`w-16 h-16 rounded-xl flex items-center justify-center overflow-hidden border border-background-200 dark:border-foreground-700 ${logoImage ? '' : 'bg-background-100 dark:bg-foreground-800'}`}>
                  {logoImage ? (
                    <img src={logoImage} alt="Restaurant Logo" className="w-full h-full object-cover" />
                  ) : (
                    <i className="ri-store-2-line text-2xl text-foreground-400" />
                  )}
                </div>
                <div>
                  <h3 className="text-base font-bold text-foreground-950 dark:text-foreground-100 font-heading">Restaurant Logo</h3>
                  <p className="text-xs text-foreground-400 mt-0.5 font-body">Upload a square image (recommended 512x512px)</p>
                  <input
                    type="file"
                    ref={logoInputRef}
                    className="hidden"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) setLogoImage(URL.createObjectURL(file));
                    }}
                  />
                  <button
                    onClick={() => logoInputRef.current?.click()}
                    className="mt-2 px-3 py-1.5 text-xs font-semibold rounded-lg bg-background-100 dark:bg-foreground-800 text-foreground-600 dark:text-foreground-300 hover:bg-background-200 transition-all cursor-pointer whitespace-nowrap font-body"
                  >
                    <i className="ri-upload-2-line mr-1"></i>Upload Logo
                  </button>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-foreground-600 dark:text-foreground-300 mb-1.5 font-body">Restaurant Name</label>
                  <input
                    type="text"
                    value={profileState.name}
                    onChange={(e) => setProfileState({ ...profileState, name: e.target.value })}
                    className="w-full px-4 py-2.5 text-sm rounded-lg border border-background-200 dark:border-foreground-800 bg-white dark:bg-foreground-900 text-foreground-900 dark:text-foreground-100 focus:outline-none focus:ring-2 focus:ring-primary-500/30 font-body"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-foreground-600 dark:text-foreground-300 mb-1.5 font-body">Tagline</label>
                  <input
                    type="text"
                    value={profileState.tagline}
                    onChange={(e) => setProfileState({ ...profileState, tagline: e.target.value })}
                    className="w-full px-4 py-2.5 text-sm rounded-lg border border-background-200 dark:border-foreground-800 bg-white dark:bg-foreground-900 text-foreground-900 dark:text-foreground-100 focus:outline-none focus:ring-2 focus:ring-primary-500/30 font-body"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-xs font-semibold text-foreground-600 dark:text-foreground-300 mb-1.5 font-body">Address</label>
                  <input
                    type="text"
                    value={profileState.address}
                    onChange={(e) => setProfileState({ ...profileState, address: e.target.value })}
                    className="w-full px-4 py-2.5 text-sm rounded-lg border border-background-200 dark:border-foreground-800 bg-white dark:bg-foreground-900 text-foreground-900 dark:text-foreground-100 focus:outline-none focus:ring-2 focus:ring-primary-500/30 font-body"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-foreground-600 dark:text-foreground-300 mb-1.5 font-body">Phone</label>
                  <input
                    type="text"
                    value={profileState.phone}
                    onChange={(e) => setProfileState({ ...profileState, phone: e.target.value })}
                    className="w-full px-4 py-2.5 text-sm rounded-lg border border-background-200 dark:border-foreground-800 bg-white dark:bg-foreground-900 text-foreground-900 dark:text-foreground-100 focus:outline-none focus:ring-2 focus:ring-primary-500/30 font-body"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-foreground-600 dark:text-foreground-300 mb-1.5 font-body">Email</label>
                  <input
                    type="email"
                    value={profileState.email}
                    onChange={(e) => setProfileState({ ...profileState, email: e.target.value })}
                    className="w-full px-4 py-2.5 text-sm rounded-lg border border-background-200 dark:border-foreground-800 bg-white dark:bg-foreground-900 text-foreground-900 dark:text-foreground-100 focus:outline-none focus:ring-2 focus:ring-primary-500/30 font-body"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-foreground-600 dark:text-foreground-300 mb-1.5 font-body">Website</label>
                  <input
                    type="text"
                    value={profileState.website}
                    onChange={(e) => setProfileState({ ...profileState, website: e.target.value })}
                    className="w-full px-4 py-2.5 text-sm rounded-lg border border-background-200 dark:border-foreground-800 bg-white dark:bg-foreground-900 text-foreground-900 dark:text-foreground-100 focus:outline-none focus:ring-2 focus:ring-primary-500/30 font-body"
                  />
                </div>
              </div>
              <div className="pt-4 border-t border-background-200 dark:border-foreground-800">
                <h4 className="text-sm font-bold text-foreground-900 dark:text-foreground-100 font-heading mb-3">Opening Hours</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {(Object.entries(profileState.openingHours) as [keyof typeof profileState.openingHours, { open: string; close: string }][]).map(([day, hours]) => (
                    <div key={day} className="flex items-center gap-3">
                      <span className="text-xs font-semibold text-foreground-600 dark:text-foreground-300 w-20 capitalize font-body">{day}</span>
                      <input type="time" value={hours.open} onChange={(e) => setProfileState({ ...profileState, openingHours: { ...profileState.openingHours, [day]: { ...hours, open: e.target.value } } })} className="px-3 py-2 text-xs rounded-lg border border-background-200 dark:border-foreground-800 bg-white dark:bg-foreground-900 text-foreground-900 dark:text-foreground-100 focus:outline-none focus:ring-2 focus:ring-primary-500/30 font-body" />
                      <span className="text-xs text-foreground-400 font-body">to</span>
                      <input type="time" value={hours.close} onChange={(e) => setProfileState({ ...profileState, openingHours: { ...profileState.openingHours, [day]: { ...hours, close: e.target.value } } })} className="px-3 py-2 text-xs rounded-lg border border-background-200 dark:border-foreground-800 bg-white dark:bg-foreground-900 text-foreground-900 dark:text-foreground-100 focus:outline-none focus:ring-2 focus:ring-primary-500/30 font-body" />
                    </div>
                  ))}
                </div>
              </div>
              <button
                onClick={handleSave}
                disabled={!hasChanges}
                className={`px-5 py-2.5 text-sm font-semibold rounded-lg transition-all whitespace-nowrap font-body ${hasChanges ? 'bg-primary-500 text-white hover:bg-primary-600 cursor-pointer' : 'bg-background-100 dark:bg-foreground-800 text-foreground-400 dark:text-foreground-500 cursor-not-allowed'}`}
              >
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
              {restaurantSettings.paymentMethods.momoEnabled && (
                <div className="space-y-4">
                  <div className="p-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg flex gap-3 text-amber-800 dark:text-amber-300">
                    <i className="ri-error-warning-line text-lg flex-shrink-0"></i>
                    <p className="text-xs font-medium font-body leading-relaxed mt-0.5">Please be aware: All Mobile Money (MoMo) payments from customers will be deposited directly into the account details provided below.</p>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-foreground-600 dark:text-foreground-300 mb-1.5 font-body">MoMo Provider</label>
                      <CustomSelect
                        value={momoProviderState}
                        onChange={(val) => setMomoProviderState(val)}
                        options={[
                          { value: 'MTN Mobile Money', label: 'MTN Mobile Money' },
                          { value: 'Telecel Cash', label: 'Telecel Cash' },
                          { value: 'AT Money', label: 'AT Money' }
                        ]}
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-foreground-600 dark:text-foreground-300 mb-1.5 font-body">MoMo Number</label>
                      <input 
                        type="text" 
                        value={momoNumberState} 
                        onChange={(e) => setMomoNumberState(e.target.value)}
                        className="w-full px-4 py-2.5 text-sm rounded-lg border border-background-200 dark:border-foreground-800 bg-white dark:bg-foreground-900 text-foreground-900 dark:text-foreground-100 focus:outline-none focus:ring-2 focus:ring-primary-500/30 font-body" 
                      />
                    </div>
                  </div>
                </div>
              )}
              <button
                onClick={handleSave}
                disabled={!hasChanges}
                className={`px-5 py-2.5 text-sm font-semibold rounded-lg transition-all whitespace-nowrap font-body ${hasChanges ? 'bg-primary-500 text-white hover:bg-primary-600 cursor-pointer' : 'bg-background-100 dark:bg-foreground-800 text-foreground-400 dark:text-foreground-500 cursor-not-allowed'}`}
              >
                <i className="ri-save-line mr-1.5"></i>Save Changes
              </button>
            </div>
          )}

          {/* Tax Tab */}
          {activeTab === 'tax' && (
            <div className="space-y-5">
              <h3 className="text-base font-bold text-foreground-950 dark:text-foreground-100 font-heading">Tax Configuration</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <div className="flex items-center gap-1.5 mb-1.5">
                    <label className="block text-xs font-semibold text-foreground-600 dark:text-foreground-300 font-body">VAT Rate (%)</label>
                    <div className="group relative flex items-center">
                      <i className="ri-information-line text-foreground-400 cursor-help text-sm"></i>
                      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 p-2 bg-foreground-900 text-white text-[10px] rounded shadow-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10 text-center">Value Added Tax applied to goods and services.</div>
                    </div>
                  </div>
                  <input type="number" step="0.5" value={taxState.vatRate} onChange={(e) => setTaxState({ ...taxState, vatRate: Number(e.target.value) })} className="w-full px-4 py-2.5 text-sm rounded-lg border border-background-200 dark:border-foreground-800 bg-white dark:bg-foreground-900 text-foreground-900 dark:text-foreground-100 focus:outline-none focus:ring-2 focus:ring-primary-500/30 font-body" />
                </div>
                <div>
                  <div className="flex items-center gap-1.5 mb-1.5">
                    <label className="block text-xs font-semibold text-foreground-600 dark:text-foreground-300 font-body">NHIL Rate (%)</label>
                    <div className="group relative flex items-center">
                      <i className="ri-information-line text-foreground-400 cursor-help text-sm"></i>
                      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 p-2 bg-foreground-900 text-white text-[10px] rounded shadow-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10 text-center">National Health Insurance Levy.</div>
                    </div>
                  </div>
                  <input type="number" step="0.5" value={taxState.nhilRate} onChange={(e) => setTaxState({ ...taxState, nhilRate: Number(e.target.value) })} className="w-full px-4 py-2.5 text-sm rounded-lg border border-background-200 dark:border-foreground-800 bg-white dark:bg-foreground-900 text-foreground-900 dark:text-foreground-100 focus:outline-none focus:ring-2 focus:ring-primary-500/30 font-body" />
                </div>
                <div>
                  <div className="flex items-center gap-1.5 mb-1.5">
                    <label className="block text-xs font-semibold text-foreground-600 dark:text-foreground-300 font-body">GETFund Rate (%)</label>
                    <div className="group relative flex items-center">
                      <i className="ri-information-line text-foreground-400 cursor-help text-sm"></i>
                      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 p-2 bg-foreground-900 text-white text-[10px] rounded shadow-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10 text-center">Ghana Education Trust Fund Levy.</div>
                    </div>
                  </div>
                  <input type="number" step="0.5" value={taxState.getfundRate} onChange={(e) => setTaxState({ ...taxState, getfundRate: Number(e.target.value) })} className="w-full px-4 py-2.5 text-sm rounded-lg border border-background-200 dark:border-foreground-800 bg-white dark:bg-foreground-900 text-foreground-900 dark:text-foreground-100 focus:outline-none focus:ring-2 focus:ring-primary-500/30 font-body" />
                </div>
                <div>
                  <div className="flex items-center gap-1.5 mb-1.5">
                    <label className="block text-xs font-semibold text-foreground-600 dark:text-foreground-300 font-body">COVID-19 Levy (%)</label>
                    <div className="group relative flex items-center">
                      <i className="ri-information-line text-foreground-400 cursor-help text-sm"></i>
                      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 p-2 bg-foreground-900 text-white text-[10px] rounded shadow-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10 text-center">COVID-19 Health Recovery Levy.</div>
                    </div>
                  </div>
                  <input type="number" step="0.5" value={taxState.covidRate} onChange={(e) => setTaxState({ ...taxState, covidRate: Number(e.target.value) })} className="w-full px-4 py-2.5 text-sm rounded-lg border border-background-200 dark:border-foreground-800 bg-white dark:bg-foreground-900 text-foreground-900 dark:text-foreground-100 focus:outline-none focus:ring-2 focus:ring-primary-500/30 font-body" />
                </div>
                <div>
                  <div className="flex items-center gap-1.5 mb-1.5">
                    <label className="block text-xs font-semibold text-foreground-600 dark:text-foreground-300 font-body">Tourism Levy (%)</label>
                    <div className="group relative flex items-center">
                      <i className="ri-information-line text-foreground-400 cursor-help text-sm"></i>
                      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 p-2 bg-foreground-900 text-white text-[10px] rounded shadow-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10 text-center">Required for licensed hospitality & catering establishments.</div>
                    </div>
                  </div>
                  <input type="number" step="0.5" value={taxState.tourismRate} onChange={(e) => setTaxState({ ...taxState, tourismRate: Number(e.target.value) })} className="w-full px-4 py-2.5 text-sm rounded-lg border border-background-200 dark:border-foreground-800 bg-white dark:bg-foreground-900 text-foreground-900 dark:text-foreground-100 focus:outline-none focus:ring-2 focus:ring-primary-500/30 font-body" />
                </div>
                <div>
                  <div className="flex items-center gap-1.5 mb-1.5">
                    <label className="block text-xs font-semibold text-foreground-600 dark:text-foreground-300 font-body">Service Charge (%)</label>
                    <div className="group relative flex items-center">
                      <i className="ri-information-line text-foreground-400 cursor-help text-sm"></i>
                      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 p-2 bg-foreground-900 text-white text-[10px] rounded shadow-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10 text-center">Gratuity or standard service fee applied to all bills.</div>
                    </div>
                  </div>
                  <input type="number" step="0.5" value={taxState.serviceCharge} onChange={(e) => setTaxState({ ...taxState, serviceCharge: Number(e.target.value) })} className="w-full px-4 py-2.5 text-sm rounded-lg border border-background-200 dark:border-foreground-800 bg-white dark:bg-foreground-900 text-foreground-900 dark:text-foreground-100 focus:outline-none focus:ring-2 focus:ring-primary-500/30 font-body" />
                </div>
              </div>
              <div className="p-4 rounded-xl bg-background-50 dark:bg-foreground-800/30 border border-background-200 dark:border-foreground-800">
                <p className="text-xs text-foreground-500 font-body">
                  Total tax rate: <strong className="text-foreground-800 dark:text-foreground-200">{(taxState.vatRate + taxState.nhilRate + taxState.getfundRate + taxState.covidRate + taxState.tourismRate).toFixed(1)}%</strong> + Service Charge: <strong className="text-foreground-800 dark:text-foreground-200">{taxState.serviceCharge}%</strong>
                </p>
              </div>
              <button
                onClick={handleSave}
                disabled={!hasChanges}
                className={`px-5 py-2.5 text-sm font-semibold rounded-lg transition-all whitespace-nowrap font-body ${hasChanges ? 'bg-primary-500 text-white hover:bg-primary-600 cursor-pointer' : 'bg-background-100 dark:bg-foreground-800 text-foreground-400 dark:text-foreground-500 cursor-not-allowed'}`}
              >
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
                  { key: 'newOrderSound', label: 'New Order Sound Alert', desc: 'Play a sound when a new order comes in', hasTest: true },
                  { key: 'newOrderNotify', label: 'New Order Notification', desc: 'Show a notification toast for new orders' },
                  { key: 'lowStockNotify', label: 'Low Stock Alerts', desc: 'Notify when inventory items run low' },
                  { key: 'negativeFeedbackNotify', label: 'Negative Feedback Alert', desc: 'Alert for reviews rated 2 stars or below' },
                  { key: 'dailyReportEmail', label: 'Daily Report Email', desc: 'Receive a daily summary via email' },
                ].map((item) => (
                  <div key={item.key} className="flex items-center justify-between p-4 rounded-xl border border-background-200 dark:border-foreground-800">
                    <div>
                      <p className="text-sm font-semibold text-foreground-900 dark:text-foreground-100 font-body">{item.label}</p>
                      <p className="text-xs text-foreground-400 font-body mb-2">{item.desc}</p>
                      {item.hasTest && (
                        <button onClick={playTestSound} className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-background-100 dark:bg-foreground-800 text-foreground-600 dark:text-foreground-300 hover:bg-background-200 transition-all cursor-pointer font-body inline-flex items-center">
                          <i className="ri-volume-up-line mr-1"></i>Test Sound
                        </button>
                      )}
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
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-foreground-600 dark:text-foreground-300 mb-1.5 font-body">Global Low Stock Threshold</label>
                  <div className="flex items-center gap-2">
                    <input type="number" defaultValue={restaurantSettings.notifications.lowStockThreshold} className="w-full max-w-[120px] px-4 py-2.5 text-sm rounded-lg border border-background-200 dark:border-foreground-800 bg-white dark:bg-foreground-900 text-foreground-900 dark:text-foreground-100 focus:outline-none focus:ring-2 focus:ring-primary-500/30 font-body" />
                    <span className="text-xs text-foreground-400 font-body italic">(Overrides individual item settings)</span>
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-foreground-600 dark:text-foreground-300 mb-1.5 font-body">Daily Report Time</label>
                  <input type="time" defaultValue={restaurantSettings.notifications.dailyReportTime} className="w-full max-w-[120px] px-4 py-2.5 text-sm rounded-lg border border-background-200 dark:border-foreground-800 bg-white dark:bg-foreground-900 text-foreground-900 dark:text-foreground-100 focus:outline-none focus:ring-2 focus:ring-primary-500/30 font-body" />
                </div>
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
                            className={`flex-1 p-3 rounded-lg border text-center transition-all cursor-pointer ${alertFrequency === opt.value
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
                            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all cursor-pointer border ${alertCategories.includes(cat)
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
                        className={`px-4 py-2.5 text-sm font-semibold rounded-lg border transition-all cursor-pointer whitespace-nowrap font-body ${testEmailSent
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

              <button
                onClick={handleSave}
                disabled={!hasChanges}
                className={`px-5 py-2.5 text-sm font-semibold rounded-lg transition-all whitespace-nowrap font-body ${hasChanges ? 'bg-primary-500 text-white hover:bg-primary-600 cursor-pointer' : 'bg-background-100 dark:bg-foreground-800 text-foreground-400 dark:text-foreground-500 cursor-not-allowed'}`}
              >
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
                  <div className="flex items-center gap-2">
                    {['#FF6B35', '#22C55E', '#3B82F6', '#8B5CF6', '#EC4899'].map(color => (
                      <button
                        key={color}
                        onClick={() => {
                          setPrimaryColorHex(color);
                          document.documentElement.style.setProperty('--color-primary-500', color);
                          document.documentElement.style.setProperty('--color-primary-600', color);
                          document.documentElement.style.setProperty('--color-primary-400', color);
                        }}
                        className={`w-7 h-7 rounded-full border-2 transition-transform cursor-pointer ${primaryColorHex === color ? 'border-foreground-900 dark:border-white scale-110' : 'border-transparent hover:scale-110'}`}
                        style={{ backgroundColor: color }}
                        aria-label={`Theme ${color}`}
                      />
                    ))}
                    <div className="w-px h-5 bg-background-200 dark:bg-foreground-800 mx-1"></div>
                    <div className="relative group flex items-center justify-center w-7 h-7 rounded-full border-2 border-dashed border-background-300 dark:border-foreground-700 hover:border-foreground-500 transition-all cursor-pointer overflow-hidden">
                      <input
                        type="color"
                        value={primaryColorHex}
                        onChange={(e) => {
                          const val = e.target.value;
                          setPrimaryColorHex(val);
                          document.documentElement.style.setProperty('--color-primary-500', val);
                          document.documentElement.style.setProperty('--color-primary-600', val);
                          document.documentElement.style.setProperty('--color-primary-400', val);
                        }}
                        className="absolute inset-0 w-16 h-16 -top-4 -left-4 cursor-pointer opacity-0"
                      />
                      <i className="ri-palette-line text-foreground-400 group-hover:text-foreground-600 dark:group-hover:text-foreground-300 text-xs pointer-events-none"></i>
                    </div>
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-foreground-600 dark:text-foreground-300 mb-1.5 font-body">Display Language</label>
                  <CustomSelect
                    value={'English'}
                    onChange={() => { }}
                    options={['English']}
                  />
                  <p className="text-[10px] text-foreground-400 mt-1.5 italic font-body">Other languages coming soon.</p>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-foreground-600 dark:text-foreground-300 mb-1.5 font-body">Currency</label>
                  <CustomSelect
                    value={currency}
                    onChange={(val) => setCurrency(val)}
                    options={[
                      { label: 'GHS (₵) - Ghana Cedi', value: 'GHS' },
                      { label: 'USD ($) - US Dollar', value: 'USD' },
                      { label: 'EUR (€) - Euro', value: 'EUR' }
                    ]}
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-foreground-600 dark:text-foreground-300 mb-1.5 font-body">Date Format</label>
                  <CustomSelect
                    value={dateFormat}
                    onChange={(val) => setDateFormat(val)}
                    options={['DD/MM/YYYY', 'MM/DD/YYYY', 'YYYY-MM-DD']}
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-foreground-600 dark:text-foreground-300 mb-1.5 font-body">Time Format</label>
                  <CustomSelect
                    value={timeFormat}
                    onChange={(val) => setTimeFormat(val)}
                    options={['24-hour', '12-hour (AM/PM)']}
                  />
                </div>
              </div>
              <button
                onClick={handleSave}
                disabled={!hasChanges}
                className={`px-5 py-2.5 text-sm font-semibold rounded-lg transition-all whitespace-nowrap font-body ${hasChanges ? 'bg-primary-500 text-white hover:bg-primary-600 cursor-pointer' : 'bg-background-100 dark:bg-foreground-800 text-foreground-400 dark:text-foreground-500 cursor-not-allowed'}`}
              >
                <i className="ri-save-line mr-1.5"></i>Save Changes
              </button>
            </div>
          )}

          {/* Subscription Tab */}
          {activeTab === 'subscription' && (
            <SubscriptionBillingSection />
          )}
        </div>
      </div>
    </div>
  );
}