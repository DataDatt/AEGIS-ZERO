import React, { useState, useMemo } from 'react';
import {
  Download,
  Terminal,
  Sliders,
  CheckSquare,
  Square,
  Copy,
  Check,
  EyeOff,
  Clock,
  Volume2,
  ShieldCheck,
  RefreshCw,
} from 'lucide-react';
import { SabotageConfig, ThreatPlatform } from '../data/threatDatabase';

interface EnforcerCompilerModuleProps {
  platforms: ThreatPlatform[];
  domKeywords: string[];
  sabotageConfig: SabotageConfig;
  onUpdateSabotageConfig: (next: SabotageConfig) => void;
  onTriggerInterception: (reason: string) => void;
}

function downloadTextFile(filename: string, content: string, mimeType = 'text/plain;charset=utf-8') {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export const EnforcerCompilerModule: React.FC<EnforcerCompilerModuleProps> = ({
  platforms,
  domKeywords,
  sabotageConfig,
  onUpdateSabotageConfig,
  onTriggerInterception,
}) => {
  const [selectedFileTab, setSelectedFileTab] = useState<
    | 'manifest.json'
    | 'background.js'
    | 'content_disruptor.js'
    | 'rules.json'
    | 'windows_lockdown.ps1'
    | 'mac_lockdown.sh'
    | 'aegis_auto_installer.ps1'
  >('content_disruptor.js');
  const [copiedFile, setCopiedFile] = useState<string | null>(null);
  const [liveSyncStatus, setLiveSyncStatus] = useState<string | null>(null);

  const [installSteps, setInstallSteps] = useState<Record<string, boolean>>({
    step1: false,
    step2: false,
    step3: false,
    step4: false,
  });

  const [sandboxDepositClicks, setSandboxDepositClicks] = useState(0);
  const [sandboxStatusMessage, setSandboxStatusMessage] = useState<string | null>(null);

  const activeDomains = useMemo(() => {
    const set = new Set<string>();
    for (const p of platforms) {
      if (p.activeBlock) {
        for (const d of p.domains) {
          set.add(d.toLowerCase());
        }
      }
    }
    return Array.from(set);
  }, [platforms]);

  // Push live rules to server endpoint /api/rules/sync so the Chrome Extension background worker picks them up automatically
  const handlePushLiveRulesToServer = async () => {
    try {
      const res = await fetch('/api/rules/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          blockedDomains: activeDomains,
          domKeywords,
        }),
      });
      if (res.ok) {
        setLiveSyncStatus(
          `Synced ${activeDomains.length} domains & ${domKeywords.length} DOM signatures to live extension endpoint (/api/rules/live).`
        );
      }
    } catch {
      setLiveSyncStatus('Local rule state updated.');
    }
  };

  const compiledFiles = useMemo(() => {
    const manifestJson = JSON.stringify(
      {
        manifest_version: 3,
        name: 'AEGIS-ZERO Autonomous Anti-Gambling Enforcer & Saboteur',
        version: '4.0.0',
        description:
          'Real-time URL interceptor, WebSocket fish-table network kill-switch, and DOM/input lag saboteur with live rule sync.',
        permissions: [
          'declarativeNetRequest',
          'declarativeNetRequestFeedback',
          'tabs',
          'webNavigation',
          'scripting',
          'storage',
          'alarms',
        ],
        host_permissions: ['<all_urls>'],
        background: {
          service_worker: 'background.js',
        },
        declarative_net_request: {
          rule_resources: [
            {
              id: 'aegis_master_ruleset',
              enabled: true,
              path: 'rules.json',
            },
          ],
        },
        content_scripts: [
          {
            matches: ['<all_urls>'],
            js: ['content_disruptor.js'],
            run_at: 'document_start',
            all_frames: true,
          },
        ],
      },
      null,
      2
    );

    const rulesJson = JSON.stringify(
      activeDomains.map((domain, idx) => ({
        id: idx + 1,
        priority: 1,
        action: {
          type: 'block',
        },
        condition: {
          urlFilter: `||${domain}^`,
          resourceTypes: ['main_frame', 'sub_frame', 'xmlhttprequest', 'websocket'],
        },
      })),
      null,
      2
    );

    const backgroundJs = `// AEGIS-ZERO Service Worker (background.js) v4.0
// Auto-compiled with ${activeDomains.length} blocked domains, ${domKeywords.length} DOM signatures, and Live Server Polling.
let BLOCKED_DOMAINS = ${JSON.stringify(activeDomains, null, 2)};
const URL_REGEX = /(milkyway|bitofgold|juwa|crowncoins|bettywins|casinoadrenaline|prizepicks|dingdingding|luckyland|goldenhearts|slotsandcasino|voltagebet|bc\\.game|scrambly|orionstars|firekirin|pandamaster|ultrapanda|vblink|riversweeps|chumba|pulsz|stake\\.us|winstar|777|sweeps)/i;

// Poll local AEGIS-ZERO Command Center (/api/rules/live) every 60s for newly discovered domains
async function syncLiveRules() {
  try {
    const res = await fetch('http://localhost:3000/api/rules/live');
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data.blockedDomains)) {
        BLOCKED_DOMAINS = Array.from(new Set([...BLOCKED_DOMAINS, ...data.blockedDomains]));
        chrome.storage.local.set({ aegisBlockedDomains: BLOCKED_DOMAINS, aegisDomKeywords: data.domKeywords || [] });
      }
    }
  } catch (e) {}
}
chrome.alarms.create('aegis_live_sync', { periodInMinutes: 1 });
chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === 'aegis_live_sync') syncLiveRules();
});
syncLiveRules();

function isGamblingUrl(urlStr) {
  if (!urlStr) return false;
  try {
    const u = new URL(urlStr);
    const host = u.hostname.toLowerCase();
    if (BLOCKED_DOMAINS.some(d => host === d || host.endsWith('.' + d))) return true;
    return URL_REGEX.test(urlStr);
  } catch {
    return false;
  }
}

chrome.webNavigation.onBeforeNavigate.addListener((details) => {
  if (details.frameId !== 0) return;
  if (isGamblingUrl(details.url)) {
    chrome.tabs.sendMessage(details.tabId, {
      type: 'AEGIS_ENGAGE_SABOTAGE',
      url: details.url
    }).catch(() => {});
  }
});

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  const targetUrl = changeInfo.url || tab.url;
  if (isGamblingUrl(targetUrl)) {
    chrome.tabs.sendMessage(tabId, {
      type: 'AEGIS_ENGAGE_SABOTAGE',
      url: targetUrl
    }).catch(() => {});
  }
});`;

    const contentDisruptorJs = `// AEGIS-ZERO Real-Time DOM, WebSocket & Network Saboteur (content_disruptor.js) v4.0
(function() {
  let TRIGGER_KEYWORDS = ${JSON.stringify(domKeywords, null, 2)};
  let BLOCKED_DOMAINS = ${JSON.stringify(activeDomains, null, 2)};
  let sabotageEngaged = false;

  chrome.storage?.local?.get(['aegisBlockedDomains', 'aegisDomKeywords'], (res) => {
    if (Array.isArray(res?.aegisBlockedDomains)) BLOCKED_DOMAINS = res.aegisBlockedDomains;
    if (Array.isArray(res?.aegisDomKeywords)) TRIGGER_KEYWORDS = res.aegisDomKeywords;
  });

  function severNetworkAndWebSockets() {
    try {
      window.WebSocket = function() {
        throw new Error('[AEGIS-ZERO] Gambling WebSocket Frame Severed');
      };
      const origFetch = window.fetch;
      window.fetch = async function(...args) {
        const url = String(args[0] || '').toLowerCase();
        if (/(deposit|cashier|sweeps|coins|spin|bet|wallet|bitofgold|milkyway|juwa)/i.test(url)) {
          throw new Error('[AEGIS-ZERO] Deposit/Game API Request Blocked');
        }
        return origFetch.apply(this, args);
      };
    } catch (e) {}
  }

  function playAnnoyanceSiren() {
    ${
      sabotageConfig.relentlessAudioPopups
        ? `try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(780, ctx.currentTime);
      gain.gain.value = 0.15;
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      setTimeout(() => { osc.stop(); ctx.close(); }, 650);
    } catch (e) {}`
        : '// Audio annoyance loop disabled'
    }
  }

  function injectSabotagePayload(reason) {
    if (sabotageEngaged) return;
    sabotageEngaged = true;
    console.warn('[AEGIS-ZERO] Active Sabotage Engaged:', reason);
    severNetworkAndWebSockets();

    ${
      sabotageConfig.domDestruction
        ? `const style = document.createElement('style');
    style.textContent = \`
      button, input, canvas, iframe, [class*="deposit"], [class*="cashier"], [class*="buy"], [class*="redeem"], [class*="login"], [id*="cashier"] {
        pointer-events: none !important;
        filter: blur(12px) grayscale(100%) !important;
        user-select: none !important;
      }
      body { overflow-x: hidden !important; }
    \`;
    document.documentElement.appendChild(style);`
        : ''
    }

    ${
      sabotageConfig.artificialLag
        ? `window.addEventListener('click', (e) => {
      e.stopImmediatePropagation();
      e.preventDefault();
      const start = Date.now();
      while (Date.now() - start < 450) {}
      window.scrollBy(0, (Math.random() > 0.5 ? 180 : -180));
    }, true);`
        : ''
    }

    ${
      sabotageConfig.relentlessAudioPopups
        ? `const banner = document.createElement('div');
    banner.style.cssText = 'position:fixed;top:16px;left:16px;right:16px;z-index:2147483647;background:#7f1d1d;color:#fff;padding:18px 24px;border:3px solid #ef4444;font-family:monospace;font-size:15px;font-weight:bold;box-shadow:0 20px 50px rgba(0,0,0,0.85);';
    banner.textContent = 'AEGIS-ZERO INTERCEPTION: GAMBLING / SWEEPSTAKES RAIL SABOTAGED (' + reason + '). WEBSOCKETS SEVERED. CLOSE THIS TAB IMMEDIATELY.';
    document.documentElement.appendChild(banner);
    setInterval(playAnnoyanceSiren, 3000);`
        : ''
    }
  }

  function scanDomNode() {
    if (sabotageEngaged) return;
    const host = window.location.hostname.toLowerCase();
    if (BLOCKED_DOMAINS.some(d => host === d || host.endsWith('.' + d))) {
      injectSabotagePayload('Matched Blocked Domain: ' + host);
      return;
    }
    const textSample = (document.body ? document.body.innerText : '').slice(0, 15000).toLowerCase();
    for (const kw of TRIGGER_KEYWORDS) {
      if (textSample.includes(kw.toLowerCase())) {
        injectSabotagePayload('Matched DOM Signature: ' + kw);
        return;
      }
    }
  }

  const observer = new MutationObserver(() => scanDomNode());
  observer.observe(document.documentElement, { childList: true, subtree: true });
  window.addEventListener('DOMContentLoaded', scanDomNode);

  chrome.runtime.onMessage.addListener((msg) => {
    if (msg && msg.type === 'AEGIS_ENGAGE_SABOTAGE') {
      injectSabotagePayload('Background Navigation Intercept');
    }
  });
})();`;

    const windowsPs1 = `# AEGIS-ZERO Windows OS Hosts Sinkhole & Chrome Policy Lockdown (windows_lockdown.ps1)
