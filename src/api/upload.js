const uploadUrl = () => import.meta.env.VITE_IMAGE_UPLOAD_URL || 'https://api.kudumart.com/api/upload/file';

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
