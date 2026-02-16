import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { register } from '../services/api';
import { Sparkles, User, Mail, Phone, Lock, ArrowRight, Globe, ChevronDown, CheckCircle } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

const translations = {
  en: {
    title: 'Create Account',
    subtitle: 'Start your visa journey today',
    fullName: 'Full Name',
    email: 'Email',
    phone: 'Phone (Optional)',
    password: 'Password',
    btn: 'Sign Up',
    loading: 'Creating Account...',
    hasAccount: 'Already have an account?',
    login: 'Login',
    back: '← Back to home',
    error: 'Registration failed'
  },
  pl: {
    title: 'Utwórz Konto',
    subtitle: 'Rozpocznij swoją podróż wizową',
    fullName: 'Imię i Nazwisko',
    email: 'Email',
    phone: 'Telefon (Opcjonalnie)',
    password: 'Hasło',
    btn: 'Zarejestruj się',
    loading: 'Tworzenie konta...',
    hasAccount: 'Masz już konto?',
    login: 'Zaloguj się',
    back: '← Powrót',
    error: 'Błąd rejestracji'
  },
  uk: {
    title: 'Створити Акаунт',
    subtitle: 'Почніть свою візову подорож',
    fullName: 'Повне Ім\'я',
    email: 'Email',
    phone: 'Телефон (Необов\'язково)',
    password: 'Пароль',
    btn: 'Зареєструватися',
    loading: 'Створення акаунту...',
    hasAccount: 'Вже є акаунт?',
    login: 'Увійти',
    back: '← Назад',
    error: 'Помилка реєстрації'
  },
  tr: {
    title: 'Hesap Oluştur',
    subtitle: 'Vize yolculuğunuza bugün başlayın',
    fullName: 'Ad Soyad',
    email: 'E-posta',
    phone: 'Telefon (Opsiyonel)',
    password: 'Şifre',
    btn: 'Kayıt Ol',
    loading: 'Hesap oluşturuluyor...',
    hasAccount: 'Zaten hesabınız var mı?',
    login: 'Giriş yap',
    back: '← Ana sayfa',
    error: 'Kayıt başarısız'
  },
  ru: {
    title: 'Создать Аккаунт',
    subtitle: 'Начните свой визовый путь',
    fullName: 'Полное Имя',
    email: 'Email',
    phone: 'Телефон (Необязательно)',
    password: 'Пароль',
    btn: 'Зарегистрироваться',
    loading: 'Создание аккаунта...',
    hasAccount: 'Уже есть аккаунт?',
    login: 'Войти',
    back: '← Назад',
    error: 'Ошибка регистрации'
  }
};

const languages = [
  { code: 'en', name: 'English', flag: '🇬🇧' },
  { code: 'pl', name: 'Polski', flag: '🇵🇱' },
  { code: 'uk', name: 'Українська', flag: '🇺🇦' },
  { code: 'tr', name: 'Türkçe', flag: '🇹🇷' },
  { code: 'ru', name: 'Русский', flag: '🇷🇺' }
];

