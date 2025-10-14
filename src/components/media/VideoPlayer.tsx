/**
 * VideoPlayer.tsx
 * Purpose: Reusable, responsive video player supporting embed (YouTube/Vimeo) and MP4 sources.
 * - Uses a 16:9 container for consistent layout.
 * - Provides accessible title and sensible defaults.
 */

import React from 'react';

/**
 * Props for the VideoPlayer component.
 */
export interface VideoPlayerProps {
  /** Video source URL. For embed: full embed URL; for mp4: direct mp4 link */
  src: string;
  /** Source kind: 'embed' for iframe providers, 'mp4' for HTML5 video */
  kind?: 'embed' | 'mp4';
  /** Accessible title for screen readers and iframe title */
  title?: string;
  /** Optional poster image for mp4 videos */
  poster?: string;
  /** CSS classes for the outer container */
  className?: string;
}

/**
 * VideoPlayer
 * - Renders a responsive iframe for embeddable providers (YouTube/Vimeo)
 * - Renders a HTML5 video tag for MP4 sources
 */
export function VideoPlayer({
  src,
  kind = 'embed',
  title = 'Tutorial video',
  poster,
  className = '',
}: VideoPlayerProps) {
  if (!src) return null;

  if (kind === 'mp4') {
    return (
      <div className={`rounded-lg overflow-hidden border border-slate-700 bg-black ${className}`}>
        <video
          controls
          className="w-full h-auto"
          poster={poster}
          preload="metadata"
        >
          <source src={src} type="video/mp4" />
          Your browser does not support HTML5 video.
        </video>
      </div>
    );
  }

  // Embed (YouTube/Vimeo) responsive container (16:9)
  return (
    <div className={`rounded-lg overflow-hidden border border-slate-700 bg-black ${className}`}>
      <div className="relative w-full" style={{ paddingTop: '56.25%' }}>
        <iframe
          src={src}
          title={title}
          className="absolute inset-0 w-full h-full"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
          referrerPolicy="no-referrer-when-downgrade"
        />
      </div>
    </div>
  );
}

export default VideoPlayer;
