import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { CheckCircle, Sparkles, ArrowRight } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { verifyPayment } from '../services/api';

const translations = {
  en: {
    title: 'Payment Successful!',
    subtitle: 'Thank you for your purchase',
    description: 'Your payment has been processed successfully. You can now upload your documents.',
    goToApplication: 'Go to Application',
    backToDashboard: 'Back to Dashboard'
  },
  tr: {
    title: 'Ödeme Başarılı!',
    subtitle: 'Satın aldığınız için teşekkürler',
    description: 'Ödemeniz başarıyla işlendi. Artık belgelerinizi yükleyebilirsiniz.',
    goToApplication: 'Başvuruya Git',
    backToDashboard: 'Panele Dön'
  },
  pl: {
    title: 'Płatność Udana!',
    subtitle: 'Dziękujemy za zakup',
    description: 'Twoja płatność została przetworzona. Możesz teraz przesłać dokumenty.',
    goToApplication: 'Przejdź do Wniosku',
    backToDashboard: 'Powrót do Panelu'
  },
  uk: {
    title: 'Оплата Успішна!',
    subtitle: 'Дякуємо за покупку',
    description: 'Вашу оплату оброблено успішно. Тепер ви можете завантажити документи.',
    goToApplication: 'Перейти до Заявки',
    backToDashboard: 'Повернутися'
  },
  ru: {
    title: 'Оплата Успешна!',
    subtitle: 'Спасибо за покупку',
    description: 'Ваш платеж успешно обработан. Теперь вы можете загрузить документы.',
    goToApplication: 'Перейти к Заявке',
    backToDashboard: 'Вернуться'
  }
};

export default function PaymentSuccess() {
  const [searchParams] = useSearchParams();
  const { lang } = useLanguage();
  const [verified, setVerified] = useState(false);
  const t = translations[lang];
  
  const sessionId = searchParams.get('session_id');
  const applicationId = searchParams.get('application_id');

  useEffect(() => {
    if (sessionId) {
      verifyPayment(sessionId)
        .then(response => {
          if (response.data.paid) {
            setVerified(true);
          }
        })
        .catch(console.error);
    }
  }, [sessionId]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
      {/* Animated background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-96 h-96 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse"></div>
        <div className="absolute top-40 right-10 w-96 h-96 bg-green-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse" style={{animationDelay: '1s'}}></div>
      </div>

      <div className="relative z-10 bg-white/10 backdrop-blur-xl rounded-3xl p-8 md:p-12 border border-white/20 max-w-lg w-full text-center">
        <div className="w-24 h-24 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6 animate-bounce">
          <CheckCircle className="w-12 h-12 text-white" />
        </div>

        <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
          {t.title}
        </h1>
        <p className="text-xl text-green-400 mb-4">{t.subtitle}</p>
        <p className="text-gray-300 mb-8">{t.description}</p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          {applicationId && (
            <Link
              to={`/application/${applicationId}`}
              className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-semibold hover:scale-105 transition-all"
            >
              {t.goToApplication}
              <ArrowRight className="w-5 h-5" />
            </Link>
          )}
          <Link
            to="/dashboard"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-white/10 border border-white/20 text-white rounded-xl font-semibold hover:bg-white/20 transition-all"
          >
            {t.backToDashboard}
          </Link>
        </div>

        <div className="mt-8 pt-6 border-t border-white/10">
          <div className="flex items-center justify-center gap-2 text-gray-400">
            <Sparkles className="w-5 h-5 text-yellow-400" />
            <span>VizaExpress</span>
          </div>
        </div>
      </div>
    </div>
  );
}