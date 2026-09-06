// Voice Quota Manager for LYX (Free: 2h/daily cycle starting at 05:00, Plus: Unlimited)

const STORAGE_KEY = 'lyx_voice_quota_state';
const FREE_DAILY_LIMIT_SECONDS = 2 * 60 * 60; // 2 horas = 7200 segundos

export interface VoiceQuotaState {
  cycleDate: string; // Formato YYYY-MM-DD
  usedSeconds: number;
  hasWarned80: boolean;
}

export function getCurrentCycleDate(): string {
  const now = new Date();
  // Se for antes das 05:00 da manhã, o ciclo pertence ao dia anterior
  const cycleTime = new Date(now.getTime());
  if (cycleTime.getHours() < 5) {
    cycleTime.setDate(cycleTime.getDate() - 1);
  }
  return cycleTime.toISOString().split('T')[0];
}

export function loadVoiceQuotaState(): VoiceQuotaState {
  const currentCycle = getCurrentCycleDate();
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed: VoiceQuotaState = JSON.parse(raw);
      if (parsed.cycleDate === currentCycle) {
        return parsed;
      }
    }
  } catch {}

  // Novo ciclo (reseta para o dia atual)
  const newState: VoiceQuotaState = {
    cycleDate: currentCycle,
    usedSeconds: 0,
    hasWarned80: false,
  };
  saveVoiceQuotaState(newState);
  return newState;
}

export function saveVoiceQuotaState(state: VoiceQuotaState): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {}
}

export function addVoiceUsage(seconds: number): {
  usedSeconds: number;
  limitSeconds: number;
  percentage: number;
  shouldWarn80: boolean;
  isExceeded: boolean;
} {
  const state = loadVoiceQuotaState();
  state.usedSeconds += Math.max(0, Math.round(seconds));

  const percentage = Math.min(100, Math.round((state.usedSeconds / FREE_DAILY_LIMIT_SECONDS) * 100));
  let shouldWarn80 = false;

  if (percentage >= 75 && percentage < 100 && !state.hasWarned80) {
    state.hasWarned80 = true;
    shouldWarn80 = true;
  }

  const isExceeded = state.usedSeconds >= FREE_DAILY_LIMIT_SECONDS;
  saveVoiceQuotaState(state);

  return {
    usedSeconds: state.usedSeconds,
    limitSeconds: FREE_DAILY_LIMIT_SECONDS,
    percentage,
    shouldWarn80,
    isExceeded,
  };
}

export function checkVoiceQuotaStatus(userPlan: string): {
  canStartVoice: boolean;
  percentage: number;
  usedSeconds: number;
  limitSeconds: number;
} {
  if (userPlan === 'LYX Plus') {
    return {
      canStartVoice: true,
      percentage: 0,
      usedSeconds: 0,
      limitSeconds: Infinity,
    };
  }

  const state = loadVoiceQuotaState();
  const percentage = Math.min(100, Math.round((state.usedSeconds / FREE_DAILY_LIMIT_SECONDS) * 100));
  const canStartVoice = state.usedSeconds < FREE_DAILY_LIMIT_SECONDS;

  return {
    canStartVoice,
    percentage,
    usedSeconds: state.usedSeconds,
    limitSeconds: FREE_DAILY_LIMIT_SECONDS,
  };
}
