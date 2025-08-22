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
    ctx.resume();
  }
}