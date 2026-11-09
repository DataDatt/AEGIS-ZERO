import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Volume2,
  VolumeX,
  ShieldAlert,
  Lock,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  EyeOff,
  TrendingUp,
  Send,
} from 'lucide-react';
import { SponsorProfile } from '../data/threatDatabase';

interface ActiveInterceptorModalProps {
  isOpen: boolean;
  triggerReason: string;
  totalMoneyLost: number;
  financialGoal: string;
  sponsor?: SponsorProfile;
  onCompleteCooldown: () => void;
}

interface MathEquation {
  a: number;
  b: number;
  c: number;
  d: number;
  answer: number;
}

const REQUIRED_COMMITMENT_STATEMENT =
  'I recognize this gambling urge is a synthetic dopamine trap engineered to extract my money. I choose to protect my financial future and close all gaming rails now.';

function generateEquations(): MathEquation[] {
  const list: MathEquation[] = [];
  for (let i = 0; i < 5; i++) {
    const a = Math.floor(Math.random() * 8) + 4; // 4..11
    const b = Math.floor(Math.random() * 8) + 3; // 3..10
    const c = Math.floor(Math.random() * 25) + 10; // 10..34
    const d = Math.floor(Math.random() * 14) + 5; // 5..18
    list.push({
      a,
      b,
      c,
      d,
      answer: a * b + c - d,
    });
  }
  return list;
}

