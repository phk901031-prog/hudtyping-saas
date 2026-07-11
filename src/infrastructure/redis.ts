// src/lib/redis.ts
// 앱 전역에서 사용할 Upstash Redis 클라이언트.
//
// Upstash는 HTTP 기반 Redis라 서버리스/Edge 환경에서도 잘 동작한다 (TCP 연결 풀 걱정 없음).
// `Redis.fromEnv()`는 UPSTASH_REDIS_REST_URL/UPSTASH_REDIS_REST_TOKEN 두 환경변수를 자동 감지.

import "server-only";
import { Redis } from "@upstash/redis";

if (
  !process.env.UPSTASH_REDIS_REST_URL ||
  !process.env.UPSTASH_REDIS_REST_TOKEN
) {
  throw new Error(
    "Upstash Redis 환경변수(UPSTASH_REDIS_REST_URL, UPSTASH_REDIS_REST_TOKEN)가 없습니다."
  );
}

export const redis = Redis.fromEnv();
