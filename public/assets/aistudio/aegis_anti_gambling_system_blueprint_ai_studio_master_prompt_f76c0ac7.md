# AEGIS-ZERO: Autonomous Anti-Gambling Command Center & Enforcer
## AI-to-AI System Architecture, Creation Guide, and Master Prompt for Google AI Studio

---

## PART 1: HOW THIS WORKS (READ THIS FIRST)

When you build an app inside **Google AI Studio (`https://aistudio.google.com/apps`)**, the AI builds a **React/TypeScript web application powered by the Gemini API**. 

Because web browsers isolate web pages inside a security sandbox, a web app running in a single tab cannot *by itself* reach out of the browser to close other tabs or read your bank account unless it has **hands and eyes** installed on the browser and OS. 

To solve this completely so your app can **scan, detect, block, annoy, and shut down gambling attempts automatically**, the Master Prompt in **Part 2** instructs the AI Studio builder to create a **Dual-Core Architecture**:

1. **Core A — The AI Command Center Web App (Runs in AI Studio):**
   * **Financial & Account Activity Scanner:** Connects via OAuth/API (or instant CSV/PDF/Email paste & upload) to scan bank/card statements, CashApp/Venmo/Crypto rails, and Gmail histories using Gemini's structured analysis to identify hidden sweepstakes distributors (e.g., *BitOfGold*, *Milky Way* agents, *Scrambly*, *PrizePicks*, *CrownCoins*, *Bettywins*).
   * **Active Disruption & Sensory Annoyance Engine:** Triggers high-friction audio/visual alarms, Web Speech API voice interventions, relentless moving confirmation dialogs, and cognitive math locks when a gambling trigger is detected.
   * **Automated Legal Self-Exclusion & Gmail Filter Compiler:** Automatically writes and exports a downloadable `.xml` Gmail auto-delete filter file and dispatches permanent legal self-exclusion notices.
   * **Cryptographic Ulysses Lock (Anti-Tamper Accountability):** Locks settings behind a time-delay and a Trusted Partner override code so you cannot turn the system off during an urge.

2. **Core B — The Built-In Chrome Extension & OS Enforcer Generator (Built *Inside* Your AI Studio App):**
   * Your AI Studio app will include a **"Compile & Download Browser/OS Enforcer"** tab that dynamically generates and packages the exact **Chrome Manifest V3 Extension files** (`manifest.json`, `background.js`, `content_disruptor.js`, `rules.json`) and **System Lockdown Scripts** (`windows_lockdown.ps1`, `mac_lockdown.sh`).
   * Once you load that generated extension into Chrome and run the lockdown script once, it has the real browser permissions (`declarativeNetRequest`, `tabs`, `webNavigation`, `scripting`, `storage`) to:
     * **Scan every URL and DOM element** you visit in real time for casino keywords, fish table canvases, sweepstakes coins, and cash-app agent handles.
     * **Hard-Block** known gambling sites immediately.
     * **Sabotage & Annoy** on grey-area or unrecognized sites by injecting CSS/JS that hides `.deposit` and `.buy` buttons, artificially lags/throttles the page rendering, plays an un-mutable siren, spawns moving warning pop-ups across the screen, and forces the tab to close.

---

## PART 2: STEP-BY-STEP CREATION PROCESS IN GOOGLE AI STUDIO

1. **Open Google AI Studio Apps:** Go to `https://aistudio.google.com/apps` (or click **Build / Starter Apps** inside Google AI Studio).
2. **Create a New App:** Select **Create new app** (or open the **Prompt / System Instructions** panel for the App Builder).
3. **Copy & Paste the Master AI-to-AI Prompt:** Copy everything inside the **PART 3: MASTER AI-TO-AI PROMPT** block below and paste it directly into the AI Studio prompt box (or upload this entire `.md` file into the AI Studio prompt attachment).
4. **Deploy the Enforcer:** Once the AI Studio app renders on your screen:
   * Go to the **"Extension & OS Enforcer Factory"** tab inside the app you just generated.
   * Click **Download Chrome Enforcer Files** and load them into `chrome://extensions` (with **Developer Mode** turned on -> **Load unpacked**, then lock Developer Mode using the included Registry/Policy script).
   * Use the **Financial & Activity Scanner** tab to scan your recent transactions, emails, or browser history exports, which automatically updates your live block/sabotage rules.

