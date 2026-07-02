# 데이터 흐름

## 가입과 승인

```text
사용자 가입
  -> Clerk 계정 생성
  -> SaaS JIT 사용자 row 생성
  -> status = pending
  -> 관리자가 승인
  -> status = approved
```

## API 키

```text
사용자 대시보드
  -> API 키 발급
  -> 평문 키는 1회 표시
  -> DB에는 SHA-256 해시 저장
  -> HUD 설정에 평문 키 입력
```

## HUD 검색

```text
한글 문서
  -> 커서 앞 검색 단축키
  -> 입력 횟수 수집
  -> 커서 앞 단어/구절 선택
  -> 클립보드 복사
  -> HUD main process
  -> SaaS /api/search
  -> 결과 수신
  -> renderer에 표시
```

## SaaS 검색

```text
/api/search
  -> Bearer API 키 검증
  -> 사용자 승인 상태 확인
  -> 월 한도 확인
  -> Redis search cache 조회
  -> Neon dictionary_cache 조회
  -> 우리말샘 API 호출
  -> Redis + Neon 캐시 저장
  -> search_logs 기록
  -> JSON 응답
```

## 관리자 통계

```text
search_logs
  -> 전체 검색량
  -> 사용자별 검색량
  -> 최근 검색 이력
  -> 인기 검색어
  -> 시간대별 사용량

dictionary_cache
  -> 장기 캐시 단어 수
  -> 캐시 재사용 횟수
```
