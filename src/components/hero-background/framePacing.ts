const SAMPLE_COUNT = 8;
const TARGET_FRAME_RATE = 72;
const MAX_SAMPLE_INTERVAL = 50;

export interface FramePacer {
  shouldDraw: (timestamp: number) => boolean;
  reset: () => void;
}

function median(values: number[]) {
  const sorted = [...values].sort((left, right) => left - right);
  const middle = Math.floor(sorted.length / 2);
  return sorted.length % 2 === 0
    ? (sorted[middle - 1] + sorted[middle]) / 2
    : sorted[middle];
}

export function createFramePacer(): FramePacer {
  let previousTimestamp: number | null = null;
  let frameIndex = 0;
  let frameStride = 1;
  let samples: number[] = [];

  return {
    shouldDraw(timestamp) {
      if (previousTimestamp !== null && samples.length < SAMPLE_COUNT) {
        const interval = timestamp - previousTimestamp;
        if (interval > 0 && interval < MAX_SAMPLE_INTERVAL) {
          samples.push(interval);
          if (samples.length === SAMPLE_COUNT) {
            const refreshRate = 1000 / median(samples);
            frameStride = Math.max(
              1,
              Math.round(refreshRate / TARGET_FRAME_RATE),
            );
          }
        }
      }
      previousTimestamp = timestamp;
      const shouldDraw = frameIndex % frameStride === 0;
      frameIndex += 1;
      return shouldDraw;
    },

    reset() {
      previousTimestamp = null;
      frameIndex = 0;
      frameStride = 1;
      samples = [];
    },
  };
}
