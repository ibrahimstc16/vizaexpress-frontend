import { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { Sparkles, ArrowLeft, Upload, FileText, CheckCircle, AlertCircle, Clock, X, User, LogOut, Loader, CreditCard, Lock } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { getApplication, uploadDocument, createCheckoutSession } from '../services/api';

const translations = {
  en: {
    backToDashboard: 'Back to Dashboard',
    applicationDetails: 'Application Details',
    package: 'Package',
    status: 'Status',
    created: 'Created',
    documents: 'Documents',
    dragDrop: 'Drag & drop or click to upload',
    supportedFormats: 'PDF, JPG, PNG (max 10MB)',
    uploading: 'Uploading...',
    uploaded: 'Uploaded',
    required: 'Required',
    optional: 'Optional',
    aiValidation: 'AI Validation',
    passed: 'Passed',
    issues: 'Issues Found',
    logout: 'Logout',
    loading: 'Loading...',
    payment: 'Payment',
    payNow: 'Pay Now',
    paid: 'Paid',
    unpaid: 'Unpaid',
    processing: 'Processing...',
    securePayment: 'Secure payment with Stripe',
    price: 'Price',
    documentTypes: {
      passport: 'Passport',
      photo: 'Biometric Photo',
      residence_proof: 'Proof of Residence',
      insurance: 'Health Insurance',
      work_contract: 'Work Contract',
      application_form: 'Application Form'
    },
    statusLabels: {
      draft: 'Draft',
      pending: 'Pending Review',
      approved: 'Approved',
      rejected: 'Rejected',
      created: 'Created',
      paid: 'Paid'
    },
    packages: {
      express: 'Express',
      smart: 'Smart',
      concierge: 'Concierge'
    },
    prices: {
      express: '599 PLN',
      smart: '1,299 PLN',
      concierge: '2,499 PLN'
    }
  },
  tr: {
    backToDashboard: 'Panele Dön',
    applicationDetails: 'Başvuru Detayları',
    package: 'Paket',
    status: 'Durum',
    created: 'Oluşturulma',
    documents: 'Belgeler',
    dragDrop: 'Sürükle bırak veya tıkla',
    supportedFormats: 'PDF, JPG, PNG (max 10MB)',
    uploading: 'Yükleniyor...',
    uploaded: 'Yüklendi',
    required: 'Zorunlu',
    optional: 'Opsiyonel',
    aiValidation: 'AI Doğrulama',
    passed: 'Geçti',
    issues: 'Sorun Bulundu',
    logout: 'Çıkış',
    loading: 'Yükleniyor...',
    payment: 'Ödeme',
    payNow: 'Şimdi Öde',
    paid: 'Ödendi',
    unpaid: 'Ödenmedi',
    processing: 'İşleniyor...',
    securePayment: 'Stripe ile güvenli ödeme',
    price: 'Fiyat',
    documentTypes: {
      passport: 'Pasaport',
      photo: 'Biyometrik Fotoğraf',
      residence_proof: 'İkamet Belgesi',
      insurance: 'Sağlık Sigortası',
      work_contract: 'İş Sözleşmesi',
      application_form: 'Başvuru Formu'
    },
    statusLabels: {
      draft: 'Taslak',
      pending: 'İncelemede',
      approved: 'Onaylandı',
      rejected: 'Reddedildi',
      created: 'Oluşturuldu',
      paid: 'Ödendi'
    },
    packages: {
      express: 'Express',
      smart: 'Smart',
      concierge: 'Concierge'
    },
    prices: {
      express: '599 PLN',
      smart: '1.299 PLN',
      concierge: '2.499 PLN'
    }
  },
  pl: {
    backToDashboard: 'Powrót do Panelu',
    applicationDetails: 'Szczegóły Wniosku',
    package: 'Pakiet',
    status: 'Status',
    created: 'Utworzono',
    documents: 'Dokumenty',
    dragDrop: 'Przeciągnij lub kliknij',
    supportedFormats: 'PDF, JPG, PNG (max 10MB)',
    uploading: 'Przesyłanie...',
    uploaded: 'Przesłano',
    required: 'Wymagane',
    optional: 'Opcjonalne',
    aiValidation: 'Walidacja AI',
    passed: 'Pozytywna',
    issues: 'Znaleziono Problemy',
    logout: 'Wyloguj',
    loading: 'Ładowanie...',
    payment: 'Płatność',
    payNow: 'Zapłać Teraz',
    paid: 'Opłacono',
    unpaid: 'Nieopłacono',
    processing: 'Przetwarzanie...',
    securePayment: 'Bezpieczna płatność przez Stripe',
    price: 'Cena',
    documentTypes: {
      passport: 'Paszport',
      photo: 'Zdjęcie Biometryczne',
      residence_proof: 'Potwierdzenie Zamieszkania',
      insurance: 'Ubezpieczenie',
      work_contract: 'Umowa o Pracę',
      application_form: 'Formularz'
    },
    statusLabels: {
      draft: 'Szkic',
      pending: 'W Trakcie',
      approved: 'Zatwierdzony',
      rejected: 'Odrzucony',
      created: 'Utworzony',
      paid: 'Opłacono'
    },
    packages: {
      express: 'Express',
      smart: 'Smart',
      concierge: 'Concierge'
    },
    prices: {
      express: '599 PLN',
      smart: '1.299 PLN',
      concierge: '2.499 PLN'
    }
  },
  uk: {
    backToDashboard: 'Повернутися',
    applicationDetails: 'Деталі Заявки',
    package: 'Пакет',
    status: 'Статус',
    created: 'Створено',
    documents: 'Документи',
    dragDrop: 'Перетягніть або натисніть',
    supportedFormats: 'PDF, JPG, PNG (max 10MB)',
    uploading: 'Завантаження...',
    uploaded: 'Завантажено',
    required: 'Обов\'язково',
    optional: 'Необов\'язково',
    aiValidation: 'AI Перевірка',
    passed: 'Пройдено',
    issues: 'Знайдено Проблеми',
    logout: 'Вийти',
    loading: 'Завантаження...',
    payment: 'Оплата',
    payNow: 'Оплатити',
    paid: 'Оплачено',
    unpaid: 'Не оплачено',
    processing: 'Обробка...',
    securePayment: 'Безпечна оплата через Stripe',
    price: 'Ціна',
    documentTypes: {
      passport: 'Паспорт',
      photo: 'Біометричне Фото',
      residence_proof: 'Підтвердження',
      insurance: 'Страхування',
      work_contract: 'Контракт',
      application_form: 'Форма'
    },
    statusLabels: {
      draft: 'Чернетка',
      pending: 'На Розгляді',
      approved: 'Схвалено',
      rejected: 'Відхилено',
      created: 'Створено',
      paid: 'Оплачено'
    },
    packages: {
      express: 'Express',
      smart: 'Smart',
      concierge: 'Concierge'
    },
    prices: {
      express: '599 PLN',
      smart: '1.299 PLN',
      concierge: '2.499 PLN'
    }
  },
  ru: {
    backToDashboard: 'Вернуться',
    applicationDetails: 'Детали Заявки',
    package: 'Пакет',
    status: 'Статус',
    created: 'Создано',
    documents: 'Документы',
    dragDrop: 'Перетащите или нажмите',
    supportedFormats: 'PDF, JPG, PNG (max 10MB)',
    uploading: 'Загрузка...',
    uploaded: 'Загружено',
    required: 'Обязательно',
    optional: 'Необязательно',
    aiValidation: 'AI Проверка',
    passed: 'Пройдено',
    issues: 'Найдены Проблемы',
    logout: 'Выйти',
    loading: 'Загрузка...',
    payment: 'Оплата',
    payNow: 'Оплатить',
    paid: 'Оплачено',
    unpaid: 'Не оплачено',
    processing: 'Обработка...',
    securePayment: 'Безопасная оплата через Stripe',
    price: 'Цена',
    documentTypes: {
      passport: 'Паспорт',
      photo: 'Биометрическое Фото',
      residence_proof: 'Подтверждение',
      insurance: 'Страховка',
      work_contract: 'Контракт',
      application_form: 'Форма'
    },
    statusLabels: {
      draft: 'Черновик',
      pending: 'На Рассмотрении',
      approved: 'Одобрено',
      rejected: 'Отклонено',
      created: 'Создано',
      paid: 'Оплачено'
    },
    packages: {
      express: 'Express',
      smart: 'Smart',
      concierge: 'Concierge'
    },
    prices: {
      express: '599 PLN',
      smart: '1.299 PLN',
      concierge: '2.499 PLN'
    }
  }
};

const requiredDocuments = [
  { type: 'passport', required: true },
  { type: 'photo', required: true },
  { type: 'residence_proof', required: true },
  { type: 'insurance', required: true },
  { type: 'work_contract', required: false },
  { type: 'application_form', required: false }
];

const statusColors = {
  draft: 'text-yellow-400 bg-yellow-400/20 border-yellow-400/30',
  pending: 'text-blue-400 bg-blue-400/20 border-blue-400/30',
  approved: 'text-green-400 bg-green-400/20 border-green-400/30',
  rejected: 'text-red-400 bg-red-400/20 border-red-400/30',
  created: 'text-purple-400 bg-purple-400/20 border-purple-400/30',
  paid: 'text-green-400 bg-green-400/20 border-green-400/30'
};

const statusIcons = {
  draft: Clock,
  pending: AlertCircle,
  approved: CheckCircle,
  rejected: X,
  created: Clock,
  paid: CheckCircle
};

export default function ApplicationDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { lang } = useLanguage();
  const [application, setApplication] = useState(null);
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState({});
  const [user, setUser] = useState(null);
  const [paymentLoading, setPaymentLoading] = useState(false);
  const t = translations[lang];

  useEffect(() => {
    const userData = localStorage.getItem('user');
    const token = localStorage.getItem('token');
    
    if (!token || !userData) {
      navigate('/login');
      return;
    }
    
    try {
      setUser(JSON.parse(userData));
    } catch (e) {
      navigate('/login');
      return;
    }
    
    loadApplication();
  }, [id, navigate]);

  const loadApplication = async () => {
    try {
      const response = await getApplication(id);
      console.log('Full response:', response.data);
      if (response.data) {
        const appData = response.data.application || response.data;
        console.log('App data:', appData);
        console.log('Status:', appData.status);
        setApplication(appData);
        setDocuments(response.data.documents || []);
      }
    } catch (error) {
      console.error('Error loading application:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (documentType, file) => {
    if (!file) return;
    setUploading({ ...uploading, [documentType]: true });
    try {
      const formData = new FormData();
      formData.append('document', file);
      formData.append('documentType', documentType);
      const response = await uploadDocument(id, formData);
      if (response.data) {
        setDocuments(prev => {
          const filtered = prev.filter(d => d.documentType !== documentType);
          return [...filtered, response.data];
        });
      }
    } catch (error) {
      console.error('Error uploading document:', error);
      alert('Upload failed. Please try again.');
    } finally {
      setUploading({ ...uploading, [documentType]: false });
    }
  };

  const handlePayment = async () => {
    setPaymentLoading(true);
    try {
      const packageType = application.package_type || application.packageType || 'express';
      const response = await createCheckoutSession({
        packageType,
        applicationId: id
      });
      if (response.data && response.data.url) {
        window.location.href = response.data.url;
      }
    } catch (error) {
      console.error('Payment error:', error);
      alert('Payment failed. Please try again.');
    } finally {
      setPaymentLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/');
  };

  const getDocumentByType = (type) => {
    return documents.find(d => d.documentType === type || d.document_type === type);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <Sparkles className="w-16 h-16 text-yellow-400 animate-spin mx-auto mb-4" />
          <p className="text-white text-xl">{t.loading}</p>
        </div>
      </div>
    );
  }

  if (!application) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
          <p className="text-white text-xl">Application not found</p>
          <Link to="/dashboard" className="text-purple-400 hover:text-purple-300 mt-4 inline-block">
            {t.backToDashboard}
          </Link>
        </div>
      </div>
    );
  }

  const appStatus = application.status || 'created';
  const isPaid = appStatus === 'paid';
  const StatusIcon = statusIcons[appStatus] || Clock;
  const packageType = application.package_type || application.packageType || 'express';

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 relative overflow-hidden">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-96 h-96 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse"></div>
        <div className="absolute top-40 right-10 w-96 h-96 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse" style={{animationDelay: '1s'}}></div>
      </div>

      <nav className="relative z-50 bg-white/10 backdrop-blur-md border-b border-white/20">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <Link to="/" className="text-2xl font-bold text-white flex items-center gap-2 hover:scale-105 transition-transform">
            <Sparkles className="w-6 h-6 text-yellow-400 animate-spin" style={{animationDuration: '3s'}} />
            VizaExpress
          </Link>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3 px-4 py-2 bg-white/10 rounded-xl border border-white/20">
              <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                <User className="w-5 h-5 text-white" />
              </div>
              <span className="text-white font-medium hidden sm:block">{user?.fullName || 'User'}</span>
            </div>
            <button onClick={handleLogout} className="flex items-center gap-2 px-4 py-2 bg-red-500/20 hover:bg-red-500/30 border border-red-500/30 rounded-xl text-red-300 hover:text-red-200 transition-all hover:scale-105">
              <LogOut className="w-5 h-5" />
              <span className="hidden sm:block">{t.logout}</span>
            </button>
          </div>
        </div>
      </nav>

      <div className="relative z-10 max-w-5xl mx-auto px-4 py-8">
        <Link to="/dashboard" className="inline-flex items-center gap-2 text-gray-400 hover:text-white mb-6 transition-colors group">
          <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
          {t.backToDashboard}
        </Link>

        <div className="bg-white/10 backdrop-blur-md rounded-3xl p-6 md:p-8 border border-white/20 mb-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-white mb-2">{t.applicationDetails}</h1>
              <p className="text-gray-400">Application #{application.id?.slice(0, 8)}</p>
            </div>
            <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full border ${statusColors[appStatus] || statusColors.created}`}>
              <StatusIcon className="w-5 h-5" />
              <span className="font-medium">{t.statusLabels[appStatus] || appStatus}</span>
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-6 mt-6 pt-6 border-t border-white/10">
            <div>
              <p className="text-gray-400 text-sm mb-1">{t.package}</p>
              <p className="text-white font-semibold text-lg">{t.packages[packageType] || packageType}</p>
            </div>
            <div>
              <p className="text-gray-400 text-sm mb-1">{t.price}</p>
              <p className="text-white font-semibold text-lg">{t.prices[packageType] || '599 PLN'}</p>
            </div>
            <div>
              <p className="text-gray-400 text-sm mb-1">{t.payment}</p>
              <p className={`font-semibold text-lg ${isPaid ? 'text-green-400' : 'text-yellow-400'}`}>
                {isPaid ? t.paid : t.unpaid}
              </p>
            </div>
          </div>
        </div>

        {!isPaid && (
          <div className="bg-gradient-to-r from-purple-600/20 to-pink-600/20 backdrop-blur-md rounded-3xl p-6 md:p-8 border border-purple-500/30 mb-8">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <h2 className="text-xl font-bold text-white mb-2 flex items-center gap-2">
                  <CreditCard className="w-6 h-6 text-purple-400" />
                  {t.payment}
                </h2>
                <p className="text-gray-300 flex items-center gap-2">
                  <Lock className="w-4 h-4" />
                  {t.securePayment}
                </p>
              </div>
              <button
                onClick={handlePayment}
                disabled={paymentLoading}
                className="flex items-center justify-center gap-2 px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-bold text-lg hover:scale-105 hover:shadow-xl hover:shadow-purple-500/30 transition-all disabled:opacity-50"
              >
                {paymentLoading ? (
                  <>
                    <Loader className="w-5 h-5 animate-spin" />
                    {t.processing}
                  </>
                ) : (
                  <>
                    <CreditCard className="w-5 h-5" />
                    {t.payNow} - {t.prices[packageType]}
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        <div className="bg-white/10 backdrop-blur-md rounded-3xl p-6 md:p-8 border border-white/20">
          <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
            <FileText className="w-6 h-6 text-purple-400" />
            {t.documents}
          </h2>

          <div className="grid md:grid-cols-2 gap-4">
            {requiredDocuments.map((doc) => {
              const uploadedDoc = getDocumentByType(doc.type);
              const isUploading = uploading[doc.type];

              return (
                <div
                  key={doc.type}
                  className={`relative rounded-2xl border-2 border-dashed p-6 transition-all duration-300 ${
                    uploadedDoc
                      ? 'border-green-400/50 bg-green-400/10'
                      : 'border-white/20 bg-white/5 hover:border-purple-400/50 hover:bg-purple-400/10'
                  }`}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-white font-semibold">{t.documentTypes[doc.type]}</h3>
                      <span className={`text-xs ${doc.required ? 'text-red-400' : 'text-gray-500'}`}>
                        {doc.required ? t.required : t.optional}
                      </span>
                    </div>
                    {uploadedDoc && <CheckCircle className="w-6 h-6 text-green-400" />}
                  </div>

                  {uploadedDoc ? (
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-green-400/20 rounded-lg flex items-center justify-center">
                        <FileText className="w-5 h-5 text-green-400" />
                      </div>
                      <div>
                        <p className="text-white text-sm font-medium truncate max-w-[150px]">
                          {uploadedDoc.original_name || uploadedDoc.originalName || 'Document'}
                        </p>
                        <p className="text-green-400 text-xs">{t.uploaded}</p>
                      </div>
                    </div>
                  ) : (
                    <label className="cursor-pointer block">
                      <input
                        type="file"
                        className="hidden"
                        accept=".pdf,.jpg,.jpeg,.png"
                        onChange={(e) => handleFileUpload(doc.type, e.target.files[0])}
                        disabled={isUploading}
                      />
                      <div className="flex flex-col items-center justify-center py-4">
                        {isUploading ? (
                          <>
                            <Loader className="w-8 h-8 text-purple-400 animate-spin mb-2" />
                            <p className="text-purple-400 text-sm">{t.uploading}</p>
                          </>
                        ) : (
                          <>
                            <Upload className="w-8 h-8 text-gray-400 mb-2" />
                            <p className="text-gray-400 text-sm text-center">{t.dragDrop}</p>
                            <p className="text-gray-500 text-xs mt-1">{t.supportedFormats}</p>
                          </>
                        )}
                      </div>
                    </label>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}