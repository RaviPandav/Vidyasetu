import { useState, useEffect } from "react";

const useDarkMode = () => {
  const [isDark, setIsDark] = useState(() => {
    const stored = localStorage.getItem("vidyasetu-dark");
    return stored ? JSON.parse(stored) : window.matchMedia("(prefers-color-scheme: dark)").matches;
  });

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
    localStorage.setItem("vidyasetu-dark", JSON.stringify(isDark));
  }, [isDark]);

  return [isDark, () => setIsDark((d) => !d)];
};

export default useDarkMode;
