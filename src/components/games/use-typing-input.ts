"use client";

import { useCallback, useState, type ChangeEvent } from "react";
import { convertDubeolsik } from "@/features/typing-game/dubeolsik";

// 컨트롤드 입력 + IME 조합 대응 + 두벌식 자동복구(수동 토글).
// 두벌식 모드가 꺼져있으면 브라우저 IME 결과를 그대로 신뢰 — 대부분의 사용자(한글 IME 정상 설정)가 이 경로.
// 두벌식 모드는 raw 입력을 별도로 쌓아두고 매 입력마다 convertDubeolsik()로 다시 계산한다
// (raw 글자 수와 변환된 한글 글자 수가 다르므로 완성된 한글 기준으로 길이를 제한한다).
export function useTypingInput(targetLength: number) {
  const [typedText, setTypedText] = useState("");
  const [rawBuffer, setRawBuffer] = useState("");
  const [dubeolsikMode, setDubeolsikMode] = useState(false);

  const reset = useCallback(() => {
    setTypedText("");
    setRawBuffer("");
  }, []);

  const onChange = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      const value = event.target.value;
      const isComposing = (event.nativeEvent as InputEvent).isComposing ?? false;

      if (dubeolsikMode) {
        const converted = convertDubeolsik(value);
        if (!isComposing && converted.length > targetLength) return;
        setRawBuffer(value);
        setTypedText(converted);
        return;
      }

      if (!isComposing && value.length > targetLength) return;
      setTypedText(value);
    },
    [dubeolsikMode, targetLength]
  );

  const toggleDubeolsikMode = useCallback(() => {
    setDubeolsikMode((prev) => !prev);
    setTypedText("");
    setRawBuffer("");
  }, []);

  return {
    typedText,
    rawValue: dubeolsikMode ? rawBuffer : typedText,
    dubeolsikMode,
    toggleDubeolsikMode,
    onChange,
    reset,
  };
}
