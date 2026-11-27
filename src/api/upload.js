const uploadUrl = () => import.meta.env.VITE_IMAGE_UPLOAD_URL || 'https://api.kudumart.com/api/upload/file';
const videoUploadUrl = () =>
  import.meta.env.VITE_VIDEO_UPLOAD_URL ||
  uploadUrl().replace(/\/file\/?$/, '/video');

const MAX_VIDEO_BYTES = 50 * 1024 * 1024;

export async function uploadVideo(file) {
  if (!file) throw new Error('Choose a video file first.');
  if (file.size > MAX_VIDEO_BYTES) {
    throw new Error('Video is too large. Maximum size is 50MB.');
  }
  const form = new FormData();
  form.append('video', file);
  let response;
  try { response = await fetch(videoUploadUrl(), { method: 'POST', body: form }); }
  catch { throw new Error('Could not reach the video upload service. Please try again in a moment.'); }
  const payload = await response.json().catch(() => null);
  if (!response.ok) throw new Error(payload?.message || `Video upload failed (${response.status}). Please try again.`);
  const url = typeof payload?.data === 'string' ? payload.data : payload?.data?.url || payload?.url;
  if (!url) throw new Error('The video upload did not return a URL.');
  return url;
}

export async function uploadImage(file) {
  const form = new FormData();
  form.append('image', file);
  let response;
  try { response = await fetch(uploadUrl(), { method: 'POST', body: form }); }
  catch { throw new Error('Could not reach the photo upload service. Please try again in a moment.'); }
  const payload = await response.json().catch(() => null);
  if (!response.ok) throw new Error(payload?.message || `Photo upload failed (${response.status}). Please try again.`);
  const image = typeof payload?.data === 'string' ? payload.data : payload?.data?.url || payload?.url || payload?.secure_url || payload?.path;
  if (!image) throw new Error('The image upload did not return a URL.');
  return image;
}

export async function uploadFile(file) {
  const form = new FormData();
  form.append('image', file);
  let response;
  try { response = await fetch(uploadUrl(), { method: 'POST', body: form }); }
  catch { throw new Error('Could not reach the file upload service. Please try again in a moment.'); }
  const payload = await response.json().catch(() => null);
  if (!response.ok) throw new Error(payload?.message || `File upload failed (${response.status}).`);
  const url = typeof payload?.data === 'string' ? payload.data : payload?.data?.url || payload?.url || payload?.secure_url || payload?.path;
  if (!url) throw new Error('The file upload did not return a URL.');
  return url;
}
