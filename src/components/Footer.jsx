import { Link } from 'react-router-dom';
import { Sparkles } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

const footerTranslations = {
  en: { howItWorks: 'How It Works', about: 'About', contact: 'Contact', footer: 'Made with ❤️ in Poland. Powered by Claude AI.' },
  pl: { howItWorks: 'Jak Działa', about: 'O Nas', contact: 'Kontakt', footer: 'Stworzone z ❤️ w Polsce.' },
  uk: { howItWorks: 'Як Працює', about: 'Про Нас', contact: 'Контакт', footer: 'Зроблено з ❤️ в Польщі.' },
  tr: { howItWorks: 'Nasıl Çalışır', about: 'Hakkımızda', contact: 'İletişim', footer: 'Polonya\'da ❤️ ile yapıldı.' },
  ru: { howItWorks: 'Как Работает', about: 'О Нас', contact: 'Контакт', footer: 'Сделано с ❤️ в Польше.' }
};

export default function Footer() {
  const { lang } = useLanguage();
  const t = footerTranslations[lang];

  return (
    <footer className="relative z-10 bg-black/50 backdrop-blur-md border-t border-white/10 py-8 mt-16 md:mt-20">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <Link to="/" className="flex items-center gap-2 hover:scale-105 transition-transform">
            <Sparkles className="w-5 h-5 text-yellow-400" />
            <span className="text-white font-bold">VizaExpress</span>
          </Link>
          <div className="flex flex-wrap justify-center gap-6 text-sm">
            <Link to="/how-it-works" className="text-gray-400 hover:text-white hover:scale-105 transition-all">{t.howItWorks}</Link>
            <Link to="/faq" className="text-gray-400 hover:text-white hover:scale-105 transition-all">FAQ</Link>
            <Link to="/about" className="text-gray-400 hover:text-white hover:scale-105 transition-all">{t.about}</Link>
            <Link to="/contact" className="text-gray-400 hover:text-white hover:scale-105 transition-all">{t.contact}</Link>
          </div>
          <p className="text-gray-400 text-sm">© 2026 VizaExpress. {t.footer}</p>
        </div>
      </div>
    </footer>
  );
}