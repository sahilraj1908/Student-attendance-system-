import * as faceapi from 'face-api.js';

/**
 * Remote model weights (SSD MobileNet + landmarks + FaceNet recognition).
 * Host your own copies under /public/models for offline use.
 */
const MODEL_URI = 'https://justadudewhohacks.github.io/face-api.js/models';

let loadPromise = null;

/** Loads face-api.js nets once; safe to call multiple times. */
export function loadFaceModels() {
  if (!loadPromise) {
    loadPromise = Promise.all([
      faceapi.nets.ssdMobilenetv1.loadFromUri(MODEL_URI),
      faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URI),
      faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URI),
    ]);
  }
  return loadPromise;
}

export { faceapi };