export const ActiveInterceptorModal: React.FC<ActiveInterceptorModalProps> = ({
  isOpen,
  triggerReason,
  totalMoneyLost,
  financialGoal,
  sponsor,
  onCompleteCooldown,
}) => {
  const [stage, setStage] = useState<'A' | 'B' | 'C'>('A');
  const [typedText, setTypedText] = useState('');
  const [pasteAttemptCount, setPasteAttemptCount] = useState(0);
  const [equations, setEquations] = useState<MathEquation[]>(() => generateEquations());
  const [userAnswers, setUserAnswers] = useState<string[]>(['', '', '', '', '']);
  const [mathError, setMathError] = useState<string | null>(null);
  const [secondsRemaining, setSecondsRemaining] = useState(180);
  const [tabSwitchResets, setTabSwitchResets] = useState(0);
  const [evasiveOffset, setEvasiveOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [evasionAttempts, setEvasionAttempts] = useState(0);
  const [isAudioActive, setIsAudioActive] = useState(true);
  const [currentFreqHz, setCurrentFreqHz] = useState(740);

  const audioCtxRef = useRef<AudioContext | null>(null);
  const oscPrimaryRef = useRef<OscillatorNode | null>(null);
  const oscSecondaryRef = useRef<OscillatorNode | null>(null);
  const sirenIntervalRef = useRef<number | null>(null);

  // Compound Opportunity Cost Calculation (8% annualized return over 1, 5, 10 years)
  const opp1Yr = totalMoneyLost * Math.pow(1.08, 1);
  const opp5Yr = totalMoneyLost * Math.pow(1.08, 5);
  const opp10Yr = totalMoneyLost * Math.pow(1.08, 10);

  const stopSirenAndSpeech = useCallback(() => {
    if (sirenIntervalRef.current) {
      window.clearInterval(sirenIntervalRef.current);
      sirenIntervalRef.current = null;
    }
    try {
      oscPrimaryRef.current?.stop();
      oscPrimaryRef.current?.disconnect();
    } catch {
      // ignore
    }
    try {
      oscSecondaryRef.current?.stop();
      oscSecondaryRef.current?.disconnect();
    } catch {
      // ignore
    }
    if (audioCtxRef.current) {
      audioCtxRef.current.close().catch(() => {});
      audioCtxRef.current = null;
    }
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
  }, []);

  const speakIntervention = useCallback(() => {
    if (!('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();
    const sponsorPhrase = sponsor?.fullName
      ? `Your sponsor ${sponsor.fullName} is registered as your accountability guardian.`
      : '';
    const msg = new SpeechSynthesisUtterance(
      `AEGIS ZERO ACTIVE INTERCEPTION. Pattern interrupt engaged. Trigger detected: ${triggerReason}. You have already leaked ${totalMoneyLost.toFixed(
        2
      )} dollars across high-risk gambling rails. ${sponsorPhrase} Remember your primary financial commitment: ${financialGoal}. Complete all three prefrontal cortex cooldown stages to silence this alarm.`
    );
    msg.rate = 0.98;
    msg.pitch = 0.88;
    msg.volume = 1.0;
    window.speechSynthesis.speak(msg);
  }, [triggerReason, totalMoneyLost, financialGoal, sponsor]);

  const startSiren = useCallback(() => {
    stopSirenAndSpeech();
    try {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      const ctx = new AudioCtx();
      audioCtxRef.current = ctx;

      const masterGain = ctx.createGain();
      masterGain.gain.value = 0.14;
      masterGain.connect(ctx.destination);

      const osc1 = ctx.createOscillator();
      const osc2 = ctx.createOscillator();
      osc1.type = 'sawtooth';
      osc2.type = 'square';
      osc1.frequency.setValueAtTime(620, ctx.currentTime);
      osc2.frequency.setValueAtTime(660, ctx.currentTime);

      osc1.connect(masterGain);
      osc2.connect(masterGain);
      osc1.start();
      osc2.start();

      oscPrimaryRef.current = osc1;
      oscSecondaryRef.current = osc2;

      let highPhase = false;
      sirenIntervalRef.current = window.setInterval(() => {
        if (!audioCtxRef.current || audioCtxRef.current.state === 'closed') return;
        highPhase = !highPhase;
        const target1 = highPhase ? 880 : 580;
        const target2 = highPhase ? 920 : 620;
        setCurrentFreqHz(target1);
        osc1.frequency.exponentialRampToValueAtTime(target1, audioCtxRef.current.currentTime + 0.35);
        osc2.frequency.exponentialRampToValueAtTime(target2, audioCtxRef.current.currentTime + 0.35);
      }, 450);
    } catch {
      // Browser autoplay policy fallback
    }
    speakIntervention();
  }, [stopSirenAndSpeech, speakIntervention]);

  useEffect(() => {
    if (isOpen) {
      setStage('A');
      setTypedText('');
      setPasteAttemptCount(0);
      setEquations(generateEquations());
      setUserAnswers(['', '', '', '', '']);
      setMathError(null);
      setSecondsRemaining(180);
      setTabSwitchResets(0);
      setEvasiveOffset({ x: 0, y: 0 });
      setEvasionAttempts(0);
      setIsAudioActive(true);
      startSiren();
    } else {
      stopSirenAndSpeech();
    }
    return () => {
      stopSirenAndSpeech();
    };
  }, [isOpen, startSiren, stopSirenAndSpeech]);

  // Stage C visibilitychange listener: switching tabs resets countdown to 180s
  useEffect(() => {
    if (!isOpen || stage !== 'C') return;
    const handleVisibilityChange = () => {
      if (document.hidden) {
        setSecondsRemaining(180);
        setTabSwitchResets((prev) => prev + 1);
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [isOpen, stage]);

  // Stage C 180-second countdown timer (Strict Production Enforcement - No Fast-Forward Bypass)
  useEffect(() => {
    if (!isOpen || stage !== 'C') return;
    if (secondsRemaining <= 0) return;
    const timer = window.setInterval(() => {
      setSecondsRemaining((prev) => Math.max(0, prev - 1));
    }, 1000);
    return () => window.clearInterval(timer);
  }, [isOpen, stage, secondsRemaining]);

  const toggleAudio = () => {
    if (isAudioActive) {
      stopSirenAndSpeech();
      setIsAudioActive(false);
    } else {
      setIsAudioActive(true);
      startSiren();
    }
  };

  const dodgeCursor = () => {
    const randX = Math.floor(Math.random() * 280) - 140;
    const randY = Math.floor(Math.random() * 120) - 60;
    setEvasiveOffset({ x: randX, y: randY });
    setEvasionAttempts((prev) => prev + 1);
  };

  const isStageAComplete =
    typedText.trim().length >= 150 &&
    typedText.trim().toLowerCase() === REQUIRED_COMMITMENT_STATEMENT.toLowerCase();

  const verifyStageB = () => {
    for (let i = 0; i < equations.length; i++) {
      const parsed = parseInt(userAnswers[i], 10);
      if (Number.isNaN(parsed) || parsed !== equations[i].answer) {
        setMathError(`Equation #${i + 1} is incorrect. Engage working memory and recalculate.`);
        return;
      }
    }
    setMathError(null);
    setStage('C');
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-[#090D16]/95 backdrop-blur-md p-4 overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-labelledby="interceptor-heading"
    >
      <div className="w-full max-w-4xl bg-[#0F1624] border-2 border-red-500 rounded-xl p-6 md:p-8 interceptor-strobe">
        {/* Top Alert Banner */}
        <div className="flex flex-wrap items-start justify-between gap-4 pb-6 border-b border-slate-800">
          <div className="space-y-1">
            <div className="flex items-center gap-2.5 text-red-400 text-xs font-mono uppercase tracking-wider">
              <ShieldAlert className="w-4 h-4 shrink-0" />
              <span>Active Behavioral Pattern Interrupt Engaged (Hardcore Production Lock)</span>
              <span aria-hidden="true">•</span>
              <span className="tabular-nums">
                Klaxon {isAudioActive ? `${currentFreqHz} Hz` : 'Paused'}
              </span>
            </div>
            <h2 id="interceptor-heading" className="text-2xl md:text-3xl font-bold text-white tracking-tight">
              High-Risk Gambling Sequence Intercepted
            </h2>
            <p className="text-sm text-slate-300">
              Trigger Source: <span className="font-mono text-amber-300">{triggerReason}</span>
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={speakIntervention}
              className="px-3 py-2 text-xs font-medium text-slate-200 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg transition-colors whitespace-nowrap shrink-0"
            >
              Replay Voice Intervention
            </button>
            <button
              type="button"
              onClick={toggleAudio}
              className={`flex items-center gap-2 px-3 py-2 text-xs font-medium rounded-lg border transition-colors whitespace-nowrap shrink-0 ${
                isAudioActive
                  ? 'bg-red-500/20 text-red-200 border-red-500/50 hover:bg-red-500/30'
                  : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
              }`}
            >
              {isAudioActive ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
              <span>{isAudioActive ? 'Mute Klaxon Temporarily' : 'Resume Klaxon Siren'}</span>
            </button>
          </div>
        </div>

        {/* Financial Reality, Compound Opportunity Cost & Sponsor Strip */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 my-5 p-4 bg-[#090D16] border border-slate-800 rounded-lg">
          <div>
            <div className="text-xs text-slate-400">Cumulative Audited Leakage</div>
            <div className="text-xl font-bold font-mono tabular-nums text-red-400 mt-0.5">
              ${totalMoneyLost.toFixed(2)}
            </div>
            <div className="text-[11px] text-slate-400 font-mono mt-1 flex items-center gap-1">
              <TrendingUp className="w-3 h-3 text-emerald-400" />
              <span>10-Yr Compounded Value (8%): ${opp10Yr.toFixed(2)}</span>
            </div>
          </div>
          <div>
            <div className="text-xs text-slate-400">Protected Financial Objective</div>
            <div className="text-xs font-medium text-emerald-300 mt-1">{financialGoal}</div>
            {sponsor?.fullName && (
              <div className="text-[11px] font-mono text-amber-300 mt-1">
                Sponsor Guardian: {sponsor.fullName} ({sponsor.phone || sponsor.email})
              </div>
            )}
          </div>
          <div>
            <div className="text-xs text-slate-400">Cooldown Stage Progression</div>
            <div className="flex items-center gap-2 mt-1.5 text-xs font-mono">
              <span className={stage === 'A' ? 'text-amber-400 font-semibold' : 'text-emerald-400'}>
                [1. Statement]
              </span>
              <span aria-hidden="true">→</span>
              <span
                className={
                  stage === 'B'
                    ? 'text-amber-400 font-semibold'
                    : stage === 'C'
                    ? 'text-emerald-400'
                    : 'text-slate-500'
                }
              >
                [2. DLPFC Math]
              </span>
              <span aria-hidden="true">→</span>
              <span className={stage === 'C' ? 'text-amber-400 font-semibold' : 'text-slate-500'}>
                [3. 180s Lock]
              </span>
            </div>
            <div className="text-[11px] text-slate-400 font-mono mt-1">
              1Yr: ${opp1Yr.toFixed(0)} • 5Yr: ${opp5Yr.toFixed(0)} • 10Yr: ${opp10Yr.toFixed(0)}
            </div>
          </div>
        </div>

        {/* Stage A: 150-Character Anti-Paste Commitment Statement (No Motor-Assist Bypass) */}
        {stage === 'A' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-semibold text-white">
                Stage A of 3: Mandatory 150+ Character Cognitive Commitment (Paste &amp; Shortcuts Disabled)
              </h3>
              <span className="text-xs font-mono tabular-nums text-slate-400">
                {typedText.length} / {REQUIRED_COMMITMENT_STATEMENT.length} chars
              </span>
            </div>
            <div className="p-4 bg-[#090D16] border border-slate-800 rounded-lg select-none">
              <div className="text-xs text-slate-400 mb-1">
                Type the exact phrase below character by character:
              </div>
              <p className="font-mono text-sm text-amber-200 leading-relaxed">
                {REQUIRED_COMMITMENT_STATEMENT}
              </p>
            </div>
            <div>
              <textarea
                rows={3}
                value={typedText}
                onChange={(e) => setTypedText(e.target.value)}
                onPaste={(e) => {
                  e.preventDefault();
                  setPasteAttemptCount((prev) => prev + 1);
                }}
                placeholder="Begin typing the exact commitment statement here (clipboard paste is blocked)..."
                className="w-full p-3.5 bg-[#090D16] border border-slate-700 rounded-lg text-sm font-mono text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
              />
              {pasteAttemptCount > 0 && (
                <p className="text-xs text-red-400 font-mono mt-1.5">
                  Clipboard paste blocked ({pasteAttemptCount} attempt
                  {pasteAttemptCount > 1 ? 's' : ''}). Manual motor typing is strictly required to interrupt impulsive automaticity.
                </p>
              )}
            </div>
            <div className="flex items-center justify-end pt-2">
              <button
                type="button"
                disabled={!isStageAComplete}
                onClick={() => setStage('B')}
                className={`px-5 py-2.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap shrink-0 ${
                  isStageAComplete
                    ? 'bg-emerald-500 text-slate-950 hover:bg-emerald-400'
                    : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                }`}
              >
                Proceed to Stage B (Prefrontal Cortex Arithmetic)
              </button>
            </div>
          </div>
        )}

        {/* Stage B: 5 Working-Memory Equations (a * b) + c - d */}
        {stage === 'B' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-semibold text-white">
                  Stage B of 3: Working-Memory Prefrontal Cortex Activation
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Solve all 5 equations of the form (a × b) + c − d to shift neural activity away from limbic craving circuits.
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setEquations(generateEquations());
                  setUserAnswers(['', '', '', '', '']);
                  setMathError(null);
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-slate-300 bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors whitespace-nowrap shrink-0"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Regenerate Set</span>
              </button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-5 gap-3">
              {equations.map((eq, idx) => (
                <div key={idx} className="p-3.5 bg-[#090D16] border border-slate-800 rounded-lg space-y-2">
                  <div className="text-xs text-slate-400 font-mono">Equation #{idx + 1}</div>
                  <div className="text-sm font-bold font-mono tabular-nums text-amber-300">
                    ({eq.a} × {eq.b}) + {eq.c} − {eq.d}
                  </div>
                  <input
                    type="number"
                    value={userAnswers[idx]}
                    onChange={(e) => {
                      const next = [...userAnswers];
                      next[idx] = e.target.value;
                      setUserAnswers(next);
                    }}
                    placeholder="= ?"
                    className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-700 rounded text-sm font-mono tabular-nums text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
              ))}
            </div>
            {mathError && (
              <div className="flex items-center gap-2 text-xs text-red-400 font-mono">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>{mathError}</span>
              </div>
            )}
            <div className="flex items-center justify-end pt-2">
              <button
                type="button"
                onClick={verifyStageB}
                className="px-5 py-2.5 text-xs font-semibold bg-emerald-500 text-slate-950 hover:bg-emerald-400 rounded-lg transition-colors whitespace-nowrap shrink-0"
              >
                Verify Equations &amp; Start 180s Cooldown Lock
              </button>
            </div>
          </div>
        )}

        {/* Stage C: 180-Second Mandatory Visibility-Enforced Timer (Strict Production Mode) */}
        {stage === 'C' && (
          <div className="space-y-4">
            <div className="p-6 bg-[#090D16] border border-slate-800 rounded-lg text-center space-y-3">
              <div className="text-xs font-mono text-amber-400 uppercase tracking-wider">
                Stage C of 3 • Mandatory 180-Second Impulse Decay Lock (No Fast-Forward)
              </div>
              <div className="text-4xl md:text-5xl font-bold font-mono tabular-nums text-white">
                {String(Math.floor(secondsRemaining / 60)).padStart(2, '0')}:
                {String(secondsRemaining % 60).padStart(2, '0')}
              </div>
              <p className="text-xs text-slate-400 max-w-xl mx-auto">
                Keep this window focused. Switching browser tabs or minimizing triggers{' '}
                <code className="text-amber-300">document.visibilitychange</code> and immediately resets the countdown to 03:00.
              </p>
              {tabSwitchResets > 0 && (
                <div className="text-xs font-mono text-red-400">
                  Tab focus lost {tabSwitchResets} time{tabSwitchResets > 1 ? 's' : ''} — timer was reset to 180s!
                </div>
              )}
            </div>
            <div className="flex items-center justify-end pt-2">
              <button
                type="button"
                disabled={secondsRemaining > 0}
                onClick={() => {
                  stopSirenAndSpeech();
                  onCompleteCooldown();
                }}
                className={`flex items-center gap-2 px-5 py-2.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap shrink-0 ${
                  secondsRemaining === 0
                    ? 'bg-emerald-500 text-slate-950 hover:bg-emerald-400'
                    : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                }`}
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>
                  {secondsRemaining === 0
                    ? 'Complete Pattern Interrupt & Stand Down Alarm'
                    : `Locked (${secondsRemaining}s remaining)`}
                </span>
              </button>
            </div>
          </div>
        )}

        {/* Evasive "Ignore / Bypass" Friction Trap Footer */}
        <div className="mt-8 pt-4 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-4 relative min-h-[52px]">
          <div className="text-xs text-slate-400 flex items-center gap-2">
            <Lock className="w-3.5 h-3.5 text-slate-500" />
            <span>
              Evasive UI Defense Active
              {evasionAttempts > 0
                ? ` • Dodged ${evasionAttempts} impulsive bypass attempt(s)`
                : ''}
            </span>
          </div>
          <button
            type="button"
            onMouseEnter={dodgeCursor}
            onFocus={dodgeCursor}
            onClick={dodgeCursor}
            style={{
              transform: `translate(${evasiveOffset.x}px, ${evasiveOffset.y}px)`,
              transition: 'transform 110ms cubic-bezier(0.16, 1, 0.3, 1)',
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-mono text-red-400/80 bg-red-950/30 border border-red-900/50 rounded select-none"
          >
            <EyeOff className="w-3.5 h-3.5" />
            <span>Ignore Warning &amp; Bypass Block</span>
          </button>
        </div>
      </div>
    </div>
  );
};
