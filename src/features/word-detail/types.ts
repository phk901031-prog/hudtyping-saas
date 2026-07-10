// Word-detail 도메인 타입 (③ Domain).
// 우리말샘 /api/view 응답을 정제한 뒤 클라이언트(HUD 예문 창 등)에 노출하는 shape.

export interface WordDetailExample {
  text: string;
  source?: string;
}

export interface WordDetailSense {
  senseNo: string;
  definition: string;
  pos: string;
  cat: string;
  examples: WordDetailExample[];
}

export interface WordDetail {
  targetCode: string;
  word: string;
  senses: WordDetailSense[];
}

export type CacheStatus = "hit" | "miss";

export interface WordDetailWithCacheMeta extends WordDetail {
  cache: CacheStatus;
}
