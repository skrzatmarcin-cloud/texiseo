import { createContext, useContext, useState, useEffect } from "react";
import { getT, setLang as persistLang } from "./i18n";

const LanguageContext = createContext({ lang: "pl", t: {}, setLang: () => {} });

export function LanguageProvider({ children }) {
  const [lang, setLangState] = useState(() => localStorage.getItem("app_lang") || "pl");

  useEffect(() => {
    const handler = () => setLangState(localStorage.getItem("app_lang") || "pl");
    window.addEventListener("lang_change", handler);
    return () => window.removeEventListener("lang_change", handler);
  }, []);

  const setLang = (code) => {
    persistLang(code);
    setLangState(code);
  };

  return (
    <LanguageContext.Provider value={{ lang, t: getT(lang), setLang }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  return useContext(LanguageContext);
}