"use client";

import { useCallback, useEffect, useRef, useState } from "react";

// Save as: src/hook/useAlertSound.js
//
// Plays a three-tone "ding-ding-dong" with the browser's Web Audio API, so no sound file is needed.
// Browsers do not allow sound until the person has tapped something on the page, so the sound
// is OFF until enable() is called from a button click.
//
//   const sound = useAlertSound();
//   <button onClick={sound.enable}>Turn on sound</button>
//   sound.beep();   // plays only after enable()

function tone(ctx, frequency, start, duration, volume = 0.4) {
  const oscillator = ctx.createOscillator();
  const gain = ctx.createGain();

  oscillator.type = "sine";
  oscillator.frequency.value = frequency;

  // Quick fade in and out so the tone does not click
  gain.gain.setValueAtTime(0.0001, start);
  gain.gain.exponentialRampToValueAtTime(volume, start + 0.02);
  gain.gain.exponentialRampToValueAtTime(0.0001, start + duration);

  oscillator.connect(gain);
  gain.connect(ctx.destination);
  oscillator.start(start);
  oscillator.stop(start + duration + 0.05);
}

export default function useAlertSound() {
  const ctxRef = useRef(null);
  const enabledRef = useRef(false);
  const [enabled, setEnabled] = useState(false);
  const [supported, setSupported] = useState(true);

  useEffect(() => {
    setSupported(Boolean(window.AudioContext || window.webkitAudioContext));
    return () => {
      ctxRef.current?.close?.();
    };
  }, []);

  const beep = useCallback(() => {
    const ctx = ctxRef.current;
    if (!ctx || !enabledRef.current) return;
    if (ctx.state === "suspended") ctx.resume();

    const t = ctx.currentTime;
    tone(ctx, 880, t, 0.18);
    tone(ctx, 880, t + 0.26, 0.18);
    tone(ctx, 1175, t + 0.52, 0.4);
  }, []);

  // Must be called from a click or tap
  const enable = useCallback(async () => {
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtx) return false;

    if (!ctxRef.current) ctxRef.current = new AudioCtx();
    await ctxRef.current.resume();

    enabledRef.current = true;
    setEnabled(true);
    beep(); // lets the person hear that it works
    return true;
  }, [beep]);

  const disable = useCallback(() => {
    enabledRef.current = false;
    setEnabled(false);
  }, []);

  return { enabled, supported, enable, disable, beep };
}
