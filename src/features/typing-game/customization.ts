export const TYPING_NAME_COLORS = [
  { id: "mint", label: "민트", className: "text-accent" },
  { id: "coral", label: "코랄", className: "text-signal" },
  { id: "violet", label: "보라", className: "text-violet-500" },
  { id: "sky", label: "하늘", className: "text-sky-500" },
  { id: "gold", label: "금빛", className: "text-amber-500" },
] as const;

export const TYPING_BORDER_STYLES = [
  { id: "soft", label: "말랑", className: "border border-current/25 bg-current/5" },
  { id: "line", label: "또렷", className: "border-2 border-current/45" },
  { id: "glow", label: "반짝", className: "border border-current/30 bg-current/5 shadow-[0_0_12px_currentColor]" },
] as const;

export type TypingNameColor = (typeof TYPING_NAME_COLORS)[number]["id"];
export type TypingBorderStyle = (typeof TYPING_BORDER_STYLES)[number]["id"];

export interface TypingGameProfile {
  nickname: string;
  nameColor: TypingNameColor;
  borderStyle: TypingBorderStyle;
  customized: boolean;
}

export function isTypingNameColor(value: unknown): value is TypingNameColor {
  return TYPING_NAME_COLORS.some((color) => color.id === value);
}

export function isTypingBorderStyle(value: unknown): value is TypingBorderStyle {
  return TYPING_BORDER_STYLES.some((style) => style.id === value);
}

export function normalizeTypingNickname(value: string) {
  return value.normalize("NFC").trim().replace(/\s+/g, " ");
}

export function isValidTypingNickname(value: string) {
  const normalized = normalizeTypingNickname(value);
  return (
    normalized.length >= 2 &&
    normalized.length <= 10 &&
    /^[가-힣A-Za-z0-9]+$/.test(normalized) &&
    !/^(관리자|운영자|playsteno|플레이스테노)$/i.test(normalized)
  );
}

export function colorClass(color: TypingNameColor) {
  return TYPING_NAME_COLORS.find((item) => item.id === color)?.className ?? "text-accent";
}

export function borderClass(style: TypingBorderStyle) {
  return TYPING_BORDER_STYLES.find((item) => item.id === style)?.className ?? "border border-current/25";
}
