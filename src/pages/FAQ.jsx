import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronDown, HelpCircle, MessageCircle } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const translations = {
  en: {
    hero: { title: 'Frequently Asked', highlight: 'Questions' },
    faqs: [
      { q: 'What is VizaExpress?', a: 'VizaExpress is an AI-powered platform that helps expats in Poland validate their documents before submitting Karta Pobytu applications.' },
      { q: 'How does AI document validation work?', a: 'You upload your documents and our Claude AI analyzes them in real-time, checking for common errors like wrong photo dimensions, missing signatures, and expired documents.' },
      { q: 'How long does the Karta Pobytu process take?', a: 'The official process typically takes 6-18 months. VizaExpress helps reduce delays by ensuring your documents are correct the first time.' },
      { q: 'What documents do I need?', a: 'Common requirements include: valid passport, biometric photos, proof of health insurance, proof of accommodation, and work contract.' },
      { q: 'Is my data secure?', a: 'Yes! All documents are encrypted. We never share your data with third parties.' },
      { q: 'What is the difference between packages?', a: 'Express (599 PLN): AI check + 48h feedback. Smart (1,299 PLN): + priority support. Concierge (2,499 PLN): Full service including appointment booking.' },
      { q: 'Can I get a refund?', a: 'Yes, full refund within 7 days if you have not used the service.' },
      { q: 'Do you guarantee approval?', a: 'We cannot guarantee approval, but our 95% accuracy rate significantly reduces rejection risk.' }
    ],
    cta: { title: 'Still have questions?', btn: 'Contact Us' }
  },
  pl: {
    hero: { title: 'Często Zadawane', highlight: 'Pytania' },
    faqs: [
      { q: 'Czym jest VizaExpress?', a: 'VizaExpress to platforma AI do sprawdzania dokumentów przed złożeniem wniosku o Kartę Pobytu.' },
      { q: 'Jak działa walidacja AI?', a: 'Przesyłasz dokumenty, a AI Claude analizuje je w czasie rzeczywistym.' },
      { q: 'Ile trwa proces?', a: 'Oficjalny proces trwa 6-18 miesięcy. VizaExpress pomaga uniknąć opóźnień.' },
      { q: 'Jakie dokumenty potrzebuję?', a: 'Paszport, zdjęcia, ubezpieczenie, potwierdzenie zamieszkania, umowa o pracę.' },
      { q: 'Czy moje dane są bezpieczne?', a: 'Tak! Wszystkie dokumenty są szyfrowane.' },
      { q: 'Jaka jest różnica między pakietami?', a: 'Express: AI. Smart: + priorytet. Concierge: pełna obsługa.' },
      { q: 'Czy mogę otrzymać zwrot?', a: 'Tak, pełny zwrot w ciągu 7 dni.' },
      { q: 'Czy gwarantujecie pozytywną decyzję?', a: '95% dokładność znacznie zmniejsza ryzyko odmowy.' }
    ],
    cta: { title: 'Masz pytania?', btn: 'Kontakt' }
  },
  uk: {
    hero: { title: 'Часті', highlight: 'Питання' },
    faqs: [
      { q: 'Що таке VizaExpress?', a: 'VizaExpress - це AI платформа для перевірки документів.' },
      { q: 'Як працює AI перевірка?', a: 'Ви завантажуєте документи, AI Claude аналізує їх.' },
      { q: 'Скільки триває процес?', a: 'Офіційний процес триває 6-18 місяців.' },
      { q: 'Які документи потрібні?', a: 'Паспорт, фото, страховка, підтвердження проживання.' },
      { q: 'Чи безпечні мої дані?', a: 'Так! Всі документи зашифровані.' },
      { q: 'Яка різниця між пакетами?', a: 'Express: AI. Smart: + пріоритет. Concierge: повний сервіс.' },
      { q: 'Чи можу отримати повернення?', a: 'Так, протягом 7 днів.' },
      { q: 'Чи гарантуєте схвалення?', a: '95% точність зменшує ризик відмови.' }
    ],
    cta: { title: 'Є питання?', btn: 'Контакт' }
  },
  tr: {
    hero: { title: 'Sık Sorulan', highlight: 'Sorular' },
    faqs: [
      { q: 'VizaExpress nedir?', a: 'VizaExpress, Karta Pobytu başvurusu öncesi belge kontrolü yapan AI platformudur.' },
      { q: 'AI doğrulama nasıl çalışır?', a: 'Belgelerinizi yüklersiniz, Claude AI analiz eder.' },
      { q: 'Süreç ne kadar sürer?', a: 'Resmi süreç 6-18 ay sürer.' },
      { q: 'Hangi belgeler gerekli?', a: 'Pasaport, fotoğraf, sigorta, ikamet belgesi, iş sözleşmesi.' },
      { q: 'Verilerim güvende mi?', a: 'Evet! Tüm belgeler şifrelenir.' },
      { q: 'Paketler arasındaki fark nedir?', a: 'Express: AI. Smart: + öncelik. Concierge: tam hizmet.' },
      { q: 'İade alabilir miyim?', a: 'Evet, 7 gün içinde tam iade.' },
      { q: 'Onay garantisi var mı?', a: '%95 doğruluk red riskini azaltır.' }
    ],
    cta: { title: 'Sorunuz mu var?', btn: 'İletişim' }
  },
  ru: {
    hero: { title: 'Часто Задаваемые', highlight: 'Вопросы' },
    faqs: [
      { q: 'Что такое VizaExpress?', a: 'VizaExpress - это AI платформа для проверки документов.' },
      { q: 'Как работает AI проверка?', a: 'Вы загружаете документы, AI Claude анализирует их.' },
      { q: 'Сколько длится процесс?', a: 'Официальный процесс длится 6-18 месяцев.' },
      { q: 'Какие документы нужны?', a: 'Паспорт, фото, страховка, подтверждение проживания.' },
      { q: 'Безопасны ли мои данные?', a: 'Да! Все документы зашифрованы.' },
      { q: 'Какая разница между пакетами?', a: 'Express: AI. Smart: + приоритет. Concierge: полный сервис.' },
      { q: 'Могу ли получить возврат?', a: 'Да, в течение 7 дней.' },
      { q: 'Гарантируете ли одобрение?', a: '95% точность снижает риск отказа.' }
    ],
    cta: { title: 'Есть вопросы?', btn: 'Контакт' }
  }
};

