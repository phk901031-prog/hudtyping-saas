/**
 * 공개 릴리스 정보의 단일 기준점.
 * 새 Windows 버전 배포 시 이 파일만 변경한다.
 *
 * downloadUrl 은 우리 사이트 경로. 실제 파일 원본 주소(GitHub)는 계정명 노출을
 * 막기 위해 서버 전용 infrastructure/release-assets.ts 에서 version 으로 만든다.
 */
export const WINDOWS_RELEASE = {
  version: "0.2.31",
  minimumFreshInstallVersion: "0.2.10",
  downloadUrl: "/download/windows/installer",
} as const;
