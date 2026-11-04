import { useCallback, useEffect, useRef, useState } from "react";

export default function useClipboard(timeout = 1800) {
  const [copied, setCopied] = useState("");
  const timer = useRef(null);

  const copy = useCallback(async (value, label = "Value") => {
    if (!value || !navigator.clipboard) return false;
    await navigator.clipboard.writeText(value);
    setCopied(label);
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => setCopied(""), timeout);
    return true;
  }, [timeout]);

  useEffect(() => () => window.clearTimeout(timer.current), []);

  return { copied, copy };
}
