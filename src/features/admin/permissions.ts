// src/features/admin/permissions.ts
// 관리자 권한 검사 — 순수 ③ Domain.

import type { User } from "@/infrastructure/db/schema";

/** 일반 사용자가 admin 동작을 시도했을 때 throw할 에러 */
export class AdminPermissionError extends Error {
  constructor() {
    super("관리자 권한이 필요합니다.");
    this.name = "AdminPermissionError";
  }
}

/** admin 권한 강제 검사. 일반 사용자면 throw. */
export function assertAdmin(user: User): void {
  if (user.role !== "admin") {
    throw new AdminPermissionError();
  }
}
