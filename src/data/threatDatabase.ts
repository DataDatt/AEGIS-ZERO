export interface ThreatPlatform {
  id: string;
  name: string;
  domains: string[];
  category: 'Fish Table / Sweepstakes' | 'Social & Sweepstakes Casino' | 'DFS / Sports / Physical' | 'Crypto / Offshore Casino' | 'Payment Rail / Distributor';
  supportEmail: string;
  riskTier: 'CRITICAL' | 'HIGH' | 'ELEVATED';
  knownSignatures: string[];
  activeBlock: boolean;
}

export interface PaymentRailEntry {
  id: string;
  timestamp: string;
  merchantOrHandle: string;
  railType: 'CashApp Agent' | 'Disguised Sweepstakes Card' | 'Crypto On-Ramp' | 'Gift Card Portal' | 'Direct ACH/Card';
  platformLinked: string;
  amount: number;
  isLateNight: boolean;
}

export interface SabotageConfig {
  domDestruction: boolean;
  artificialLag: boolean;
  relentlessAudioPopups: boolean;
  autoCloseTabSeconds: number;
  strictnessLevel: 'MAXIMUM_SABOTAGE' | 'HARD_REDIRECT' | 'STEALTH_THROTTLE';
}

export interface UlyssesVaultState {
  isArmed: boolean;
  partnerName: string;
  partnerEmail: string;
  partnerOverrideCodeHash: string;
  demoOverrideHint: string;
  coolingOffUntil: number | null;
  pendingActionDescription: string | null;
  cognitiveChallengePassed: boolean;
}