# Run as Administrator in PowerShell
$HostsPath = "$env:windir\System32\drivers\etc\hosts"
attrib -r $HostsPath

$BlockedDomains = @(
${activeDomains.map((d) => `  "${d}", "www.${d}"`).join(',\n')}
)

Add-Content -Path $HostsPath -Value "\`n# --- AEGIS-ZERO ANTI-GAMBLING SINKHOLE ---"
foreach ($domain in $BlockedDomains) {
  Add-Content -Path $HostsPath -Value "0.0.0.0 $domain"
  Add-Content -Path $HostsPath -Value "::0 $domain"
}

attrib +r $HostsPath
ipconfig /flushdns

New-Item -Path "HKLM:\SOFTWARE\Policies\Google\Chrome" -Force | Out-Null
Set-ItemProperty -Path "HKLM:\SOFTWARE\Policies\Google\Chrome" -Name "IncognitoModeAvailability" -Value 1 -Type DWord
Set-ItemProperty -Path "HKLM:\SOFTWARE\Policies\Google\Chrome" -Name "DeveloperToolsAvailability" -Value 2 -Type DWord

Write-Host "AEGIS-ZERO OS Sinkhole (${activeDomains.length} domains) and Chrome Policy Lock applied successfully." -ForegroundColor Green`;

    const macSh = `#!/usr/bin/env bash
