let audioContext;

export function initAudio() {
  if (!audioContext) {
    audioContext = new (window.AudioContext || window.webkitAudioContext)();
  }
  return audioContext;
}

export function unlockAudio() {
  const ctx = initAudio();
  if (ctx.state === "suspended") {
    ctx.resume().catch((err) => {
      console.warn("AudioContext resume failed:", err);
    });
  }
  return ctx;
}

// Always call this before playing any sound
export function getAudioContext() {
  const ctx = initAudio();
  if (ctx.state === "suspended") {
    ctx.resume().catch((err) => {
      console.warn("AudioContext resume failed:", err);
    });
  }
  return ctx;
}