export const INITIAL_THREAT_PLATFORMS: ThreatPlatform[] = [
  {
    id: 'milky-way',
    name: 'Milky Way Sweepstakes',
    domains: ['milkywayapp.xyz', 'themilkywayapp.com', 'dl.milkywayapp.xyz'],
    category: 'Fish Table / Sweepstakes',
    supportEmail: 'compliance@themilkywayapp.com',
    riskTier: 'CRITICAL',
    knownSignatures: ['milkywayapp', 'milky way load', 'fish table canvas', 'bitofgold milkyway'],
    activeBlock: true,
  },
  {
    id: 'bit-of-gold',
    name: 'BitOfGold Distributor',
    domains: ['bitofgold.cc', 'app.bitofgold.cc', 'pay.bitofgold.cc'],
    category: 'Payment Rail / Distributor',
    supportEmail: 'support@bitofgold.cc',
    riskTier: 'CRITICAL',
    knownSignatures: ['BITOFGOLD', 'BOG*SWEEPS', 'bitofgold deposit', 'sweepstakes distributor'],
    activeBlock: true,
  },
  {
    id: 'juwa-777',
    name: 'Juwa777 Fish & Casino',
    domains: ['juwa777.com', 'dl.juwa777.com', 'ht.juwa777.com'],
    category: 'Fish Table / Sweepstakes',
    supportEmail: 'support@juwa777.com',
    riskTier: 'CRITICAL',
    knownSignatures: ['juwa777', 'juwa agent', 'juwa city', 'dl.juwa777'],
    activeBlock: true,
  },
  {
    id: 'crowncoins',
    name: 'CrownCoins Casino',
    domains: ['crowncoinscasino.com', 'app.crowncoinscasino.com'],
    category: 'Social & Sweepstakes Casino',
    supportEmail: 'support@crowncoinscasino.com',
    riskTier: 'CRITICAL',
    knownSignatures: ['CROWNCOINS', 'Sunflower Limited', 'Crown Coins Package', 'Sweeps Coins'],
    activeBlock: true,
  },
  {
    id: 'bettywins',
    name: 'Bettywins Casino',
    domains: ['bettywins.com', 'play.bettywins.com'],
    category: 'Social & Sweepstakes Casino',
    supportEmail: 'support@bettywins.com',
    riskTier: 'CRITICAL',
    knownSignatures: ['BETTYWINS', 'bettywins bonus', 'no rules bonus'],
    activeBlock: true,
  },
  {
    id: 'casino-adrenaline',
    name: 'Casino Adrenaline',
    domains: ['casinoadrenaline.com', 'm.casinoadrenaline.com'],
    category: 'Crypto / Offshore Casino',
    supportEmail: 'support@casinoadrenaline.com',
    riskTier: 'CRITICAL',
    knownSignatures: ['CASINOADRENALINE', 'adrenaline crypto', 'free spins reload'],
    activeBlock: true,
  },
  {
    id: 'ding-ding-ding',
    name: 'Ding Ding Ding Casino',
    domains: ['dingdingding.com', 'play.dingdingding.com'],
    category: 'Social & Sweepstakes Casino',
    supportEmail: 'support@dingdingding.com',
    riskTier: 'HIGH',
    knownSignatures: ['DINGDINGDING', 'Living Pixels Studio', 'bingo balls sweeps'],
    activeBlock: true,
  },
  {
    id: 'luckyland-slots',
    name: 'LuckyLand Slots',
    domains: ['luckylandslots.com', 'play.luckylandslots.com'],
    category: 'Social & Sweepstakes Casino',
    supportEmail: 'support@luckylandslots.com',
    riskTier: 'HIGH',
    knownSignatures: ['LUCKYLAND', 'VGW LuckyLand', 'quacky hour'],
    activeBlock: true,
  },
  {
    id: 'golden-hearts',
    name: 'Golden Hearts Games',
    domains: ['goldenheartsgames.com', 'play.goldenheartsgames.com'],
    category: 'Social & Sweepstakes Casino',
    supportEmail: 'support@goldenheartsgames.com',
    riskTier: 'HIGH',
    knownSignatures: ['GOLDEN HEARTS GAMES', 'charity bingo sweeps'],
    activeBlock: true,
  },
  {
    id: 'slots-and-casino',
    name: 'SlotsandCasino',
    domains: ['slotsandcasino.com', 'www.slotsandcasino.com'],
    category: 'Crypto / Offshore Casino',
    supportEmail: 'support@slotsandcasino.com',
    riskTier: 'HIGH',
    knownSignatures: ['SLOTSANDCASINO', 'international gateway charge'],
    activeBlock: true,
  },
  {
    id: 'voltage-bet',
    name: 'Voltage Bet & BC.Game',
    domains: ['voltagebet.io', 'bc.game', 'mirror.bc.game'],
    category: 'Crypto / Offshore Casino',
    supportEmail: 'support@bc.game',
    riskTier: 'CRITICAL',
    knownSignatures: ['VOLTAGEBET', 'BC.GAME', 'JB coin', 'BCD deposit'],
    activeBlock: true,
  },
  {
    id: 'scrambly',
    name: 'Scrambly Casino Offerwall',
    domains: ['scrambly.io', 'app.scrambly.io'],
    category: 'Payment Rail / Distributor',
    supportEmail: 'support@scrambly.io',
    riskTier: 'HIGH',
    knownSignatures: ['SCRAMBLY', 'casino milestone offer', 'deposit match task'],
    activeBlock: true,
  },
  {
    id: 'fish-table-syndicate',
    name: 'Orion Stars / Fire Kirin / Cash Avalanche / Panda Master / VBlink / RiverSweeps',
    domains: [
      'orionstars.vip',
      'firekirin.xyz',
      'cashavalanche.net',
      'pandamaster.vip',
      'ultrapanda.mobi',
      'vblink777.club',
      'riversweeps.org',
      'goldentreasure.mobi',
    ],
    category: 'Fish Table / Sweepstakes',
    supportEmail: 'abuse@registrar-compliance.org',
    riskTier: 'CRITICAL',
    knownSignatures: ['ORION STARS', 'FIRE KIRIN', 'CASH AVALANCHE', 'PANDA MASTER', 'ULTRA PANDA', 'VBLINK', 'RIVERSWEEPS', 'GOLDEN TREASURE'],
    activeBlock: true,
  },
  {
    id: 'sweeps-network',
    name: 'Chumba / Pulsz / Stake.us / High 5 / McLuck / Wow Vegas',
    domains: [
      'chumbacasino.com',
      'pulsz.com',
      'stake.us',
      'high5casino.com',
      'mcluck.com',
      'wowvegas.com',
    ],
    category: 'Social & Sweepstakes Casino',
    supportEmail: 'support@chumbacasino.com',
    riskTier: 'HIGH',
    knownSignatures: ['VGW GAMES', 'YELLOW SOCIAL INTERACTIVE', 'SWEEPSTAKES COINS', 'STAKE CASH'],
    activeBlock: true,
  },
  {
    id: 'dfs-sports-physical',
    name: 'PrizePicks / Underdog / DraftKings / FanDuel / WinStar World Casino',
    domains: [
      'prizepicks.com',
      'underdogfantasy.com',
      'draftkings.com',
      'fanduel.com',
      'winstar.com',
    ],
    category: 'DFS / Sports / Physical',
    supportEmail: 'responsiblegaming@prizepicks.com',
    riskTier: 'CRITICAL',
    knownSignatures: ['PRIZEPICKS', 'UNDERDOG FANTASY', 'DRAFTKINGS', 'FANDUEL', 'WINSTAR WORLD CASINO'],
    activeBlock: true,
  },
];

