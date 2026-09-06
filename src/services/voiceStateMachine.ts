// Unified Voice State Machine for LYX
// States: IDLE | LISTENING | PROCESSING | SPEAKING | INTERRUPTED | ERROR

export type LyxVoiceState = 'IDLE' | 'LISTENING' | 'PROCESSING' | 'SPEAKING' | 'INTERRUPTED' | 'ERROR';

export type StateChangeCallback = (newState: LyxVoiceState, oldState: LyxVoiceState) => void;

class VoiceStateMachine {
  private static instance: VoiceStateMachine | null = null;
  private state: LyxVoiceState = 'IDLE';
  private listeners: Set<StateChangeCallback> = new Set();
  private watchdogTimer: any = null;

  private constructor() {}

  public static getInstance(): VoiceStateMachine {
    if (!VoiceStateMachine.instance) {
      VoiceStateMachine.instance = new VoiceStateMachine();
    }
    return VoiceStateMachine.instance;
  }

  public getState(): LyxVoiceState {
    return this.state;
  }

  public subscribe(cb: StateChangeCallback): () => void {
    this.listeners.add(cb);
    return () => {
      this.listeners.delete(cb);
    };
  }

  public transition(next: LyxVoiceState): boolean {
    const prev = this.state;
    if (prev === next) return true;

    // Clear watchdog when leaving PROCESSING or SPEAKING
    if (this.watchdogTimer) {
      clearTimeout(this.watchdogTimer);
      this.watchdogTimer = null;
    }

    this.state = next;

    // Safety watchdog for PROCESSING state (max 10 seconds to prevent stuck UI)
    if (next === 'PROCESSING') {
      this.watchdogTimer = setTimeout(() => {
        if (this.state === 'PROCESSING') {
          console.warn('[StateMachine] Watchdog triggered on PROCESSING. Recovering to IDLE.');
          this.transition('IDLE');
        }
      }, 10000);
    }

    // Safety watchdog for ERROR state (auto recover to IDLE after 2s)
    if (next === 'ERROR') {
      this.watchdogTimer = setTimeout(() => {
        if (this.state === 'ERROR') {
          this.transition('IDLE');
        }
      }, 2000);
    }
    
    // Auto transition from INTERRUPTED to LISTENING
    if (next === 'INTERRUPTED') {
      this.watchdogTimer = setTimeout(() => {
        if (this.state === 'INTERRUPTED') {
          this.transition('LISTENING');
        }
      }, 300); // Brief delay before re-listening
    }

    // Notify all listeners
    for (const listener of this.listeners) {
      try {
        listener(next, prev);
      } catch (err) {
        console.error('[StateMachine] Listener error:', err);
      }
    }

    return true;
  }

  public reset(): void {
    if (this.watchdogTimer) {
      clearTimeout(this.watchdogTimer);
      this.watchdogTimer = null;
    }
    this.transition('IDLE');
  }
}

export const lyxStateMachine = VoiceStateMachine.getInstance();
