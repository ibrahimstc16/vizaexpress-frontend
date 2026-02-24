import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { CheckCircle, Clock, Shield, Sparkles, Zap, Star, Award, Users, Globe, ChevronDown, Menu, X } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

const translations = {
  en: {
    nav: { login: 'Login', getStarted: 'Get Started', howItWorks: 'How It Works', pricing: 'Pricing', about: 'About', contact: 'Contact' },
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
  pl: {
    nav: { login: 'Zaloguj', getStarted: 'Rozpocznij', howItWorks: 'Jak Działa', pricing: 'Cennik', about: 'O Nas', contact: 'Kontakt' },
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
    nav: { login: 'Увійти', getStarted: 'Почати', howItWorks: 'Як Працює', pricing: 'Ціни', about: 'Про Нас', contact: 'Контакт' },
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
  tr: {
    nav: { login: 'Giriş', getStarted: 'Başla', howItWorks: 'Nasıl Çalışır', pricing: 'Fiyatlar', about: 'Hakkımızda', contact: 'İletişim' },
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
  ru: {
    nav: { login: 'Войти', getStarted: 'Начать', howItWorks: 'Как Работает', pricing: 'Цены', about: 'О Нас', contact: 'Контакт' },
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
  { text: "Otrzymałam Kartę Pobytu w 9 miesięcy. AI wykrył 3 krytyczne błędy! Warto każdej złotówki! 🎉", name: "Maria K.", city: "Warszawa", flag: "🇵🇱", color: "from-blue-600/10 to-purple-600/10" },
  { text: "Нарешті отримала карту побиту після 10 місяців! VizaExpress AI допоміг уникнути повторної подачі. 🙏", name: "Олена Б.", city: "Краків", flag: "🇺🇦", color: "from-purple-600/10 to-pink-600/10" },
  { text: "AI belge kontrolü inanılmaz! Fotoğraf boyutu hatasını hemen fark etti. 8 ayda oturma iznimi aldım! 🎊", name: "Mehmet Y.", city: "Gdańsk", flag: "🇹🇷", color: "from-pink-600/10 to-red-600/10" },
  { text: "Best €300 I ever spent. Smart package support answered all my questions. 11 months but stress-free! 🙌", name: "John D.", city: "Wrocław", flag: "🇺🇸", color: "from-cyan-600/10 to-blue-600/10" },
  { text: "Получил карту побыту за 9 месяцев. AI проверка спасла от переподачи. Отличный сервис! 👏", name: "Дмитрий К.", city: "Познань", flag: "🇷🇺", color: "from-yellow-600/10 to-orange-600/10" },
  { text: "Finally got approved after 10 months! Dashboard tracking was amazing. Highly recommend! 🎉", name: "Priya S.", city: "Łódź", flag: "🇮🇳", color: "from-green-600/10 to-teal-600/10" }
];

const languages = [
  { code: 'en', name: 'English', flag: '🇬🇧' },
  { code: 'pl', name: 'Polski', flag: '🇵🇱' },
  { code: 'uk', name: 'Українська', flag: '🇺🇦' },
  { code: 'tr', name: 'Türkçe', flag: '🇹🇷' },
  { code: 'ru', name: 'Русский', flag: '🇷🇺' }
];

export default function Landing() {
  const navigate = useNavigate();
  const { lang, setLang } = useLanguage();
  const [langOpen, setLangOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const t = translations[lang];
  const currentLang = languages.find(l => l.code === lang);

  // Giriş yapmış kullanıcıyı dashboard'a yönlendir
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      navigate('/dashboard');
    }
  }, [navigate]);
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 relative overflow-hidden">
      {/* Animated background */}
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
            <Link to="/how-it-works" className="text-white/80 hover:text-white transition-colors font-medium">
              {t.nav.howItWorks}
            </Link>
            <a href="#pricing" className="text-white/80 hover:text-white transition-colors font-medium">
              {t.nav.pricing}
            </a>
            <Link to="/faq" className="text-white/80 hover:text-white transition-colors font-medium">
              FAQ
            </Link>
            <Link to="/about" className="text-white/80 hover:text-white transition-colors font-medium">
              {t.nav.about}
            </Link>
            <Link to="/contact" className="text-white/80 hover:text-white transition-colors font-medium">
              {t.nav.contact}
            </Link>
          </div>

          <div className="flex items-center gap-3">
            {/* Language Switcher */}
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
                            : 'text-gray-200 hover:bg-white/10 hover:text-white'
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

            {/* Mobile Menu Button */}
            <button 
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden text-white p-2 hover:bg-white/10 rounded-lg transition-colors"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>

            <Link to="/login" className="hidden sm:block text-white/90 hover:text-white transition-colors font-medium">
              {t.nav.login}
            </Link>
            <Link to="/register" className="px-4 sm:px-6 py-2 rounded-full bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 text-white font-semibold hover:scale-105 transition-transform text-sm sm:text-base">
              {t.nav.getStarted} →
            </Link>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="lg:hidden bg-slate-900/95 backdrop-blur-xl border-t border-white/10">
            <div className="px-4 py-6 space-y-1">
              <Link to="/how-it-works" onClick={() => setMobileMenuOpen(false)} className="block text-white/80 hover:text-white hover:bg-white/10 transition-all font-medium py-3 px-4 rounded-xl">
                {t.nav.howItWorks}
              </Link>
              <a href="#pricing" onClick={() => setMobileMenuOpen(false)} className="block text-white/80 hover:text-white hover:bg-white/10 transition-all font-medium py-3 px-4 rounded-xl">
                {t.nav.pricing}
              </a>
              <Link to="/faq" onClick={() => setMobileMenuOpen(false)} className="block text-white/80 hover:text-white hover:bg-white/10 transition-all font-medium py-3 px-4 rounded-xl">
                FAQ
              </Link>
              <Link to="/about" onClick={() => setMobileMenuOpen(false)} className="block text-white/80 hover:text-white hover:bg-white/10 transition-all font-medium py-3 px-4 rounded-xl">
                {t.nav.about}
              </Link>
              <Link to="/contact" onClick={() => setMobileMenuOpen(false)} className="block text-white/80 hover:text-white hover:bg-white/10 transition-all font-medium py-3 px-4 rounded-xl">
                {t.nav.contact}
              </Link>
              <div className="border-t border-white/10 my-4"></div>
              <Link to="/login" onClick={() => setMobileMenuOpen(false)} className="block text-white/80 hover:text-white hover:bg-white/10 transition-all font-medium py-3 px-4 rounded-xl">
                {t.nav.login}
              </Link>
            </div>
          </div>
        )}
      </nav>

      {/* Hero */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 py-16 md:py-20 text-center">
        <div className="inline-block mb-6 px-6 py-3 bg-gradient-to-r from-blue-600/20 to-purple-600/20 backdrop-blur-sm rounded-full border border-white/20 text-white text-sm font-semibold">
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
          <Link to="/register" className="group px-8 py-4 rounded-full bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 text-white text-lg font-bold hover:scale-110 hover:shadow-2xl hover:shadow-purple-500/50 transition-all flex items-center justify-center gap-2">
            {t.nav.getStarted}
            <Zap className="w-5 h-5 group-hover:rotate-12 transition-transform" />
          </Link>
          <a href="#pricing" className="px-8 py-4 rounded-full border-2 border-white/30 text-white text-lg font-semibold hover:bg-white/10 transition-all">
            {t.nav.pricing}
          </a>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 mb-20">
          {[
            { icon: Users, value: '127+', label: t.stats.clients, color: 'text-blue-400' },
            { icon: Star, value: '95%', label: t.stats.success, color: 'text-purple-400' },
            { icon: Clock, value: '48h', label: t.stats.response, color: 'text-pink-400' },
            { icon: Award, value: '4.9/5', label: t.stats.rating, color: 'text-yellow-400' },
          ].map((stat, i) => (
            <div key={i} className="group bg-white/10 backdrop-blur-md p-4 md:p-6 rounded-2xl border border-white/20 hover:bg-white/20 hover:scale-105 transition-all cursor-pointer">
              <stat.icon className={`w-8 h-8 md:w-10 md:h-10 mx-auto mb-2 md:mb-3 ${stat.color} group-hover:scale-110 transition-transform`} />
              <div className={`text-2xl md:text-4xl font-bold ${stat.color} mb-1`}>{stat.value}</div>
              <div className="text-gray-300 text-xs md:text-sm">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Features */}
        <div className="grid md:grid-cols-3 gap-6 md:gap-8 mb-20">
          {[
            { icon: Clock, title: t.features.t1, desc: t.features.d1, color: 'from-blue-500 to-cyan-500' },
            { icon: CheckCircle, title: t.features.t2, desc: t.features.d2, color: 'from-purple-500 to-pink-500' },
            { icon: Shield, title: t.features.t3, desc: t.features.d3, color: 'from-pink-500 to-red-500' },
          ].map((feature, i) => (
            <div key={i} className="group relative bg-white/10 backdrop-blur-md p-6 md:p-8 rounded-3xl border border-white/20 hover:border-white/40 transition-all duration-500 hover:-translate-y-4 hover:shadow-2xl cursor-pointer">
              <div className={`relative bg-gradient-to-br ${feature.color} w-14 h-14 md:w-16 md:h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 md:mb-6 group-hover:rotate-12 group-hover:scale-110 transition-all duration-300`}>
                <feature.icon className="w-7 h-7 md:w-8 md:h-8 text-white" />
              </div>
              <h3 className="text-lg md:text-xl font-bold text-white mb-2 md:mb-3">{feature.title}</h3>
              <p className="text-gray-300 text-sm md:text-base">{feature.desc}</p>
            </div>
          ))}
        </div>

        {/* Pricing */}
        <div id="pricing" className="mt-20 md:mt-32 scroll-mt-20">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">{t.pricing.title}</h2>
          <p className="text-gray-300 mb-12 md:mb-16 text-base md:text-lg">{t.pricing.subtitle}</p>
          
          <div className="grid md:grid-cols-3 gap-6 md:gap-8">
            {/* Express */}
            <div className="relative bg-white/10 backdrop-blur-md p-6 md:p-8 rounded-3xl border border-white/20 hover:border-blue-400/50 transition-all duration-300 hover:-translate-y-2 group">
              <h3 className="text-xl md:text-2xl font-bold text-white mb-4">Express</h3>
              <p className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent mb-6">
                599 <span className="text-xl md:text-2xl">PLN</span>
              </p>
              <ul className="text-left space-y-3 md:space-y-4 mb-6 md:mb-8">
                {t.pricing.express.map((item, i) => (
                  <li key={i} className="flex items-center gap-3 text-gray-300 text-sm md:text-base">
                    <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
              <Link to="/register" className="block bg-gradient-to-r from-blue-600 to-cyan-600 text-white py-3 rounded-xl hover:shadow-2xl hover:shadow-blue-500/50 hover:scale-105 transition-all font-semibold text-center">
                {t.pricing.btn}
              </Link>
            </div>

            {/* Smart */}
            <div className="relative bg-gradient-to-br from-purple-600 to-pink-600 p-6 md:p-8 rounded-3xl md:scale-105 hover:scale-105 md:hover:scale-110 transition-all duration-300 shadow-2xl shadow-purple-500/50">
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-yellow-400 to-orange-400 text-gray-900 px-4 md:px-6 py-2 rounded-full text-xs md:text-sm font-bold shadow-lg animate-pulse">
                {t.pricing.popular}
              </div>
              <h3 className="text-xl md:text-2xl font-bold text-white mb-4 mt-2">Smart</h3>
              <p className="text-4xl md:text-6xl font-bold text-white mb-6">
                1,299 <span className="text-xl md:text-2xl">PLN</span>
              </p>
              <ul className="text-left space-y-3 md:space-y-4 mb-6 md:mb-8">
                {t.pricing.smart.map((item, i) => (
                  <li key={i} className="flex items-center gap-3 text-white text-sm md:text-base">
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
            <div className="relative bg-white/10 backdrop-blur-md p-6 md:p-8 rounded-3xl border border-white/20 hover:border-pink-400/50 transition-all duration-300 hover:-translate-y-2 group">
              <h3 className="text-xl md:text-2xl font-bold text-white mb-4">Concierge</h3>
              <p className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-pink-400 to-red-400 bg-clip-text text-transparent mb-6">
                2,499 <span className="text-xl md:text-2xl">PLN</span>
              </p>
              <ul className="text-left space-y-3 md:space-y-4 mb-6 md:mb-8">
                {t.pricing.concierge.map((item, i) => (
                  <li key={i} className="flex items-center gap-3 text-gray-300 text-sm md:text-base">
                    <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
              <Link to="/register" className="block bg-gradient-to-r from-pink-600 to-red-600 text-white py-3 rounded-xl hover:shadow-2xl hover:shadow-pink-500/50 hover:scale-105 transition-all font-semibold text-center">
                {t.pricing.btn}
              </Link>
            </div>
          </div>
        </div>

        {/* Testimonials */}
        <div className="mt-20 md:mt-32">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-8 md:mb-12">{t.testimonials.title}</h2>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            {testimonials.map((review, i) => (
              <div key={i} className="relative bg-white/10 backdrop-blur-md rounded-2xl p-6 md:p-8 border border-white/20 hover:scale-105 transition-all">
                <div className={`absolute inset-0 bg-gradient-to-r ${review.color} blur-2xl rounded-2xl opacity-50`}></div>
                <div className="relative flex items-center justify-center gap-1 mb-4">
                  {[...Array(5)].map((_, j) => (
                    <Star key={j} className="w-5 h-5 md:w-6 md:h-6 text-yellow-400 fill-yellow-400" />
                  ))}
                </div>
                <p className="relative text-base md:text-lg text-white italic mb-4">"{review.text}"</p>
                <p className="relative text-gray-300 font-semibold">- {review.name}, {review.city} {review.flag}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="relative z-10 bg-black/50 backdrop-blur-md border-t border-white/10 py-8 mt-16 md:mt-20">
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