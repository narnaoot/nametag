// imageCrop.js — crop + downscale a picked photo to a small square on-device,
// BEFORE it's uploaded. The tag only ever shows a small circle ("A cropped
// circle, only ever this small"), so there's no reason to send a full-resolution
// image to the server — this keeps the Privacy promise true and minimises what
// briefly lives server-side.
import { savePhotoLocally } from './profileStorage';

const OUT_SIZE = 320;   // px — plenty for a ~112px avatar at 2–3× DPR
const QUALITY = 0.82;
const OUT_TYPE = 'image/jpeg';

// Decode a File/Blob or data-URL string into something drawable, honouring EXIF
// orientation (phones rotate via EXIF, not pixels).
async function decode(source) {
  const blob = typeof source === 'string' ? await (await fetch(source)).blob() : source;
  if (typeof createImageBitmap === 'function') {
    try { return { img: await createImageBitmap(blob, { imageOrientation: 'from-image' }), cleanup() {} }; }
    catch { /* older Safari: no options bag */ }
    try { return { img: await createImageBitmap(blob), cleanup() {} }; }
    catch { /* fall through to <img> */ }
  }
  const url = URL.createObjectURL(blob);
  const img = await new Promise((resolve, reject) => {
    const el = new Image();
    el.onload = () => resolve(el);
    el.onerror = reject;
    el.src = url;
  });
  return { img, cleanup() { URL.revokeObjectURL(url); } };
}

// Returns { dataUrl, file } — a centered-square, downscaled JPEG. `file` is ready
// to upload; `dataUrl` is for the live preview and the on-device copy.
export async function cropToSquare(source, { size = OUT_SIZE, quality = QUALITY, type = OUT_TYPE } = {}) {
  const { img, cleanup } = await decode(source);
  try {
    const w = img.width, h = img.height;
    const s = Math.min(w, h);
    const sx = (w - s) / 2;
    const sy = (h - s) / 2;

    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d');
    ctx.imageSmoothingQuality = 'high';
    ctx.drawImage(img, sx, sy, s, s, 0, 0, size, size);

    const dataUrl = canvas.toDataURL(type, quality);
    const blob = await (await fetch(dataUrl)).blob();
    const file = new File([blob], 'photo.jpg', { type });
    return { dataUrl, file };
  } finally {
    cleanup();
    if (img.close) img.close();   // release the ImageBitmap
  }
}

function readAsDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (ev) => resolve(ev.target.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

// Prepare a just-picked file for the tag: crop it to a square (falling back to
// the raw file if cropping isn't available), save the data URL as the on-device
// copy, and return { dataUrl, file } for the live preview + the upload. Shared
// by ProfilePage and OnboardingPage so the pick flow lives in one place.
export async function preparePickedPhoto(file) {
  try {
    const { dataUrl, file: cropped } = await cropToSquare(file);
    await savePhotoLocally(dataUrl);
    return { dataUrl, file: cropped };
  } catch {
    const dataUrl = await readAsDataUrl(file);
    await savePhotoLocally(dataUrl);
    return { dataUrl, file };
  }
}
