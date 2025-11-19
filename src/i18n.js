import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import en from "./app/locales/en/translation.json";
import vi from "./app/locales/vi/translation.json";

i18n.use(initReactI18next).init({
  resources: {
    en: { translation: en },
    vi: { translation: vi },
  },
  lng: localStorage.getItem("i18nextLng") || "en", // hoặc "vi" nếu bạn muốn default là tiếng Việt
  fallbackLng: "vi",
  interpolation: { escapeValue: false },
});

export default i18n;