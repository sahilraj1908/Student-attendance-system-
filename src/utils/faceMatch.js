import * as faceapi from 'face-api.js';

/**
 * Compare a live descriptor to registered students.
 * Uses Euclidean distance; lower is more similar (typical match threshold ~0.6).
 */
const MATCH_THRESHOLD = 0.55;

export function findBestMatch(liveDescriptor, students) {
  if (!liveDescriptor || !students?.length) return null;

  let best = null;
  let bestDistance = Infinity;

  for (const s of students) {
    const ref = s.faceDescriptor;
    if (!ref || !ref.length) continue;
    const refTyped = new Float32Array(ref);
    const dist = faceapi.euclideanDistance(liveDescriptor, refTyped);
    if (dist < bestDistance) {
      bestDistance = dist;
      best = { student: s, distance: dist };
    }
  }

  if (!best || bestDistance > MATCH_THRESHOLD) return null;
  return { student: best.student, distance: bestDistance };
}