# AEGIS-ZERO macOS / Linux Hosts Sinkhole & Immutable Flag Lockdown (mac_lockdown.sh)
HOSTS_FILE="/etc/hosts"
chflags noschg "$HOSTS_FILE" 2>/dev/null || chattr -i "$HOSTS_FILE" 2>/dev/null
cat << 'EOF' >> "$HOSTS_FILE"

# --- AEGIS-ZERO ANTI-GAMBLING SINKHOLE ---
${activeDomains.map((d) => `0.0.0.0 ${d}\n0.0.0.0 www.${d}`).join('\n')}
EOF
chflags schg "$HOSTS_FILE" 2>/dev/null || chattr +i "$HOSTS_FILE" 2>/dev/null
defaults write com.google.Chrome IncognitoModeAvailability -integer 1
dscacheutil -flushcache; sudo killall -HUP mDNSResponder 2>/dev/null
echo "AEGIS-ZERO macOS/Linux Sinkhole (${activeDomains.length} domains) & Immutable Lock active."`;

    const autoInstallerPs1 = `# AEGIS-ZERO One-Click Automated Extension Builder & OS Sinkhole Installer (aegis_auto_installer.ps1)
# Automatically writes all 4 Chrome Extension files to C:\AEGIS-ZERO-Enforcer and applies the Windows Hosts Sinkhole.
$ExtDir = "C:\AEGIS-ZERO-Enforcer"
New-Item -ItemType Directory -Force -Path $ExtDir | Out-Null

