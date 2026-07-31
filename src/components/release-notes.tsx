/**
 * ============================================
 * release-notes.tsx
 * ============================================
 *
 * GitHub Release body markdown 을 가벼운 규칙으로 JSX 로 변환.
 * 라이브러리(marked, react-markdown) 도입 없이 다음만 지원:
 *   - `## 헤딩` → h3
 *   - `- 목록` → ul > li
 *   - `**굵게**` → <strong>
 *   - 빈 줄로 문단 분리
 *   - 인라인 링크는 지원하지 않음(릴리스 노트는 우리가 직접 씀 → 심플하게 유지)
 * ============================================
 */

import React from "react";

interface Block {
  type: "h3" | "ul" | "p";
  lines: string[];
}

function parseBlocks(markdown: string): Block[] {
  const rawLines = markdown.replace(/\r\n/g, "\n").split("\n");
  const blocks: Block[] = [];
  let current: Block | null = null;

  const flush = () => {
    if (current && current.lines.length > 0) blocks.push(current);
    current = null;
  };

  for (const line of rawLines) {
    const trimmed = line.trim();

    if (!trimmed) {
      flush();
      continue;
    }

    if (trimmed.startsWith("## ")) {
      flush();
      blocks.push({ type: "h3", lines: [trimmed.slice(3).trim()] });
      continue;
    }

    if (trimmed.startsWith("- ") || trimmed.startsWith("* ")) {
      if (!current || current.type !== "ul") {
        flush();
        current = { type: "ul", lines: [] };
      }
      current.lines.push(trimmed.slice(2).trim());
      continue;
    }

    if (!current || current.type !== "p") {
      flush();
      current = { type: "p", lines: [] };
    }
    current.lines.push(trimmed);
  }
  flush();
  return blocks;
}

/** `**text**` → <strong> 처리. React key 안전. */
function renderInline(text: string): React.ReactNode {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return parts.map((part, i) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return <strong key={i}>{part.slice(2, -2)}</strong>;
    }
    return <React.Fragment key={i}>{part}</React.Fragment>;
  });
}

export function ReleaseNotes({ markdown }: { markdown: string }) {
  const blocks = parseBlocks(markdown);
  if (blocks.length === 0) {
    return <p className="text-sm text-muted">릴리스 노트가 없습니다.</p>;
  }

  return (
    <div className="flex flex-col gap-4">
      {blocks.map((block, i) => {
        if (block.type === "h3") {
          return (
            <h3 key={i} className="mt-2 font-display text-base font-bold">
              {renderInline(block.lines[0])}
            </h3>
          );
        }
        if (block.type === "ul") {
          return (
            <ul key={i} className="flex list-disc flex-col gap-1.5 pl-5">
              {block.lines.map((line, j) => (
                <li key={j} className="text-[15px] leading-7 text-muted [word-break:keep-all]">
                  {renderInline(line)}
                </li>
              ))}
            </ul>
          );
        }
        return (
          <p key={i} className="text-[15px] leading-7 text-muted [word-break:keep-all]">
            {block.lines.map((line, j) => (
              <React.Fragment key={j}>
                {j > 0 && <br />}
                {renderInline(line)}
              </React.Fragment>
            ))}
          </p>
        );
      })}
    </div>
  );
}
