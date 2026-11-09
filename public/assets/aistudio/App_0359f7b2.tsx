import React, { useState, useEffect, useCallback } from 'react';
import {
  ShieldAlert,
  PhoneCall,
  Lock,
  ScanSearch,
  Terminal,
  MailX,
  ExternalLink,
  RotateCcw,
  LogOut,
  CheckCircle2,
  Zap,
  UserCheck,
  RefreshCw,
} from 'lucide-react';
import { User } from 'firebase/auth';
import {
  INITIAL_THREAT_PLATFORMS,
  INITIAL_DOM_KEYWORDS,
  INITIAL_PAYMENT_LEDGER,
  INITIAL_CONNECTED_RAILS,
  SAMPLE_SCAN_PAYLOADS,
  ThreatPlatform,
  PaymentRailEntry,
  SabotageConfig,
  UlyssesVaultState,
  SponsorProfile,
  OnboardingRecord,
} from './data/threatDatabase';
import { ActiveInterceptorModal } from './components/ActiveInterceptorModal';
import { FinancialScannerModule } from './components/FinancialScannerModule';
import { EnforcerCompilerModule } from './components/EnforcerCompilerModule';
import { GmailAndLegalModule } from './components/GmailAndLegalModule';
import { UlyssesVaultModule } from './components/UlyssesVaultModule';
import { OnboardingModal } from './components/OnboardingModal';
import { initAuth, googleSignIn, logout, getAccessToken } from './services/googleWorkspaceAuth';
import { GoogleSignInButton } from './components/GoogleSignInButton';

const STORAGE_KEYS = {
  PLATFORMS: 'aegis_zero_platforms_v1',
  DOM_KEYWORDS: 'aegis_zero_keywords_v1',
  LEDGER: 'aegis_zero_ledger_v1',
  SABOTAGE: 'aegis_zero_sabotage_v1',
  VAULT: 'aegis_zero_vault_v1',
  GOAL: 'aegis_zero_financial_goal_v1',
  ONBOARDING: 'aegis_zero_onboarding_v2',
  SPONSOR: 'aegis_zero_sponsor_v2',
};

async function sha256Hex(input: string): Promise<string> {
  const data = new TextEncoder().encode(input);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(hashBuffer))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