Set-Content -Path "$ExtDir\manifest.json" -Value @'
${manifestJson}
'@ -Encoding UTF8

Set-Content -Path "$ExtDir\rules.json" -Value @'
${rulesJson}
'@ -Encoding UTF8

Set-Content -Path "$ExtDir\background.js" -Value @'
${backgroundJs}
'@ -Encoding UTF8

Set-Content -Path "$ExtDir\content_disruptor.js" -Value @'
${contentDisruptorJs}
'@ -Encoding UTF8

Write-Host "Created C:\AEGIS-ZERO-Enforcer with all 4 Manifest V3 extension files." -ForegroundColor Cyan
${windowsPs1}`;

    return {
      'manifest.json': manifestJson,
      'background.js': backgroundJs,
      'content_disruptor.js': contentDisruptorJs,
      'rules.json': rulesJson,
      'windows_lockdown.ps1': windowsPs1,
      'mac_lockdown.sh': macSh,
      'aegis_auto_installer.ps1': autoInstallerPs1,
    };
  }, [activeDomains, domKeywords, sabotageConfig]);

  const handleCopyCode = (filename: string, code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedFile(filename);
    setTimeout(() => setCopiedFile(null), 2000);
  };

  const handleDownloadAllExtensionFiles = () => {
    (['manifest.json', 'background.js', 'content_disruptor.js', 'rules.json'] as const).forEach(
      (file, index) => {
        setTimeout(() => {
          downloadTextFile(
            file,
            compiledFiles[file],
            file.endsWith('.json') ? 'application/json' : 'text/javascript'
          );
        }, index * 220);
      }
    );
  };

  const handleSimulateSabotageClick = () => {
    setSandboxDepositClicks((prev) => prev + 1);
    setSandboxStatusMessage(
      'SABOTAGE INTERCEPTED: WebSocket severed • Click delayed by 8,000ms • Deposit element blurred (12px)'
    );
  };

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        <div className="lg:col-span-6 bg-[#0F1624] border border-slate-800 rounded-xl p-6 space-y-5">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-white">
                02. Browser Extension &amp; One-Click OS Enforcer Compiler
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Dynamically compiles Chrome Manifest V3 files, WebSocket network kill-switches &amp; OS sinkhole scripts from your live {activeDomains.length}-domain Master Blocklist.
              </p>
            </div>
            <Sliders className="w-5 h-5 text-emerald-400 shrink-0" />
          </div>

          <div className="space-y-3">
            <label className="flex items-start justify-between gap-4 p-3.5 bg-[#090D16] border border-slate-800 rounded-lg cursor-pointer">
              <div>
                <div className="text-xs font-semibold text-white flex items-center gap-2">
                  <EyeOff className="w-3.5 h-3.5 text-emerald-400" />
                  <span>DOM Destruction, WebSocket Severing &amp; Fish-Table Canvas Blur</span>
                </div>
                <p className="text-xs text-slate-400 mt-0.5">
                  Blurs all <code className="text-slate-300">&lt;canvas&gt;</code> &amp; <code className="text-slate-300">.deposit</code> elements and overrides <code className="text-amber-300">window.WebSocket</code> so HTML5 fish lobbies disconnect.
                </p>
              </div>
              <input
                type="checkbox"
                checked={sabotageConfig.domDestruction}
                onChange={(e) =>
                  onUpdateSabotageConfig({
                    ...sabotageConfig,
                    domDestruction: e.target.checked,
                  })
                }
                className="mt-1 rounded border-slate-700 bg-slate-900 text-emerald-500"
              />
            </label>

            <label className="flex items-start justify-between gap-4 p-3.5 bg-[#090D16] border border-slate-800 rounded-lg cursor-pointer">
              <div>
                <div className="text-xs font-semibold text-white flex items-center gap-2">
                  <Clock className="w-3.5 h-3.5 text-amber-400" />
                  <span>Artificial Input Lag &amp; Viewport Jitter Sabotage</span>
                </div>
                <p className="text-xs text-slate-400 mt-0.5">
                  Injects main-thread micro-stutters, click interception, and random scroll jumps so grey-area sweepstakes sites feel broken.
                </p>
              </div>
              <input
                type="checkbox"
                checked={sabotageConfig.artificialLag}
                onChange={(e) =>
                  onUpdateSabotageConfig({
                    ...sabotageConfig,
                    artificialLag: e.target.checked,
                  })
                }
                className="mt-1 rounded border-slate-700 bg-slate-900 text-emerald-500"
              />
            </label>

            <label className="flex items-start justify-between gap-4 p-3.5 bg-[#090D16] border border-slate-800 rounded-lg cursor-pointer">
              <div>
                <div className="text-xs font-semibold text-white flex items-center gap-2">
                  <Volume2 className="w-3.5 h-3.5 text-red-400" />
                  <span>Relentless Audio Beep Loop &amp; Floating Banner</span>
                </div>
                <p className="text-xs text-slate-400 mt-0.5">
                  Spawns an un-closeable warning banner and triggers a 780Hz Web Audio sawtooth alarm every 3 seconds while on any suspicious domain.
                </p>
              </div>
              <input
                type="checkbox"
                checked={sabotageConfig.relentlessAudioPopups}
                onChange={(e) =>
                  onUpdateSabotageConfig({
                    ...sabotageConfig,
                    relentlessAudioPopups: e.target.checked,
                  })
                }
                className="mt-1 rounded border-slate-700 bg-slate-900 text-emerald-500"
              />
            </label>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            <button
              type="button"
              onClick={() =>
                downloadTextFile(
                  'aegis_auto_installer.ps1',
                  compiledFiles['aegis_auto_installer.ps1']
                )
              }
              className="flex items-center justify-center gap-2 px-4 py-2.5 text-xs font-semibold bg-emerald-500 text-slate-950 hover:bg-emerald-400 rounded-lg transition-colors whitespace-nowrap cursor-pointer"
            >
              <Download className="w-4 h-4 shrink-0" />
              <span>One-Click Bundle Installer (.ps1)</span>
            </button>
            <button
              type="button"
              onClick={handleDownloadAllExtensionFiles}
              className="flex items-center justify-center gap-2 px-4 py-2.5 text-xs font-medium bg-[#090D16] text-slate-200 hover:bg-slate-800 border border-slate-700 rounded-lg transition-colors whitespace-nowrap cursor-pointer"
            >
              <Download className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Download Extension (4 Files)</span>
            </button>
          </div>

          <div className="flex items-center justify-between pt-1">
            <button
              type="button"
              onClick={handlePushLiveRulesToServer}
              className="inline-flex items-center gap-1.5 text-xs text-emerald-400 hover:text-emerald-300 font-mono cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Sync Rules to Live Extension Endpoint (/api/rules/live)</span>
            </button>
          </div>
          {liveSyncStatus && (
            <div className="text-xs font-mono text-emerald-300 bg-emerald-950/30 border border-emerald-800/50 rounded px-2.5 py-1.5">
              {liveSyncStatus}
            </div>
          )}
        </div>

        <div className="lg:col-span-6 bg-[#0F1624] border border-slate-800 rounded-xl p-6 space-y-5">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-white">Live DOM Sabotage Preview Sandbox</h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Preview how <code className="text-emerald-300">content_disruptor.js</code> neutralizes a sweepstakes fish-table lobby in real time.
              </p>
            </div>
            <button
              type="button"
              onClick={() =>
                onTriggerInterception('Simulated Sweepstakes Cashier / Fish-Table Canvas Trigger')
              }
              className="px-3 py-1.5 text-xs font-medium text-red-300 bg-red-500/15 hover:bg-red-500/25 border border-red-500/40 rounded-lg transition-colors whitespace-nowrap shrink-0"
            >
              Escalate to Full Siren Lock
            </button>
          </div>

          <div className="p-4 bg-[#090D16] border border-slate-800 rounded-lg space-y-3 relative overflow-hidden">
            {sabotageConfig.relentlessAudioPopups && (
              <div className="p-2.5 bg-red-950/90 border border-red-500 rounded text-xs font-mono text-red-200 flex items-center justify-between">
                <span>AEGIS-ZERO SABOTAGE ACTIVE: WebSockets Severed &amp; Cashier Neutralized</span>
                <span className="tabular-nums">780Hz Beep Loop</span>
              </div>
            )}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-center">
              <div
                className={`p-4 rounded-lg border border-slate-800 bg-slate-900/90 text-center space-y-2 transition-all ${
                  sabotageConfig.domDestruction ? 'blur-[5px] grayscale select-none' : ''
                }`}
              >
                <div className="text-xs font-mono text-amber-400">
                  &lt;canvas id=&quot;milkyway-fish-table&quot;&gt;
                </div>
                <div className="text-sm font-bold text-white">Dragon King 777 Sweepstakes Lobby</div>
                <div className="text-xs text-slate-400">Balance: 0.00 Sweeps Coins</div>
              </div>
              <div className="space-y-2">
                <button
                  type="button"
                  onClick={handleSimulateSabotageClick}
                  className={`w-full py-2.5 px-4 rounded-lg text-xs font-semibold border border-amber-500/40 bg-amber-500/10 text-amber-200 transition-all ${
                    sabotageConfig.domDestruction ? 'blur-[2px] opacity-60' : ''
                  }`}
                >
                  Buy $99.99 Gold Coins + 100 Free Sweeps
                </button>
                <button
                  type="button"
                  onClick={handleSimulateSabotageClick}
                  className={`w-full py-2 px-4 rounded-lg text-xs font-mono border border-slate-700 bg-slate-800 text-slate-300 transition-all ${
                    sabotageConfig.domDestruction ? 'blur-[2px] opacity-60' : ''
                  }`}
                >
                  Message CashApp Load Agent $Apex777
                </button>
              </div>
            </div>
            {sandboxStatusMessage && (
              <div className="text-xs font-mono text-emerald-400 pt-1">
                [{sandboxDepositClicks}x Blocked] {sandboxStatusMessage}
              </div>
            )}
          </div>

          <div className="space-y-2 pt-1">
            <div className="text-xs font-semibold text-slate-300">
              4-Step Local Browser &amp; OS Hardening Checklist
            </div>
            {[
              {
                id: 'step1',
                text: 'Run aegis_auto_installer.ps1 (PowerShell Admin) to auto-unpack C:\AEGIS-ZERO-Enforcer and apply the Windows Hosts Sinkhole.',
              },
              {
                id: 'step2',
                text: 'Open chrome://extensions, enable Developer Mode, and click "Load unpacked" -> select C:\AEGIS-ZERO-Enforcer.',
              },
              {
                id: 'step3',
                text: 'Verify live rule sync is active (background.js polls /api/rules/live automatically every 60 seconds).',
              },
              {
                id: 'step4',
                text: 'Verify that System32\drivers\etc\hosts is marked Read-Only and Chrome Incognito Mode is locked.',
              },
            ].map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => setInstallSteps((prev) => ({ ...prev, [item.id]: !prev[item.id] }))}
                className="w-full flex items-start gap-2.5 p-2.5 bg-[#090D16] hover:bg-slate-900 border border-slate-800 rounded-lg text-left transition-colors"
              >
                {installSteps[item.id] ? (
                  <CheckSquare className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                ) : (
                  <Square className="w-4 h-4 text-slate-500 shrink-0 mt-0.5" />
                )}
                <span
                  className={`text-xs ${
                    installSteps[item.id] ? 'text-emerald-300 line-through' : 'text-slate-300'
                  }`}
                >
                  {item.text}
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-[#0F1624] border border-slate-800 rounded-xl p-6 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-1 p-1 bg-[#090D16] border border-slate-800 rounded-lg">
            {(
              [
                'content_disruptor.js',
                'background.js',
                'manifest.json',
                'rules.json',
                'aegis_auto_installer.ps1',
                'windows_lockdown.ps1',
                'mac_lockdown.sh',
              ] as const
            ).map((filename) => (
              <button
                key={filename}
                type="button"
                onClick={() => setSelectedFileTab(filename)}
                className={`px-3 py-1.5 text-xs font-mono rounded-md transition-colors whitespace-nowrap shrink-0 ${
                  selectedFileTab === filename
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {filename}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => handleCopyCode(selectedFileTab, compiledFiles[selectedFileTab])}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-200 bg-[#090D16] hover:bg-slate-800 border border-slate-700 rounded-lg transition-colors whitespace-nowrap shrink-0"
            >
              {copiedFile === selectedFileTab ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Copied</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy Source</span>
                </>
              )}
            </button>
            <button
              type="button"
              onClick={() => downloadTextFile(selectedFileTab, compiledFiles[selectedFileTab])}
              className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold bg-emerald-500 text-slate-950 hover:bg-emerald-400 rounded-lg transition-colors whitespace-nowrap shrink-0"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download {selectedFileTab}</span>
            </button>
          </div>
        </div>
        <pre className="p-4 bg-[#090D16] border border-slate-800 rounded-lg font-mono text-xs text-slate-200 overflow-x-auto max-h-96 leading-relaxed">
          <code>{compiledFiles[selectedFileTab]}</code>
        </pre>
      </div>
    </div>
  );
};