export const INITIAL_DOM_KEYWORDS: string[] = [
  'Sweeps Coins',
  'Gold Coins',
  'CashApp Agent',
  'BitOfGold',
  'Milky Way Load',
  'Juwa777',
  'Buy Coins',
  'Redeem Prizes',
  'Instant Crypto Deposit',
  'Free Spins Bonus',
  'Fish Table Lobby',
  'PrizePicks Entry',
];

export const INITIAL_PAYMENT_LEDGER: PaymentRailEntry[] = [
  {
    id: 'tx-101',
    timestamp: '2026-11-07 02:14:00',
    merchantOrHandle: 'CASHAPP* $LuckyDragonLoad88 (Telegram Agent)',
    railType: 'CashApp Agent',
    platformLinked: 'Milky Way / Juwa777',
    amount: 140.00,
    isLateNight: true,
  },
  {
    id: 'tx-102',
    timestamp: '2026-11-07 03:41:12',
    merchantOrHandle: 'BITOFGOLD.CC *SWEEPS LOAD',
    railType: 'Disguised Sweepstakes Card',
    platformLinked: 'BitOfGold / Orion Stars',
    amount: 85.00,
    isLateNight: true,
  },
  {
    id: 'tx-103',
    timestamp: '2026-11-06 01:19:45',
    merchantOrHandle: 'SUNFLOWER LTD *CROWNCOINS',
    railType: 'Disguised Sweepstakes Card',
    platformLinked: 'CrownCoins Casino',
    amount: 99.99,
    isLateNight: true,
  },
  {
    id: 'tx-104',
    timestamp: '2026-11-05 23:12:08',
    merchantOrHandle: 'PRIZEPICKS* ENTRY ATLANTA GA',
    railType: 'Direct ACH/Card',
    platformLinked: 'PrizePicks',
    amount: 75.00,
    isLateNight: false,
  },
  {
    id: 'tx-105',
    timestamp: '2026-11-04 04:05:33',
    merchantOrHandle: 'MOONPAY* LTC TO BETTYWINS / ADRENALINE',
    railType: 'Crypto On-Ramp',
    platformLinked: 'Bettywins / Casino Adrenaline',
    amount: 210.00,
    isLateNight: true,
  },
];

