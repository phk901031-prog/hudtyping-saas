// src/app/global-error.tsx
// 루트 레이아웃 자체에서 에러 발생 시 표시. 매우 드문 케이스 (Next.js 자체 에러 등).
// global-error는 자체적으로 <html>·<body>를 렌더해야 함 (root layout이 동작 안 하므로).

"use client";

export default function GlobalError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="ko">
      <body
        style={{
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: "2rem",
          fontFamily: "system-ui, sans-serif",
          background: "#faf9f5",
          color: "#1f1e1d",
          textAlign: "center",
          gap: "1rem",
        }}
      >
        <h1 style={{ fontSize: "2rem", fontWeight: 700 }}>
          서비스에 문제가 생겼어요
        </h1>
        <p style={{ color: "#6f6e6a", maxWidth: "32rem" }}>
          잠시 후 다시 시도해주세요. 같은 문제가 반복되면 알려주세요.
        </p>
        <button
          type="button"
          onClick={reset}
          style={{
            padding: "0.75rem 1.5rem",
            borderRadius: "9999px",
            background: "#1f1e1d",
            color: "#faf9f5",
            border: "none",
            cursor: "pointer",
            fontSize: "0.875rem",
          }}
        >
          다시 시도
        </button>
      </body>
    </html>
  );
}
