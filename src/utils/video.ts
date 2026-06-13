export function getYoutubeVideoId(url?: string): string | undefined {
  if (!url) return undefined;

  try {
    const parsedUrl = new URL(url);
    return parsedUrl.hostname.includes("youtu.be")
      ? parsedUrl.pathname.slice(1)
      : parsedUrl.searchParams.get("v") ?? undefined;
  } catch {
    return undefined;
  }
}

export function getYoutubeEmbedUrl(url?: string): string | undefined {
  const videoId = getYoutubeVideoId(url);
  return videoId ? `https://www.youtube.com/embed/${videoId}` : undefined;
}

export function getYoutubeThumbnailUrl(url?: string): string | undefined {
  const videoId = getYoutubeVideoId(url);
  return videoId
    ? `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`
    : undefined;
}
