import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { CheckCircle, Clock, Shield, Sparkles, Zap, Star, Award, Users, Globe, ChevronDown, Menu, X, LogOut } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

const translations = {
  en: {
    nav: { login: 'Login', getStarted: 'Get Started', howItWorks: 'How It Works', pricing: 'Pricing', about: 'About', contact: 'Contact', dashboard: 'Dashboard', logout: 'Logout' },
    hero: {
      badge: 'AI-Powered • 48-Hour Guarantee • 95% Success Rate',
      title1: 'Get Your',
      title2: 'Karta Pobytu',
      title3: 'Faster',
      subtitle: 'AI-powered document validation powered by Claude. Cut your processing time in half. 95% accuracy guaranteed.'
    },
    stats: { clients: 'Happy Clients', success: 'Success Rate', response: 'Avg Response', rating: 'Rating' },
    features: {
      t1: '48-Hour Review', d1: 'AI validates your documents in minutes, not weeks',
      t2: '95% Accuracy', d2: 'Claude AI catches errors before submission',
      t3: 'Secure & Private', d3: 'Your documents are encrypted and protected'
    },
    pricing: {
      title: 'Simple Pricing', subtitle: 'Choose the perfect plan for your needs',
      express: ['AI Document Check', '48h Feedback', 'Dashboard Access'],
      smart: ['Everything in Express', 'Priority Support', 'Form Assistance'],
      concierge: ['Everything in Smart', 'Full Concierge', 'Urząd Appointment'],
      btn: 'Choose Plan', popular: '🔥 MOST POPULAR'
    },
    testimonials: { title: 'What Our Clients Say' },
    footer: 'Made with ❤️ in Poland. Powered by Claude AI.'
  },
  tr: {
    nav: { login: 'Giriş', getStarted: 'Başla', howItWorks: 'Nasıl Çalışır', pricing: 'Fiyatlar', about: 'Hakkımızda', contact: 'İletişim', dashboard: 'Panel', logout: 'Çıkış' },
    hero: {
      badge: 'AI Destekli • 48 Saat Garanti • %95 Başarı',
      title1: '',
      title2: 'Karta Pobytu',
      title3: 'Hızlıca Alın',
      subtitle: 'Claude AI ile belge doğrulama. Sürenizi yarıya indirin. %95 doğruluk garantisi.'
    },
    stats: { clients: 'Mutlu Müşteri', success: 'Başarı', response: 'Ort. Süre', rating: 'Puan' },
    features: {
      t1: '48 Saat İnceleme', d1: 'AI belgelerinizi dakikalar içinde doğrular',
      t2: '%95 Doğruluk', d2: 'AI hataları önceden yakalar',
      t3: 'Güvenli', d3: 'Belgeleriniz şifrelenmiştir'
    },
    pricing: {
      title: 'Basit Fiyatlandırma', subtitle: 'Size uygun planı seçin',
      express: ['AI Kontrol', '48s Geri Bildirim', 'Panel Erişimi'],
      smart: ['Express\'teki Her Şey', 'Öncelikli Destek', 'Form Yardımı'],
      concierge: ['Smart\'taki Her Şey', 'Tam Hizmet', 'Urząd Randevusu'],
      btn: 'Seç', popular: '🔥 EN POPÜLER'
    },
    testimonials: { title: 'Müşteri Yorumları' },
    footer: 'Polonya\'da ❤️ ile yapıldı.'
  },
  pl: {
    nav: { login: 'Zaloguj', getStarted: 'Rozpocznij', howItWorks: 'Jak Działa', pricing: 'Cennik', about: 'O Nas', contact: 'Kontakt', dashboard: 'Panel', logout: 'Wyloguj' },
    hero: {
      badge: 'AI • Gwarancja 48h • 95% Sukcesu',
      title1: 'Otrzymaj',
      title2: 'Kartę Pobytu',
      title3: 'Szybciej',
      subtitle: 'Walidacja dokumentów AI przez Claude. Skróć czas o połowę. 95% dokładności.'
    },
    stats: { clients: 'Klientów', success: 'Sukces', response: 'Czas Odp.', rating: 'Ocena' },
    features: {
      t1: 'Przegląd 48h', d1: 'AI sprawdza dokumenty w minuty',
      t2: '95% Dokładności', d2: 'AI wykrywa błędy przed złożeniem',
      t3: 'Bezpieczeństwo', d3: 'Twoje dokumenty są zaszyfrowane'
    },
    pricing: {
      title: 'Prosty Cennik', subtitle: 'Wybierz idealny plan',
      express: ['Sprawdzenie AI', 'Feedback 48h', 'Panel Klienta'],
      smart: ['Wszystko z Express', 'Priorytetowe Wsparcie', 'Pomoc z Formularzami'],
      concierge: ['Wszystko z Smart', 'Pełna Obsługa', 'Wizyta w Urzędzie'],
      btn: 'Wybierz', popular: '🔥 NAJPOPULARNIEJSZY'
    },
    testimonials: { title: 'Opinie Klientów' },
    footer: 'Stworzone z ❤️ w Polsce.'
  },
  uk: {
    nav: { login: 'Увійти', getStarted: 'Почати', howItWorks: 'Як Працює', pricing: 'Ціни', about: 'Про Нас', contact: 'Контакт', dashboard: 'Панель', logout: 'Вийти' },
    hero: {
      badge: 'AI • Гарантія 48год • 95% Успіху',
      title1: 'Отримайте',
      title2: 'Карту Побиту',
      title3: 'Швидше',
      subtitle: 'AI перевірка документів через Claude. Скоротіть час вдвічі. 95% точності.'
    },
    stats: { clients: 'Клієнтів', success: 'Успіх', response: 'Час Відп.', rating: 'Рейтинг' },
    features: {
      t1: 'Перевірка 48год', d1: 'AI перевіряє документи за хвилини',
      t2: '95% Точності', d2: 'AI знаходить помилки',
      t3: 'Безпека', d3: 'Ваші документи зашифровані'
    },
    pricing: {
      title: 'Прості Ціни', subtitle: 'Оберіть ідеальний план',
      express: ['AI Перевірка', 'Відгук 48год', 'Панель'],
      smart: ['Все з Express', 'Пріоритетна Підтримка', 'Допомога'],
      concierge: ['Все з Smart', 'Повний Сервіс', 'Візит в Urząd'],
      btn: 'Обрати', popular: '🔥 НАЙПОПУЛЯРНІШИЙ'
    },
    testimonials: { title: 'Відгуки Клієнтів' },
    footer: 'Зроблено з ❤️ в Польщі.'
  },
  ru: {
    nav: { login: 'Войти', getStarted: 'Начать', howItWorks: 'Как Работает', pricing: 'Цены', about: 'О Нас', contact: 'Контакт', dashboard: 'Панель', logout: 'Выйти' },
    hero: {
      badge: 'AI • Гарантия 48ч • 95% Успеха',
      title1: 'Получите',
      title2: 'Карту Побыту',
      title3: 'Быстрее',
      subtitle: 'AI проверка документов через Claude. Сократите время вдвое. 95% точности.'
    },
    stats: { clients: 'Клиентов', success: 'Успех', response: 'Время Отв.', rating: 'Рейтинг' },
    features: {
      t1: 'Проверка 48ч', d1: 'AI проверяет документы за минуты',
      t2: '95% Точности', d2: 'AI находит ошибки',
      t3: 'Безопасность', d3: 'Ваши документы зашифрованы'
    },
    pricing: {
      title: 'Простые Цены', subtitle: 'Выберите идеальный план',
      express: ['AI Проверка', 'Отзыв 48ч', 'Панель'],
      smart: ['Все из Express', 'Приоритетная Поддержка', 'Помощь'],
      concierge: ['Все из Smart', 'Полный Сервис', 'Визит в Urząd'],
      btn: 'Выбрать', popular: '🔥 САМЫЙ ПОПУЛЯРНЫЙ'
    },
    testimonials: { title: 'Отзывы Клиентов' },
    footer: 'Сделано с ❤️ в Польше.'
  }
};

