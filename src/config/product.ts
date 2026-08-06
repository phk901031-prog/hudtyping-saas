/** 공개 화면에서 사용하는 브랜드·제품 정책의 단일 기준점. */
export const BRAND = {
  name: "PlaySteno",
  tagline: "속기사의 놀이터",
} as const;

export const NATMALGI_ONLINE = {
  name: "낱말지기 온라인",
  shortName: "낱말지기",
  monthlySearchLimit: 500,
  quotaResetLabel: "매월 1일 오전 9시(한국시간)",
  supportedEnvironment: "Windows 10·11",
} as const;
