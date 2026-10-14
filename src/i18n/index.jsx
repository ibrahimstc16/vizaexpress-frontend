/* eslint-disable react-refresh/only-export-components -- provider and its hook live together */
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { LANGUAGES } from '../config/site';
import en from './en';
import pl from './pl';
import uk from './uk';
import tr from './tr';
import ru from './ru';

const dictionaries = { en, pl, uk, tr, ru };
const STORAGE_KEY = 'vizaexpress-lang';

function initialLanguage() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved && dictionaries[saved]) return saved;
  } catch {
    // Storage can be unavailable (private mode); fall through to the browser language.
  }
  const browser = (navigator.languages || [navigator.language || 'en'])
    .map((l) => l.slice(0, 2).toLowerCase())
    .find((l) => dictionaries[l]);
  return browser || 'en';
}

function lookup(dict, key) {
  return key.split('.').reduce((node, part) => (node == null ? undefined : node[part]), dict);
}

function interpolate(value, vars) {
  if (typeof value !== 'string' || !vars) return value;
  return value.replace(/\{(\w+)\}/g, (match, name) => (vars[name] ?? match));
}

const I18nContext = createContext(null);

export function I18nProvider({ children }) {
  const [lang, setLangState] = useState(initialLanguage);

  const setLang = useCallback((code) => {
    if (!dictionaries[code]) return;
    setLangState(code);
    try {
      localStorage.setItem(STORAGE_KEY, code);
    } catch {
      // Ignore: the choice still applies for this visit.
    }
  }, []);

  useEffect(() => {
    document.documentElement.lang = lang;
    document.title = lookup(dictionaries[lang], 'meta.title') || en.meta.title;
  }, [lang]);

  const value = useMemo(() => {
    const t = (key, vars) => {
      const found = lookup(dictionaries[lang], key);
      return interpolate(found === undefined ? lookup(en, key) ?? key : found, vars);
    };
    const locale = LANGUAGES.find((l) => l.code === lang)?.locale || 'en-GB';
    const formatDate = (input) => {
      const date = new Date(input);
      if (Number.isNaN(date.getTime())) return '–';
      return date.toLocaleDateString(locale, { day: 'numeric', month: 'short', year: 'numeric' });
    };
    const formatNumber = (n) => Number(n).toLocaleString(locale);
    return { lang, setLang, t, formatDate, formatNumber };
  }, [lang, setLang]);

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n() {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error('useI18n must be used inside I18nProvider');
  return ctx;
}
