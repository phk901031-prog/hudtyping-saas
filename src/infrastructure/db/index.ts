// src/db/index.ts
// 앱 전역에서 사용할 Drizzle DB 클라이언트.
// `import { db } from "@/db"` 한 줄로 어디서든 쿼리할 수 있게 만든다.
//
// Neon은 두 가지 드라이버를 제공한다:
//   - @neondatabase/serverless의 `neon()` — HTTP fetch 기반, 콜드 스타트 빠름. **서버리스/Edge에 최적.**
//   - `Pool` — 전통적 TCP 연결, 트랜잭션·LISTEN/NOTIFY 지원. 장기 실행 서버용.
// Vercel 배포 + Next.js API 라우트 환경에선 HTTP 방식이 표준이라 그걸로 간다.

import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "./schema";

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL이 환경변수에 없습니다. .env.local을 확인해주세요.");
}

// HTTP 클라이언트 생성 — 실제 SQL 실행을 담당한다.
const sql = neon(process.env.DATABASE_URL);

// Drizzle 클라이언트 — 타입 안전한 쿼리 빌더 + schema 정보 주입.
// `{ schema }` 덕분에 db.query.users.findFirst({...}) 같은 관계형 쿼리도 가능해진다.
export const db = drizzle(sql, { schema });
