// drizzle.config.ts
// drizzle-kit CLI(스키마 → 마이그레이션 SQL 생성/적용)의 설정 파일.
// Next.js의 dev/build와는 무관하고, 오직 `npm run db:generate`/`db:migrate` 같은 명령에서만 읽힌다.

import { config } from "dotenv";
import { defineConfig } from "drizzle-kit";

// drizzle-kit은 standalone CLI라 Next.js의 환경변수 자동 로드를 못 쓴다.
// dotenv로 .env.local을 직접 읽어 DATABASE_URL을 가져온다.
config({ path: ".env.local" });

if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL이 .env.local에 없습니다. Neon connection string을 추가해주세요."
  );
}

export default defineConfig({
  // 스키마 파일 위치 — 여기에 정의된 pgTable들을 보고 마이그레이션 SQL을 만든다.
  schema: "./src/infrastructure/db/schema.ts",

  // 생성된 마이그레이션 SQL 파일이 저장될 폴더 (Git에 커밋해서 팀과 공유 + 배포 환경에서도 실행).
  out: "./drizzle",

  // PostgreSQL 방언 (Neon은 PostgreSQL과 100% 호환).
  dialect: "postgresql",

  // DB 연결 정보 — 마이그레이션 적용/스키마 검사용.
  dbCredentials: {
    url: process.env.DATABASE_URL,
  },

  // 진행 과정 자세히 출력 (마이그레이션 SQL 내용 미리보기 등).
  verbose: true,
  // 위험한 변경(데이터 손실 가능)을 감지하면 확인 메시지 띄움.
  strict: true,
});
