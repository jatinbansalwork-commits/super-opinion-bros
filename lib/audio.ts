import {
  AUDIO_SETTINGS_KEY,
  BGM_DUCK_VOLUME,
  BGM_VOLUME,
  SFX_VOLUME,
} from "@/lib/constants";

export type SfxName =
  | "start"
  | "select"
  | "reveal"
  | "next"
  | "win"
  | "lose";

export interface AudioSettings {
  music: boolean;
  sfx: boolean;
}

const DEFAULT_SETTINGS: AudioSettings = { music: true, sfx: true };

class AudioManager {
  private unlocked = false;
  private settings: AudioSettings = { ...DEFAULT_SETTINGS };
  private bgm: HTMLAudioElement | null = null;
  private sfxCache = new Map<SfxName, HTMLAudioElement>();
  private ducking = false;
  private toastListeners = new Set<(message: string) => void>();
  private unlockListeners = new Set<() => void>();

  init(): void {
    if (typeof window === "undefined") return;
    this.loadSettings();
    this.preload();
  }

  isUnlocked(): boolean {
    return this.unlocked;
  }

  onUnlock(listener: () => void): () => void {
    this.unlockListeners.add(listener);
    return () => this.unlockListeners.delete(listener);
  }

  subscribeToast(listener: (message: string) => void): () => void {
    this.toastListeners.add(listener);
    return () => this.toastListeners.delete(listener);
  }

  private emitToast(message: string): void {
    this.toastListeners.forEach((l) => l(message));
  }

  private loadSettings(): void {
    try {
      const raw = localStorage.getItem(AUDIO_SETTINGS_KEY);
      if (raw) {
        this.settings = { ...DEFAULT_SETTINGS, ...JSON.parse(raw) };
      }
    } catch {
      this.settings = { ...DEFAULT_SETTINGS };
    }
  }

  private persistSettings(): void {
    try {
      localStorage.setItem(AUDIO_SETTINGS_KEY, JSON.stringify(this.settings));
    } catch {
      /* ignore */
    }
  }

  private preload(): void {
    const sfxNames: SfxName[] = [
      "start",
      "select",
      "reveal",
      "next",
      "win",
      "lose",
    ];
    for (const name of sfxNames) {
      const el = new Audio(`/audio/${name}.mp3`);
      el.preload = "auto";
      el.volume = SFX_VOLUME;
      this.sfxCache.set(name, el);
    }
    this.bgm = new Audio("/audio/bgm.mp3");
    this.bgm.loop = true;
    this.bgm.preload = "auto";
    this.bgm.volume = BGM_VOLUME;
  }

  /** Must run from a user gesture — never auto-called */
  unlock(): void {
    if (this.unlocked || typeof window === "undefined") return;
    this.unlocked = true;

    const prime = (el: HTMLAudioElement) => {
      el.play()
        .then(() => {
          el.pause();
          el.currentTime = 0;
        })
        .catch(() => undefined);
    };

    if (this.bgm) prime(this.bgm);
    for (const sfx of this.sfxCache.values()) prime(sfx);

    this.unlockListeners.forEach((l) => l());
  }

  getSettings(): AudioSettings {
    return { ...this.settings };
  }

  isMusicOn(): boolean {
    return this.settings.music;
  }

  toggle(): AudioSettings {
    if (!this.unlocked) this.unlock();
    this.settings.music = !this.settings.music;
    this.persistSettings();
    if (this.settings.music) {
      this.playBgm();
      this.emitToast("MUSIC ON");
    } else {
      this.stopBgm();
      this.emitToast("MUSIC OFF");
    }
    return this.getSettings();
  }

  playSfx(name: SfxName): void {
    if (!this.unlocked || !this.settings.sfx || typeof window === "undefined") {
      return;
    }
    const base = this.sfxCache.get(name);
    if (!base) return;
    const clip = base.cloneNode(true) as HTMLAudioElement;
    clip.volume = SFX_VOLUME;
    clip.play().catch(() => undefined);
  }

  playBgm(): void {
    if (
      !this.unlocked ||
      !this.settings.music ||
      !this.bgm ||
      typeof window === "undefined"
    ) {
      return;
    }
    this.bgm.volume = this.ducking ? BGM_DUCK_VOLUME : BGM_VOLUME;
    if (this.bgm.paused) {
      this.bgm.play().catch(() => undefined);
    }
  }

  stopBgm(): void {
    if (!this.bgm) return;
    this.bgm.pause();
    this.bgm.currentTime = 0;
  }

  duckBgm(active: boolean): void {
    this.ducking = active;
    if (!this.unlocked || !this.bgm || !this.settings.music) return;
    this.bgm.volume = active ? BGM_DUCK_VOLUME : BGM_VOLUME;
  }

  stop(): void {
    this.stopBgm();
    this.ducking = false;
  }
}

export const audio = new AudioManager();