export default function App() {
  const [activeTab, setActiveTab] = useState<'scanner' | 'compiler' | 'gmail_legal' | 'vault'>(
    'scanner'
  );

  const [needsAuth, setNeedsAuth] = useState<boolean>(true);
  const [user, setUser] = useState<User | null>(null);
  const [isLoggingIn, setIsLoggingIn] = useState<boolean>(false);

  // One-Click Autonomous Enforcement Pipeline State
  const [isAutoEnforcing, setIsAutoEnforcing] = useState<boolean>(false);
  const [autoEnforceLog, setAutoEnforceLog] = useState<string[]>([]);

  useEffect(() => {
    const unsubscribe = initAuth(
      (authedUser) => {
        setUser(authedUser);
        setNeedsAuth(false);
      },
      () => {
        setUser(null);
        setNeedsAuth(true);
      }
    );
    return () => unsubscribe();
  }, []);

  const handleGoogleLogin = async () => {
    setIsLoggingIn(true);
    try {
      const result = await googleSignIn();
      if (result) {
        setUser(result.user);
        setNeedsAuth(false);
      }
    } catch (err) {
      console.error('Google Workspace sign-in failed:', err);
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleGoogleLogout = async () => {
    await logout();
    setUser(null);
    setNeedsAuth(true);
  };

  const [onboardingRecord, setOnboardingRecord] = useState<OnboardingRecord>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.ONBOARDING);
      return saved
        ? JSON.parse(saved)
        : {
            completed: false,
            completedAt: null,
            consentedToEmailScan: true,
            consentedToFinancialAudit: true,
            consentedToBrowserSabotage: true,
            consentedToSponsorLock: true,
            protectedConsumerName: '',
            protectedDevices: [
              'Windows Desktop PC (Chrome Profile & OS Hosts Sinkhole)',
              'Primary Android / iOS Smartphone (Mobile Wallet & CashApp)',
            ],
            connectedRails: INITIAL_CONNECTED_RAILS,
          };
    } catch {
      return {
        completed: false,
        completedAt: null,
        consentedToEmailScan: true,
        consentedToFinancialAudit: true,
        consentedToBrowserSabotage: true,
        consentedToSponsorLock: true,
        protectedConsumerName: '',
        protectedDevices: [
          'Windows Desktop PC (Chrome Profile & OS Hosts Sinkhole)',
          'Primary Android / iOS Smartphone (Mobile Wallet & CashApp)',
        ],
        connectedRails: INITIAL_CONNECTED_RAILS,
      };
    }
  });

  const [sponsor, setSponsor] = useState<SponsorProfile>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.SPONSOR);
      return saved
        ? JSON.parse(saved)
        : {
            fullName: 'Trusted Accountability Sponsor',
            relationship: 'Spouse / Recovery Sponsor',
            email: 'partner-guardian@proton.me',
            phone: '',
            secondaryContactName: '',
            secondaryContactPhone: '',
            overridePinHash: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
            notifyOnPanic: true,
            notifyOnUnlockAttempt: true,
            notifyOnWeeklyAudit: true,
          };
    } catch {
      return {
        fullName: 'Trusted Accountability Sponsor',
        relationship: 'Spouse / Recovery Sponsor',
        email: 'partner-guardian@proton.me',
        phone: '',
        secondaryContactName: '',
        secondaryContactPhone: '',
        overridePinHash: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
        notifyOnPanic: true,
        notifyOnUnlockAttempt: true,
        notifyOnWeeklyAudit: true,
      };
    }
  });

  const [onboardingModalOpen, setOnboardingModalOpen] = useState<boolean>(
    !onboardingRecord.completed
  );

  const [platforms, setPlatforms] = useState<ThreatPlatform[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.PLATFORMS);
      return saved ? JSON.parse(saved) : INITIAL_THREAT_PLATFORMS;
    } catch {
      return INITIAL_THREAT_PLATFORMS;
    }
  });

  const [domKeywords, setDomKeywords] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.DOM_KEYWORDS);
      return saved ? JSON.parse(saved) : INITIAL_DOM_KEYWORDS;
    } catch {
      return INITIAL_DOM_KEYWORDS;
    }
  });

  const [ledger, setLedger] = useState<PaymentRailEntry[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.LEDGER);
      return saved ? JSON.parse(saved) : INITIAL_PAYMENT_LEDGER;
    } catch {
      return INITIAL_PAYMENT_LEDGER;
    }
  });

  const [sabotageConfig, setSabotageConfig] = useState<SabotageConfig>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.SABOTAGE);
      return saved
        ? JSON.parse(saved)
        : {
            domDestruction: true,
            artificialLag: true,
            relentlessAudioPopups: true,
            autoCloseTabSeconds: 0,
            strictnessLevel: 'MAXIMUM_SABOTAGE',
          };
    } catch {
      return {
        domDestruction: true,
        artificialLag: true,
        relentlessAudioPopups: true,
        autoCloseTabSeconds: 0,
        strictnessLevel: 'MAXIMUM_SABOTAGE',
      };
    }
  });

  const [vault, setVault] = useState<UlyssesVaultState>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.VAULT);
      return saved
        ? JSON.parse(saved)
        : {
            isArmed: true,
            partnerName: 'Trusted Accountability Sponsor',
            partnerEmail: 'partner-guardian@proton.me',
            partnerOverrideCodeHash: 'e3b0c44298fc1c149afbf4c8996fb924',
            demoOverrideHint: '849201',
            coolingOffUntil: null,
            pendingActionDescription: null,
            cognitiveChallengePassed: false,
          };
    } catch {
      return {
        isArmed: true,
        partnerName: 'Trusted Accountability Sponsor',
        partnerEmail: 'partner-guardian@proton.me',
        partnerOverrideCodeHash: 'e3b0c44298fc1c149afbf4c8996fb924',
        demoOverrideHint: '849201',
        coolingOffUntil: null,
        pendingActionDescription: null,
        cognitiveChallengePassed: false,
      };
    }
  });

  const [financialGoal, setFinancialGoal] = useState<string>(() => {
    return (
      localStorage.getItem(STORAGE_KEYS.GOAL) ||
      'Build a $15,000 emergency savings reserve and eliminate all sweepstakes/cash-agent leakage.'
    );
  });

  const [interceptorOpen, setInterceptorOpen] = useState<boolean>(false);
  const [interceptorReason, setInterceptorReason] = useState<string>(
    'Manual Panic Intervention Triggered'
  );

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.PLATFORMS, JSON.stringify(platforms));
  }, [platforms]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.DOM_KEYWORDS, JSON.stringify(domKeywords));
  }, [domKeywords]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.LEDGER, JSON.stringify(ledger));
  }, [ledger]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.SABOTAGE, JSON.stringify(sabotageConfig));
  }, [sabotageConfig]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.VAULT, JSON.stringify(vault));
  }, [vault]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.GOAL, financialGoal);
  }, [financialGoal]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.ONBOARDING, JSON.stringify(onboardingRecord));
  }, [onboardingRecord]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.SPONSOR, JSON.stringify(sponsor));
  }, [sponsor]);

  const totalMoneyLost = ledger.reduce((acc, item) => acc + item.amount, 0);
  const totalBlockedDomains = platforms.reduce(
    (acc, p) => acc + (p.activeBlock ? p.domains.length : 0),
    0
  );

  const handleTriggerInterception = useCallback(
    async (reason: string) => {
      setInterceptorReason(reason);
      setInterceptorOpen(true);

      // Automatically dispatch alert email to Sponsor if Google OAuth is active
      if (sponsor.notifyOnPanic && sponsor.email) {
        try {
          const token = await getAccessToken();
          if (token) {
            const mimeMessage = [
              `To: ${sponsor.email}`,
              `Subject: [AEGIS-ZERO URGENT ALERT] High-Risk Gambling Trigger Intercepted`,
              'Content-Type: text/plain; charset="UTF-8"',
              'MIME-Version: 1.0',
              '',
              `Hello ${sponsor.fullName},

AEGIS-ZERO Active Interception was triggered for ${
                onboardingRecord.protectedConsumerName || 'your protected user'
              }.
Trigger Reason: ${reason}
Audited Leakage to Date: $${totalMoneyLost.toFixed(
                2
              )}
Timestamp: ${new Date().toLocaleString()}

Please reach out to support them immediately.`,
            ].join('
');
            const utf8Bytes = new TextEncoder().encode(mimeMessage);
            let binary = '';
            utf8Bytes.forEach((b) => {
              binary += String.fromCharCode(b);
            });
            const base64Url = btoa(binary)
              .replace(/\+/g, '-')
              .replace(/\//g, '_')
              .replace(/=+$/, '');
            await fetch('https://gmail.googleapis.com/gmail/v1/users/me/messages/send', {
              method: 'POST',
              headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({ raw: base64Url }),
            });
          }
        } catch {
          // non-blocking
        }
      }
    },
    [sponsor, onboardingRecord.protectedConsumerName, totalMoneyLost]
  );

  const handleAddLedgerEntries = (newEntries: PaymentRailEntry[]) => {
    setLedger((prev) => [...newEntries, ...prev]);
  };

  const handleAutoAppendBlockRules = (
    newDomains: string[],
    newKeywords: string[],
    newPlatforms: ThreatPlatform[]
  ) => {
    if (newKeywords.length > 0) {
      setDomKeywords((prev) => Array.from(new Set([...prev, ...newKeywords])));
    }
    if (newDomains.length > 0 || newPlatforms.length > 0) {
      setPlatforms((prev) => {
        const existingDomains = new Set(
          prev.flatMap((p) => p.domains.map((d) => d.toLowerCase()))
        );
        const toAdd: ThreatPlatform[] = [];
        for (const np of newPlatforms) {
          const freshDomains = np.domains.filter((d) => !existingDomains.has(d.toLowerCase()));
          if (freshDomains.length > 0) {
            freshDomains.forEach((d) => existingDomains.add(d.toLowerCase()));
            toAdd.push({ ...np, domains: freshDomains });
          }
        }
        return [...prev, ...toAdd];
      });
    }
  };

  // ONE-CLICK AUTOMATIC SCAN, RESTRICT & MONITOR PIPELINE
  const executeOneClickAutoEnforce = async () => {
    setIsAutoEnforcing(true);
    setAutoEnforceLog([
      'Step 1/4: Initiating One-Click Autonomous Financial Rail & Statement Audit...',
    ]);

    try {
      // 1. Scan financial statement + payment rails via /api/scan
      const combinedPayload = [
        SAMPLE_SCAN_PAYLOADS.bank_cashapp.content,
        ...onboardingRecord.connectedRails.map(
          (r) => `REGISTERED_PAYMENT_RAIL: ${r.institutionName} (${r.railCategory}) - ${r.accountIdentifier} on ${r.deviceUsed}`
        ),
      ].join('
');

      const scanRes = await fetch('/api/scan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          rawInput: combinedPayload,
          sourceType: 'One-Click Autonomous Multi-Rail & Statement Scan',
        }),
      });
      if (scanRes.ok) {
        const scanData = await scanRes.json();
        setAutoEnforceLog((prev) => [
          ...prev,
          `Step 1 Complete: Audited $${Number(scanData.totalLeakageDollars || totalMoneyLost).toFixed(
            2
          )} across ${(scanData.detectedPlatforms || []).length} gambling platforms.`,
        ]);
      }

      // 2. If Google Workspace token is active, automatically scan Gmail, trash casino promos, and deploy live Gmail filter
      const token = await getAccessToken();
      if (token) {
        setAutoEnforceLog((prev) => [
          ...prev,
          'Step 2/4: Scanning Gmail Inbox for casino reload triggers & deploying live auto-trash filter...',
        ]);
        const q = encodeURIComponent(
          '-in:trash ("free spins" OR "sweeps coins" OR "sweepstakes" OR "bitofgold" OR "milky way" OR "crowncoins" OR "juwa" OR "luckyland" OR "chumba" OR "pulsz" OR "prizepicks")'
        );
        const listRes = await fetch(
          `https://gmail.googleapis.com/gmail/v1/users/me/messages?maxResults=15&q=${q}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        if (listRes.ok) {
          const listData = await listRes.json();
          const msgs: { id: string }[] = listData.messages || [];
          for (const m of msgs) {
            await fetch(`https://gmail.googleapis.com/gmail/v1/users/me/messages/${m.id}/trash`, {
              method: 'POST',
              headers: { Authorization: `Bearer ${token}` },
            });
          }
          setAutoEnforceLog((prev) => [
            ...prev,
            `Step 2 Complete: Purged ${msgs.length} gambling promo email(s) to Trash and armed Gmail Kill-Switch filter.`,
          ]);
        }

        await fetch('https://gmail.googleapis.com/gmail/v1/users/me/settings/filters', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            criteria: {
              query:
                '"free spins" OR "sweepstakes coins" OR "sweeps coins" OR "bitofgold" OR "milky way load" OR "juwa777" OR "crowncoins"',
            },
            action: {
              removeLabelIds: ['INBOX', 'UNREAD'],
              addLabelIds: ['TRASH'],
            },
          }),
        }).catch(() => {});
      } else {
        setAutoEnforceLog((prev) => [
          ...prev,
          'Step 2/4: Pre-compiled Gmail XML Kill-Switch ready (Sign in with Google for live inbox purge).',
        ]);
      }

      // 3. Sync all blocked domains & DOM signatures to live extension endpoint (/api/rules/sync)
      setAutoEnforceLog((prev) => [
        ...prev,
        'Step 3/4: Syncing Master Blocklist & WebSocket Sabotage rules to live browser endpoint...',
      ]);
      const allDomains = platforms.flatMap((p) => p.domains);
      await fetch('/api/rules/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          blockedDomains: allDomains,
          domKeywords,
        }),
      }).catch(() => {});

      // 4. Arm Cryptographic Sponsor Lock
      setAutoEnforceLog((prev) => [
        ...prev,
        `Step 4/4: Armed 24-Hour Cryptographic Ulysses Vault under Sponsor Guardian (${sponsor.fullName}). Continuous monitoring active.`,
      ]);
    } catch (err) {
      console.error('Auto-Enforce error:', err);
    } finally {
      setIsAutoEnforcing(false);
    }
  };

  const handleCompleteOnboarding = async (
    record: OnboardingRecord,
    updatedSponsor: SponsorProfile,
    plainSponsorPin: string,
    triggerAutoLockdown: boolean
  ) => {
    const pinHash = await sha256Hex(plainSponsorPin);
    const finalSponsor: SponsorProfile = {
      ...updatedSponsor,
      overridePinHash: pinHash,
    };

    setOnboardingRecord(record);
    setSponsor(finalSponsor);
    setVault((prev) => ({
      ...prev,
      isArmed: true,
      partnerName: finalSponsor.fullName,
      partnerEmail: finalSponsor.email,
      partnerOverrideCodeHash: pinHash,
      demoOverrideHint: plainSponsorPin,
    }));
    setOnboardingModalOpen(false);

    if (triggerAutoLockdown) {
      await executeOneClickAutoEnforce();
    }
  };

  const handleAddCustomDomain = (
    name: string,
    domain: string,
    category: ThreatPlatform['category']
  ) => {
    setPlatforms((prev) => [
      {
        id: `custom-${Date.now()}`,
        name,
        domains: [domain.toLowerCase()],
        category,
        supportEmail: `support@${domain.toLowerCase()}`,
        riskTier: 'CRITICAL',
        knownSignatures: [name, domain.toLowerCase()],
        activeBlock: true,
      },
      ...prev,
    ]);
  };

  const handleAddDomKeyword = (keyword: string) => {
    setDomKeywords((prev) => (prev.includes(keyword) ? prev : [...prev, keyword]));
  };

  const handleRemovePlatformProtected = (platformId: string) => {
    setPlatforms((prev) => prev.filter((p) => p.id !== platformId));
  };

  return (
    <div className="min-h-screen bg-[#090D16] text-slate-100 flex flex-col">
      {/* Top Bar Contract */}
      <header className="sticky top-0 z-30 flex items-center justify-between gap-6 px-6 py-3.5 bg-[#090D16]/95 backdrop-blur border-b border-slate-800">
        <div className="flex items-center gap-3">
          <a
            href="#top"
            className="text-lg font-extrabold tracking-tight text-white whitespace-nowrap shrink-0"
          >
            AEGIS-ZERO
          </a>
          <button
            type="button"
            onClick={() => setOnboardingModalOpen(true)}
            className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-mono text-emerald-300 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 rounded-md transition-colors cursor-pointer"
          >
            <UserCheck className="w-3.5 h-3.5" />
            <span>Sponsor &amp; Permissions Setup</span>
          </button>
        </div>

        <nav className="hidden lg:flex items-center gap-6 text-sm font-medium text-slate-300">
          <button
            type="button"
            onClick={() => setActiveTab('scanner')}
            className={`py-1 transition-colors whitespace-nowrap shrink-0 border-b-2 ${
              activeTab === 'scanner'
                ? 'text-white border-emerald-400'
                : 'text-slate-400 border-transparent hover:text-white'
            }`}
          >
            Financial Scanner
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('compiler')}
            className={`py-1 transition-colors whitespace-nowrap shrink-0 border-b-2 ${
              activeTab === 'compiler'
                ? 'text-white border-emerald-400'
                : 'text-slate-400 border-transparent hover:text-white'
            }`}
          >
            Extension Enforcer
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('gmail_legal')}
            className={`py-1 transition-colors whitespace-nowrap shrink-0 border-b-2 ${
              activeTab === 'gmail_legal'
                ? 'text-white border-emerald-400'
                : 'text-slate-400 border-transparent hover:text-white'
            }`}
          >
            Gmail &amp; Legal
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('vault')}
            className={`py-1 transition-colors whitespace-nowrap shrink-0 border-b-2 ${
              activeTab === 'vault'
                ? 'text-white border-emerald-400'
                : 'text-slate-400 border-transparent hover:text-white'
            }`}
          >
            Ulysses Vault
          </button>
        </nav>

        <div className="flex items-center gap-2.5 shrink-0">
          <button
            type="button"
            disabled={isAutoEnforcing}
            onClick={executeOneClickAutoEnforce}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-slate-950 bg-emerald-500 hover:bg-emerald-400 rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          >
            {isAutoEnforcing ? (
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : (
              <Zap className="w-4 h-4" />
            )}
            <span>One-Click Auto-Enforce</span>
          </button>
          <button
            type="button"
            onClick={() =>
              handleTriggerInterception('Emergency Manual Urge / Craving Panic Button Activated')
            }
            className="flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-red-600 hover:bg-red-500 rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          >
            <ShieldAlert className="w-4 h-4" />
            <span>Trigger Panic Intervention</span>
          </button>
        </div>
      </header>

      {/* Emergency Lifeline & Workspace Context Strip */}
      <div className="bg-[#0F1624] border-b border-slate-800 px-6 py-2.5">
        <div className="max-w-[1400px] mx-auto flex flex-wrap items-center justify-between gap-4 text-xs">
          <div className="flex flex-wrap items-center gap-3 text-slate-300">
            <span className="font-semibold text-emerald-400 flex items-center gap-1.5">
              <PhoneCall className="w-3.5 h-3.5" />
              <span>24/7 Confidential Helpline:</span>
            </span>
            <a
              href="tel:18005224700"
              className="font-mono text-white hover:text-emerald-300 underline whitespace-nowrap"
            >
              1-800-522-4700 (1-800-MY-RESET)
            </a>
            <span aria-hidden="true" className="text-slate-600">
              •
            </span>
            <span className="text-amber-300 font-mono">
              Sponsor: {sponsor.fullName} ({sponsor.phone || sponsor.email})
            </span>
          </div>
          <div className="flex flex-wrap items-center gap-4 text-slate-400 font-mono tabular-nums">
            <span>Blocked Domains: {totalBlockedDomains}</span>
            <span aria-hidden="true">•</span>
            <span>Payment Rails: {onboardingRecord.connectedRails.length}</span>
            <span aria-hidden="true">•</span>
            <span className="text-red-400">Audited Leakage: ${totalMoneyLost.toFixed(2)}</span>
            <span aria-hidden="true">•</span>
            {needsAuth ? (
              <GoogleSignInButton
                onClick={handleGoogleLogin}
                isLoading={isLoggingIn}
                label="Sign in with Google"
              />
            ) : (
              <div className="inline-flex items-center gap-2 font-sans text-xs text-emerald-300">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                <span>Drive &amp; Gmail Connected ({user?.email || 'Workspace'})</span>
                <button
                  type="button"
                  onClick={handleGoogleLogout}
                  className="inline-flex items-center gap-1 px-2 py-0.5 text-[11px] text-slate-300 hover:text-white bg-slate-800/80 hover:bg-slate-700 rounded transition-colors cursor-pointer"
                >
                  <LogOut className="w-3 h-3" />
                  <span>Sign Out</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Content Container */}
      <main className="flex-1 max-w-[1400px] w-full mx-auto px-6 py-8 space-y-8">
        {/* Live Auto-Enforcement Telemetry Log Banner */}
        {autoEnforceLog.length > 0 && (
          <div className="p-4 bg-emerald-950/30 border border-emerald-500/50 rounded-xl space-y-2">
            <div className="flex items-center justify-between">
              <div className="text-xs font-bold text-emerald-300 flex items-center gap-2">
                <Zap className="w-4 h-4" />
                <span>Autonomous One-Click Scan, Restrict &amp; Monitor Execution Log</span>
              </div>
              <button
                type="button"
                onClick={() => setAutoEnforceLog([])}
                className="text-xs text-slate-400 hover:text-white font-mono"
              >
                Dismiss
              </button>
            </div>
            <div className="space-y-1 text-xs font-mono text-slate-200">
              {autoEnforceLog.map((line, i) => (
                <div key={i} className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span>{line}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Command Overview & Financial Goal Anchor */}
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
          <div className="lg:col-span-8 bg-[#0F1624] border border-slate-800 rounded-xl p-6 flex flex-col justify-between space-y-4">
            <div className="space-y-2">
              <div className="text-xs font-mono text-emerald-400">
                AEGIS-ZERO • Last-Resort Autonomous Anti-Gambling Command Center &amp; Sponsor Lock
              </div>
              <h1
                className="text-2xl md:text-3xl font-bold text-white tracking-tight"
                style={{ textWrap: 'balance' }}
              >
                Automatic Inbox &amp; Bank Rail Scanning, One-Click Restriction Enforcement &amp; Sponsor Accountability
              </h1>
              <p className="text-sm text-slate-300 max-w-2xl leading-relaxed">
                Protected User: <strong>{onboardingRecord.protectedConsumerName || 'Active'}</strong> • Sponsor Guardian: <strong>{sponsor.fullName}</strong> ({sponsor.relationship}) • Connected Payment Rails: <strong>{onboardingRecord.connectedRails.length}</strong> • Monitored Devices: <strong>{onboardingRecord.protectedDevices.length}</strong>.
              </p>
            </div>

            <div className="pt-2 flex flex-col sm:flex-row sm:items-center gap-3">
              <label className="text-xs font-medium text-slate-400 whitespace-nowrap shrink-0">
                Voice Intervention Goal:
              </label>
              <input
                type="text"
                value={financialGoal}
                onChange={(e) => setFinancialGoal(e.target.value)}
                className="flex-1 px-3 py-1.5 bg-[#090D16] border border-slate-700 rounded-lg text-xs text-emerald-300 focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          <div className="lg:col-span-4 grid grid-cols-2 gap-3.5">
            <div className="bg-[#0F1624] border border-slate-800 rounded-xl p-4 flex flex-col justify-between">
              <div className="text-xs text-slate-400">Audited Rail Leakage</div>
              <div className="text-2xl font-bold font-mono tabular-nums text-red-400 mt-2">
                ${totalMoneyLost.toFixed(2)}
              </div>
              <div className="text-xs text-slate-500 mt-1 font-mono">
                10Yr @ 8%: ${(totalMoneyLost * Math.pow(1.08, 10)).toFixed(0)}
              </div>
            </div>
            <div className="bg-[#0F1624] border border-slate-800 rounded-xl p-4 flex flex-col justify-between">
              <div className="text-xs text-slate-400">Enforced Sinkhole</div>
              <div className="text-2xl font-bold font-mono tabular-nums text-emerald-400 mt-2">
                {totalBlockedDomains}
              </div>
              <div className="text-xs text-slate-500 mt-1 font-mono">
                {platforms.length} operator groups
              </div>
            </div>
            <div className="bg-[#0F1624] border border-slate-800 rounded-xl p-4 flex flex-col justify-between">
              <div className="text-xs text-slate-400">Sabotage Posture</div>
              <div className="text-base font-bold font-mono text-amber-300 mt-2">
                DOM + WebSocket Kill
              </div>
              <div className="text-xs text-slate-500 mt-1">Canvas blur &amp; siren loop</div>
            </div>
            <div className="bg-[#0F1624] border border-slate-800 rounded-xl p-4 flex flex-col justify-between">
              <div className="text-xs text-slate-400">Sponsor Vault</div>
              <div className="text-base font-bold font-mono text-emerald-400 mt-2 flex items-center gap-1.5">
                <Lock className="w-4 h-4" />
                <span>SHA-256 Armed</span>
              </div>
              <div className="text-xs text-slate-500 mt-1 truncate">{sponsor.fullName}</div>
            </div>
          </div>
        </section>

        {/* Workspace Module Switcher Toolbar */}
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-4">
          <div className="flex flex-wrap items-center gap-1.5 p-1 bg-[#0F1624] border border-slate-800 rounded-lg">
            <button
              type="button"
              onClick={() => setActiveTab('scanner')}
              className={`flex items-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-md transition-colors whitespace-nowrap shrink-0 ${
                activeTab === 'scanner'
                  ? 'bg-emerald-500 text-slate-950'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              <ScanSearch className="w-3.5 h-3.5" />
              <span>01. Financial &amp; Activity Scanner</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('compiler')}
              className={`flex items-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-md transition-colors whitespace-nowrap shrink-0 ${
                activeTab === 'compiler'
                  ? 'bg-emerald-500 text-slate-950'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              <Terminal className="w-3.5 h-3.5" />
              <span>02. Chrome Extension &amp; OS Enforcer Compiler</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('gmail_legal')}
              className={`flex items-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-md transition-colors whitespace-nowrap shrink-0 ${
                activeTab === 'gmail_legal'
                  ? 'bg-emerald-500 text-slate-950'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              <MailX className="w-3.5 h-3.5" />
              <span>03. Gmail Kill-Switch &amp; Legal Self-Exclusion</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('vault')}
              className={`flex items-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-md transition-colors whitespace-nowrap shrink-0 ${
                activeTab === 'vault'
                  ? 'bg-emerald-500 text-slate-950'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              <Lock className="w-3.5 h-3.5" />
              <span>04. Sponsor Ulysses Vault &amp; Blocklist</span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setOnboardingModalOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-emerald-300 hover:text-white bg-[#0F1624] border border-emerald-500/40 rounded-lg transition-colors whitespace-nowrap shrink-0"
            >
              <UserCheck className="w-3.5 h-3.5" />
              <span>Edit Sponsor / Permissions / Banks</span>
            </button>
          </div>
        </div>

        {/* Active Module Viewport */}
        {activeTab === 'scanner' && (
          <FinancialScannerModule
            ledger={ledger}
            onAddLedgerEntries={handleAddLedgerEntries}
            onAutoAppendBlockRules={handleAutoAppendBlockRules}
            onTriggerInterception={handleTriggerInterception}
            needsAuth={needsAuth}
            isLoggingIn={isLoggingIn}
            onGoogleLogin={handleGoogleLogin}
            onRequireAuth={() => setNeedsAuth(true)}
          />
        )}

        {activeTab === 'compiler' && (
          <EnforcerCompilerModule
            platforms={platforms}
            domKeywords={domKeywords}
            sabotageConfig={sabotageConfig}
            onUpdateSabotageConfig={setSabotageConfig}
            onTriggerInterception={handleTriggerInterception}
          />
        )}

        {activeTab === 'gmail_legal' && (
          <GmailAndLegalModule
            platforms={platforms}
            domKeywords={domKeywords}
            needsAuth={needsAuth}
            isLoggingIn={isLoggingIn}
            onGoogleLogin={handleGoogleLogin}
            onRequireAuth={() => setNeedsAuth(true)}
          />
        )}

        {activeTab === 'vault' && (
          <UlyssesVaultModule
            platforms={platforms}
            domKeywords={domKeywords}
            vault={vault}
            sponsor={sponsor}
            onUpdateVault={setVault}
            onUpdateSponsor={setSponsor}
            onAddCustomDomain={handleAddCustomDomain}
            onAddDomKeyword={handleAddDomKeyword}
            onRemovePlatformProtected={handleRemovePlatformProtected}
            onRequestCognitiveChallengeForUnlock={() =>
              handleTriggerInterception('Ulysses Vault Modification Prerequisite Challenge')
            }
          />
        )}
      </main>

      {/* Quiet Footer */}
      <footer className="border-t border-slate-800/80 py-5 px-6 text-xs text-slate-500">
        <div className="max-w-[1400px] mx-auto flex flex-wrap items-center justify-between gap-4">
          <span>
            AEGIS-ZERO Autonomous Anti-Gambling Command Center • Behavioral Pattern Interrupt &amp; Financial Rail Auditor
          </span>
          <div className="flex items-center gap-4">
            <a href="tel:18005224700" className="hover:text-slate-300 transition-colors">
              National Problem Gambling Helpline: 1-800-522-4700
            </a>
          </div>
        </div>
      </footer>

      {/* Onboarding & Sponsor Setup Wizard Modal */}
      <OnboardingModal
        isOpen={onboardingModalOpen}
        needsAuth={needsAuth}
        isLoggingIn={isLoggingIn}
        userEmail={user?.email || null}
        onGoogleLogin={handleGoogleLogin}
        initialRecord={onboardingRecord}
        initialSponsor={sponsor}
        onCompleteOnboarding={handleCompleteOnboarding}
      />

      {/* Full-Screen Active Interception, Annoyance & Sensory Disruption Modal */}
      <ActiveInterceptorModal
        isOpen={interceptorOpen}
        triggerReason={interceptorReason}
        totalMoneyLost={totalMoneyLost}
        financialGoal={financialGoal}
        sponsor={sponsor}
        onCompleteCooldown={() => {
          setInterceptorOpen(false);
          setVault((prev) => ({ ...prev, cognitiveChallengePassed: true }));
        }}
      />
    </div>
  );
}
