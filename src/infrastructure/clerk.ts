// src/infrastructure/clerk.ts
// Clerk SDK를 한 곳에서만 다루도록 모은 어댑터.
//
// 목적: 앱 코드는 `@/infrastructure/clerk`만 import → Clerk SDK 변경/교체 시
// 이 파일만 손보면 됨. 또한 모킹·테스트도 이 한 점만 가로채면 됨.
//
// 현재는 단순 re-export지만, 점차 다음을 추가할 예정:
//   - `getClerkUserById(id)` — clerkClient().users.getUser() 래퍼
//   - 에러 타입 정규화

export { auth, clerkClient } from "@clerk/nextjs/server";
