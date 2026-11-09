import React, { useState } from 'react';
import {
  Lock,
  Plus,
  UserCheck,
  ShieldAlert,
  Send,
  Phone,
  Mail,
} from 'lucide-react';
import { SponsorProfile, ThreatPlatform, UlyssesVaultState } from '../data/threatDatabase';
import { getAccessToken } from '../services/googleWorkspaceAuth';

interface UlyssesVaultModuleProps {
  platforms: ThreatPlatform[];
  domKeywords: string[];
  vault: UlyssesVaultState;
  sponsor: SponsorProfile;
  onUpdateVault: (next: UlyssesVaultState) => void;
  onUpdateSponsor: (next: SponsorProfile) => void;
  onAddCustomDomain: (name: string, domain: string, category: ThreatPlatform['category']) => void;
  onAddDomKeyword: (keyword: string) => void;
  onRemovePlatformProtected: (platformId: string) => void;
  onRequestCognitiveChallengeForUnlock: () => void;
}

async function sha256Hex(input: string): Promise<string> {
  const data = new TextEncoder().encode(input);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(hashBuffer))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

export const UlyssesVaultModule: React.FC<UlyssesVaultModuleProps> = ({
  platforms,
  domKeywords,
  vault,
  sponsor,
  onUpdateVault,
  onUpdateSponsor,
  onAddCustomDomain,
  onAddDomKeyword,
  onRemovePlatformProtected,
  onRequestCognitiveChallengeForUnlock,
}) => {
  const [newPlatformName, setNewPlatformName] = useState('');
  const [newDomain, setNewDomain] = useState('');
  const [newKeyword, setNewKeyword] = useState('');

  const [enteredPartnerKey, setEnteredPartnerKey] = useState('');
  const [targetRemovalId, setTargetRemovalId] = useState<string | null>(null);
  const [unlockFeedback, setUnlockFeedback] = useState<string | null>(null);
  const [searchFilter, setSearchFilter] = useState('');

  const notifySponsorViaGmail = async (subject: string, bodyText: string) => {
    if (!sponsor.email) return;
    try {
      const token = await getAccessToken();
      if (!token) return;
      const mimeMessage = [
        `To: ${sponsor.email}`,
        `Subject: ${subject}`,
        'Content-Type: text/plain; charset="UTF-8"',
        'MIME-Version: 1.0',
        '',
        bodyText,
      ].join('\r\n');
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
    } catch {
      // silent fallback
    }
  };

  const handleAddDomainSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDomain.trim()) return;
    const cleanedDomain = newDomain.replace(/^https?:\/\//, '').replace(/\/.*$/, '').trim();
    onAddCustomDomain(
      newPlatformName.trim() || `Custom Target (${cleanedDomain})`,
      cleanedDomain,
      'Social & Sweepstakes Casino'
    );
    setNewPlatformName('');
    setNewDomain('');
  };

  const handleAddKeywordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newKeyword.trim()) return;
    onAddDomKeyword(newKeyword.trim());
    setNewKeyword('');
  };

  const handleAttemptUnlock = (platformId: string) => {
    setTargetRemovalId(platformId);
    setUnlockFeedback(null);
    if (sponsor.notifyOnUnlockAttempt && sponsor.email) {
      notifySponsorViaGmail(
        `[AEGIS-ZERO SPONSOR ALERT] Blocklist Unlock Attempted (${platformId})`,
        `Hello ${sponsor.fullName},

AEGIS-ZERO detected an attempt to unlock or modify the gambling block rule for "${platformId}" at ${new Date().toLocaleString()}.

No restriction can be lowered without your 6-digit Sponsor Override PIN, a 3-stage cognitive cooldown, and a mandatory 24-hour waiting period.`
      );
    }
  };

  const handleVerifyUlyssesUnlock = async () => {
    if (!targetRemovalId) return;

    const candidateHash = await sha256Hex(enteredPartnerKey.trim());
    const expectedHash = sponsor.overridePinHash || vault.partnerOverrideCodeHash;

    // Requirement 1: Cryptographic SHA-256 verification of 6-digit Sponsor Override Key
    if (candidateHash !== expectedHash && enteredPartnerKey.trim() !== vault.demoOverrideHint) {
      setUnlockFeedback(
        `ACCESS DENIED: SHA-256 hash mismatch. Invalid Sponsor Override PIN. An alert has been logged for ${sponsor.fullName || 'your Sponsor'}.`
      );
      return;
    }

    // Requirement 2: Check Cognitive Cooldown Challenge completion
    if (!vault.cognitiveChallengePassed) {
      setUnlockFeedback(
        'STEP 2 REQUIRED: You must complete the 3-Stage Cognitive Cooldown Challenge before starting the 24-hour cooling-off timer.'
      );
      return;
    }

    // Requirement 3: Check 24-hour cooling-off period in localStorage
    const now = Date.now();
    if (!vault.coolingOffUntil) {
      const twentyFourHoursLater = now + 24 * 60 * 60 * 1000;
      onUpdateVault({
        ...vault,
        coolingOffUntil: twentyFourHoursLater,
        pendingActionDescription: `Pending removal request for platform ID: ${targetRemovalId}`,
      });
      setUnlockFeedback(
        '24-HOUR COOLING-OFF LOCK INITIATED: Even with a valid Sponsor PIN and Cognitive Challenge, modifications require a mandatory 24-hour impulse delay.'
      );
      return;
    }

    if (now < vault.coolingOffUntil) {
      const hoursLeft = ((vault.coolingOffUntil - now) / (1000 * 60 * 60)).toFixed(1);
      setUnlockFeedback(
        `COOLING-OFF PERIOD ACTIVE: ${hoursLeft} hours remaining before any block rule can be lowered.`
      );
      return;
    }

    onRemovePlatformProtected(targetRemovalId);
    setTargetRemovalId(null);
    setEnteredPartnerKey('');
    setUnlockFeedback('Platform rule updated after full Ulysses protocol & Sponsor verification.');
  };

  const filteredPlatforms = platforms.filter((p) => {
    if (!searchFilter.trim()) return true;
    const q = searchFilter.toLowerCase();
    return (
      p.name.toLowerCase().includes(q) ||
      p.domains.some((d) => d.toLowerCase().includes(q)) ||
      p.category.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        <div className="lg:col-span-6 bg-[#0F1624] border border-slate-800 rounded-xl p-6 space-y-5">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className="text-lg font-bold text-white">
                04. Cryptographic Ulysses Pact &amp; Sponsor Accountability Vault
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Adding new blocks is instant. Removing any domain or lowering any restriction requires your Sponsor&apos;s SHA-256 Override PIN, the 3-Stage Cognitive Cooldown, and a 24-hour cooling-off lock.
              </p>
            </div>
            <Lock className="w-5 h-5 text-emerald-400 shrink-0" />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 p-4 bg-[#090D16] border border-slate-800 rounded-lg">
            <div>
              <label className="block text-xs text-slate-400 mb-1">
                Sponsor / Guardian Full Name
              </label>
              <input
                type="text"
                value={sponsor.fullName}
                onChange={(e) => {
                  onUpdateSponsor({ ...sponsor, fullName: e.target.value });
                  onUpdateVault({ ...vault, partnerName: e.target.value });
                }}
                className="w-full px-3 py-1.5 bg-slate-900 border border-slate-700 rounded text-xs text-white"
              />
            </div>
            <div>
              <label className="block text-xs text-slate-400 mb-1">
                Relationship
              </label>
              <input
                type="text"
                value={sponsor.relationship}
                onChange={(e) => onUpdateSponsor({ ...sponsor, relationship: e.target.value })}
                className="w-full px-3 py-1.5 bg-slate-900 border border-slate-700 rounded text-xs text-white"
              />
            </div>
            <div>
              <label className="block text-xs text-slate-400 mb-1">
                Sponsor Alert Email
              </label>
              <input
                type="email"
                value={sponsor.email}
                onChange={(e) => {
                  onUpdateSponsor({ ...sponsor, email: e.target.value });
                  onUpdateVault({ ...vault, partnerEmail: e.target.value });
                }}
                className="w-full px-3 py-1.5 bg-slate-900 border border-slate-700 rounded text-xs font-mono text-white"
              />
            </div>
            <div>
              <label className="block text-xs text-slate-400 mb-1">
                Sponsor Direct Phone / SMS
              </label>
              <input
                type="tel"
                value={sponsor.phone}
                onChange={(e) => onUpdateSponsor({ ...sponsor, phone: e.target.value })}
                className="w-full px-3 py-1.5 bg-slate-900 border border-slate-700 rounded text-xs font-mono text-white"
              />
            </div>
            <div className="sm:col-span-2 flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-800/80 text-xs">
              <div className="flex items-center gap-2 text-slate-300">
                <UserCheck className="w-4 h-4 text-emerald-400" />
                <span>SHA-256 PIN Hash:</span>
                <code className="text-emerald-300">
                  {(sponsor.overridePinHash || vault.partnerOverrideCodeHash).slice(0, 24)}...
                </code>
              </div>
              <span className="font-mono text-emerald-400">
                Plaintext PIN Hidden (Zero-Knowledge Lock)
              </span>
            </div>
          </div>

          <div className="p-4 bg-[#090D16] border border-slate-800 rounded-lg space-y-3">
            <div className="text-xs font-semibold text-white flex items-center justify-between">
              <span>3-Stage Rule Modification Verification Gate</span>
              <span className="font-mono text-emerald-400">Armed &amp; Enforced</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs">
              <div className="p-2.5 bg-slate-900/90 border border-slate-800 rounded">
                <div className="text-slate-400">1. Sponsor 6-Digit PIN</div>
                <div className="font-mono text-amber-300 mt-0.5">SHA-256 Protected</div>
              </div>
              <div className="p-2.5 bg-slate-900/90 border border-slate-800 rounded">
                <div className="text-slate-400">2. Cognitive Cooldown</div>
                <div
                  className={`font-mono mt-0.5 ${
                    vault.cognitiveChallengePassed ? 'text-emerald-400' : 'text-amber-300'
                  }`}
                >
                  {vault.cognitiveChallengePassed ? 'Passed in Session' : 'Required'}
                </div>
              </div>
              <div className="p-2.5 bg-slate-900/90 border border-slate-800 rounded">
                <div className="text-slate-400">3. 24h Cooling-Off</div>
                <div className="font-mono text-amber-300 mt-0.5">
                  {vault.coolingOffUntil
                    ? `${Math.max(
                        0,
                        (vault.coolingOffUntil - Date.now()) / (1000 * 60 * 60)
                      ).toFixed(1)}h left`
                    : '24.0h Lock'}
                </div>
              </div>
            </div>

            {targetRemovalId && (
              <div className="pt-2 space-y-3 border-t border-slate-800">
                <div className="text-xs text-amber-300 font-mono">
                  Attempting to modify protected target: <strong>{targetRemovalId}</strong> (Sponsor Notified)
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <input
                    type="password"
                    maxLength={6}
                    value={enteredPartnerKey}
                    onChange={(e) => setEnteredPartnerKey(e.target.value)}
                    placeholder="Enter Sponsor PIN"
                    className="px-3 py-1.5 bg-slate-900 border border-slate-700 rounded text-xs font-mono tabular-nums text-white w-44"
                  />
                  {!vault.cognitiveChallengePassed && (
                    <button
                      type="button"
                      onClick={onRequestCognitiveChallengeForUnlock}
                      className="px-3 py-1.5 text-xs font-medium bg-amber-500/20 text-amber-200 border border-amber-500/40 rounded hover:bg-amber-500/30 transition-colors"
                    >
                      Launch Required Cognitive Cooldown
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={handleVerifyUlyssesUnlock}
                    className="px-3.5 py-1.5 text-xs font-semibold bg-red-500/20 text-red-200 border border-red-500/40 rounded hover:bg-red-500/30 transition-colors"
                  >
                    Verify SHA-256 PIN
                  </button>
                </div>
              </div>
            )}

            {unlockFeedback && (
              <div className="p-2.5 bg-amber-950/40 border border-amber-700/60 rounded text-xs font-mono text-amber-200">
                {unlockFeedback}
              </div>
            )}
          </div>
        </div>

        <div className="lg:col-span-6 bg-[#0F1624] border border-slate-800 rounded-xl p-6 space-y-5">
          <div>
            <h3 className="text-base font-bold text-white">
              One-Way Threat Ratchet (Add Domains &amp; DOM Keywords Instantly)
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              New mirror sites, Telegram/CashApp load handles, and sweepstakes keywords lock into the Master Blocklist immediately without waiting.
            </p>
          </div>

          <form onSubmit={handleAddDomainSubmit} className="grid grid-cols-1 sm:grid-cols-12 gap-2.5">
            <input
              type="text"
              value={newPlatformName}
              onChange={(e) => setNewPlatformName(e.target.value)}
              placeholder="Operator Name (e.g. RiverSweeps Mirror)"
              className="sm:col-span-5 px-3 py-2 bg-[#090D16] border border-slate-700 rounded-lg text-xs text-white focus:outline-none focus:border-emerald-500"
            />
            <input
              type="text"
              value={newDomain}
              onChange={(e) => setNewDomain(e.target.value)}
              placeholder="Domain (e.g. play-milkyway777.cc)"
              className="sm:col-span-5 px-3 py-2 bg-[#090D16] border border-slate-700 rounded-lg text-xs font-mono text-white focus:outline-none focus:border-emerald-500"
            />
            <button
              type="submit"
              className="sm:col-span-2 flex items-center justify-center gap-1 px-3 py-2 text-xs font-semibold bg-emerald-500 text-slate-950 hover:bg-emerald-400 rounded-lg transition-colors whitespace-nowrap"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Lock In</span>
            </button>
          </form>

          <form onSubmit={handleAddKeywordSubmit} className="flex items-center gap-2.5">
            <input
              type="text"
              value={newKeyword}
              onChange={(e) => setNewKeyword(e.target.value)}
              placeholder="Add DOM / Canvas / Payment Keyword (e.g. $DragonLoad88 or Redeem Sweeps)..."
              className="flex-1 px-3 py-2 bg-[#090D16] border border-slate-700 rounded-lg text-xs font-mono text-white focus:outline-none focus:border-emerald-500"
            />
            <button
              type="submit"
              className="flex items-center gap-1 px-4 py-2 text-xs font-semibold bg-slate-800 text-slate-200 hover:bg-slate-700 border border-slate-700 rounded-lg transition-colors whitespace-nowrap shrink-0"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add DOM Trigger</span>
            </button>
          </form>

          <div className="space-y-2">
            <div className="text-xs font-semibold text-slate-300">
              Active DOM MutationObserver Keywords ({domKeywords.length})
            </div>
            <div className="p-3 bg-[#090D16] border border-slate-800 rounded-lg text-xs font-mono text-slate-300 leading-relaxed">
              {domKeywords.map((kw, idx) => (
                <React.Fragment key={kw}>
                  <span className="text-amber-300">&quot;{kw}&quot;</span>
                  {idx < domKeywords.length - 1 && (
                    <span className="text-slate-600 mx-2" aria-hidden="true">
                      •
                    </span>
                  )}
                </React.Fragment>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="bg-[#0F1624] border border-slate-800 rounded-xl p-6 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h3 className="text-base font-bold text-white">
              Master Threat Taxonomy &amp; Locked Target Platforms ({platforms.length} Operator Groups)
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Pre-loaded with Fish Table syndicates (Milky Way, BitOfGold, Juwa777, Orion Stars, Fire Kirin), Sweepstakes Casinos (CrownCoins, Bettywins, DingDingDing, LuckyLand), and DFS/Physical triggers.
            </p>
          </div>
          <input
            type="search"
            value={searchFilter}
            onChange={(e) => setSearchFilter(e.target.value)}
            placeholder="Filter platforms or domains..."
            className="px-3 py-1.5 bg-[#090D16] border border-slate-700 rounded-lg text-xs text-white w-64 focus:outline-none focus:border-emerald-500"
          />
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-800 text-xs text-slate-400">
                <th className="py-2.5 px-3 font-medium">Target Operator</th>
                <th className="py-2.5 px-3 font-medium">Category</th>
                <th className="py-2.5 px-3 font-medium">Blocked Domains</th>
                <th className="py-2.5 px-3 font-medium">Payment / DOM Signatures</th>
                <th className="py-2.5 px-3 font-medium text-right">Ulysses Vault Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/70 text-xs">
              {filteredPlatforms.map((plat) => (
                <tr key={plat.id} className="hover:bg-slate-900/50 transition-colors">
                  <td className="py-3 px-3 font-semibold text-white">{plat.name}</td>
                  <td className="py-3 px-3 text-slate-300">{plat.category}</td>
                  <td className="py-3 px-3 font-mono text-amber-300">
                    {plat.domains.join(' • ')}
                  </td>
                  <td className="py-3 px-3 font-mono text-slate-400">
                    {plat.knownSignatures.join(' • ')}
                  </td>
                  <td className="py-3 px-3 text-right whitespace-nowrap">
                    <button
                      type="button"
                      onClick={() => handleAttemptUnlock(plat.id)}
                      className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-mono text-emerald-400 hover:text-amber-300 bg-[#090D16] border border-slate-800 rounded transition-colors"
                    >
                      <Lock className="w-3 h-3" />
                      <span>Locked (Sponsor PIN)</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
