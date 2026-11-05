/**
 * Utility to extract YouTube video ID from various URL formats:
 * - https://www.youtube.com/watch?v=dQw4w9WgXcQ
 * - https://youtu.be/dQw4w9WgXcQ
 * - https://www.youtube.com/embed/dQw4w9WgXcQ
 * - https://www.youtube.com/shorts/dQw4w9WgXcQ
 */
export function extractYouTubeId(url?: string): string | null {
  if (!url) return null;
  const clean = url.trim();
  const match = clean.match(
    /(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=|shorts\/))([\w-]{11})/i
  );
  if (match && match[1]) {
    return match[1];
  }
  // If the user pasted just the 11-char ID
  if (/^[\w-]{11}$/.test(clean)) {
    return clean;
  }
  return null;
}