const testimonials = [
  { text: "Otrzymałam Kartę Pobytu w 9 miesięcy. AI wykrył 3 krytyczne błędy!", name: "Maria K.", city: "Warszawa", flag: "🇵🇱" },
  { text: "Нарешті отримала карту побиту після 10 місяців! VizaExpress допоміг!", name: "Олена Б.", city: "Краків", flag: "🇺🇦" },
  { text: "AI belge kontrolü inanılmaz! 8 ayda oturma iznimi aldım!", name: "Mehmet Y.", city: "Gdańsk", flag: "🇹🇷" },
  { text: "Best €300 I ever spent. 11 months but stress-free!", name: "John D.", city: "Wrocław", flag: "🇺🇸" },
  { text: "Получил карту побыту за 9 месяцев. Отличный сервис!", name: "Дмитрий К.", city: "Познань", flag: "🇷🇺" },
  { text: "Finally got approved after 10 months! Highly recommend!", name: "Priya S.", city: "Łódź", flag: "🇮🇳" }
];

const languages = [
  { code: 'en', name: 'English', flag: '🇬🇧' },
  { code: 'pl', name: 'Polski', flag: '🇵🇱' },
  { code: 'uk', name: 'Українська', flag: '🇺🇦' },
  { code: 'tr', name: 'Türkçe', flag: '🇹🇷' },
  { code: 'ru', name: 'Русский', flag: '🇷🇺' }
];