export const SAMPLE_SCAN_PAYLOADS: Record<string, { label: string; sourceType: string; content: string }> = {
  bank_cashapp: {
    label: 'Load Sample: Late-Night Bank & CashApp Statement',
    sourceType: 'Bank/Card/CashApp Transaction Log',
    content: `DATE,TIME,DESCRIPTOR,CHANNEL,AMOUNT_USD
2026-11-07,01:42:19,"SQC*$ApexSweepsLoader777 - Note: MilkyWay 150pts",CashApp P2P,-150.00
2026-11-07,02:18:04,"BITOFGOLD*GOLD COINS PACKAGE",Debit Card,-75.00
2026-11-07,03:09:51,"SUNFLOWER*CROWNCOINS CASINO",Apple Pay / Visa,-199.99
2026-11-07,03:54:22,"MOONPAY*CRYPTO DEPOSIT -> bettywins.com",Debit Card,-120.00
2026-11-06,22:15:00,"PRIZEPICKS FANTASY ENTRY",ACH Debit,-50.00
2026-11-06,04:11:30,"VGW*LUCKYLAND SLOTS GOLD COINS",Mastercard,-49.99`,
  },
  browser_history: {
    label: 'Load Sample: Active Browser Tabs & History Export',
    sourceType: 'Browser History / Open Tab Export',
    content: `[
  { "timestamp": "2026-11-07T02:51:00", "url": "https://bitofgold.cc/dashboard/deposit?game=milkyway", "title": "BitOfGold - Buy Gold Coins & Load Milky Way / Juwa777" },
  { "timestamp": "2026-11-07T03:04:12", "url": "https://crowncoinscasino.com/store/sweeps-promo", "title": "CrownCoins Casino - Claim 200% Sweeps Coins Reload" },
  { "timestamp": "2026-11-07T03:19:44", "url": "https://dl.juwa777.com/web-mobile/fish-table", "title": "Juwa777 Web Lobby - Dragon King Fish Table" },
  { "timestamp": "2026-11-07T03:38:10", "url": "https://casinoadrenaline.com/cashier/crypto", "title": "Casino Adrenaline - Instant LTC Deposit & 100 Free Spins" },
  { "timestamp": "2026-11-07T04:02:15", "url": "https://scrambly.io/offers/social-casinos", "title": "Scrambly - Deposit on DingDingDing & Golden Hearts Games" }
]`,
  },
  inbox_headers: {
    label: 'Load Sample: Casino VIP & Reload Email Snippets',
    sourceType: 'Email / Inbox Headers & Snippets',
    content: `From: VIP Host <vip@bettywins.com> | Date: 2026-11-07 01:15 | Subject: 250% No-Rules Bonus + 50 Free Spins Waiting!
Snippet: Tap here to deposit $35 via Litecoin or CashApp Voucher and unlock instant Sweeps withdrawal.
---
From: BitOfGold Cashier <noreply@bitofgold.cc> | Date: 2026-11-07 02:30 | Subject: Your $85.00 Load to Fire Kirin & Milky Way is Complete
Snippet: Order #BOG-99281 confirmed. Need a reload? Message our 24/7 Telegram Load Agent $DragonSweepsVIP.
---
From: WinStar World Casino <offers@winstar.com> | Date: 2026-11-06 19:00 | Subject: Your Weekend Free Play & Resort Comp Voucher
Snippet: Claim $100 in Electronic Bonus Cash at the kiosk before Sunday midnight.`,
  },
};


export interface SponsorProfile {
  fullName: string;
  relationship: string;
  email: string;
  phone: string;
  secondaryContactName?: string;
  secondaryContactPhone?: string;
  overridePinHash: string;
  notifyOnPanic: boolean;
  notifyOnUnlockAttempt: boolean;
  notifyOnWeeklyAudit: boolean;
}

export interface ConnectedFinancialRail {
  id: string;
  institutionName: string;
  railCategory: 'Primary Checking / ACH' | 'Debit / Credit Card' | 'P2P App (CashApp / Venmo)' | 'Crypto Exchange / On-Ramp';
  accountIdentifier: string;
  deviceUsed: string;
  status: 'MONITORED_AND_LOCKED' | 'PENDING_REVOCATION';
}

export interface OnboardingRecord {
  completed: boolean;
  completedAt: string | null;
  consentedToEmailScan: boolean;
  consentedToFinancialAudit: boolean;
  consentedToBrowserSabotage: boolean;
  consentedToSponsorLock: boolean;
  protectedConsumerName: string;
  protectedDevices: string[];
  connectedRails: ConnectedFinancialRail[];
}

export const INITIAL_CONNECTED_RAILS: ConnectedFinancialRail[] = [
  {
    id: 'rail-cashapp',
    institutionName: 'CashApp P2P ($Cashtag Agent Rail)',
    railCategory: 'P2P App (CashApp / Venmo)',
    accountIdentifier: 'CashApp P2P Transfers & $Cashtag Loaders',
    deviceUsed: 'Primary Mobile Smartphone (Android / iOS)',
    status: 'MONITORED_AND_LOCKED',
  },
  {
    id: 'rail-card-4821',
    institutionName: 'Primary Visa / Mastercard Debit',
    railCategory: 'Debit / Credit Card',
    accountIdentifier: 'Card ending in 4821 (Sweepstakes & Apple/Google Pay)',
    deviceUsed: 'Desktop PC (Chrome) & Mobile Wallet',
    status: 'MONITORED_AND_LOCKED',
  },
  {
    id: 'rail-crypto-moonpay',
    institutionName: 'MoonPay / LTC & BTC Offshore On-Ramp',
    railCategory: 'Crypto Exchange / On-Ramp',
    accountIdentifier: 'Crypto Gateway / Offshore Casino Cashier',
    deviceUsed: 'Desktop PC (Windows Chrome Profile)',
    status: 'MONITORED_AND_LOCKED',
  },
];
