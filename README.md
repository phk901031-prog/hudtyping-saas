# hudtyping

> 한글에서 단축키 한 번이면 우리말샘 사전이 옆에 떠요.
> 속기사·회의록 작성자를 위한 데스크톱 HUD 도구.

🌐 **https://papawheels.vercel.app** ← 가입·로그인·관리

⬇️ **[데스크톱 앱 다운로드 (Windows)](https://github.com/phk901031-prog/hudtyping-saas/releases/latest/download/hudtyping-Setup-0.1.0.exe)**

---

## 무엇인가요

회의록 쓰다가 모르는 단어 만났을 때, Alt+Tab으로 브라우저 띄우고 우리말샘 검색하는 그 흐름 끊김을 없애요. 한글에서 단어를 블록 잡고 단축키 한 번 누르면, 반투명 HUD 오버레이로 결과가 옆에 살짝 떠요. 시선만 살짝, 한글 작업은 그대로.

데스크톱 앱은 위 다운로드 링크. SaaS는 가입·승인·API 키 발급·사용 통계용 백엔드.

## 빠른 시작

1. **회원가입**: https://papawheels.vercel.app/sign-up
2. **승인 대기** (관리자가 1~24시간 안에 승인)
3. **API 키 발급**: 대시보드 → "🔑 API 키" → 발급 → 평문 키 복사 (1회만 노출)
4. **데스크톱 앱 설치**: 위 다운로드 링크 → .exe 실행 → 설치
5. **HUD 설정 → API 키 입력** → 한글에서 단축키로 검색 시작

자세한 매뉴얼: [docs/manual/user-guide.md](docs/manual/user-guide.md), [docs/manual/local-hud-setup.md](docs/manual/local-hud-setup.md)

## 기술 스택

- **프론트엔드**: Next.js 16 (App Router, Turbopack) + React 19 + Tailwind CSS v4 + TypeScript
- **DB**: Neon PostgreSQL + Drizzle ORM (Tokyo 리전)
- **인증**: Clerk
- **캐시**: Upstash Redis (공유 캐시 — 모든 사용자가 같은 결과 즉시 받음)
- **외부 API**: 우리말샘 Open API ([opendict.korean.go.kr](https://opendict.korean.go.kr))
- **호스팅**: Vercel (SaaS) + GitHub Releases (.exe)
- **데스크톱 앱**: Electron + Nextron — 별도 코드

## 프로젝트 구조

```
src/
├── app/                # Next.js routes (UI/API)
├── components/         # 공유 UI
├── features/           # 도메인별 비즈니스 로직
│   ├── search/         # 우리말샘 검색 + 캐시 + 통계
│   ├── auth/           # 인증·API 키
│   ├── users/          # JIT provisioning
│   ├── admin/          # 회원 관리·전체 통계
│   ├── quota/          # 월 한도 관리
│   └── webhooks/       # Clerk webhook 핸들러
├── infrastructure/     # 외부 시스템 어댑터 (DB, Redis, Clerk, 우리말샘)
└── proxy.ts            # Next.js 16 미들웨어 (Clerk 컨텍스트)
```

자세한 아키텍처: [docs/architecture/](docs/architecture/)

## 개발 환경

```bash
# 의존성 설치
npm install

# .env.local 작성 (다음 6개 키 필요)
# NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=
# CLERK_SECRET_KEY=
# DATABASE_URL=
# UPSTASH_REDIS_REST_URL=
# UPSTASH_REDIS_REST_TOKEN=
# WOORI_KEY=

# DB 마이그레이션 적용
npm run db:migrate

# dev 서버
npm run dev
```

## 비즈니스 모델

베타 1년 무료 운영 → 사용 패턴 분석 → 1년 후 합리적 가격으로 유료화 전환 예정.
무료 기간 한도: **월 500회 검색 / 사용자**.

## 정책

- [개인정보 처리방침](https://papawheels.vercel.app/privacy)
- [이용약관](https://papawheels.vercel.app/terms)

## 문의

phk901031@gmail.com

## 라이선스

Proprietary — 코드 공개되어 있지만 무단 복제·배포 금지. 학습용 참고는 환영.