export default function Register() {
  const navigate = useNavigate();
  const { lang, setLang } = useLanguage();
  const [langOpen, setLangOpen] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    fullName: '',
    phone: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [focused, setFocused] = useState('');
  const t = translations[lang];
  const currentLang = languages.find(l => l.code === lang);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await register(formData);
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.error || t.error);
    } finally {
      setLoading(false);
    }
  };

  const fields = [
    { key: 'fullName', type: 'text', label: t.fullName, icon: User, placeholder: 'Jan Kowalski' },
    { key: 'email', type: 'email', label: t.email, icon: Mail, placeholder: 'your@email.com' },
    { key: 'phone', type: 'tel', label: t.phone, icon: Phone, placeholder: '+48 123 456 789', required: false },
    { key: 'password', type: 'password', label: t.password, icon: Lock, placeholder: '••••••••', minLength: 6 },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 relative overflow-hidden flex items-center justify-center p-4">
      {/* Animated background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-20 left-10 w-96 h-96 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse"></div>
        <div className="absolute top-40 right-10 w-96 h-96 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse" style={{animationDelay: '1s'}}></div>
        <div className="absolute -bottom-8 left-20 w-96 h-96 bg-pink-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse" style={{animationDelay: '2s'}}></div>
      </div>

      {/* Language Switcher - Top Right */}
      <div className="absolute top-4 right-4 z-50">
        <div className="relative">
          <button 
            onClick={() => setLangOpen(!langOpen)}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-600/30 to-pink-600/30 backdrop-blur-md rounded-xl border border-white/30 text-white hover:from-purple-600/50 hover:to-pink-600/50 hover:border-white/50 hover:scale-105 transition-all duration-300"
          >
            <Globe className="w-4 h-4 text-purple-300" />
            <span className="font-medium">{currentLang?.flag} {currentLang?.code.toUpperCase()}</span>
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
      </div>

      <div className="relative z-10 bg-white/10 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 p-8 w-full max-w-md hover:shadow-purple-500/20 transition-all duration-500">
        {/* Logo */}
        <Link to="/" className="flex justify-center mb-6">
          <div className="relative group">
            <Sparkles className="w-12 h-12 text-yellow-400 animate-spin group-hover:scale-110 transition-transform" style={{animationDuration: '3s'}} />
            <div className="absolute inset-0 w-12 h-12 bg-yellow-400 blur-lg opacity-50 group-hover:opacity-75 transition-opacity"></div>
          </div>
        </Link>

        <h2 className="text-4xl font-bold text-center mb-2 bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
          {t.title}
        </h2>
        <p className="text-center text-gray-300 mb-8">{t.subtitle}</p>
        
        {error && (
          <div className="bg-red-500/20 border border-red-500/50 text-red-200 p-4 rounded-xl mb-6 backdrop-blur-sm animate-shake">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          {fields.map((field) => (
            <div key={field.key} className="group">
              <label className={`block text-sm font-medium mb-2 transition-colors duration-300 ${focused === field.key ? 'text-purple-400' : 'text-gray-200'}`}>
                {field.label}
              </label>
              <div className="relative">
                <field.icon className={`absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 transition-colors duration-300 ${focused === field.key ? 'text-purple-400' : 'text-gray-400'}`} />
                <input
                  type={field.type}
                  required={field.required !== false}
                  minLength={field.minLength}
                  className="w-full pl-12 pr-4 py-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl text-white placeholder-gray-400 focus:border-purple-400 focus:ring-2 focus:ring-purple-400/50 focus:bg-white/15 transition-all duration-300"
                  placeholder={field.placeholder}
                  value={formData[field.key]}
                  onChange={(e) => setFormData({...formData, [field.key]: e.target.value})}
                  onFocus={() => setFocused(field.key)}
                  onBlur={() => setFocused('')}
                />
              </div>
            </div>
          ))}

          <button
            type="submit"
            disabled={loading}
            className="group relative w-full py-3 rounded-xl overflow-hidden disabled:opacity-50 hover:scale-105 transition-transform"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600"></div>
            <div className="absolute inset-0 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 blur-xl opacity-50 group-hover:opacity-100 transition-opacity"></div>
            <span className="relative text-white font-bold flex items-center justify-center gap-2">
              {loading ? t.loading : (
                <>
                  {t.btn} <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </span>
          </button>
        </form>

        <p className="text-center mt-6 text-gray-300">
          {t.hasAccount}{' '}
          <Link to="/login" className="text-purple-400 hover:text-purple-300 font-semibold transition-colors hover:underline">
            {t.login}
          </Link>
        </p>

        <Link to="/" className="block text-center mt-4 text-gray-400 hover:text-gray-300 transition-colors hover:scale-105">
          {t.back}
        </Link>
      </div>

      <style jsx>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-10px); }
          75% { transform: translateX(10px); }
        }
        .animate-shake { animation: shake 0.5s; }
      `}</style>
    </div>
  );
}