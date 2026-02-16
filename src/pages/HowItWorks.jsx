import { Link } from 'react-router-dom';
import { CheckCircle, Upload, Cpu, FileCheck, ArrowRight, Zap, UserPlus } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const translations = {
  en: {
    hero: { title: 'How It', highlight: 'Works', subtitle: 'Get your Karta Pobytu faster with our simple 4-step process' },
    steps: [
      { title: 'Create Account', desc: 'Sign up in 30 seconds with your email. No credit card required.' },
      { title: 'Upload Documents', desc: 'Upload your passport, photos, and other required documents securely.' },
      { title: 'AI Validation', desc: 'Claude AI analyzes your documents, checking for 50+ common errors.' },
      { title: 'Get Results', desc: 'Receive detailed feedback within 48 hours with recommendations.' }
    ],
    features: {
      title: 'Why Choose AI Validation?',
      items: [
        { title: '50+ Error Checks', desc: 'Our AI checks photo dimensions, document expiry, signatures, and more' },
        { title: 'Real-time Feedback', desc: 'Get instant preliminary results as you upload each document' },
        { title: 'Expert Review', desc: 'Smart and Concierge plans include human expert verification' },
        { title: 'Resubmission Prevention', desc: 'Avoid the #1 cause of delays - incorrect documentation' }
      ]
    },
    cta: { title: 'Ready to Start?', btn: 'Begin Your Application' }
  },
  pl: {
    hero: { title: 'Jak to', highlight: 'Działa', subtitle: 'Uzyskaj Kartę Pobytu szybciej w 4 krokach' },
    steps: [
      { title: 'Załóż Konto', desc: 'Rejestracja w 30 sekund. Bez karty kredytowej.' },
      { title: 'Prześlij Dokumenty', desc: 'Prześlij paszport, zdjęcia i inne dokumenty.' },
      { title: 'Walidacja AI', desc: 'AI Claude sprawdza 50+ typowych błędów.' },
      { title: 'Otrzymaj Wyniki', desc: 'Szczegółowy feedback w ciągu 48 godzin.' }
    ],
    features: {
      title: 'Dlaczego AI?',
      items: [
        { title: '50+ Kontroli', desc: 'AI sprawdza wymiary zdjęć, ważność i więcej' },
        { title: 'Feedback Natychmiast', desc: 'Natychmiastowe wyniki' },
        { title: 'Ekspert', desc: 'Smart i Concierge zawierają weryfikację eksperta' },
        { title: 'Bez Odrzuceń', desc: 'Unikaj głównej przyczyny opóźnień' }
      ]
    },
    cta: { title: 'Gotowy?', btn: 'Rozpocznij' }
  },
  uk: {
    hero: { title: 'Як це', highlight: 'Працює', subtitle: 'Отримайте Карту Побиту швидше за 4 кроки' },
    steps: [
      { title: 'Створіть Акаунт', desc: 'Реєстрація за 30 секунд. Без картки.' },
      { title: 'Завантажте Документи', desc: 'Завантажте паспорт, фото та інші документи.' },
      { title: 'AI Перевірка', desc: 'AI Claude перевіряє 50+ помилок.' },
      { title: 'Отримайте Результати', desc: 'Детальний відгук протягом 48 годин.' }
    ],
    features: {
      title: 'Чому AI?',
      items: [
        { title: '50+ Перевірок', desc: 'AI перевіряє розміри фото, термін дії' },
        { title: 'Миттєвий Відгук', desc: 'Миттєві результати' },
        { title: 'Експерт', desc: 'Smart і Concierge включають експерта' },
        { title: 'Без Відмов', desc: 'Уникайте затримок' }
      ]
    },
    cta: { title: 'Готові?', btn: 'Почати' }
  },
  tr: {
    hero: { title: 'Nasıl', highlight: 'Çalışır', subtitle: '4 adımda Karta Pobytu alın' },
    steps: [
      { title: 'Hesap Oluştur', desc: '30 saniyede kayıt. Kredi kartı gerekmez.' },
      { title: 'Belge Yükle', desc: 'Pasaport, fotoğraf ve diğer belgeleri yükleyin.' },
      { title: 'AI Doğrulama', desc: 'Claude AI 50+ hata kontrol eder.' },
      { title: 'Sonuçları Al', desc: '48 saat içinde detaylı geri bildirim.' }
    ],
    features: {
      title: 'Neden AI?',
      items: [
        { title: '50+ Kontrol', desc: 'AI fotoğraf boyutlarını, geçerliliği kontrol eder' },
        { title: 'Anlık Geri Bildirim', desc: 'Anlık sonuçlar' },
        { title: 'Uzman', desc: 'Smart ve Concierge uzman içerir' },
        { title: 'Red Yok', desc: 'Gecikmeleri önleyin' }
      ]
    },
    cta: { title: 'Hazır mısınız?', btn: 'Başla' }
  },
  ru: {
    hero: { title: 'Как это', highlight: 'Работает', subtitle: 'Получите Карту Побыту быстрее за 4 шага' },
    steps: [
      { title: 'Создайте Аккаунт', desc: 'Регистрация за 30 секунд. Без карты.' },
      { title: 'Загрузите Документы', desc: 'Загрузите паспорт, фото и другие документы.' },
      { title: 'AI Проверка', desc: 'AI Claude проверяет 50+ ошибок.' },
      { title: 'Получите Результаты', desc: 'Детальный отзыв в течение 48 часов.' }
    ],
    features: {
      title: 'Почему AI?',
      items: [
        { title: '50+ Проверок', desc: 'AI проверяет размеры фото, срок действия' },
        { title: 'Мгновенный Отзыв', desc: 'Мгновенные результаты' },
        { title: 'Эксперт', desc: 'Smart и Concierge включают эксперта' },
        { title: 'Без Отказов', desc: 'Избегайте задержек' }
      ]
    },
    cta: { title: 'Готовы?', btn: 'Начать' }
  }
};

