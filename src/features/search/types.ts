// src/features/search/types.ts
// Search 도메인의 타입 정의 (③ Domain).
//
// 이 파일은 외부 시스템(우리말샘, Redis, DB)에 의존하지 않는 순수 타입.
// 인프라 어댑터(`@/infrastructure/urimalsaem`)와 서비스(`./service`)가 모두 여기에 의존한다.

/** 한 단어의 한 뜻풀이 */
export interface Sense {
  definition: string;
  pos: string; // 품사 (명사, 동사 등)
  cat: string; // 분야 (식물, 의학 등) — 빈 문자열일 수 있음
  origin: string; // 어원/한자 — 빈 문자열일 수 있음
  link: string; // 우리말샘 웹 페이지 링크
  senseNo: string; // 뜻풀이 번호 (camelCase 정규화 후)
}

/** 같은 글자라도 한자 다르면 별도 item (예: 사과(沙果)/사과(謝過)) */
export interface DictItem {
  word: string;
  senses: Sense[];
}

/** 정제된 검색 결과 (외부 노출용) */
export interface SearchResult {
  query: string;
  total: number;
  items: DictItem[];
  operatorNotes?: OperatorNote[];
}

/** 서비스가 응답에 추가하는 캐시 적중 메타 */
export type CacheStatus = "hit" | "miss";

export interface SearchResultWithCacheMeta extends SearchResult {
  cache: CacheStatus;
}

export interface OperatorNote {
  term: string;
  label: string;
  note: string;
}
