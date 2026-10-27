import Link from "next/link";

interface ConnectionGuideVideoProps {
  compact?: boolean;
  showHelpLink?: boolean;
}

export function ConnectionGuideVideo({
  compact = false,
  showHelpLink = false,
}: ConnectionGuideVideoProps) {
  return (
    <figure>
      <div className="overflow-hidden rounded-xl border border-border bg-ink">
        <video
          className="aspect-video w-full bg-ink object-contain"
          controls
          playsInline
          preload="none"
          // ?v=2: 2026-10-27 포스터를 'STEP 3' 장면 → 'START HERE 회원가입' 장면으로 교체 (캐시 무효화)
          poster="/media/wordkeeper-connection-guide-poster.webp?v=2"
          aria-label="낱말지기 가입, 연결 코드 발급, 프로그램 연결과 검색 방법 안내 영상"
        >
          <source src="/media/wordkeeper-connection-guide.mp4" type="video/mp4" />
          동영상 재생을 지원하지 않는 브라우저입니다.
        </video>
      </div>
      <figcaption
        className={`ko-copy text-muted ${compact ? "mt-3 text-xs leading-5" : "mt-4 text-sm leading-6"}`}
      >
        가입 승인 후 대시보드에서 연결 코드를 발급하고, 낱말지기 설정에 입력한 뒤
        문서에서 검색하는 과정까지 순서대로 보여드립니다.
        {showHelpLink && (
          <>
            {" "}
            <Link
              href="/help"
              className="font-bold text-accent underline decoration-accent/35 underline-offset-4 hover:decoration-accent"
            >
              글로 된 사용 가이드 보기
            </Link>
          </>
        )}
      </figcaption>
    </figure>
  );
}
