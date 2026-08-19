// game_profiles.nameColor / borderStyle 의 DB enum 값과 1:1로 맞춰야 한다.
// (src/infrastructure/db/schema.ts 의 gameNameColorEnum / gameBorderStyleEnum 참고)
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

export function isTypingNameColor(value: unknown): value is TypingNameColor {
  return TYPING_NAME_COLORS.some((color) => color.id === value);
}

export function isTypingBorderStyle(value: unknown): value is TypingBorderStyle {
  return TYPING_BORDER_STYLES.some((style) => style.id === value);
}

export function colorClass(color: TypingNameColor) {
  return TYPING_NAME_COLORS.find((item) => item.id === color)?.className ?? "text-accent";
}

export function borderClass(style: TypingBorderStyle) {
  return TYPING_BORDER_STYLES.find((item) => item.id === style)?.className ?? "border border-current/25";
}
