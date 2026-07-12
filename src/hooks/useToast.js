import { useCallback, useRef, useState } from "react";

const EMPTY = { message: "", title: "Sign in failed", variant: "error" };

// showToast(text) still works exactly like before (used by AuthPage) —
// options is optional, so `title`/`variant` default to the original
// error-toast look. Other features can opt into success/info variants:
//   showToast("Marked as completed", { title: "Success", variant: "success" })
export default function useToast() {
  const [state, setState] = useState(EMPTY);
  const timeoutRef = useRef(null);

  const showToast = useCallback((text, options = {}) => {
    const { title = "Sign in failed", variant = "error", duration = 3500 } = options;
    clearTimeout(timeoutRef.current);
    setState({ message: text, title, variant });
    timeoutRef.current = setTimeout(() => setState(EMPTY), duration);
  }, []);

  const hideToast = useCallback(() => {
    clearTimeout(timeoutRef.current);
    setState(EMPTY);
  }, []);

  return { message: state.message, title: state.title, variant: state.variant, showToast, hideToast };
}