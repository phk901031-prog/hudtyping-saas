"use client";

import { useRef } from "react";

const CHAPTERS = [
  { label: "여러 파일 열기", time: 29 },
  { label: "같은 순간 맞추기", time: 43 },
  { label: "화자 기준점", time: 61 },
  { label: "별 시간값 입력", time: 91 },
  { label: "별표에서 바로 듣기", time: 103 },
  { label: "순서대로 검수", time: 115 },
] as const;

export function SogPlayerOverviewVideo() {
  const videoRef = useRef<HTMLVideoElement>(null);

  function playChapter(time: number) {
    const video = videoRef.current;
    if (!video) return;
    video.currentTime = time;
    void video.play();
  }

  return (
    <div>
      <div className="overflow-hidden rounded-2xl border border-white/10 bg-black">
        <video
          ref={videoRef}
          className="aspect-video w-full bg-black object-contain"
          controls
          playsInline
          preload="metadata"
          poster="/media/sog-player-overview-poster.png"
          aria-label="속플레이어 제품 설명 영상"
        >
          <source src="/media/sog-player-overview.mp4" type="video/mp4" />
          브라우저에서 영상을 재생할 수 없습니다.
        </video>
      </div>
      <div className="mt-4 flex flex-wrap gap-2" aria-label="영상 장면 바로가기">
        {CHAPTERS.map((chapter) => (
          <button
            key={chapter.label}
            type="button"
            onClick={() => playChapter(chapter.time)}
            className="rounded-full border border-white/15 px-3 py-2 text-xs font-bold text-white/65 transition hover:border-[var(--sog-accent)] hover:text-[var(--sog-accent)]"
          >
            {chapter.label}
          </button>
        ))}
      </div>
    </div>
  );
}