const stepIcons = [UserPlus, Upload, Cpu, FileCheck];
const stepColors = ['from-blue-500 to-cyan-500', 'from-purple-500 to-pink-500', 'from-pink-500 to-red-500', 'from-green-500 to-emerald-500'];

export default function HowItWorks() {
  const { lang } = useLanguage();
  const t = translations[lang];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 relative overflow-hidden">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-96 h-96 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse"></div>
        <div className="absolute top-40 right-10 w-96 h-96 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse" style={{animationDelay: '1s'}}></div>
        <div className="absolute bottom-20 left-1/2 w-96 h-96 bg-pink-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse" style={{animationDelay: '2s'}}></div>
      </div>

      <Navbar />

      <div className="relative z-10 max-w-6xl mx-auto px-4 py-16">
        <div className="text-center mb-20">
          <div className="inline-block p-4 bg-gradient-to-br from-yellow-500/20 to-orange-500/20 rounded-full mb-6 hover:scale-110 transition-transform">
            <Zap className="w-16 h-16 text-yellow-400" />
          </div>
          <h1 className="text-5xl md:text-6xl font-extrabold text-white mb-4">
            {t.hero.title}{' '}
            <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
              {t.hero.highlight}
            </span>
          </h1>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">{t.hero.subtitle}</p>
        </div>

        <div className="grid md:grid-cols-4 gap-8 mb-20">
          {t.steps.map((step, i) => {
            const Icon = stepIcons[i];
            return (
              <div key={i} className="relative text-center group">
                {i < 3 && (
                  <div className="hidden md:block absolute top-16 left-1/2 w-full h-1 bg-gradient-to-r from-purple-500/50 to-pink-500/50"></div>
                )}
                
                <div className={`relative z-10 bg-gradient-to-br ${stepColors[i]} w-32 h-32 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 group-hover:rotate-6 transition-all duration-500 shadow-2xl shadow-purple-500/30 cursor-pointer`}>
                  <Icon className="w-14 h-14 text-white" />
                </div>
                
                <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20 group-hover:bg-white/15 group-hover:border-purple-400/50 group-hover:-translate-y-2 hover:shadow-xl hover:shadow-purple-500/20 transition-all duration-500 cursor-pointer">
                  <span className="text-5xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent mb-2 block">0{i + 1}</span>
                  <h3 className="text-xl font-bold text-white mb-3 group-hover:text-purple-300 transition-colors">{step.title}</h3>
                  <p className="text-gray-300 text-sm group-hover:text-gray-200 transition-colors">{step.desc}</p>
                </div>
              </div>
            );
          })}
        </div>

        <div className="mb-20">
          <h2 className="text-3xl font-bold text-white mb-8 text-center">{t.features.title}</h2>
          <div className="grid md:grid-cols-2 gap-6">
            {t.features.items.map((item, i) => (
              <div 
                key={i} 
                className="group bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20 flex items-start gap-4 hover:bg-white/15 hover:scale-105 hover:border-purple-400/50 hover:shadow-xl hover:shadow-purple-500/20 transition-all duration-300 cursor-pointer"
              >
                <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-r from-green-400 to-emerald-500 rounded-xl flex items-center justify-center group-hover:rotate-12 transition-transform duration-300 shadow-lg">
                  <CheckCircle className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white mb-2 group-hover:text-purple-300 transition-colors">{item.title}</h3>
                  <p className="text-gray-300 group-hover:text-gray-200 transition-colors">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-3xl p-12 text-center hover:shadow-2xl hover:shadow-purple-500/30 transition-all duration-500 group cursor-pointer">
          <h2 className="text-3xl font-bold text-white mb-6">{t.cta.title}</h2>
          <Link to="/register" className="inline-flex items-center gap-2 px-8 py-4 bg-white text-purple-600 rounded-full font-bold text-lg hover:scale-110 hover:shadow-xl transition-all">
            {t.cta.btn} <ArrowRight className="w-5 h-5 group-hover:translate-x-2 transition-transform" />
          </Link>
        </div>
      </div>

      <Footer />
    </div>
  );
}