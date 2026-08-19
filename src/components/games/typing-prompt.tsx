"use client";

// 목표 지문 대비 입력 진행 상황을 글자 단위로 하이라이트. props만 받는 순수 표시 컴포넌트.
export function TypingPrompt({ target, typed }: { target: string; typed: string }) {
  const targetChars = Array.from(target);
  const typedChars = Array.from(typed);

  return (
    <p className="ko-copy select-none whitespace-pre-wrap break-keep rounded-xl border border-border bg-card px-5 py-6 text-lg leading-9 sm:text-xl">
      {targetChars.map((char, index) => {
        const typedChar = typedChars[index];
        const isCursor = index === typedChars.length;
        let toneClass = "text-muted";
        if (typedChar !== undefined) {
          toneClass = typedChar === char ? "text-foreground" : "bg-danger/15 text-danger";
        }
        return (
          <span
            key={index}
            className={`${toneClass} ${isCursor ? "border-l-2 border-accent" : ""}`}
          >
            {char}
          </span>
        );
      })}
    </p>
  );
}
