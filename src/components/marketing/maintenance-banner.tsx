import Link from "next/link";
import { OPENCHAT } from "@/config/community";

// DB 장애 등 긴급 공지용 배너. 절대 DB/인증을 호출하지 않는 순수 정적 컴포넌트로
// 유지할 것 — 지금처럼 DB 자체가 막혀있는 상황에서도 이 배너는 반드시 떠야 한다.
export function MaintenanceBanner() {
  return (
    <div className="border-b border-warning/30 bg-warning/10 px-5 py-2.5 text-center text-sm sm:px-8">
      <p className="ko-copy text-warning">
        <span className="font-bold">낱말지기 서버 점검 중입니다.</span> 검색이 일시적으로
        원활하지 않을 수 있어요. 자세한 문의는{" "}
        <Link
          href={OPENCHAT.url}
          target="_blank"
          rel="noreferrer"
          className="font-bold underline underline-offset-2 hover:opacity-80"
        >
          카카오톡 오픈톡방
        </Link>
        으로 남겨주세요.
      </p>
    </div>
  );
}
