import React, { useState, useMemo } from 'react';
import {
  MailX,
  Download,
  Scale,
  Send,
  Copy,
  Check,
  FileCode2,
  Sparkles,
  ExternalLink,
  Inbox,
  Trash2,
  ShieldCheck,
  RefreshCw,
} from 'lucide-react';
import { ThreatPlatform } from '../data/threatDatabase';
import { getAccessToken } from '../services/googleWorkspaceAuth';
import { GoogleSignInButton, WorkspaceConfirmModal } from './GoogleSignInButton';

interface GmailDetectedMessage {
  id: string;
  subject: string;
  from: string;
  date: string;
  snippet: string;
}

interface GmailAndLegalModuleProps {
  platforms: ThreatPlatform[];
  domKeywords: string[];
  needsAuth: boolean;
  isLoggingIn: boolean;
  onGoogleLogin: () => Promise<void>;
  onRequireAuth: () => void;
}

export const GmailAndLegalModule: React.FC<GmailAndLegalModuleProps> = ({
  platforms,
  domKeywords,
  needsAuth,
  isLoggingIn,
  onGoogleLogin,
  onRequireAuth,
}) => {
  const [selectedPlatformId, setSelectedPlatformId] = useState<string>(
    platforms[0]?.id || 'milky-way'
  );
  const [userFullName, setUserFullName] = useState<string>('Protected Account Holder');
  const [userState, setUserState] = useState<string>('California / State Consumer Protection Act');
  const [accountIdentifier, setAccountIdentifier] = useState<string>(
    'JoshHilburn48@gmail.com'
  );
  const [knownPaymentRails, setKnownPaymentRails] = useState<string>(
    'Visa/Mastercard ending in 4821, CashApp $cashtag transfers, and MoonPay LTC/BTC wallets'
  );

  const [isGeneratingLegal, setIsGeneratingLegal] = useState<boolean>(false);
  const [legalError, setLegalError] = useState<string | null>(null);
  const [copiedNotice, setCopiedNotice] = useState<boolean>(false);
  const [copiedXml, setCopiedXml] = useState<boolean>(false);

  // Live Gmail API State
  const [detectedEmails, setDetectedEmails] = useState<GmailDetectedMessage[]>([]);
  const [isGmailBusy, setIsGmailBusy] = useState<boolean>(false);
  const [gmailStatus, setGmailStatus] = useState<string | null>(null);
  const [gmailError, setGmailError] = useState<string | null>(null);

  // Confirmation Dialog States for Mutating/Destructive Gmail Operations
  const [confirmTrashEmailsOpen, setConfirmTrashEmailsOpen] = useState<boolean>(false);
  const [confirmDeployFilterOpen, setConfirmDeployFilterOpen] = useState<boolean>(false);
  const [confirmSendLegalEmailOpen, setConfirmSendLegalEmailOpen] = useState<boolean>(false);

  const selectedPlatform = useMemo(
    () => platforms.find((p) => p.id === selectedPlatformId) || platforms[0],
    [platforms, selectedPlatformId]
  );

  const [generatedNotice, setGeneratedNotice] = useState<{
    subjectLine: string;
    legalBody: string;
    statutoryCitations: string[];
  }>(() => ({
    subjectLine: `FORMAL LEGAL DEMAND: Permanent Self-Exclusion, Account Closure & Payment Revocation (${
      platforms[0]?.name || 'Milky Way Sweepstakes'
    })`,
    legalBody: `TO THE LEGAL COMPLIANCE, RISK MANAGEMENT & PAYMENTS DEPARTMENT OF ${(
      platforms[0]?.name || 'MILKY WAY SWEEPSTAKES'
    ).toUpperCase()} (${platforms[0]?.domains.join(', ') || 'milkywayapp.xyz'}):

I am writing to execute an immediate, irrevocable, and permanent self-exclusion and account termination across ${
      platforms[0]?.name || 'Milky Way Sweepstakes'
    }, all mirror domains, and all affiliated sweepstakes coin distributors (including BitOfGold and P2P load agents).

1. IRREVOCABLE ACCOUNT TERMINATION & SELF-EXCLUSION:
Effective immediately, you are instructed to permanently close, block, and blacklist my account associated with ${accountIdentifier} and prohibit the creation of any future accounts using my name, residential address, device fingerprints, or payment instruments.

2. REVOCATION OF PAYMENT AUTHORIZATION (REGULATION E / TILA NOTICE):
I hereby permanently revoke authorization for any debit card, credit card, ACH transfer, CashApp $cashtag load, gift card voucher, or cryptocurrency deposit linked to my identity. Any transaction processed or accepted by your platform or your third-party merchant processors after the timestamp of this notice is strictly unauthorized and will be formally disputed as an unauthorized electronic fund transfer under 12 C.F.R. § 1005 (Regulation E) and reported to my financial institution and State Attorney General.

3. CEASE AND DESIST ALL PROMOTIONAL SOLICITATION:
Remove my email address, phone number, and device identifiers from all marketing lists, VIP host rosters, "Free Spins", "Sweeps Coins", and reload bonus campaigns immediately.

Please provide written confirmation of permanent account closure and payment instrument blacklisting within forty-eight (48) hours.`,
    statutoryCitations: [
      'Electronic Fund Transfer Act (15 U.S.C. § 1693 et seq.) & Regulation E (12 C.F.R. Part 1005)',
      'State Unfair and Deceptive Acts and Practices (UDAP) Consumer Protection Statutes',
      'Sweepstakes & Promotional Gaming Duty-of-Care Compliance Standards',
    ],
  }));

  // Build valid Atom XML feed for Gmail -> Settings -> See all settings -> Filters and Blocked Addresses -> Import filters
  const gmailFilterXml = useMemo(() => {
    const allDomains = Array.from(
      new Set(platforms.flatMap((p) => p.domains.map((d) => d.toLowerCase())))
    );
    const domainChunks: string[][] = [];
    for (let i = 0; i < allDomains.length; i += 10) {
      domainChunks.push(allDomains.slice(i, i + 10));
    }

    const promoPhrases = [
      '"free spins"',
      '"sweepstakes coins"',
      '"sweeps coins"',
      '"no deposit bonus"',
      '"lucky wheel"',
      '"gold coins package"',
      '"bitofgold"',
      '"milky way load"',
      '"juwa777"',
      '"vip host reload"',
    ];

    const nowIso = new Date().toISOString();

    const entriesXml = domainChunks
      .map((chunk, idx) => {
        const fromQuery = chunk.map((d) => `*@${d}`).join(' OR ');
        return `  <entry>
    <category term='filter'></category>
    <title>AEGIS-ZERO Casino Domain Kill-Switch Part #${idx + 1}</title>
    <id>tag:mail.google.com,2008:filter:aegis-domain-${idx + 1}</id>
    <updated>${nowIso}</updated>
    <content></content>
    <apps:property name='from' value='${fromQuery}'/>
    <apps:property name='shouldTrash' value='true'/>
    <apps:property name='shouldMarkAsRead' value='true'/>
    <apps:property name='shouldNeverSpam' value='false'/>
  </entry>`;
      })
      .concat([
        `  <entry>
    <category term='filter'></category>
    <title>AEGIS-ZERO Sweepstakes &amp; Bonus Keyword Kill-Switch</title>
    <id>tag:mail.google.com,2008:filter:aegis-keywords-master</id>
    <updated>${nowIso}</updated>
    <content></content>
    <apps:property name='hasTheWord' value='${promoPhrases.join(' OR ')}'/>
    <apps:property name='shouldTrash' value='true'/>
    <apps:property name='shouldMarkAsRead' value='true'/>
  </entry>`,
      ])
      .join('\n');

    return `<?xml version='1.0' encoding='UTF-8'?>
<feed xmlns='http://www.w3.org/2005/Atom' xmlns:apps='http://schemas.google.com/apps/2006'>
  <title>AEGIS-ZERO Automated Gmail Gambling Promo Kill-Switch Filters</title>
  <id>tag:mail.google.com,2008:filters:aegis-zero-master</id>
  <updated>${nowIso}</updated>
${entriesXml}
</feed>`;
  }, [platforms, domKeywords]);

  const handleDownloadGmailXml = () => {
    const blob = new Blob([gmailFilterXml], { type: 'application/xml;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'aegis_gmail_killswitch.xml';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Scan user's live Gmail inbox for casino/sweepstakes promotional triggers
  const handleScanGmailInbox = async () => {
    setGmailError(null);
    setGmailStatus(null);
    const token = await getAccessToken();
    if (!token) {
      onRequireAuth();
      return;
    }

    setIsGmailBusy(true);
    try {
      const searchQuery = encodeURIComponent(
        '-in:trash ("free spins" OR "sweeps coins" OR "sweepstakes" OR "bitofgold" OR "milky way" OR "crowncoins" OR "juwa" OR "luckyland" OR "chumba" OR "pulsz" OR "prizepicks" OR "casino")'
      );
      const listRes = await fetch(
        `https://gmail.googleapis.com/gmail/v1/users/me/messages?maxResults=10&q=${searchQuery}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (listRes.status === 401 || listRes.status === 403) {
        onRequireAuth();
        throw new Error('Gmail authorization required or expired. Please sign in with Google.');
      }

      const listData = await listRes.json();
      if (!listRes.ok) {
        throw new Error(listData.error?.message || 'Failed to query Gmail messages');
      }

      const rawMessages: { id: string }[] = listData.messages || [];
      if (rawMessages.length === 0) {
        setDetectedEmails([]);
        setGmailStatus('Zero active gambling/sweepstakes promo emails found in your inbox.');
        return;
      }

      const detailed: GmailDetectedMessage[] = [];
      for (const msg of rawMessages) {
        const msgRes = await fetch(
          `https://gmail.googleapis.com/gmail/v1/users/me/messages/${msg.id}?format=metadata&metadataHeaders=Subject&metadataHeaders=From&metadataHeaders=Date`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        if (msgRes.ok) {
          const msgData = await msgRes.json();
          const headers: { name: string; value: string }[] = msgData.payload?.headers || [];
          const getHeader = (name: string) =>
            headers.find((h) => h.name.toLowerCase() === name.toLowerCase())?.value || '';
          detailed.push({
            id: msg.id,
            subject: getHeader('Subject') || '(No Subject)',
            from: getHeader('From') || 'Unknown Sender',
            date: getHeader('Date') || '',
            snippet: msgData.snippet || '',
          });
        }
      }

      setDetectedEmails(detailed);
      setGmailStatus(
        `Detected ${detailed.length} gambling/sweepstakes email(s) in your Gmail inbox.`
      );
    } catch (err: unknown) {
      setGmailError(err instanceof Error ? err.message : 'Unable to scan Gmail inbox');
    } finally {
      setIsGmailBusy(false);
    }
  };

  // Move detected gambling emails to Trash (Requires explicit user confirmation)
  const executeTrashDetectedEmails = async () => {
    setConfirmTrashEmailsOpen(false);
    setGmailError(null);
    setGmailStatus(null);

    const token = await getAccessToken();
    if (!token) {
      onRequireAuth();
      return;
    }

    setIsGmailBusy(true);
    try {
      let trashedCount = 0;
      for (const email of detectedEmails) {
        const res = await fetch(
          `https://gmail.googleapis.com/gmail/v1/users/me/messages/${email.id}/trash`,
          {
            method: 'POST',
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        if (res.ok) {
          trashedCount += 1;
        }
      }

      setDetectedEmails([]);
      setGmailStatus(`Moved ${trashedCount} gambling promotional email(s) to Gmail Trash.`);
    } catch (err: unknown) {
      setGmailError(err instanceof Error ? err.message : 'Failed to trash Gmail messages');
    } finally {
      setIsGmailBusy(false);
    }
  };

  // Deploy Kill-Switch filter rule directly to Gmail Settings (Requires explicit user confirmation)
  const executeDeployGmailFilter = async () => {
    setConfirmDeployFilterOpen(false);
    setGmailError(null);
    setGmailStatus(null);

    const token = await getAccessToken();
    if (!token) {
      onRequireAuth();
      return;
    }

    setIsGmailBusy(true);
    try {
      const filterBody = {
        criteria: {
          query:
            '"free spins" OR "sweepstakes coins" OR "sweeps coins" OR "bitofgold" OR "milky way load" OR "juwa777" OR "crowncoins"',
        },
        action: {
          removeLabelIds: ['INBOX', 'UNREAD'],
          addLabelIds: ['TRASH'],
        },
      };

      const res = await fetch(
        'https://gmail.googleapis.com/gmail/v1/users/me/settings/filters',
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(filterBody),
        }
      );

      if (res.status === 401 || res.status === 403) {
        onRequireAuth();
        throw new Error('Gmail settings permission required. Please sign in again.');
      }

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error?.message || 'Failed to create Gmail filter');
      }

      setGmailStatus(
        `Active Gmail Kill-Switch Filter (ID: ${data.id || 'deployed'}) created in your Gmail settings.`
      );
    } catch (err: unknown) {
      setGmailError(err instanceof Error ? err.message : 'Failed to deploy Gmail filter');
    } finally {
      setIsGmailBusy(false);
    }
  };

  // Send Legal Self-Exclusion Demand via Gmail API (Requires explicit user confirmation)
  const executeSendLegalEmailViaGmail = async () => {
    setConfirmSendLegalEmailOpen(false);
    setLegalError(null);
    setGmailStatus(null);

    if (!selectedPlatform) return;
    const token = await getAccessToken();
    if (!token) {
      onRequireAuth();
      return;
    }

    setIsGmailBusy(true);
    try {
      const mimeMessage = [
        `To: ${selectedPlatform.supportEmail}`,
        `Subject: ${generatedNotice.subjectLine}`,
        'Content-Type: text/plain; charset="UTF-8"',
        'MIME-Version: 1.0',
        '',
        generatedNotice.legalBody,
      ].join('\r\n');

      // Base64URL encode UTF-8 string
      const utf8Bytes = new TextEncoder().encode(mimeMessage);
      let binary = '';
      utf8Bytes.forEach((b) => {
        binary += String.fromCharCode(b);
      });
      const base64Url = btoa(binary)
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=+$/, '');

      const res = await fetch(
        'https://gmail.googleapis.com/gmail/v1/users/me/messages/send',
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ raw: base64Url }),
        }
      );

      if (res.status === 401 || res.status === 403) {
        onRequireAuth();
        throw new Error('Gmail send permission required. Please sign in with Google.');
      }

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error?.message || 'Failed to send legal notice via Gmail');
      }

      setGmailStatus(
        `Dispatched Permanent Self-Exclusion Demand to ${selectedPlatform.supportEmail} via Gmail (Message ID: ${data.id}).`
      );
    } catch (err: unknown) {
      setLegalError(err instanceof Error ? err.message : 'Failed to send notice via Gmail API');
    } finally {
      setIsGmailBusy(false);
    }
  };

  const handleGenerateWithGemini = async () => {
    if (!selectedPlatform) return;
    setIsGeneratingLegal(true);
    setLegalError(null);

    try {
      const response = await fetch('/api/legal-notice', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          platformName: selectedPlatform.name,
          platformDomain: selectedPlatform.domains.join(', '),
          supportEmail: selectedPlatform.supportEmail,
          userFullName,
          userState,
          accountIdentifier,
          knownPaymentRails,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Failed to generate notice');
      }

      setGeneratedNotice(data);
    } catch (err: unknown) {
      setLegalError(
        err instanceof Error ? err.message : 'Unable to generate custom notice via Gemini'
      );
    } finally {
      setIsGeneratingLegal(false);
    }
  };

  const mailtoHref = useMemo(() => {
    if (!selectedPlatform) return '#';
    const subject = encodeURIComponent(generatedNotice.subjectLine);
    const body = encodeURIComponent(generatedNotice.legalBody);
    return `mailto:${selectedPlatform.supportEmail}?subject=${subject}&body=${body}`;
  }, [selectedPlatform, generatedNotice]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
      {/* Left Column: Live Gmail Promo Kill-Switch & XML Filter Compiler */}
      <div className="lg:col-span-5 bg-[#0F1624] border border-slate-800 rounded-xl p-6 space-y-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-lg font-bold text-white">
              03. Gmail Promo Kill-Switch &amp; Live Inbox Purge
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Connects to Gmail to purge existing casino reload triggers, deploy live auto-trash rules, or export a Google Apps Atom XML filter feed.
            </p>
          </div>
          <MailX className="w-5 h-5 text-emerald-400 shrink-0" />
        </div>

        {/* Live Gmail API Controls */}
        <div className="p-3.5 bg-[#090D16] border border-slate-800 rounded-lg space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="text-xs font-semibold text-white flex items-center gap-1.5">
              <Inbox className="w-4 h-4 text-emerald-400" />
              <span>Live Gmail Inbox Scanner &amp; Filter Enforcement</span>
            </div>

            {needsAuth ? (
              <GoogleSignInButton
                onClick={onGoogleLogin}
                isLoading={isLoggingIn}
                label="Sign in with Google"
              />
            ) : (
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  disabled={isGmailBusy}
                  onClick={handleScanGmailInbox}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-200 bg-[#0F1624] hover:bg-slate-800 border border-slate-700 rounded-lg transition-colors cursor-pointer"
                >
                  {isGmailBusy ? (
                    <RefreshCw className="w-3.5 h-3.5 animate-spin text-emerald-400" />
                  ) : (
                    <Inbox className="w-3.5 h-3.5 text-emerald-400" />
                  )}
                  <span>Scan Gmail Inbox</span>
                </button>
                <button
                  type="button"
                  disabled={isGmailBusy}
                  onClick={() => setConfirmDeployFilterOpen(true)}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-950 bg-emerald-500 hover:bg-emerald-400 rounded-lg transition-colors cursor-pointer"
                >
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Deploy Live Filter</span>
                </button>
              </div>
            )}
          </div>

          {gmailError && (
            <div className="text-xs text-red-300 font-mono bg-red-950/40 border border-red-800/60 rounded px-2.5 py-1.5">
              {gmailError}
            </div>
          )}

          {gmailStatus && (
            <div className="text-xs text-emerald-300 font-mono bg-emerald-950/30 border border-emerald-800/50 rounded px-2.5 py-1.5">
              {gmailStatus}
            </div>
          )}

          {!needsAuth && detectedEmails.length > 0 && (
            <div className="space-y-2 pt-1 border-t border-slate-800">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-amber-300">
                  Detected Casino / Sweepstakes Emails ({detectedEmails.length})
                </span>
                <button
                  type="button"
                  disabled={isGmailBusy}
                  onClick={() => setConfirmTrashEmailsOpen(true)}
                  className="flex items-center gap-1 px-2.5 py-1 text-xs font-semibold bg-red-600 hover:bg-red-500 text-white rounded transition-colors cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Trash All ({detectedEmails.length})</span>
                </button>
              </div>
              <div className="max-h-44 overflow-y-auto space-y-1.5 pr-1">
                {detectedEmails.map((msg) => (
                  <div
                    key={msg.id}
                    className="p-2 bg-[#0F1624] border border-slate-800 rounded text-xs space-y-0.5"
                  >
                    <div className="font-semibold text-white truncate">{msg.subject}</div>
                    <div className="text-[11px] font-mono text-amber-300 truncate">{msg.from}</div>
                    <div className="text-[11px] text-slate-400 line-clamp-1">{msg.snippet}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="p-3.5 bg-[#090D16] border border-slate-800 rounded-lg space-y-2 text-xs">
          <div className="font-semibold text-white">Filter Rules Compiled into XML:</div>
          <div className="text-slate-300">
            · Sender Wildcards:{' '}
            <span className="font-mono text-emerald-300">
              {platforms.reduce((acc, p) => acc + p.domains.length, 0)} casino domains
            </span>
          </div>
          <div className="text-slate-300">
            · Trigger Phrases:{' '}
            <span className="font-mono text-amber-300">
              &quot;free spins&quot; OR &quot;sweepstakes coins&quot; OR &quot;no deposit bonus&quot; OR &quot;lucky wheel&quot;
            </span>
          </div>
          <div className="text-slate-300">
            · Enforcement Flags: <code className="text-emerald-400">shouldTrash=true</code> ·{' '}
            <code className="text-emerald-400">shouldMarkAsRead=true</code>
          </div>
        </div>

        <pre className="p-3.5 bg-[#090D16] border border-slate-800 rounded-lg font-mono text-xs text-slate-300 overflow-x-auto max-h-56 leading-relaxed">
          <code>{gmailFilterXml}</code>
        </pre>

        <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
          <button
            type="button"
            onClick={() => {
              navigator.clipboard.writeText(gmailFilterXml);
              setCopiedXml(true);
              setTimeout(() => setCopiedXml(false), 2000);
            }}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium text-slate-200 bg-[#090D16] hover:bg-slate-800 border border-slate-700 rounded-lg transition-colors whitespace-nowrap shrink-0"
          >
            {copiedXml ? (
              <Check className="w-3.5 h-3.5 text-emerald-400" />
            ) : (
              <FileCode2 className="w-3.5 h-3.5" />
            )}
            <span>{copiedXml ? 'XML Copied' : 'Copy XML Feed'}</span>
          </button>

          <button
            type="button"
            onClick={handleDownloadGmailXml}
            className="flex items-center gap-2 px-4 py-2.5 text-xs font-semibold bg-emerald-500 text-slate-950 hover:bg-emerald-400 rounded-lg transition-colors whitespace-nowrap shrink-0"
          >
            <Download className="w-4 h-4" />
            <span>Download aegis_gmail_killswitch.xml</span>
          </button>
        </div>
      </div>

      {/* Right Column: Legal Self-Exclusion & Payment Revocation Dispatcher */}
      <div className="lg:col-span-7 bg-[#0F1624] border border-slate-800 rounded-xl p-6 space-y-5">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h2 className="text-lg font-bold text-white">
              04. Permanent Legal Self-Exclusion &amp; Payment Revocation Dispatcher
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Uses Gemini to draft formal statutory self-exclusion demands and Regulation E payment revocation notices, with direct Gmail API dispatch or <code className="text-slate-300">mailto:</code> fallback.
            </p>
          </div>
          <Scale className="w-5 h-5 text-amber-400 shrink-0" />
        </div>

        {/* Target Platform & Consumer Parameters */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          <div>
            <label className="block text-xs text-slate-400 mb-1">
              Target Sweepstakes / Casino Operator
            </label>
            <select
              value={selectedPlatformId}
              onChange={(e) => setSelectedPlatformId(e.target.value)}
              className="w-full px-3 py-2 bg-[#090D16] border border-slate-700 rounded-lg text-xs text-white focus:outline-none focus:border-emerald-500"
            >
              {platforms.map((plat) => (
                <option key={plat.id} value={plat.id}>
                  {plat.name} ({plat.supportEmail})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs text-slate-400 mb-1">
              Consumer Full Legal Name
            </label>
            <input
              type="text"
              value={userFullName}
              onChange={(e) => setUserFullName(e.target.value)}
              className="w-full px-3 py-2 bg-[#090D16] border border-slate-700 rounded-lg text-xs text-white focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div>
            <label className="block text-xs text-slate-400 mb-1">
              Account Email / Phone / Player Handle
            </label>
            <input
              type="text"
              value={accountIdentifier}
              onChange={(e) => setAccountIdentifier(e.target.value)}
              className="w-full px-3 py-2 bg-[#090D16] border border-slate-700 rounded-lg text-xs font-mono text-white focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div>
            <label className="block text-xs text-slate-400 mb-1">
              State / Consumer Protection Jurisdiction
            </label>
            <input
              type="text"
              value={userState}
              onChange={(e) => setUserState(e.target.value)}
              className="w-full px-3 py-2 bg-[#090D16] border border-slate-700 rounded-lg text-xs text-white focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div className="sm:col-span-2">
            <label className="block text-xs text-slate-400 mb-1">
              Revoked Payment Rails (Cards, CashApp $cashtags, Crypto Gateways)
            </label>
            <input
              type="text"
              value={knownPaymentRails}
              onChange={(e) => setKnownPaymentRails(e.target.value)}
              className="w-full px-3 py-2 bg-[#090D16] border border-slate-700 rounded-lg text-xs text-white focus:outline-none focus:border-emerald-500"
            />
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="text-xs text-slate-400 font-mono">
            Recipient: <span className="text-emerald-300">{selectedPlatform?.supportEmail}</span>
          </div>
          <button
            type="button"
            disabled={isGeneratingLegal}
            onClick={handleGenerateWithGemini}
            className="flex items-center gap-2 px-4 py-2 text-xs font-semibold bg-amber-500 text-slate-950 hover:bg-amber-400 disabled:opacity-50 rounded-lg transition-colors whitespace-nowrap shrink-0"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>
              {isGeneratingLegal
                ? 'Drafting Statutory Demand with Gemini...'
                : `Generate Custom Legal Demand for ${selectedPlatform?.name.split(' ')[0]}`}
            </span>
          </button>
        </div>

        {legalError && (
          <div className="p-3 bg-red-950/40 border border-red-800/70 rounded-lg text-xs text-red-300 font-mono">
            {legalError}
          </div>
        )}

        {/* Generated Legal Notice Preview & Dispatch Controls */}
        <div className="space-y-3 pt-1">
          <div className="p-3 bg-[#090D16] border border-slate-800 rounded-lg text-xs font-mono text-amber-200">
            Subject: {generatedNotice.subjectLine}
          </div>

          <textarea
            rows={9}
            value={generatedNotice.legalBody}
            onChange={(e) =>
              setGeneratedNotice((prev) => ({ ...prev, legalBody: e.target.value }))
            }
            className="w-full p-3.5 bg-[#090D16] border border-slate-800 rounded-lg font-mono text-xs text-slate-200 leading-relaxed focus:outline-none focus:border-emerald-500"
          />

          <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
            <button
              type="button"
              onClick={() => {
                navigator.clipboard.writeText(
                  `To: ${selectedPlatform?.supportEmail}\nSubject: ${generatedNotice.subjectLine}\n\n${generatedNotice.legalBody}`
                );
                setCopiedNotice(true);
                setTimeout(() => setCopiedNotice(false), 2000);
              }}
              className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium text-slate-200 bg-[#090D16] hover:bg-slate-800 border border-slate-700 rounded-lg transition-colors whitespace-nowrap shrink-0"
            >
              {copiedNotice ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Copied Demand Text</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy Legal Demand</span>
                </>
              )}
            </button>

            <div className="flex flex-wrap items-center gap-2.5">
              {needsAuth ? (
                <GoogleSignInButton
                  onClick={onGoogleLogin}
                  isLoading={isLoggingIn}
                  label="Sign in with Google to Send"
                />
              ) : (
                <button
                  type="button"
                  disabled={isGmailBusy}
                  onClick={() => setConfirmSendLegalEmailOpen(true)}
                  className="flex items-center gap-2 px-4 py-2.5 text-xs font-semibold bg-emerald-500 text-slate-950 hover:bg-emerald-400 rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Dispatch Directly via Gmail API</span>
                </button>
              )}

              <a
                href={mailtoHref}
                className="flex items-center gap-2 px-4 py-2.5 text-xs font-medium text-slate-200 bg-[#090D16] hover:bg-slate-800 border border-slate-700 rounded-lg transition-colors whitespace-nowrap shrink-0"
              >
                <span>Open Mail Client</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Confirmation Modal 1: Trashing Detected Gambling Emails */}
      <WorkspaceConfirmModal
        isOpen={confirmTrashEmailsOpen}
        title={`Move ${detectedEmails.length} Gambling Promo Email(s) to Trash?`}
        description="This action will move the detected casino and sweepstakes promotional emails from your Gmail Inbox to Trash."
        affectedItems={detectedEmails.map((m) => `${m.subject} (${m.from})`)}
        confirmLabel={`Trash ${detectedEmails.length} Email(s)`}
        isDestructive={true}
        onConfirm={executeTrashDetectedEmails}
        onCancel={() => setConfirmTrashEmailsOpen(false)}
      />

      {/* Confirmation Modal 2: Deploying Live Auto-Trash Filter to Gmail Settings */}
      <WorkspaceConfirmModal
        isOpen={confirmDeployFilterOpen}
        title="Deploy Auto-Trash Kill-Switch Filter to Gmail?"
        description="This will create an active Gmail filter in your account settings that automatically marks as read and moves incoming sweepstakes/casino promotional emails to Trash."
        affectedItems={[
          'Query: "free spins" OR "sweepstakes coins" OR "sweeps coins" OR "bitofgold" OR "milky way load" OR "juwa777" OR "crowncoins"',
          'Action: Remove INBOX & UNREAD labels, Add TRASH label',
        ]}
        confirmLabel="Confirm & Create Gmail Filter"
        isDestructive={false}
        onConfirm={executeDeployGmailFilter}
        onCancel={() => setConfirmDeployFilterOpen(false)}
      />

      {/* Confirmation Modal 3: Sending Legal Self-Exclusion Notice via Gmail API */}
      <WorkspaceConfirmModal
        isOpen={confirmSendLegalEmailOpen}
        title="Send Legal Self-Exclusion Notice via Gmail?"
        description={`This will send an email on your behalf from your authenticated Gmail account to ${selectedPlatform?.supportEmail || ''} demanding permanent self-exclusion and payment rail revocation.`}
        affectedItems={[
          `To: ${selectedPlatform?.supportEmail || ''}`,
          `Subject: ${generatedNotice.subjectLine}`,
        ]}
        confirmLabel="Confirm & Send Email"
        isDestructive={false}
        onConfirm={executeSendLegalEmailViaGmail}
        onCancel={() => setConfirmSendLegalEmailOpen(false)}
      />
    </div>
  );
};
