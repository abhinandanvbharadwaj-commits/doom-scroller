/**
 * Doom Scroller Dashboard - Simulated Event Generation Engine
 * Generates authentic high-volatility events across Crypto, Equities, Cyber, and Geopolitics.
 */

const CRISIS_TEMPLATES = [
  // CRYPTO & DEFI DISASTERS
  {
    category: 'crypto',
    title: 'Mega-Whale Account Liquidated: 34,000 BTC Forced Market Dump',
    impact: '-$2.18B LIQUIDATED',
    lossUsd: 2180000000,
    defcon: 1,
    baseChaos: 96,
    affectedAssets: ['BTC', 'DERIBIT-PERPS', 'BINANCE-FUTURES', 'SOL'],
    details: 'Cascading margin liquidation triggers automated collateral selloffs across 14 major derivatives exchanges. Slippage breaches 12% across centralized books.',
    recommendation: 'HALT PERPETUAL TRADING ENGINES // ENGAGE SPREAD CIRCUIT BREAKERS'
  },
  {
    category: 'crypto',
    title: 'Top-5 Algorithmic Stablecoin De-Pegs to $0.62 in 45 Seconds',
    impact: '-38.4% STABLE DE-PEG',
    lossUsd: 890000000,
    defcon: 1,
    baseChaos: 94,
    affectedAssets: ['USDe', 'CURVE-3POOL', 'AAVE', 'MAKER-DAO'],
    details: 'Coordinated automated redemption run drains primary automated market maker liquidity pools. Arbitrageurs halt operations due to RPC node saturation.',
    recommendation: 'EXECUTE EMERGENCY PAUSE GUARDIAN // FREEZE BRIDGE RELAYERS'
  },
  {
    category: 'crypto',
    title: 'Cross-Chain Bridge Validator Set Compromised via Zero-Day Exploit',
    impact: '-$620M EXPLOITED',
    lossUsd: 620000000,
    defcon: 1,
    baseChaos: 91,
    affectedAssets: ['ETH', 'AVAX', 'CROSS-CHAIN MESSENGER'],
    details: 'Attacker leverages corrupted multi-sig signature threshold to forge withdrawal proofs. Stolen funds currently dispersing through privacy mixers.',
    recommendation: 'BROADCAST BLACKLIST ADVISORY // CONTACT TIER-1 EXCHANGES'
  },
  {
    category: 'crypto',
    title: 'Flash Crash: Ethereum Drops $420 in 9-Second Vacuum Spike',
    impact: '-15.8% FLASH CRASH',
    lossUsd: 410000000,
    defcon: 2,
    baseChaos: 82,
    affectedAssets: ['ETH', 'OP', 'ARB', 'LDO'],
    details: 'Order book vacuum on spot desks results in high-frequency algorithmic dumping before market makers reboot quote parameters.',
    recommendation: 'WIDEN MAKER SPREADS // SUSPEND MARGIN BORROWING'
  },
  {
    category: 'crypto',
    title: 'Tier-1 CEX Halts Spot & Derivatives Withdrawals Amid Solvency Rumors',
    impact: 'WITHDRAWALS FROZEN',
    lossUsd: 310000000,
    defcon: 2,
    baseChaos: 85,
    affectedAssets: ['ALL-ASSETS', 'USDT', 'PROOF-OF-RESERVES'],
    details: 'Panic spreads on social feeds as proof-of-reserve discrepancies surface regarding unbacked liabilities.',
    recommendation: 'INITIATE ON-CHAIN PROOF AUDIT // PREPARE EMERGENCY LIQUIDITY LINES'
  },
  {
    category: 'crypto',
    title: 'Gas War Spikes L1 Base Fees to 1,450 Gwei - 92,000 Transactions Stuck',
    impact: '+2,400% GAS SURGE',
    lossUsd: 75000000,
    defcon: 3,
    baseChaos: 58,
    affectedAssets: ['ETH-MEMPOOL', 'ORACLES', 'MEV-BOTS'],
    details: 'Aggressive MEV searcher arbitrage loops choke block limits, causing Oracle update delays and bad-debt liquidations.',
    recommendation: 'SWITCH ORACLE PROVIDERS TO SECONDARY HEARTBEAT FEEDS'
  },

  // EQUITIES & TRADITIONAL FINANCIAL CRASHES
  {
    category: 'equities',
    title: 'Nasdaq Level-2 Market-Wide Circuit Breaker Triggered (Halt 15m)',
    impact: '-7.2% INDEX DUMP',
    lossUsd: 3450000000,
    defcon: 1,
    baseChaos: 98,
    affectedAssets: ['NDX', 'SPX', 'MAG-7', 'VIX SPIKE +48%'],
    details: 'Unprecedented institutional rebalancing error cascades through automated dark pools, triggering the SEC rule 80B market-wide circuit breaker halt.',
    recommendation: 'EXECUTE NYSE/NASDAQ LEVEL 2 CLEARING DRILL // STAND BY FOR 15-MIN REOPEN'
  },
  {
    category: 'equities',
    title: 'Global Sovereign Bond Yields Invert by 65 bps in 2-Hour Shock',
    impact: '+65 BPS VOLATILITY',
    lossUsd: 1800000000,
    defcon: 1,
    baseChaos: 92,
    affectedAssets: ['US10Y', 'BUND', 'JGB', 'EURODOLLAR'],
    details: 'Offshore repo market dislocation forces major hedge fund liquidation of sovereign paper. Liquidity dries up in primary dealer books.',
    recommendation: 'ACTIVATE FED REPO EMERGENCY STANDING FACILITY'
  },
  {
    category: 'equities',
    title: 'Semiconductor Mega-Cap Warns on Severe Supply Stoppage',
    impact: '-$240B MKT CAP ERASED',
    lossUsd: 1200000000,
    defcon: 2,
    baseChaos: 78,
    affectedAssets: ['NVDA', 'TSM', 'ASML', 'SOXX'],
    details: 'Critical lithography facility in East Asia reports catastrophic cleanroom contamination halting wafer output for 120 days.',
    recommendation: 'REBALANCE HARDWARE EXPOSURE // AUDIT SECONDARY FAB ALLOCATIONS'
  },
  {
    category: 'equities',
    title: 'Major Prime Broker Issues $8.4B Margin Call to Tier-1 Quantitative Fund',
    impact: 'UNRESOLVED MARGIN BREACH',
    lossUsd: 940000000,
    defcon: 2,
    baseChaos: 84,
    affectedAssets: ['PRIME-DESKS', 'EQUITY-SWAPS', 'LEVERAGED-LOANS'],
    details: 'Multi-strategy fund fails intraday variation margin check following aggressive short squeeze across consumer staples.',
    recommendation: 'SEIZE PLEDGED COLLATERAL // BEGIN CONTROLLED LIQUIDATION AUCTION'
  },
  {
    category: 'equities',
    title: 'Crude Oil Jumps $14/bbl in Sudden Gulf Shipping Chokepoint Disruption',
    impact: '+18.2% BRENT CRUDE',
    lossUsd: 580000000,
    defcon: 2,
    baseChaos: 76,
    affectedAssets: ['BRENT', 'WTI', 'AIRLINE-EQUITIES', 'CPI-SWAPS'],
    details: 'Strait of Hormuz commercial traffic suspended following drone strike warnings on two ultra-large crude carriers.',
    recommendation: 'RELEASE IEA STRATEGIC PETROLEUM RESERVES'
  },

  // CYBER & INFRASTRUCTURE WARFARE
  {
    category: 'cyber',
    title: 'Transatlantic Undersea Fiber-Optic Trunks Severed Simultaneously',
    impact: '42% LATENCY SURGE',
    lossUsd: 1650000000,
    defcon: 1,
    baseChaos: 95,
    affectedAssets: ['TAT-14', 'APOLLO-CABLE', 'GLOBAL-DNS', 'SWIFT-NET'],
    details: 'Physical sabotage detected on two transatlantic submarine data cables. Global financial routing rerouted via satellite failsafes.',
    recommendation: 'DIVERT TRAFFIC TO TRANS-PACIFIC PATHWAYS // ELEVATE CYBERCOM READINESS'
  },
  {
    category: 'cyber',
    title: 'Global Cloud Hyperscaler Region Suffers Complete Redundant Power Loss',
    impact: '54,000 SERVICES OFFLINE',
    lossUsd: 820000000,
    defcon: 1,
    baseChaos: 93,
    affectedAssets: ['US-EAST-1', 'PAYMENT-GATEWAYS', 'AIRLINE-RESERVATIONS'],
    details: 'Catastrophic substation fire takes out primary and backup diesel generators at northern Virginia mega-data center cluster.',
    recommendation: 'TRIGGER MULTI-REGION FAILOVER // ISSUE INCIDENT SEV-0 BROADCAST'
  },
  {
    category: 'cyber',
    title: 'BGP Hijack Redirects $4.2B in Banking & Crypto Traffic to Rogue AS',
    impact: 'ROGUE TRAFFIC INTERCEPT',
    lossUsd: 490000000,
    defcon: 2,
    baseChaos: 87,
    affectedAssets: ['BGP-ROUTES', 'DNS-AUTHORITY', 'TLS-CERT-ISSUERS'],
    details: 'Rogue autonomous system broadcasts false IP prefix route announcements, intercepting encrypted transaction payloads.',
    recommendation: 'ROV FILTER ENFORCEMENT // REVOKE COMPROMISED ROOT CERTIFICATES'
  },
  {
    category: 'cyber',
    title: 'Zero-Day Vulnerability Discovered in Core Microprocessor Architecture',
    impact: 'REMOTE CODE EXECUTION',
    lossUsd: 380000000,
    defcon: 2,
    baseChaos: 79,
    affectedAssets: ['X86_64-KERNEL', 'HYPERVISORS', 'CONTAINER-RUNTIME'],
    details: 'Speculative execution exploit bypasses hardware enclave memory protections without requiring physical host access.',
    recommendation: 'APPLY IMMEDIATE KERNEL MICROCODE PATCH // MITIGATE SPECULATION'
  },
  {
    category: 'cyber',
    title: 'Regional Power Grid SCADA Telemetry Disconnected in Cyber Intrusion',
    impact: '3.8 GW CAPACITY ISOLATED',
    lossUsd: 610000000,
    defcon: 2,
    baseChaos: 83,
    affectedAssets: ['SCADA-BUS', 'SUBSTATION-RELAYS', 'INDUSTRIAL-PLC'],
    details: 'Sophisticated wiper malware discovered inside peripheral SCADA substation controller firmware.',
    recommendation: 'ISOLATE GRID ISLANDS // SWITCH TO MANUAL ANALOG DISPATCH'
  },

  // GEOPOLITICAL & MACRO BLACK SWANS
  {
    category: 'geopolitics',
    title: 'Central Bank Emergency Rate Announcement: Unscheduled 250 bps Hike',
    impact: '+250 BPS EMERGENCY',
    lossUsd: 2900000000,
    defcon: 1,
    baseChaos: 97,
    affectedAssets: ['DXY-DOLLAR', 'EMERGING-FX', 'GOLD-DUMP', 'REITs'],
    details: 'Central bank conducts midnight emergency conference call citing uncontained capital flight and hyper-inflationary currency divergence.',
    recommendation: 'FREEZE CROSS-BORDER CAPITAL ACCOUNTS // PREPARE CURRENCY SWAP LINES'
  },
  {
    category: 'geopolitics',
    title: 'Critical Rare-Earth Minerals Export Embargo Enacted Effective Immediately',
    impact: 'SUPPLY CHOKEPOINT 94%',
    lossUsd: 1400000000,
    defcon: 1,
    baseChaos: 90,
    affectedAssets: ['GALLIUM', 'GERMANIUM', 'AEROSPACE-TITANIUM', 'EV-MAKERS'],
    details: 'Geopolitical retaliation freezes 94% of global advanced semiconductor refining feedstocks with immediate export ban.',
    recommendation: 'COMMENCE NATIONAL DEFENSE STOCKPILE DRAWDOWN'
  },
  {
    category: 'geopolitics',
    title: 'International Clearing House Halts Settlements for 3 Sovereign Nations',
    impact: 'SETTLEMENTS FROZEN',
    lossUsd: 870000000,
    defcon: 2,
    baseChaos: 81,
    affectedAssets: ['EUROCLEAR', 'CLEARSTREAM', 'CORRESPONDENT-BANKS'],
    details: 'Multilateral sanctions escalation forces clearinghouses to suspend cross-border securities reconciliation.',
    recommendation: 'ACTIVATE BILATERAL ESCROW SETTLEMENT PROTOCOLS'
  },
  {
    category: 'geopolitics',
    title: 'Panama Canal Transit Reduced to 8 Vessels Per Day Due to Extreme Drought',
    impact: 'SHIPPING DELAYS +24 DAYS',
    lossUsd: 420000000,
    defcon: 3,
    baseChaos: 64,
    affectedAssets: ['CONTAINER-RATES', 'LNG-CARRIERS', 'GRAIN-FUTURES'],
    details: 'Historic water reservoir depletion forces canal authority to slash daily maritime transit slots by 70%.',
    recommendation: 'REROUTE FREIGHT VIA CAPE OF GOOD HOPE // ADJUST INVENTORY BUFFERS'
  },
  {
    category: 'geopolitics',
    title: 'Sovereign Debt Downgrade Triggers Automated Institutional Dump Mandate',
    impact: 'RATING CUT TO JUNK (CCC)',
    lossUsd: 730000000,
    defcon: 2,
    baseChaos: 77,
    affectedAssets: ['PENSION-FUNDS', 'SOVEREIGN-CDS', 'INSURANCE-RESERVES'],
    details: 'Automated covenant mandates force non-discretionary pension liquidation of $45B in debt following rating agency downgrade.',
    recommendation: 'COORDINATE DEBT RESTRUCTURING COMMITTEE'
  }
];

