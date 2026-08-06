# PlaySteno

> 한글에서 단축키 한 번이면 우리말샘 사전이 옆에 떠요.
> 속기사·회의록 작성자를 위한 데스크톱 HUD 도구.

🌐 **https://playsteno.com** ← 공식 홈페이지·가입·로그인·관리

⬇️ **[낱말지기 온라인 다운로드 (Windows)](https://playsteno.com/download/windows)**

---

## 무엇인가요

회의록을 작성하다 모르는 단어를 만났을 때 Alt+Tab으로 브라우저를 여는 흐름을 줄입니다. 단어 뒤에 커서를 두고 지정한 단축키를 누르면 반투명 HUD에 우리말샘 결과가 표시됩니다.

낱말지기 온라인은 Windows HUD 앱과 가입·승인·프로그램 연결·사용 통계를 제공하는 온라인 서비스로 구성됩니다.

## 빠른 시작

1. **회원가입**: https://playsteno.com/sign-up
2. **승인 대기** (관리자가 1~24시간 안에 승인)
3. **Windows 앱 설치**: 위 다운로드 링크 → 설치 파일 실행
4. **프로그램 연결**: 대시보드에서 10분짜리 1회용 연결 코드 발급 → HUD 설정에 입력

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

- [개인정보 처리방침](https://playsteno.com/privacy)
- [이용약관](https://playsteno.com/terms)

## 문의

phk901031@gmail.com

## 라이선스

Proprietary — 코드 공개되어 있지만 무단 복제·배포 금지. 학습용 참고는 환영.
