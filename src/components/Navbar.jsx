import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Sparkles, Globe, ChevronDown, Menu, X, CheckCircle } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

const languages = [
  { code: 'en', name: 'English', flag: '🇬🇧' },
  { code: 'pl', name: 'Polski', flag: '🇵🇱' },
  { code: 'uk', name: 'Українська', flag: '🇺🇦' },
  { code: 'tr', name: 'Türkçe', flag: '🇹🇷' },
  { code: 'ru', name: 'Русский', flag: '🇷🇺' }
];

const navTranslations = {
  en: { login: 'Login', getStarted: 'Get Started', howItWorks: 'How It Works', pricing: 'Pricing', about: 'About', contact: 'Contact' },
  pl: { login: 'Zaloguj', getStarted: 'Rozpocznij', howItWorks: 'Jak Działa', pricing: 'Cennik', about: 'O Nas', contact: 'Kontakt' },
  uk: { login: 'Увійти', getStarted: 'Почати', howItWorks: 'Як Працює', pricing: 'Ціни', about: 'Про Нас', contact: 'Контакт' },
  tr: { login: 'Giriş', getStarted: 'Başla', howItWorks: 'Nasıl Çalışır', pricing: 'Fiyatlar', about: 'Hakkımızda', contact: 'İletişim' },
  ru: { login: 'Войти', getStarted: 'Начать', howItWorks: 'Как Работает', pricing: 'Цены', about: 'О Нас', contact: 'Контакт' }
};

export default function Navbar() {
  const { lang, setLang } = useLanguage();
  const [langOpen, setLangOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();
  const t = navTranslations[lang];
  const currentLang = languages.find(l => l.code === lang);

  const isActive = (path) => location.pathname === path;

  const navLinks = [
    { path: '/how-it-works', label: t.howItWorks },
    { path: '/#pricing', label: t.pricing, isAnchor: true },
    { path: '/faq', label: 'FAQ' },
    { path: '/about', label: t.about },
    { path: '/contact', label: t.contact },
  ];

  return (
    <nav className="relative z-50 bg-white/10 backdrop-blur-md border-b border-white/20 sticky top-0">
      <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
        <Link to="/" className="text-2xl font-bold text-white flex items-center gap-2 hover:scale-105 transition-transform">
          <Sparkles className="w-6 h-6 text-yellow-400 animate-spin" style={{animationDuration: '3s'}} />
          VizaExpress
        </Link>

        <div className="hidden lg:flex items-center gap-1">
          {navLinks.map((link, i) => (
            link.isAnchor ? (
              <a 
                key={i}
                href={link.path}
                className="relative px-4 py-2 text-white/80 hover:text-white transition-all font-medium rounded-xl hover:bg-white/10 group"
              >
                {link.label}
                <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-0 h-0.5 bg-gradient-to-r from-purple-400 to-pink-400 group-hover:w-3/4 transition-all duration-300"></span>
              </a>
            ) : (
              <Link 
                key={i}
                to={link.path}
                className={`relative px-4 py-2 transition-all font-medium rounded-xl group
                  ${isActive(link.path) 
                    ? 'text-white bg-gradient-to-r from-purple-600/50 to-pink-600/50 shadow-lg shadow-purple-500/25' 
                    : 'text-white/80 hover:text-white hover:bg-white/10'
                  }`}
              >
                {link.label}
                {!isActive(link.path) && (
                  <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-0 h-0.5 bg-gradient-to-r from-purple-400 to-pink-400 group-hover:w-3/4 transition-all duration-300"></span>
                )}
              </Link>
            )
          ))}
        </div>

        <div className="flex items-center gap-3">
          <div className="relative">
            <button 
              onClick={() => setLangOpen(!langOpen)}
              className="flex items-center gap-2 px-3 py-2 bg-gradient-to-r from-purple-600/30 to-pink-600/30 backdrop-blur-md rounded-xl border border-white/30 text-white hover:from-purple-600/50 hover:to-pink-600/50 hover:border-white/50 hover:scale-105 transition-all duration-300"
            >
              <Globe className="w-4 h-4 text-purple-300" />
              <span className="font-medium hidden sm:inline">{currentLang?.flag} {currentLang?.code.toUpperCase()}</span>
              <span className="font-medium sm:hidden">{currentLang?.flag}</span>
              <ChevronDown className={`w-4 h-4 transition-transform duration-300 ${langOpen ? 'rotate-180' : ''}`} />
            </button>
            {langOpen && (
              <div className="absolute right-0 mt-3 w-56 bg-gradient-to-br from-slate-800/95 via-purple-900/95 to-slate-800/95 backdrop-blur-xl rounded-2xl shadow-2xl shadow-purple-500/30 border border-white/20 overflow-hidden z-50">
                <div className="p-2">
                  {languages.map((l) => (
                    <button
                      key={l.code}
                      onClick={() => { setLang(l.code); setLangOpen(false); }}
                      className={`w-full px-4 py-3 text-left flex items-center gap-3 rounded-xl transition-all duration-300 group
                        ${lang === l.code 
                          ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg shadow-purple-500/50' 
                          : 'text-gray-200 hover:bg-white/10 hover:text-white hover:translate-x-1'
                        }`}
                    >
                      <span className="text-2xl group-hover:scale-125 transition-transform duration-300">{l.flag}</span>
                      <span className="font-medium">{l.name}</span>
                      {lang === l.code && <CheckCircle className="w-5 h-5 ml-auto text-white" />}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          <button 
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden text-white p-2 hover:bg-white/10 rounded-xl transition-all hover:scale-110"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>

          <Link to="/login" className="hidden sm:block text-white/90 hover:text-white transition-colors font-medium hover:scale-105">
            {t.login}
          </Link>
          <Link to="/register" className="px-4 sm:px-6 py-2 rounded-full bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 text-white font-semibold hover:scale-110 hover:shadow-lg hover:shadow-purple-500/50 transition-all text-sm sm:text-base">
            {t.getStarted} →
          </Link>
        </div>
      </div>

      {mobileMenuOpen && (
        <div className="lg:hidden bg-slate-900/95 backdrop-blur-xl border-t border-white/10">
          <div className="px-4 py-6 space-y-1">
            {navLinks.map((link, i) => (
              link.isAnchor ? (
                <a 
                  key={i}
                  href={link.path}
                  onClick={() => setMobileMenuOpen(false)}
                  className="block text-white/80 hover:text-white hover:bg-gradient-to-r hover:from-purple-600/30 hover:to-pink-600/30 transition-all font-medium py-3 px-4 rounded-xl"
                >
                  {link.label}
                </a>
              ) : (
                <Link 
                  key={i}
                  to={link.path}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`block transition-all font-medium py-3 px-4 rounded-xl
                    ${isActive(link.path)
                      ? 'text-white bg-gradient-to-r from-purple-600/50 to-pink-600/50'
                      : 'text-white/80 hover:text-white hover:bg-gradient-to-r hover:from-purple-600/30 hover:to-pink-600/30'
                    }`}
                >
                  {link.label}
                </Link>
              )
            ))}
            <div className="border-t border-white/10 my-4"></div>
            <Link to="/login" onClick={() => setMobileMenuOpen(false)} className="block text-white/80 hover:text-white hover:bg-white/10 transition-all font-medium py-3 px-4 rounded-xl">
              {t.login}
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
}