// src/features/notes/notes.ts
// 표기 노트 — 속기·회의록 작성 중 자주 헷갈리는 표기를 짧게 정리한 읽을거리 (② Application).
//
// - DB 없이 코드에 정적으로 둔다 (Neon 비용 0, 빌드 시 정적 생성).
// - 새 노트는 NOTES 배열 맨 앞에 추가. slug 는 URL 이므로 한 번 정하면 바꾸지 않는다.
// - 규정 근거는 국립국어원 한글 맞춤법 조항으로 확인 가능한 것만 적는다.

export interface NoteExample {
  wrong: string;
  right: string;
}

export interface NoteSection {
  heading: string;
  body: string[];
  examples?: NoteExample[];
}

export interface Note {
  slug: string;
  title: string;
  summary: string;
  publishedAt: string; // YYYY-MM-DD
  basis?: string; // 규정 근거
  sections: NoteSection[];
}

export const NOTES: Note[] = [
  {
    slug: "doe-dwae",
    title: "‘되’와 ‘돼’, 한 번에 가르는 법",
    summary: "‘돼’는 ‘되어’가 줄어든 말입니다. ‘되어’로 바꿔 자연스러우면 ‘돼’를 씁니다.",
    publishedAt: "2026-10-27",
    basis: "한글 맞춤법 제35항 [붙임 2]",
    sections: [
      {
        heading: "원리",
        body: [
          "‘돼’는 ‘되-’에 ‘-어’가 붙은 ‘되어’의 준말입니다. 그래서 ‘되어’로 풀어 읽어 말이 되면 ‘돼’, 말이 되지 않으면 ‘되’를 씁니다.",
          "헷갈릴 때는 ‘하/해’를 넣어 보는 방법도 많이 씁니다. ‘하’가 어울리면 ‘되’, ‘해’가 어울리면 ‘돼’입니다.",
        ],
      },
      {
        heading: "회의록에서 자주 보는 예",
        body: ["발언을 받아 적을 때 말소리만 듣고 쓰면 틀리기 쉬운 자리입니다."],
        examples: [
          { wrong: "그렇게 하면 안 되요.", right: "그렇게 하면 안 돼요." },
          { wrong: "안건이 통과됬습니다.", right: "안건이 통과됐습니다." },
          { wrong: "검토가 되야 합니다.", right: "검토가 돼야 합니다." },
          { wrong: "위원이 돼고 싶습니다.", right: "위원이 되고 싶습니다." },
        ],
      },
    ],
  },
  {
    slug: "an-anh",
    title: "‘안’과 ‘않’, 줄이기 전 모양으로 확인하기",
    summary: "‘안’은 ‘아니’, ‘않’은 ‘아니하’가 줄어든 말입니다. 원래 모양을 넣어 보면 갈립니다.",
    publishedAt: "2026-10-27",
    sections: [
      {
        heading: "원리",
        body: [
          "‘안’은 부사 ‘아니’의 준말로, 뒤에 오는 말을 부정합니다. ‘않-’은 ‘아니하-’의 준말로, 그 자체가 동사·형용사처럼 활용합니다.",
          "문장에서 ‘아니’로 바꿔 자연스러우면 ‘안’, ‘아니하’로 바꿔 자연스러우면 ‘않’을 씁니다.",
          "또 ‘않’은 보통 ‘-지 않다’ 꼴로 ‘-지’ 뒤에 옵니다. ‘-지’ 뒤라면 대부분 ‘않’입니다.",
        ],
      },
      {
        heading: "회의록에서 자주 보는 예",
        body: [],
        examples: [
          { wrong: "그 안건은 논의하지 안았습니다.", right: "그 안건은 논의하지 않았습니다." },
          { wrong: "아직 결정이 않 됐습니다.", right: "아직 결정이 안 됐습니다." },
          { wrong: "참석하지 안은 위원", right: "참석하지 않은 위원" },
        ],
      },
    ],
  },
  {
    slug: "dependent-noun-spacing",
    title: "‘할 수 있다’, ‘하는 데’ — 의존 명사 띄어쓰기",
    summary: "‘수·것·데·만큼’처럼 혼자 못 쓰는 명사도 명사이므로 앞말과 띄어 씁니다.",
    publishedAt: "2026-10-27",
    basis: "한글 맞춤법 제42항",
    sections: [
      {
        heading: "원리",
        body: [
          "의존 명사는 홀로 쓰이지 못할 뿐 명사입니다. 그래서 앞말과 띄어 씁니다. 발언을 빠르게 받아 적을 때 붙여 쓰기 쉬운 대표적인 자리입니다.",
          "같은 모양이 어미로도 쓰이는 경우가 있어 주의가 필요합니다. ‘데’가 ‘곳·일·경우’를 뜻하면 의존 명사라 띄우고, 뒤 내용의 배경을 말하는 연결 어미 ‘-는데’면 붙입니다.",
        ],
      },
      {
        heading: "구별 예",
        body: ["‘데’ 자리에 ‘곳’이나 ‘일’을 넣어 말이 되면 띄어 씁니다."],
        examples: [
          { wrong: "검토할수 있습니다.", right: "검토할 수 있습니다." },
          { wrong: "충분히 논의한것으로 알고 있습니다.", right: "충분히 논의한 것으로 알고 있습니다." },
          { wrong: "예산을 편성하는데 석 달이 걸렸습니다.", right: "예산을 편성하는 데 석 달이 걸렸습니다." },
          { wrong: "회의를 하는 데 전화가 왔습니다.", right: "회의를 하는데 전화가 왔습니다." },
        ],
      },
    ],
  },
];

export function getNote(slug: string): Note | undefined {
  return NOTES.find((n) => n.slug === slug);
}