export default function Landing() {
  const { lang, setLang } = useLanguage();
  const [langOpen, setLangOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState(null);
  const t = translations[lang];
  const currentLang = languages.find(l => l.code === lang);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    if (token && userData) {
      setIsLoggedIn(true);
      try {
        setUser(JSON.parse(userData));
      } catch (e) {}
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setIsLoggedIn(false);
    setUser(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
        <div className="absolute top-40 right-10 w-72 h-72 bg-blue-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse" style={{animationDelay: '1s'}}></div>
        <div className="absolute -bottom-8 left-20 w-72 h-72 bg-pink-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse" style={{animationDelay: '2s'}}></div>
      </div>

      {/* Header */}
      <nav className="relative z-50 bg-white/10 backdrop-blur-md border-b border-white/20 sticky top-0">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <Link to="/" className="text-2xl font-bold text-white flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-yellow-400 animate-spin" style={{animationDuration: '3s'}} />
            VizaExpress
          </Link>

          {/* Desktop Menu */}
          <div className="hidden lg:flex items-center gap-6">
            <Link to="/how-it-works" className="text-white/80 hover:text-white transition-colors font-medium">{t.nav.howItWorks}</Link>
            <a href="#pricing" className="text-white/80 hover:text-white transition-colors font-medium">{t.nav.pricing}</a>
            <Link to="/faq" className="text-white/80 hover:text-white transition-colors font-medium">FAQ</Link>
            <Link to="/about" className="text-white/80 hover:text-white transition-colors font-medium">{t.nav.about}</Link>
            <Link to="/contact" className="text-white/80 hover:text-white transition-colors font-medium">{t.nav.contact}</Link>
          </div>

          <div className="flex items-center gap-3">
            {/* Language Switcher */}
            <div className="relative">
              <button 
                onClick={() => setLangOpen(!langOpen)}
                className="flex items-center gap-2 px-3 py-2 bg-purple-600/30 backdrop-blur-md rounded-xl border border-white/30 text-white hover:bg-purple-600/50 transition-all"
              >
                <Globe className="w-4 h-4" />
                <span className="hidden sm:inline">{currentLang?.flag} {currentLang?.code.toUpperCase()}</span>
                <span className="sm:hidden">{currentLang?.flag}</span>
                <ChevronDown className={`w-4 h-4 transition-transform ${langOpen ? 'rotate-180' : ''}`} />
              </button>
              {langOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-slate-800/95 backdrop-blur-xl rounded-xl shadow-xl border border-white/20 overflow-hidden z-50">
                  {languages.map((l) => (
                    <button
                      key={l.code}
                      onClick={() => { setLang(l.code); setLangOpen(false); }}
                      className={`w-full px-4 py-3 text-left flex items-center gap-3 transition-all ${lang === l.code ? 'bg-purple-600 text-white' : 'text-gray-200 hover:bg-white/10'}`}
                    >
                      <span className="text-xl">{l.flag}</span>
                      <span>{l.name}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Mobile Menu Button */}
            <button 
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden text-white p-2 hover:bg-white/10 rounded-lg"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>

            {/* Auth Buttons */}
            {isLoggedIn ? (
              <div className="flex items-center gap-2">
                <Link to="/dashboard" className="px-4 py-2 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold hover:scale-105 transition-transform text-sm">
                  {t.nav.dashboard} →
                </Link>
                <button 
                  onClick={handleLogout}
                  className="hidden sm:flex items-center gap-1 px-3 py-2 text-red-300 hover:text-red-200 hover:bg-red-500/20 rounded-lg transition-all"
                >
                  <LogOut className="w-4 h-4" />
                  {t.nav.logout}
                </button>
              </div>
            ) : (
              <>
                <Link to="/login" className="hidden sm:block text-white/90 hover:text-white transition-colors font-medium">
                  {t.nav.login}
                </Link>
                <Link to="/register" className="px-4 py-2 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold hover:scale-105 transition-transform text-sm">
                  {t.nav.getStarted} →
                </Link>
              </>
            )}
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="lg:hidden bg-slate-900/95 backdrop-blur-xl border-t border-white/10">
            <div className="px-4 py-4 space-y-2">
              <Link to="/how-it-works" onClick={() => setMobileMenuOpen(false)} className="block text-white/80 hover:text-white py-2">{t.nav.howItWorks}</Link>
              <a href="#pricing" onClick={() => setMobileMenuOpen(false)} className="block text-white/80 hover:text-white py-2">{t.nav.pricing}</a>
              <Link to="/faq" onClick={() => setMobileMenuOpen(false)} className="block text-white/80 hover:text-white py-2">FAQ</Link>
              <Link to="/about" onClick={() => setMobileMenuOpen(false)} className="block text-white/80 hover:text-white py-2">{t.nav.about}</Link>
              <Link to="/contact" onClick={() => setMobileMenuOpen(false)} className="block text-white/80 hover:text-white py-2">{t.nav.contact}</Link>
              {isLoggedIn ? (
                <>
                  <Link to="/dashboard" onClick={() => setMobileMenuOpen(false)} className="block text-purple-400 hover:text-purple-300 py-2">{t.nav.dashboard}</Link>
                  <button onClick={() => { handleLogout(); setMobileMenuOpen(false); }} className="block text-red-400 hover:text-red-300 py-2">{t.nav.logout}</button>
                </>
              ) : (
                <Link to="/login" onClick={() => setMobileMenuOpen(false)} className="block text-white/80 hover:text-white py-2">{t.nav.login}</Link>
              )}
            </div>
          </div>
        )}
      </nav>

      {/* Hero */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 py-16 text-center">
        <div className="inline-block mb-6 px-6 py-3 bg-purple-600/20 backdrop-blur-sm rounded-full border border-white/20 text-white text-sm font-semibold">
          <span className="flex items-center gap-2">
            <Zap className="w-4 h-4 text-yellow-400" />
            {t.hero.badge}
          </span>
        </div>
        
        <h1 className="text-4xl sm:text-5xl md:text-7xl font-extrabold text-white mb-6 leading-tight">
          {t.hero.title1}{' '}
          <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
            {t.hero.title2}
          </span>
          {' '}{t.hero.title3}
        </h1>
        
        <p className="text-lg md:text-xl text-gray-300 mb-10 max-w-3xl mx-auto">
          {t.hero.subtitle}
        </p>
        
        <div className="flex flex-col sm:flex-row justify-center gap-4 mb-16">
          <Link to={isLoggedIn ? "/dashboard" : "/register"} className="px-8 py-4 rounded-full bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 text-white text-lg font-bold hover:scale-110 hover:shadow-2xl hover:shadow-purple-500/50 transition-all flex items-center justify-center gap-2">
            {isLoggedIn ? t.nav.dashboard : t.nav.getStarted}
            <Zap className="w-5 h-5" />
          </Link>
          <a href="#pricing" className="px-8 py-4 rounded-full border-2 border-white/30 text-white text-lg font-semibold hover:bg-white/10 transition-all">
            {t.nav.pricing}
          </a>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-20">
          {[
            { icon: Users, value: '127+', label: t.stats.clients, color: 'text-blue-400' },
            { icon: Star, value: '95%', label: t.stats.success, color: 'text-purple-400' },
            { icon: Clock, value: '48h', label: t.stats.response, color: 'text-pink-400' },
            { icon: Award, value: '4.9/5', label: t.stats.rating, color: 'text-yellow-400' },
          ].map((stat, i) => (
            <div key={i} className="bg-white/10 backdrop-blur-md p-4 md:p-6 rounded-2xl border border-white/20 hover:bg-white/20 hover:scale-105 transition-all">
              <stat.icon className={`w-8 h-8 mx-auto mb-2 ${stat.color}`} />
              <div className={`text-2xl md:text-4xl font-bold ${stat.color} mb-1`}>{stat.value}</div>
              <div className="text-gray-300 text-xs md:text-sm">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Features */}
        <div className="grid md:grid-cols-3 gap-6 mb-20">
          {[
            { icon: Clock, title: t.features.t1, desc: t.features.d1, color: 'from-blue-500 to-cyan-500' },
            { icon: CheckCircle, title: t.features.t2, desc: t.features.d2, color: 'from-purple-500 to-pink-500' },
            { icon: Shield, title: t.features.t3, desc: t.features.d3, color: 'from-pink-500 to-red-500' },
          ].map((feature, i) => (
            <div key={i} className="bg-white/10 backdrop-blur-md p-6 rounded-3xl border border-white/20 hover:border-white/40 transition-all hover:-translate-y-2">
              <div className={`bg-gradient-to-br ${feature.color} w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4`}>
                <feature.icon className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">{feature.title}</h3>
              <p className="text-gray-300 text-sm">{feature.desc}</p>
            </div>
          ))}
        </div>

        {/* Pricing */}
        <div id="pricing" className="mt-20 scroll-mt-20">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">{t.pricing.title}</h2>
          <p className="text-gray-300 mb-12">{t.pricing.subtitle}</p>
          
          <div className="grid md:grid-cols-3 gap-6">
            {/* Express */}
            <div className="bg-white/10 backdrop-blur-md p-6 rounded-3xl border border-white/20 hover:border-blue-400/50 transition-all hover:-translate-y-2">
              <h3 className="text-xl font-bold text-white mb-4">Express</h3>
              <p className="text-4xl font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent mb-6">
                599 <span className="text-xl">PLN</span>
              </p>
              <ul className="text-left space-y-3 mb-6">
                {t.pricing.express.map((item, i) => (
                  <li key={i} className="flex items-center gap-3 text-gray-300 text-sm">
                    <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
              <Link to="/register" className="block bg-gradient-to-r from-blue-600 to-cyan-600 text-white py-3 rounded-xl hover:scale-105 transition-all font-semibold text-center">
                {t.pricing.btn}
              </Link>
            </div>

            {/* Smart */}
            <div className="bg-gradient-to-br from-purple-600 to-pink-600 p-6 rounded-3xl md:scale-105 transition-all shadow-2xl shadow-purple-500/50">
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-yellow-400 to-orange-400 text-gray-900 px-4 py-2 rounded-full text-xs font-bold">
                {t.pricing.popular}
              </div>
              <h3 className="text-xl font-bold text-white mb-4 mt-2">Smart</h3>
              <p className="text-4xl font-bold text-white mb-6">
                1,299 <span className="text-xl">PLN</span>
              </p>
              <ul className="text-left space-y-3 mb-6">
                {t.pricing.smart.map((item, i) => (
                  <li key={i} className="flex items-center gap-3 text-white text-sm">
                    <CheckCircle className="w-5 h-5 flex-shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
              <Link to="/register" className="block bg-white text-purple-600 py-3 rounded-xl hover:bg-gray-100 hover:scale-105 transition-all font-bold text-center">
                {t.pricing.btn} →
              </Link>
            </div>

            {/* Concierge */}
            <div className="bg-white/10 backdrop-blur-md p-6 rounded-3xl border border-white/20 hover:border-pink-400/50 transition-all hover:-translate-y-2">
              <h3 className="text-xl font-bold text-white mb-4">Concierge</h3>
              <p className="text-4xl font-bold bg-gradient-to-r from-pink-400 to-red-400 bg-clip-text text-transparent mb-6">
                2,499 <span className="text-xl">PLN</span>
              </p>
              <ul className="text-left space-y-3 mb-6">
                {t.pricing.concierge.map((item, i) => (
                  <li key={i} className="flex items-center gap-3 text-gray-300 text-sm">
                    <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
              <Link to="/register" className="block bg-gradient-to-r from-pink-600 to-red-600 text-white py-3 rounded-xl hover:scale-105 transition-all font-semibold text-center">
                {t.pricing.btn}
              </Link>
            </div>
          </div>
        </div>

        {/* Testimonials */}
        <div className="mt-20">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-8">{t.testimonials.title}</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {testimonials.map((review, i) => (
              <div key={i} className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20 hover:scale-105 transition-all">
                <div className="flex items-center justify-center gap-1 mb-4">
                  {[...Array(5)].map((_, j) => (
                    <Star key={j} className="w-5 h-5 text-yellow-400 fill-yellow-400" />
                  ))}
                </div>
                <p className="text-white italic mb-4">"{review.text}"</p>
                <p className="text-gray-300 font-semibold">- {review.name}, {review.city} {review.flag}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="relative z-10 bg-black/50 backdrop-blur-md border-t border-white/10 py-8 mt-16">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-yellow-400" />
              <span className="text-white font-bold">VizaExpress</span>
            </div>
            <div className="flex flex-wrap justify-center gap-6 text-sm">
              <Link to="/how-it-works" className="text-gray-400 hover:text-white transition-colors">{t.nav.howItWorks}</Link>
              <Link to="/faq" className="text-gray-400 hover:text-white transition-colors">FAQ</Link>
              <Link to="/about" className="text-gray-400 hover:text-white transition-colors">{t.nav.about}</Link>
              <Link to="/contact" className="text-gray-400 hover:text-white transition-colors">{t.nav.contact}</Link>
            </div>
            <p className="text-gray-400 text-sm">© 2026 VizaExpress. {t.footer}</p>
          </div>
        </div>
      </footer>
    </div>
  );
}