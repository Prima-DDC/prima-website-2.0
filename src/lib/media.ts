const STORAGE_BASE = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/public-media/`;

/**
 * Resolves a media reference to a URL. Accepts bucket-relative paths
 * ("site/hero.webp") or full URLs pasted from the admin media library.
 */
export function mediaUrl(path: string): string {
  if (path.startsWith("http://") || path.startsWith("https://")) return path;
  return `${STORAGE_BASE}${path.replace(/^\/+/, "")}`;
}