export default function FAQ() {
  const { lang } = useLanguage();
  const [openFaq, setOpenFaq] = useState(0);
  const t = translations[lang];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 relative overflow-hidden">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-96 h-96 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse"></div>
        <div className="absolute top-40 right-10 w-96 h-96 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse" style={{animationDelay: '1s'}}></div>
      </div>

      <Navbar />

      <div className="relative z-10 max-w-4xl mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <div className="inline-block p-4 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-full mb-6 hover:scale-110 transition-transform">
            <HelpCircle className="w-16 h-16 text-purple-400" />
          </div>
          <h1 className="text-5xl md:text-6xl font-extrabold text-white mb-4">
            {t.hero.title}{' '}
            <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
              {t.hero.highlight}
            </span>
          </h1>
        </div>

        <div className="space-y-4">
          {t.faqs.map((faq, i) => (
            <div 
              key={i} 
              className={`bg-white/10 backdrop-blur-md rounded-2xl border overflow-hidden transition-all duration-500 cursor-pointer
                ${openFaq === i 
                  ? 'border-purple-400/50 shadow-lg shadow-purple-500/20 bg-white/15' 
                  : 'border-white/20 hover:border-white/40 hover:bg-white/15'
                }`}
              onClick={() => setOpenFaq(openFaq === i ? -1 : i)}
            >
              <div className="px-6 py-5 flex items-center justify-between">
                <span className={`text-lg font-semibold pr-4 transition-colors duration-300 ${openFaq === i ? 'text-purple-300' : 'text-white'}`}>
                  {faq.q}
                </span>
                <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300
                  ${openFaq === i 
                    ? 'bg-gradient-to-r from-purple-500 to-pink-500 rotate-180' 
                    : 'bg-white/10 hover:bg-white/20'
                  }`}>
                  <ChevronDown className={`w-5 h-5 ${openFaq === i ? 'text-white' : 'text-gray-400'}`} />
                </div>
              </div>
              <div className={`overflow-hidden transition-all duration-500 ${openFaq === i ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}`}>
                <div className="px-6 pb-5">
                  <div className="h-px bg-gradient-to-r from-transparent via-purple-500/50 to-transparent mb-4"></div>
                  <p className="text-gray-300 leading-relaxed">{faq.a}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-16 bg-gradient-to-r from-purple-600 to-pink-600 rounded-3xl p-8 md:p-12 text-center hover:shadow-2xl hover:shadow-purple-500/30 transition-all duration-500 group">
          <MessageCircle className="w-12 h-12 text-white/80 mx-auto mb-4 group-hover:scale-110 transition-transform" />
          <h2 className="text-2xl font-bold text-white mb-4">{t.cta.title}</h2>
          <Link to="/contact" className="inline-block px-8 py-3 bg-white text-purple-600 rounded-full font-bold hover:scale-110 hover:shadow-xl transition-all">
            {t.cta.btn}
          </Link>
        </div>
      </div>

      <Footer />
    </div>
  );
}