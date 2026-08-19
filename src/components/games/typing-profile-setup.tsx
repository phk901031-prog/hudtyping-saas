"use client";

import { useState } from "react";
import {
  TYPING_NAME_COLORS,
  TYPING_BORDER_STYLES,
  type TypingNameColor,
  type TypingBorderStyle,
} from "@/features/typing-game/types";
import type { GameProfile } from "@/infrastructure/db/schema";

// 실제 검증은 서버(API 라우트 → profile.ts)가 최종 권위. 여기선 버튼 활성화용 UX 힌트만.
const NICKNAME_HINT_PATTERN = /^[가-힣A-Za-z0-9]{2,10}$/;

interface Props {
  onSaved: (profile: GameProfile) => void;
}

export function TypingProfileSetup({ onSaved }: Props) {
  const [nickname, setNickname] = useState("");
  const [nameColor, setNameColor] = useState<TypingNameColor>("mint");
  const [borderStyle, setBorderStyle] = useState<TypingBorderStyle>("soft");
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const looksValid = NICKNAME_HINT_PATTERN.test(nickname.trim());

  const handleSubmit = async () => {
    if (!looksValid || saving) return;
    setSaving(true);
    setError(null);
    try {
      const res = await fetch("/api/games/typing/profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nickname, nameColor, borderStyle }),
      });
      const data = (await res.json().catch(() => ({}))) as {
        profile?: GameProfile;
        error?: string;
      };
      if (!res.ok || !data.profile) {
        setError(data.error ?? "저장하지 못했어요.");
        return;
      }
      onSaved(data.profile);
    } catch {
      setError("네트워크 오류가 발생했어요.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex flex-col gap-4 rounded-2xl border border-dashed border-border bg-panel px-5 py-6">
      <p className="ko-copy text-sm text-muted">
        닉네임을 정하면 리더보드에 표시돼요. (최초 설정 후 변경 불가)
      </p>
      <div className="flex flex-wrap gap-3">
        <input
          value={nickname}
          onChange={(event) => setNickname(event.target.value)}
          maxLength={10}
          placeholder="닉네임 (한글·영문·숫자 2~10자)"
          className="min-w-0 flex-1 rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus:border-accent"
        />
        <button
          type="button"
          disabled={!looksValid || saving}
          onClick={handleSubmit}
          className="shrink-0 rounded-md bg-accent px-4 py-2 text-sm font-bold text-white transition hover:bg-accent-hover disabled:cursor-not-allowed disabled:opacity-50"
        >
          {saving ? "저장 중..." : "닉네임 확정"}
        </button>
      </div>
      <div className="flex flex-wrap gap-2">
        {TYPING_NAME_COLORS.map((color) => (
          <button
            key={color.id}
            type="button"
            onClick={() => setNameColor(color.id)}
            className={`rounded-full border px-3 py-1 text-xs font-bold transition ${color.className} ${
              nameColor === color.id ? "border-accent" : "border-border"
            }`}
          >
            {color.label}
          </button>
        ))}
      </div>
      <div className="flex flex-wrap gap-2">
        {TYPING_BORDER_STYLES.map((style) => (
          <button
            key={style.id}
            type="button"
            onClick={() => setBorderStyle(style.id)}
            className={`rounded-full px-3 py-1 text-xs font-bold transition ${
              borderStyle === style.id ? "bg-accent-soft text-accent" : "text-muted"
            }`}
          >
            {style.label}
          </button>
        ))}
      </div>
      {error && <p className="text-sm text-danger">{error}</p>}
    </div>
  );
}