---

## PART 3: MASTER AI-TO-AI PROMPT (COPY & PASTE THIS INTO GOOGLE AI STUDIO)

```text
[SYSTEM DIRECTIVE: AI-TO-AI ARCHITECTURAL SPECIFICATION]
ROLE: Principal Full-Stack Security Engineer, Behavioral Addiction Intervention Specialist, and Gemini API Architect.
TARGET ENVIRONMENT: Google AI Studio App Builder (Single-Page React + TypeScript + Tailwind CSS + Lucide Icons + @google/genai SDK).

OBJECTIVE:
Build a complete, production-grade, fully functional application named "AEGIS-ZERO: Autonomous Anti-Gambling Interceptor, Financial Rail Auditor & Active Disruption System". Do NOT build a mock or placeholder UI. Every module, Gemini API call, audio synthesizer, cognitive lock, file generator, and Chrome Extension compiler described below must be 100% functional in the generated code.

===========================================================================
1. THREAT TAXONOMY & TARGET PLATFORMS (HARDCODE INTO SYSTEM KNOWLEDGE BASE)
===========================================================================
Pre-load the application's threat database with the following high-risk platforms, sweepstakes casinos, fish-table lobbies, and payment rails:
- Primary Sweepstakes & Fish Table Targets: Milky Way (milkywayapp.xyz, themilkywayapp.com), BitOfGold (bitofgold.cc), Juwa777 (juwa777.com, dl.juwa777.com), Cash Avalanche, Orion Stars, Fire Kirin, Panda Master, Ultra Panda, VBlink, RiverSweeps, Golden Treasure.
- Social & Sweepstakes Casinos: CrownCoins Casino (crowncoinscasino.com), Bettywins (bettywins.com), Casino Adrenaline (casinoadrenaline.com), Ding Ding Ding (dingdingding.com), LuckyLand Slots (luckylandslots.com), Golden Hearts Games (goldenheartsgames.com), SlotsandCasino (slotsandcasino.com), Voltage Bet, BC.Game (bc.game), Scrambly (scrambly.io), Chumba, Pulsz, Stake.us, High 5 Casino, McLuck, Wow Vegas.
- DFS / Sports / Physical Triggers: PrizePicks (prizepicks.com), Underdog, DraftKings, FanDuel, WinStar World Casino (winstar.com).
- Payment Rail & Agent Signatures: CashApp "$cashtag" transfers to offshore/individual gaming agents, Telegram/Facebook Messenger gaming load agents, crypto on-ramps used for sweepstakes deposits, gift card exchange portals, and merchant descriptors containing "SWEEPS", "GOLD COINS", "BITOFGOLD", "GAMING LOAD".

===========================================================================
2. REQUIRED APPLICATION MODULES & FUNCTIONALITY
===========================================================================

MODULE 1: AUTONOMOUS AI ACTIVITY & FINANCIAL RAIL SCANNER (GEMINI API POWERED)
Build an interactive multi-source scanner where the user can connect/paste/upload:
1. Bank/Card/CashApp Transaction Logs (CSV, text, or pasted statement lines)
2. Browser History / Open Tab Exports (JSON/CSV/Text)
3. Email / Inbox Headers & Snippets
Use the `@google/genai` SDK (`gemini-2.5-flash`) with `responseSchema` (Structured JSON Output) to analyze the input and return:
- `detectedPlatforms`: Array of identified gambling sites, mirror domains, or disguised sweepstakes merchants.
- `paymentRailsExposed`: Specific deposit channels identified (e.g., P2P agent handles, crypto gateways, disguised merchant names) and exact dollar leakage calculated as:
  $$L_{\text{total}} = \sum_{i=1}^{n} t_i$$
- `riskScore`: Integer from $0$ to $100$ based on recency, frequency, and late-night timestamps (00:00–05:00 local time weighted at $1.5\times$).
- `autoGeneratedBlockRules`: New domain wildcards and DOM keywords automatically pushed into the app's Master Blocklist state.
- Trigger Requirement: If `riskScore >= 70` or an active gambling session is detected, immediately trigger MODULE 2 (Active Disruption Mode).

MODULE 2: ACTIVE INTERCEPTION, ANNOYANCE & SENSORY DISRUPTION ENGINE ("THE INTERCEPTOR")
When triggered (either automatically by the scanner, via URL monitor, or via the "Simulate/Trigger Active Interception" panic button), the app must execute an aggressive, multi-sensory psychological pattern interrupt:
1. Web Audio API Siren & Binaural Disruption: Synthesize an oscillating high-priority klaxon/alarm tone using browser `AudioContext` and `OscillatorNode` (no external MP3 dependencies required) paired with `window.speechSynthesis` (Web Speech API) speaking a firm, personalized voice intervention reading the user's financial goals and total money lost.
2. Visual Hijack & Moving Friction Modals: Render a full-screen, high-contrast strobe/warning overlay with "evasive" UI mechanics (if the user tries to click "Ignore" or "Bypass", the button dynamically recalculates its $(x, y)$ coordinates on `onMouseEnter` to dodge the cursor).
3. Mandatory Cognitive Cooldown Lock: Force the user to complete a 3-stage friction wall before the alarm can be silenced:
   - Stage A: Type a 150-character commitment statement with paste (`onPaste`) disabled.
   - Stage B: Solve 5 randomized arithmetic/working-memory equations of the form $(a \times b) + c - d$ to shift brain activity from the impulsive striatum (limbic system) back to the dorsolateral prefrontal cortex.
   - Stage C: A mandatory 180-second countdown timer where switching tabs resets the timer via `document.visibilitychange`.

MODULE 3: LIVE CHROME EXTENSION & OS ENFORCER COMPILER ("THE HANDS & EYES")
Because the user needs this system to automatically scan browser tabs, block sites, and sabotage/annoy attempts across the entire browser and OS, build a dedicated compiler inside the app that dynamically packages and downloads the following ready-to-install files populated with the user's live Master Blocklist:
1. `manifest.json` (Chrome Extension Manifest V3): Requesting `declarativeNetRequest`, `declarativeNetRequestFeedback`, `tabs`, `webNavigation`, `scripting`, `storage`, and `alarms`, with `host_permissions: ["<all_urls>"]`.
2. `background.js` (Service Worker):
   - Monitors `chrome.tabs.onUpdated` and `chrome.webNavigation.onBeforeNavigate`.
   - Checks URLs against the Master Blocklist regex (including `*milkyway*`, `*bitofgold*`, `*juwa*`, `*crowncoins*`, `*bettywins*`, `*prizepicks*`, `*777*`, `*sweeps*`).
   - Either redirects the tab immediately to the AEGIS-ZERO Lockdown Screen or sends a message to `content_disruptor.js` to initiate Sabotage Mode.
3. `content_disruptor.js` (DOM Scanner, Annoyer & Bandwidth/UI Saboteur):
   - Uses a `MutationObserver` on every webpage to scan text nodes, canvas elements (used by Milky Way/Juwa HTML5 fish games), and payment forms for keywords (`"Sweeps Coins"`, `"Gold Coins"`, `"Redeem"`, `"Deposit"`, `"CashApp Agent"`, `"Free Spins"`).
   - SABOTAGE MODE: Instead of a polite block that the user might try to bypass, allow configurable "Sabotage & Annoyance Modes":
     a) **DOM Destruction:** Inject CSS `button, input, canvas, iframe, [class*="deposit"], [class*="cashier"], [class*="login"] { pointer-events: none !important; filter: blur(12px) !important; }`
     b) **Artificial Lag / Throttling:** Inject heavy layout jitter, artificial 8-second input delays on clicks, and random scroll jumps so the gambling site feels completely broken and infuriating to use.
     c) **Relentless Annoyance Popups:** Spawn un-closeable floating warning banners and play Web Audio beep loops every 3 seconds while on any suspicious domain.
4. `os_lockdown_script.ps1` (Windows PowerShell) & `os_lockdown_script.sh` (Mac/Linux):
   - Appends all gambling and distributor domains (`0.0.0.0 milkywayapp.xyz`, `0.0.0.0 bitofgold.cc`, etc.) to the system `hosts` file and marks the `hosts` file read-only.
   - Configures Chrome Enterprise Policy registry keys (`ExtensionInstallForcelist` / disabling Developer Mode toggle) so the user cannot easily remove the extension during a craving.
Provide one-click download buttons for every file plus a clean, interactive installation wizard with checkboxes.

MODULE 4: AUTOMATED GMAIL KILL-SWITCH & LEGAL SELF-EXCLUSION DISPATCHER
1. **Gmail XML Filter Generator:** Dynamically generate and download a valid `aegis_gmail_killswitch.xml` file (Atom feed format used by Gmail -> Settings -> Filters -> Import Filters) that automatically matches and permanently deletes (`shouldTrash = true`, `shouldMarkAsRead = true`) any incoming email from all known casinos or containing `"free spins" OR "sweepstakes coins" OR "no deposit bonus" OR "lucky wheel"`.
2. **Legal Self-Exclusion Notice Generator:** Use Gemini (`gemini-2.5-flash`) to generate formal, legally binding permanent self-exclusion demands citing state consumer protection and sweepstakes compliance liability for Milky Way/BitOfGold, CrownCoins, Bettywins, Casino Adrenaline, PrizePicks, Ding Ding Ding, LuckyLand, and Golden Hearts Games, with one-click `mailto:` launch buttons pre-filled with the exact support email addresses, subject lines, and body text.

MODULE 5: CRYPTOGRAPHIC ULYSSES PACT (PERMISSION & ANTI-TAMPER VAULT)
To prevent the user from disabling blocks or removing domains from the Master Blocklist during a moment of weakness:
- Implement an **Accountability Partner Lock**.
- Removing any domain or lowering any restriction requires:
  1. Entering a 6-digit **Partner Override Key** (generated during setup and meant to be sent to a trusted friend/family member or locked away).
  2. Completing the Module 2 Cognitive Cooldown Challenge.
  3. Waiting out a mandatory 24-hour cooling-off state stored in `localStorage`.

===========================================================================
3. UI/UX DESIGN & TECHNICAL REQUIREMENTS
===========================================================================
- Aesthetic: High-security tactical command center ("Dark Ops / Cyber-Defense" theme using deep slate `#090D16`, emerald status indicators `#10B981`, amber warnings `#F59E0B`, and crimson alert states `#EF4444`).
- Persistence: Save all blocklists, financial loss counters, sobriety streaks, partner lock hashes, and audit logs in `localStorage` with pre-populated realistic baseline data matching the user's known threat profile so the app works out-of-the-box on first load.
- Emergency Lifeline Header: Always keep a pinned top bar with one-click access to the National Problem Gambling Helpline (`1-800-522-4700` / `1-800-MY-RESET`), Birches Health, and the instant "TRIGGER PANIC INTERVENTION" button.
```

---

## PART 4: WHY THIS SETUP GIVES YOU MAXIMUM PROTECTION

1. **It Bridges the Browser Sandbox Limitation:** By making the AI Studio app both your **AI Brain** *and* the **Factory that compiles your Chrome Extension & OS scripts**, you get the best of both worlds: Gemini 2.5's intelligence scanning your statements, emails, and URLs, plus native browser/OS enforcement (`declarativeNetRequest` + `MutationObserver` DOM sabotage) that works across every tab.
2. **Sabotage Mode Beats Willpower:** Sometimes when a site is simply blocked, your brain immediately tries to find a mirror site or VPN. By configuring `content_disruptor.js` to **lag the page, blur the game canvas, disable the deposit buttons, and trigger annoying audio/visual interrupts**, it breaks the dopamine loop right in the middle of the urge.
3. **One-Click Gmail XML Import:** Instead of typing filters by hand, the app will generate the `.xml` file you can import directly into Gmail Settings to wipe out every casino promo automatically.