class ChaosEventEngine {
  constructor() {
    this.eventCounter = 1000;
  }

  generateEvent(overrideCategory = null, forceCritical = false) {
    this.eventCounter++;
    
    // Filter templates if category requested
    let pool = CRISIS_TEMPLATES;
    if (overrideCategory && overrideCategory !== 'all') {
      pool = CRISIS_TEMPLATES.filter(t => t.category === overrideCategory);
      if (pool.length === 0) pool = CRISIS_TEMPLATES;
    }

    if (forceCritical) {
      pool = pool.filter(t => t.defcon === 1);
      if (pool.length === 0) pool = CRISIS_TEMPLATES.filter(t => t.defcon === 1);
    }

    const template = pool[Math.floor(Math.random() * pool.length)];

    // Add dynamic variance to chaos score and losses
    const variance = (Math.random() * 8) - 4; // -4 to +4
    let chaosScore = Math.min(100, Math.max(30, Math.round(template.baseChaos + variance)));

    if (forceCritical) {
      chaosScore = Math.max(93, chaosScore);
    }

    let defcon = template.defcon;
    if (chaosScore >= 90) defcon = 1;
    else if (chaosScore >= 65) defcon = 2;
    else defcon = 3;

    // Variance in loss amount
    const lossMultiplier = 0.8 + (Math.random() * 0.45);
    const lossUsd = Math.round(template.lossUsd * lossMultiplier);

    return {
      id: `EVT-${this.eventCounter}`,
      timestamp: new Date(),
      category: template.category,
      defcon: defcon,
      chaosScore: chaosScore,
      title: template.title,
      impact: template.impact,
      lossUsd: lossUsd,
      affectedAssets: template.affectedAssets,
      details: template.details,
      recommendation: template.recommendation,
      isCritical: defcon === 1
    };
  }

  // Generate initial seed history of 8 events
  generateInitialHistory(count = 8) {
    const history = [];
    for (let i = 0; i < count; i++) {
      const evt = this.generateEvent();
      // stagger timestamps backward in time
      evt.timestamp = new Date(Date.now() - (count - i) * 14000);
      history.push(evt);
    }
    return history;
  }
}

window.chaosEngine = new ChaosEventEngine();
