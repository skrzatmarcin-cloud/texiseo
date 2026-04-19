import { createContext, useContext, useState, useEffect } from "react";
import { getT, setLang as persistLang } from "./i18n";

const LanguageContext = createContext({ lang: "pl", t: {}, setLang: () => {}, showLangSwitcher: true, setShowLangSwitcher: () => {} });

export function LanguageProvider({ children }) {
  const [lang, setLangState] = useState(() => localStorage.getItem("app_lang") || "pl");
  const [showLangSwitcher, setShowLangSwitcherState] = useState(() => {
    const stored = localStorage.getItem("show_lang_switcher");
    return stored === null ? true : stored === "true";
  });

  useEffect(() => {
    const handler = () => setLangState(localStorage.getItem("app_lang") || "pl");
    window.addEventListener("lang_change", handler);
    return () => window.removeEventListener("lang_change", handler);
  }, []);

  const setLang = (code) => {
    persistLang(code);
    setLangState(code);
  };

  const setShowLangSwitcher = (val) => {
    localStorage.setItem("show_lang_switcher", String(val));
    setShowLangSwitcherState(val);
  };

  return (
    <LanguageContext.Provider value={{ lang, t: getT(lang), setLang, showLangSwitcher, setShowLangSwitcher }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  return useContext(LanguageContext);
}