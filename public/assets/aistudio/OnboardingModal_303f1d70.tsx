import React, { useState } from 'react';
import {
  ShieldAlert,
  CheckCircle2,
  Lock,
  UserCheck,
  CreditCard,
  Smartphone,
  Mail,
  HardDrive,
  ArrowRight,
  Plus,
  Trash2,
  HeartHandshake,
  Zap,
  AlertTriangle,
} from 'lucide-react';
import {
  ConnectedFinancialRail,
  OnboardingRecord,
  SponsorProfile,
} from '../data/threatDatabase';
import { GoogleSignInButton } from './GoogleSignInButton';

interface OnboardingModalProps {
  isOpen: boolean;
  needsAuth: boolean;
  isLoggingIn: boolean;
  userEmail: string | null;
  onGoogleLogin: () => Promise<void>;
  initialRecord: OnboardingRecord;
  initialSponsor: SponsorProfile;
  onCompleteOnboarding: (
    record: OnboardingRecord,
    sponsor: SponsorProfile,
    plainSponsorPin: string,
    triggerAutoLockdown: boolean
  ) => void;
}

export const OnboardingModal: React.FC<OnboardingModalProps> = ({
  isOpen,
  needsAuth,
  isLoggingIn,
  userEmail,
  onGoogleLogin,
  initialRecord,
  initialSponsor,
  onCompleteOnboarding,
}) => {
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);

  // Step 1: Ethical & Privacy Consent Flags
  const [consumerName, setConsumerName] = useState(initialRecord.protectedConsumerName || '');
  const [consentEmail, setConsentEmail] = useState(initialRecord.consentedToEmailScan);
  const [consentFinance, setConsentFinance] = useState(initialRecord.consentedToFinancialAudit);
  const [consentBrowser, setConsentBrowser] = useState(initialRecord.consentedToBrowserSabotage);
  const [consentSponsor, setConsentSponsor] = useState(initialRecord.consentedToSponsorLock);

  // Step 2: Sponsor / Accountability Partner Info
  const [sponsorName, setSponsorName] = useState(initialSponsor.fullName || '');
  const [sponsorRelationship, setSponsorRelationship] = useState(
    initialSponsor.relationship || 'Spouse / Partner / Recovery Sponsor'
  );
  const [sponsorEmail, setSponsorEmail] = useState(initialSponsor.email || '');
  const [sponsorPhone, setSponsorPhone] = useState(initialSponsor.phone || '');
  const [secondaryName, setSecondaryName] = useState(initialSponsor.secondaryContactName || '');
  const [secondaryPhone, setSecondaryPhone] = useState(initialSponsor.secondaryContactPhone || '');
  const [sponsorPin, setSponsorPin] = useState('849201');
  const [notifyOnPanic, setNotifyOnPanic] = useState(true);
  const [notifyOnUnlock, setNotifyOnUnlock] = useState(true);

  // Step 3: Google Accounts, Financial Apps, Payment Rails & Devices
  const [rails, setRails] = useState<ConnectedFinancialRail[]>(initialRecord.connectedRails);
  const [devices, setDevices] = useState<string[]>(
    initialRecord.protectedDevices.length > 0
      ? initialRecord.protectedDevices
      : [
          'Windows Desktop PC (Chrome Profile & OS Hosts Sinkhole)',
          'Primary Android / iOS Smartphone (Mobile Wallet & CashApp)',
        ]
  );
  const [newInstitution, setNewInstitution] = useState('');
  const [newCategory, setNewCategory] = useState<ConnectedFinancialRail['railCategory']>(
    'P2P App (CashApp / Venmo)'
  );
  const [newIdentifier, setNewIdentifier] = useState('');
  const [newDevice, setNewDevice] = useState('');
  const [newDeviceItem, setNewDeviceItem] = useState('');

  if (!isOpen) return null;

  const allConsentsGiven =
    consumerName.trim().length >= 2 &&
    consentEmail &&
    consentFinance &&
    consentBrowser &&
    consentSponsor;

  const sponsorValid =
    sponsorName.trim().length >= 2 &&
    sponsorEmail.includes('@') &&
    sponsorPhone.trim().length >= 7 &&
    sponsorPin.trim().length === 6;

  const handleAddRail = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newInstitution.trim() || !newIdentifier.trim()) return;
    setRails((prev) => [
      ...prev,
      {
        id: `rail-${Date.now()}`,
        institutionName: newInstitution.trim(),
        railCategory: newCategory,
        accountIdentifier: newIdentifier.trim(),
        deviceUsed: newDevice.trim() || 'Primary Device',
        status: 'MONITORED_AND_LOCKED',
      },
    ]);
    setNewInstitution('');
    setNewIdentifier('');
    setNewDevice('');
  };

  const handleAddDevice = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDeviceItem.trim()) return;
    setDevices((prev) => [...prev, newDeviceItem.trim()]);
    setNewDeviceItem('');
  };

  const handleFinish = (runAutoEnforcement: boolean) => {
    const updatedRecord: OnboardingRecord = {
      completed: true,
      completedAt: new Date().toISOString(),
      consentedToEmailScan: consentEmail,
      consentedToFinancialAudit: consentFinance,
      consentedToBrowserSabotage: consentBrowser,
      consentedToSponsorLock: consentSponsor,
      protectedConsumerName: consumerName.trim() || 'Protected User',
      protectedDevices: devices,
      connectedRails: rails,
    };

    const updatedSponsor: SponsorProfile = {
      fullName: sponsorName.trim(),
      relationship: sponsorRelationship.trim(),
      email: sponsorEmail.trim(),
      phone: sponsorPhone.trim(),
      secondaryContactName: secondaryName.trim(),
      secondaryContactPhone: secondaryPhone.trim(),
      overridePinHash: initialSponsor.overridePinHash,
      notifyOnPanic,
      notifyOnUnlockAttempt: notifyOnUnlock,
      notifyOnWeeklyAudit: true,
    };

    onCompleteOnboarding(updatedRecord, updatedSponsor, sponsorPin.trim(), runAutoEnforcement);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-[#090D16]/95 backdrop-blur-md p-4 overflow-y-auto"
      role="dialog"
      aria-modal="true"
    >
      <div className="w-full max-w-4xl bg-[#0F1624] border-2 border-emerald-500/80 rounded-2xl p-6 md:p-8 shadow-2xl space-y-6 my-8">
        {/* Top Hero Header */}
        <div className="border-b border-slate-800 pb-5 flex flex-wrap items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/40 text-emerald-300 text-xs font-mono uppercase tracking-wider">
              <ShieldAlert className="w-3.5 h-3.5" />
              <span>Last-Resort Autonomous Online Gambling Defense System</span>
            </div>
            <h1 className="text-3xl md:text-4xl font-extrabold text-white tracking-tight mt-1">
              AEGIS-ZERO
            </h1>
            <p className="text-xs md:text-sm text-slate-300 max-w-2xl">
              Autonomous Financial Rail Auditor, Gmail Promo Kill-Switch, Browser/OS Enforcer &amp; Sponsor-Locked Ulysses Vault.
            </p>
          </div>
          <div className="flex items-center gap-2 text-xs font-mono">
            {[1, 2, 3, 4].map((n) => (
              <span
                key={n}
                className={`px-2.5 py-1 rounded-md border ${
                  step === n
                    ? 'bg-emerald-500 text-slate-950 font-bold border-emerald-400'
                    : step > n
                    ? 'bg-emerald-950/60 text-emerald-300 border-emerald-700/60'
                    : 'bg-[#090D16] text-slate-500 border-slate-800'
                }`}
              >
                0{n}
              </span>
            ))}
          </div>
        </div>

        {/* STEP 1: ETHICAL & PRIVACY INFORMED CONSENT */}
        {step === 1 && (
          <div className="space-y-5">
            <div className="p-4 bg-[#090D16] border border-slate-800 rounded-xl space-y-2">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <Lock className="w-5 h-5 text-emerald-400" />
                <span>Step 1 of 4: Informed Consent, Privacy &amp; Last-Resort Authorization</span>
              </h2>
              <p className="text-xs text-slate-300 leading-relaxed">
                AEGIS-ZERO is engineered as a definitive last resort for individuals who have battled online casinos, fish-table sweepstakes apps, and impulsive deposit rails. Because this system actively scans your connected inbox, audits transaction statements, blocks domains, and locks settings behind a Sponsor Key, please review and explicitly approve each permission below.
              </p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Your Full Legal Name (Used for Statutory Self-Exclusion &amp; Payment Revocation Notices)
              </label>
              <input
                type="text"
                value={consumerName}
                onChange={(e) => setConsumerName(e.target.value)}
                placeholder="Enter your full name..."
                className="w-full px-3.5 py-2.5 bg-[#090D16] border border-slate-700 rounded-lg text-sm text-white focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div className="space-y-2.5">
              <label className="flex items-start gap-3 p-3.5 bg-[#090D16] border border-slate-800 rounded-lg cursor-pointer hover:border-slate-700">
                <input
                  type="checkbox"
                  checked={consentEmail}
                  onChange={(e) => setConsentEmail(e.target.checked)}
                  className="mt-1 rounded border-slate-700 bg-slate-900 text-emerald-500"
                />
                <div className="text-xs">
                  <div className="font-semibold text-white">
                    1. Consent to Automated Gmail &amp; Google Drive Threat Scanning
                  </div>
                  <p className="text-slate-400 mt-0.5">
                    I authorize AEGIS-ZERO to scan my connected Google account for casino promotional emails, VIP host offers, and Drive financial statements, and to deploy automatic trash filters and legal self-exclusion notices.
                  </p>
                </div>
              </label>

              <label className="flex items-start gap-3 p-3.5 bg-[#090D16] border border-slate-800 rounded-lg cursor-pointer hover:border-slate-700">
                <input
                  type="checkbox"
                  checked={consentFinance}
                  onChange={(e) => setConsentFinance(e.target.checked)}
                  className="mt-1 rounded border-slate-700 bg-slate-900 text-emerald-500"
                />
                <div className="text-xs">
                  <div className="font-semibold text-white">
                    2. Consent to Financial Rail, Bank, Card, CashApp &amp; Crypto Auditing
                  </div>
                  <p className="text-slate-400 mt-0.5">
                    I authorize AEGIS-ZERO to inspect my disclosed bank rails, debit/credit descriptors, P2P $cashtag transfers, and crypto on-ramps to calculate cumulative leakage and revoke payment authorization under Regulation E.
                  </p>
                </div>
              </label>

              <label className="flex items-start gap-3 p-3.5 bg-[#090D16] border border-slate-800 rounded-lg cursor-pointer hover:border-slate-700">
                <input
                  type="checkbox"
                  checked={consentBrowser}
                  onChange={(e) => setConsentBrowser(e.target.checked)}
                  className="mt-1 rounded border-slate-700 bg-slate-900 text-emerald-500"
                />
                <div className="text-xs">
                  <div className="font-semibold text-white">
                    3. Consent to Active Browser DOM Sabotage &amp; OS Sinkhole Lockdown
                  </div>
                  <p className="text-slate-400 mt-0.5">
                    I authorize AEGIS-ZERO to compile and enforce browser extensions and OS hosts sinkholes that blur casino canvases, sever WebSocket game feeds, inject input lag, and trigger audio/voice alarms if I attempt to gamble.
                  </p>
                </div>
              </label>

              <label className="flex items-start gap-3 p-3.5 bg-[#090D16] border border-slate-800 rounded-lg cursor-pointer hover:border-slate-700">
                <input
                  type="checkbox"
                  checked={consentSponsor}
                  onChange={(e) => setConsentSponsor(e.target.checked)}
                  className="mt-1 rounded border-slate-700 bg-slate-900 text-emerald-500"
                />
                <div className="text-xs">
                  <div className="font-semibold text-white">
                    4. Consent to Cryptographic Sponsor / Accountability Partner Lock
                  </div>
                  <p className="text-slate-400 mt-0.5">
                    I understand that once armed, I cannot remove blocked sites or disable protection without my Sponsor&apos;s override PIN, a 3-stage cognitive cooldown, and a mandatory 24-hour waiting period.
                  </p>
                </div>
              </label>
            </div>

            <div className="flex items-center justify-end pt-2">
              <button
                type="button"
                disabled={!allConsentsGiven}
                onClick={() => setStep(2)}
                className="flex items-center gap-2 px-5 py-2.5 text-xs font-semibold bg-emerald-500 text-slate-950 hover:bg-emerald-400 disabled:opacity-40 rounded-lg transition-colors cursor-pointer"
              >
                <span>Approve Permissions &amp; Continue to Sponsor Setup</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 2: SPONSOR / ACCOUNTABILITY PARTNER REGISTRATION */}
        {step === 2 && (
          <div className="space-y-5">
            <div className="p-4 bg-[#090D16] border border-slate-800 rounded-xl space-y-1.5">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <HeartHandshake className="w-5 h-5 text-emerald-400" />
                <span>Step 2 of 4: Register Your Sponsor / Accountability Partner</span>
              </h2>
              <p className="text-xs text-slate-300 leading-relaxed">
                Enter the contact information for the person aiding your recovery (spouse, partner, family member, or recovery sponsor). AEGIS-ZERO will alert them if a high-risk gambling trigger is intercepted or if an unlock is requested.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-slate-400 mb-1">
                  Sponsor / Partner Full Name *
                </label>
                <input
                  type="text"
                  value={sponsorName}
                  onChange={(e) => setSponsorName(e.target.value)}
                  placeholder="e.g. Molly Wadsworth"
                  className="w-full px-3.5 py-2 bg-[#090D16] border border-slate-700 rounded-lg text-xs text-white"
                />
              </div>
              <div>
                <label className="block text-xs text-slate-400 mb-1">
                  Relationship to You *
                </label>
                <input
                  type="text"
                  value={sponsorRelationship}
                  onChange={(e) => setSponsorRelationship(e.target.value)}
                  placeholder="e.g. Wife / Partner / Recovery Sponsor"
                  className="w-full px-3.5 py-2 bg-[#090D16] border border-slate-700 rounded-lg text-xs text-white"
                />
              </div>
              <div>
                <label className="block text-xs text-slate-400 mb-1">
                  Sponsor Email Address (For Automated Alert Dispatches) *
                </label>
                <input
                  type="email"
                  value={sponsorEmail}
                  onChange={(e) => setSponsorEmail(e.target.value)}
                  placeholder="sponsor@example.com"
                  className="w-full px-3.5 py-2 bg-[#090D16] border border-slate-700 rounded-lg text-xs font-mono text-white"
                />
              </div>
              <div>
                <label className="block text-xs text-slate-400 mb-1">
                  Sponsor Direct Phone / SMS Number *
                </label>
                <input
                  type="tel"
                  value={sponsorPhone}
                  onChange={(e) => setSponsorPhone(e.target.value)}
                  placeholder="e.g. (214) 555-0199"
                  className="w-full px-3.5 py-2 bg-[#090D16] border border-slate-700 rounded-lg text-xs font-mono text-white"
                />
              </div>
              <div>
                <label className="block text-xs text-slate-400 mb-1">
                  Backup Support Contact Name (Optional)
                </label>
                <input
                  type="text"
                  value={secondaryName}
                  onChange={(e) => setSecondaryName(e.target.value)}
                  placeholder="e.g. Brother / Family Member"
                  className="w-full px-3.5 py-2 bg-[#090D16] border border-slate-700 rounded-lg text-xs text-white"
                />
              </div>
              <div>
                <label className="block text-xs text-slate-400 mb-1">
                  6-Digit Sponsor Override PIN (Have Sponsor Set or Keep This) *
                </label>
                <input
                  type="text"
                  maxLength={6}
                  value={sponsorPin}
                  onChange={(e) => setSponsorPin(e.target.value.replace(/[^0-9]/g, ''))}
                  placeholder="6-digit numeric PIN"
                  className="w-full px-3.5 py-2 bg-[#090D16] border border-amber-500/60 rounded-lg text-xs font-mono text-amber-300"
                />
              </div>
            </div>

            <div className="p-3.5 bg-[#090D16] border border-slate-800 rounded-lg flex flex-wrap items-center gap-6 text-xs">
              <label className="flex items-center gap-2 text-slate-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={notifyOnPanic}
                  onChange={(e) => setNotifyOnPanic(e.target.checked)}
                  className="rounded border-slate-700 bg-slate-900 text-emerald-500"
                />
                <span>Email Sponsor immediately if Panic / High-Risk Scan Triggers</span>
              </label>
              <label className="flex items-center gap-2 text-slate-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={notifyOnUnlock}
                  onChange={(e) => setNotifyOnUnlock(e.target.checked)}
                  className="rounded border-slate-700 bg-slate-900 text-emerald-500"
                />
                <span>Email Sponsor if Ulysses Blocklist Unlock is Attempted</span>
              </label>
            </div>

            <div className="flex items-center justify-between pt-2">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="px-4 py-2 text-xs font-medium text-slate-300 bg-[#090D16] border border-slate-700 rounded-lg"
              >
                Back
              </button>
              <button
                type="button"
                disabled={!sponsorValid}
                onClick={() => setStep(3)}
                className="flex items-center gap-2 px-5 py-2.5 text-xs font-semibold bg-emerald-500 text-slate-950 hover:bg-emerald-400 disabled:opacity-40 rounded-lg transition-colors cursor-pointer"
              >
                <span>Save Sponsor Vault &amp; Connect Accounts</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 3: GOOGLE ACCOUNTS, FINANCIAL RAILS & DEVICE MAPPING */}
        {step === 3 && (
          <div className="space-y-5">
            <div className="p-4 bg-[#090D16] border border-slate-800 rounded-xl space-y-1.5">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-emerald-400" />
                <span>Step 3 of 4: Connect Google Workspace, Banking Rails &amp; Devices</span>
              </h2>
              <p className="text-xs text-slate-300 leading-relaxed">
                Sign in with your Google Account to grant Gmail &amp; Drive scanning permissions, and register every bank account, card, P2P handle (CashApp/Venmo), crypto on-ramp, and device you use so AEGIS-ZERO can sever every deposit vector.
              </p>
            </div>

            {/* Google Account OAuth Connection Box */}
            <div className="p-4 bg-[#090D16] border border-slate-800 rounded-xl flex flex-wrap items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="text-xs font-semibold text-white flex items-center gap-2">
                  <Mail className="w-4 h-4 text-emerald-400" />
                  <HardDrive className="w-4 h-4 text-emerald-400" />
                  <span>Google Account OAuth (Gmail Promo Purge + Drive Statement Scanner)</span>
                </div>
                <p className="text-xs text-slate-400">
                  {needsAuth
                    ? 'Connect your Google account so One-Click Auto-Enforce can scan your inbox and deploy filters.'
                    : `Connected as ${userEmail || 'Authorized Google Account'} — Full Gmail & Drive Scopes Active.`}
                </p>
              </div>
              {needsAuth ? (
                <GoogleSignInButton
                  onClick={onGoogleLogin}
                  isLoading={isLoggingIn}
                  label="Sign in with Google & Grant Permissions"
                />
              ) : (
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500/20 border border-emerald-500/40 text-xs font-semibold text-emerald-300">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Google Workspace Authorized</span>
                </span>
              )}
            </div>

            {/* Financial Institutions & Payment Rails */}
            <div className="space-y-3">
              <div className="text-xs font-semibold text-white">
                Connected Banks, Cards, P2P Apps &amp; Crypto Payment Rails ({rails.length})
              </div>
              <form onSubmit={handleAddRail} className="grid grid-cols-1 sm:grid-cols-12 gap-2">
                <input
                  type="text"
                  value={newInstitution}
                  onChange={(e) => setNewInstitution(e.target.value)}
                  placeholder="Bank / App (e.g. Chase, CashApp, Chime, Robinhood)"
                  className="sm:col-span-3 px-3 py-2 bg-[#090D16] border border-slate-700 rounded-lg text-xs text-white"
                />
                <select
                  value={newCategory}
                  onChange={(e) =>
                    setNewCategory(e.target.value as ConnectedFinancialRail['railCategory'])
                  }
                  className="sm:col-span-3 px-3 py-2 bg-[#090D16] border border-slate-700 rounded-lg text-xs text-white"
                >
                  <option value="P2P App (CashApp / Venmo)">P2P App (CashApp / Venmo)</option>
                  <option value="Debit / Credit Card">Debit / Credit Card</option>
                  <option value="Primary Checking / ACH">Primary Checking / ACH</option>
                  <option value="Crypto Exchange / On-Ramp">Crypto Exchange / On-Ramp</option>
                </select>
                <input
                  type="text"
                  value={newIdentifier}
                  onChange={(e) => setNewIdentifier(e.target.value)}
                  placeholder="Last 4 digits, $Cashtag, or Wallet"
                  className="sm:col-span-4 px-3 py-2 bg-[#090D16] border border-slate-700 rounded-lg text-xs font-mono text-white"
                />
                <button
                  type="submit"
                  className="sm:col-span-2 flex items-center justify-center gap-1 px-3 py-2 bg-emerald-500 text-slate-950 font-semibold text-xs rounded-lg hover:bg-emerald-400"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Rail</span>
                </button>
              </form>

              <div className="space-y-1.5 max-h-36 overflow-y-auto">
                {rails.map((r) => (
                  <div
                    key={r.id}
                    className="flex items-center justify-between gap-2 px-3 py-2 bg-[#090D16] border border-slate-800 rounded-lg text-xs"
                  >
                    <div>
                      <span className="font-semibold text-white">{r.institutionName}</span>{' '}
                      <span className="text-slate-400">({r.railCategory})</span> —{' '}
                      <span className="font-mono text-amber-300">{r.accountIdentifier}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setRails((prev) => prev.filter((item) => item.id !== r.id))}
                      className="text-slate-500 hover:text-red-400"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Monitored Devices */}
            <div className="space-y-2">
              <div className="text-xs font-semibold text-white flex items-center gap-1.5">
                <Smartphone className="w-4 h-4 text-emerald-400" />
                <span>Protected Devices &amp; Browser Profiles ({devices.length})</span>
              </div>
              <form onSubmit={handleAddDevice} className="flex items-center gap-2">
                <input
                  type="text"
                  value={newDeviceItem}
                  onChange={(e) => setNewDeviceItem(e.target.value)}
                  placeholder="Add device (e.g. Xiaomi Redmi Note 13 Pro+, Pixel 7a, Windows Desktop PC)..."
                  className="flex-1 px-3 py-1.5 bg-[#090D16] border border-slate-700 rounded-lg text-xs text-white"
                />
                <button
                  type="submit"
                  className="px-3 py-1.5 bg-slate-800 text-slate-200 border border-slate-700 rounded-lg text-xs font-medium hover:bg-slate-700"
                >
                  Add Device
                </button>
              </form>
              <div className="flex flex-wrap gap-2">
                {devices.map((dev, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-[#090D16] border border-slate-800 rounded-md text-xs text-slate-300 font-mono"
                  >
                    {dev}
                  </span>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-between pt-2">
              <button
                type="button"
                onClick={() => setStep(2)}
                className="px-4 py-2 text-xs font-medium text-slate-300 bg-[#090D16] border border-slate-700 rounded-lg"
              >
                Back
              </button>
              <button
                type="button"
                onClick={() => setStep(4)}
                className="flex items-center gap-2 px-5 py-2.5 text-xs font-semibold bg-emerald-500 text-slate-950 hover:bg-emerald-400 rounded-lg transition-colors cursor-pointer"
              >
                <span>Review Custom Intervention Plan</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 4: ONE-CLICK AUTOMATIC SCAN, RESTRICT & MONITOR LAUNCH */}
        {step === 4 && (
          <div className="space-y-5">
            <div className="p-4 bg-[#090D16] border border-emerald-500/40 rounded-xl space-y-2">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <Zap className="w-5 h-5 text-emerald-400" />
                <span>Step 4 of 4: Custom Stop-Gambling Blueprint Ready for One-Click Execution</span>
              </h2>
              <p className="text-xs text-slate-300 leading-relaxed">
                AEGIS-ZERO has mapped your payment rails, devices, and Sponsor Vault. Clicking <strong>&ldquo;Engage One-Click Automatic Scan, Restrict &amp; Monitor&rdquo;</strong> will immediately execute the entire defense sequence:
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 text-xs">
              <div className="p-3.5 bg-[#090D16] border border-slate-800 rounded-lg space-y-1">
                <div className="font-semibold text-emerald-400">1. Automatic Inbox &amp; Statement Audit</div>
                <p className="text-slate-300">
                  Scans your connected Gmail and financial statement logs for hidden sweepstakes distributors (BitOfGold, Milky Way, Juwa, CrownCoins, PrizePicks) and calculates exact leakage.
                </p>
              </div>
              <div className="p-3.5 bg-[#090D16] border border-slate-800 rounded-lg space-y-1">
                <div className="font-semibold text-emerald-400">2. Automatic Gmail Promo Kill-Switch</div>
                <p className="text-slate-300">
                  Purges detected casino reload emails and deploys live auto-trash filters so VIP hosts and free-spin triggers never reach your eyes.
                </p>
              </div>
              <div className="p-3.5 bg-[#090D16] border border-slate-800 rounded-lg space-y-1">
                <div className="font-semibold text-emerald-400">3. Payment Rail Revocation &amp; Enforcer Package</div>
                <p className="text-slate-300">
                  Prepares Regulation E payment revocation demands for your {rails.length} registered payment rails and compiles your custom Chrome + OS sinkhole bundle.
                </p>
              </div>
              <div className="p-3.5 bg-[#090D16] border border-slate-800 rounded-lg space-y-1">
                <div className="font-semibold text-emerald-400">4. Cryptographic Sponsor Lock ({sponsorName})</div>
                <p className="text-slate-300">
                  Hashes your Sponsor&apos;s 6-digit PIN with SHA-256 and arms the 24-hour Ulysses Vault so restrictions cannot be undone during a craving.
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setStep(3)}
                className="px-4 py-2 text-xs font-medium text-slate-300 bg-[#090D16] border border-slate-700 rounded-lg"
              >
                Back
              </button>
              <div className="flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  onClick={() => handleFinish(false)}
                  className="px-4 py-2.5 text-xs font-medium text-slate-300 hover:text-white bg-[#090D16] border border-slate-700 rounded-lg"
                >
                  Save Profile &amp; Open Dashboard Manually
                </button>
                <button
                  type="button"
                  onClick={() => handleFinish(true)}
                  className="flex items-center gap-2 px-6 py-3 text-xs font-bold bg-emerald-500 text-slate-950 hover:bg-emerald-400 rounded-lg shadow-lg transition-colors cursor-pointer"
                >
                  <Zap className="w-4 h-4" />
                  <span>ENGAGE ONE-CLICK AUTOMATIC SCAN, RESTRICT &amp; MONITOR</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
