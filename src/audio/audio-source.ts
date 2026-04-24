export class AudioSource {
    private variants: HTMLAudioElement[] = [];
    private volume = 1.0;
    private enabled = true;

    public constructor(
        sources: string[],
        options?: {
            volume?: number;
            preload?: boolean;
        }
    ) {
        this.volume = options?.volume ?? 1.0;

        for (const src of sources) {
            const audio = new Audio(src);
            audio.volume = this.volume;
            audio.preload = options?.preload ? "auto" : "none";
            this.variants.push(audio);
        }
    }

    public setEnabled(state: boolean) {
        this.enabled = state;
    }

    public setVolume(volume: number) {
        this.volume = volume;
        this.variants.forEach(a => (a.volume = volume));
    }

    public play(): void {
        if (!this.enabled || this.variants.length === 0) return;
        this.playVariant(0);
    }

    public playVariant(index: number): void {
        if (!this.enabled) return;
        if (index < 0 || index >= this.variants.length) return;

        const audio = this.variants[index];
        audio.currentTime = 0;
        audio.play();
    }

    public playRandom(): void {
        if (!this.enabled || this.variants.length === 0) return;

        const index = Math.floor(Math.random() * this.variants.length);
        this.playVariant(index);
    }
}