import { useCallback, useEffect, useRef, useState } from "react";
import { CloudRain, Pause, Play, RotateCcw, VolumeX, Waves } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const SESSION_SECONDS = 25 * 60;

type Ambient = "off" | "rain" | "waves";

function formatTime(total: number) {
  const minutes = Math.floor(total / 60);
  const seconds = total % 60;
  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}

export function PomodoroTimer() {
  const [remaining, setRemaining] = useState(SESSION_SECONDS);
  const [running, setRunning] = useState(false);
  const [ambient, setAmbient] = useState<Ambient>("off");

  const audioRef = useRef<{ ctx: AudioContext; source: AudioBufferSourceNode } | null>(null);

  useEffect(() => {
    if (!running) return;
    const id = setInterval(() => {
      setRemaining((prev) => {
        if (prev <= 1) {
          setRunning(false);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(id);
  }, [running]);

  const stopAmbient = useCallback(() => {
    const current = audioRef.current;
    if (!current) return;
    try {
      current.source.stop();
      void current.ctx.close();
    } catch {
      // already closed
    }
    audioRef.current = null;
  }, []);

  useEffect(() => stopAmbient, [stopAmbient]);

  const startAmbient = useCallback(
    (kind: Exclude<Ambient, "off">) => {
      stopAmbient();
      const ctx = new AudioContext();
      const bufferSize = ctx.sampleRate * 4;
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      let last = 0;
      for (let i = 0; i < bufferSize; i += 1) {
        const white = Math.random() * 2 - 1;
        last = (last + 0.02 * white) / 1.02;
        data[i] = kind === "waves" ? last * 3.2 : white * 0.35 + last * 1.6;
      }

      const source = ctx.createBufferSource();
      source.buffer = buffer;
      source.loop = true;

      const filter = ctx.createBiquadFilter();
      filter.type = "lowpass";
      filter.frequency.value = kind === "waves" ? 520 : 1500;

      const gain = ctx.createGain();
      gain.gain.value = 0.18;

      source.connect(filter).connect(gain).connect(ctx.destination);
      source.start();
      audioRef.current = { ctx, source };
    },
    [stopAmbient],
  );

  function toggleAmbient(kind: Exclude<Ambient, "off">) {
    if (ambient === kind) {
      setAmbient("off");
      stopAmbient();
      return;
    }
    setAmbient(kind);
    startAmbient(kind);
  }

  const progress = 1 - remaining / SESSION_SECONDS;

  return (
    <div className="glass rounded-3xl p-5 sm:p-6">
      <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-4 sm:flex sm:flex-wrap sm:justify-between">
        <div className="min-w-0">
          <p className="text-xs font-semibold tracking-[0.18em] text-muted-foreground uppercase">
            Focus session
          </p>
          <p className="font-display text-4xl font-extrabold tabular-nums sm:text-5xl">
            {formatTime(remaining)}
          </p>
        </div>

        <div className="flex shrink-0 flex-wrap items-center gap-2">
          <Button
            onClick={() => setRunning((prev) => !prev)}
            disabled={remaining === 0}
            className="h-11 rounded-xl bg-primary px-5 font-semibold text-primary-foreground hover:bg-primary-glow"
          >
            {running ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
            {running ? "Pause" : remaining === SESSION_SECONDS ? "Start" : "Resume"}
          </Button>
          <Button
            variant="outline"
            onClick={() => {
              setRunning(false);
              setRemaining(SESSION_SECONDS);
            }}
            className="h-11 rounded-xl border-border-bright bg-surface-raised hover:bg-accent"
          >
            <RotateCcw className="h-4 w-4" />
            Reset
          </Button>
        </div>
      </div>

      <div className="mt-5 h-2 overflow-hidden rounded-full bg-secondary">
        <div
          className="h-full rounded-full bg-primary transition-[width] duration-500"
          style={{ width: `${Math.min(100, progress * 100)}%` }}
        />
      </div>

      <div className="mt-5 flex flex-wrap items-center gap-2">
        <span className="mr-1 text-xs font-semibold text-muted-foreground">Ambient sound</span>
        <AmbientButton
          active={ambient === "rain"}
          onClick={() => toggleAmbient("rain")}
          label="Rain"
        >
          <CloudRain className="h-4 w-4" />
        </AmbientButton>
        <AmbientButton
          active={ambient === "waves"}
          onClick={() => toggleAmbient("waves")}
          label="Deep waves"
        >
          <Waves className="h-4 w-4" />
        </AmbientButton>
        <AmbientButton
          active={ambient === "off"}
          onClick={() => {
            setAmbient("off");
            stopAmbient();
          }}
          label="Mute"
        >
          <VolumeX className="h-4 w-4" />
        </AmbientButton>
      </div>

      {remaining === 0 ? (
        <p className="mt-4 text-sm font-semibold text-success">
          Session complete — take a 5 minute break. 🎉
        </p>
      ) : null}
    </div>
  );
}

function AmbientButton({
  active,
  onClick,
  label,
  children,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        "inline-flex items-center gap-2 rounded-xl border px-3 py-2 text-xs font-semibold transition-all",
        active
          ? "border-transparent bg-primary text-primary-foreground shadow-[var(--shadow-glow)]"
          : "border-border bg-surface-raised text-muted-foreground hover:border-border-bright hover:text-foreground",
      )}
    >
      {children}
      {label}
    </button>
  );
}
