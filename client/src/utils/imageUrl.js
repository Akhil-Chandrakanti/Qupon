// The backend serves uploaded coupon images at <origin>/uploads/<file>,
// while the API itself lives at <origin>/api. This strips the /api
// suffix so we can build a working <img src> for uploaded files.

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
export const API_ORIGIN = API_BASE.replace(/\/api\/?$/, '');

export function getUploadedImageUrl(path) {
  if (!path) return null;
  if (/^https?:\/\//i.test(path)) return path;
  return `${API_ORIGIN}${path}`;
}
