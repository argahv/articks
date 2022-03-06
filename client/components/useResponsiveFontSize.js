import { useEffect, useState } from "react";

export default function useResponsiveFontSize() {
  const getFontSize = () =>
    typeof window !== "undefined"
      ? window.innerWidth < 450
        ? "16px"
        : "18px"
      : "";
  const [fontSize, setFontSize] = useState(getFontSize);

  useEffect(() => {
    const onResize = () => {
      setFontSize(getFontSize());
    };

    if (typeof window !== "undefined") {
      // Client-side-only code
      window.addEventListener("resize", onResize);

      return () => {
        window.removeEventListener("resize", onResize);
      };
    }
  });

  return fontSize;
}
