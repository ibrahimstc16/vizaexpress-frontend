import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Sparkles, Plus, FileText, Clock, CheckCircle, AlertCircle, LogOut, User, ChevronDown } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { getApplications, createApplication } from '../services/api';

const translations = {
  en: {
    welcome: 'Welcome back',
    dashboard: 'Dashboard',
    myApplications: 'My Applications',
    newApplication: 'New Application',
    noApplications: 'No applications yet',
    startFirst: 'Start your first Karta Pobytu application',
    createNew: 'Create Application',
    status: { draft: 'Draft', pending: 'Pending Review', approved: 'Approved', rejected: 'Rejected' },
    packages: { express: 'Express - 599 PLN', smart: 'Smart - 1,299 PLN', concierge: 'Concierge - 2,499 PLN' },
    logout: 'Logout',
    loading: 'Loading...'
  },
  pl: {
    welcome: 'Witaj ponownie',
    dashboard: 'Panel',
    myApplications: 'Moje Wnioski',
    newApplication: 'Nowy Wniosek',
    noApplications: 'Brak wniosków',
    startFirst: 'Rozpocznij swój pierwszy wniosek o Kartę Pobytu',
    createNew: 'Utwórz Wniosek',
    status: { draft: 'Szkic', pending: 'W Trakcie', approved: 'Zatwierdzony', rejected: 'Odrzucony' },
    packages: { express: 'Express - 599 PLN', smart: 'Smart - 1,299 PLN', concierge: 'Concierge - 2,499 PLN' },
    logout: 'Wyloguj',
    loading: 'Ładowanie...'
  },
  uk: {
    welcome: 'З поверненням',
    dashboard: 'Панель',
    myApplications: 'Мої Заявки',
    newApplication: 'Нова Заявка',
    noApplications: 'Немає заявок',
    startFirst: 'Почніть свою першу заявку на Карту Побиту',
    createNew: 'Створити Заявку',
    status: { draft: 'Чернетка', pending: 'На Розгляді', approved: 'Схвалено', rejected: 'Відхилено' },
    packages: { express: 'Express - 599 PLN', smart: 'Smart - 1,299 PLN', concierge: 'Concierge - 2,499 PLN' },
    logout: 'Вийти',
    loading: 'Завантаження...'
  },
  tr: {
    welcome: 'Tekrar hoş geldiniz',
    dashboard: 'Panel',
    myApplications: 'Başvurularım',
    newApplication: 'Yeni Başvuru',
    noApplications: 'Henüz başvuru yok',
    startFirst: 'İlk Karta Pobytu başvurunuzu oluşturun',
    createNew: 'Başvuru Oluştur',
    status: { draft: 'Taslak', pending: 'İncelemede', approved: 'Onaylandı', rejected: 'Reddedildi' },
    packages: { express: 'Express - 599 PLN', smart: 'Smart - 1,299 PLN', concierge: 'Concierge - 2,499 PLN' },
    logout: 'Çıkış',
    loading: 'Yükleniyor...'
  },
  ru: {
    welcome: 'С возвращением',
    dashboard: 'Панель',
    myApplications: 'Мои Заявки',
    newApplication: 'Новая Заявка',
    noApplications: 'Нет заявок',
    startFirst: 'Начните свою первую заявку на Карту Побыту',
    createNew: 'Создать Заявку',
    status: { draft: 'Черновик', pending: 'На Рассмотрении', approved: 'Одобрено', rejected: 'Отклонено' },
    packages: { express: 'Express - 599 PLN', smart: 'Smart - 1,299 PLN', concierge: 'Concierge - 2,499 PLN' },
    logout: 'Выйти',
    loading: 'Загрузка...'
  }
};

const statusIcons = {
  draft: Clock,
  pending: AlertCircle,
  approved: CheckCircle,
  rejected: AlertCircle
};

const statusColors = {
  draft: 'text-yellow-400 bg-yellow-400/20',
  pending: 'text-blue-400 bg-blue-400/20',
  approved: 'text-green-400 bg-green-400/20',
  rejected: 'text-red-400 bg-red-400/20'
};

export default function Dashboard() {
  const navigate = useNavigate();
  const { lang } = useLanguage();
  const [user, setUser] = useState(null);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showNewAppMenu, setShowNewAppMenu] = useState(false);
  const [creating, setCreating] = useState(false);
  const t = translations[lang];

  useEffect(() => {
    const userData = localStorage.getItem('user');
    const token = localStorage.getItem('token');
    
    if (!token || !userData) {
      navigate('/login');
      return;
    }
    
    setUser(JSON.parse(userData));
    loadApplications();
  }, [navigate]);

  const loadApplications = async () => {
    try {
      const response = await getApplications();
      setApplications(response.data || []);
    } catch (error) {
      console.error('Error loading applications:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateApplication = async (packageType) => {
    setCreating(true);
    try {
      const response = await createApplication({ packageType });
      navigate(`/application/${response.data.id}`);
    } catch (error) {
      console.error('Error creating application:', error);
      alert('Error creating application');
    } finally {
      setCreating(false);
      setShowNewAppMenu(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/');
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 relative overflow-hidden">
      {/* Animated background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-96 h-96 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse"></div>
        <div className="absolute top-40 right-10 w-96 h-96 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse" style={{animationDelay: '1s'}}></div>
      </div>

      {/* Header */}
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
              <span className="text-white font-medium hidden sm:block">{user?.fullName}</span>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-4 py-2 bg-red-500/20 hover:bg-red-500/30 border border-red-500/30 rounded-xl text-red-300 hover:text-red-200 transition-all hover:scale-105"
            >
              <LogOut className="w-5 h-5" />
              <span className="hidden sm:block">{t.logout}</span>
            </button>
          </div>
        </div>
      </nav>

      <div className="relative z-10 max-w-7xl mx-auto px-4 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
            {t.welcome}, <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">{user?.fullName?.split(' ')[0]}</span>! 👋
          </h1>
          <p className="text-gray-400">{t.dashboard}</p>
        </div>

        {/* Actions */}
        <div className="flex flex-wrap gap-4 mb-8">
          <div className="relative">
            <button
              onClick={() => setShowNewAppMenu(!showNewAppMenu)}
              disabled={creating}
              className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-semibold hover:scale-105 hover:shadow-lg hover:shadow-purple-500/30 transition-all disabled:opacity-50"
            >
              <Plus className="w-5 h-5" />
              {t.newApplication}
              <ChevronDown className={`w-4 h-4 transition-transform ${showNewAppMenu ? 'rotate-180' : ''}`} />
            </button>

            {showNewAppMenu && (
              <div className="absolute top-full left-0 mt-2 w-64 bg-gradient-to-br from-slate-800/95 via-purple-900/95 to-slate-800/95 backdrop-blur-xl rounded-2xl shadow-2xl shadow-purple-500/30 border border-white/20 overflow-hidden z-50">
                <div className="p-2">
                  {['express', 'smart', 'concierge'].map((pkg) => (
                    <button
                      key={pkg}
                      onClick={() => handleCreateApplication(pkg)}
                      disabled={creating}
                      className="w-full px-4 py-3 text-left text-white hover:bg-white/10 rounded-xl transition-all flex items-center justify-between group"
                    >
                      <span>{t.packages[pkg]}</span>
                      {pkg === 'smart' && (
                        <span className="text-xs bg-gradient-to-r from-yellow-400 to-orange-400 text-gray-900 px-2 py-1 rounded-full font-bold">
                          🔥
                        </span>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Applications */}
        <div>
          <h2 className="text-2xl font-bold text-white mb-6">{t.myApplications}</h2>

          {applications.length === 0 ? (
            <div className="bg-white/10 backdrop-blur-md rounded-3xl p-12 border border-white/20 text-center">
              <FileText className="w-16 h-16 text-gray-500 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">{t.noApplications}</h3>
              <p className="text-gray-400 mb-6">{t.startFirst}</p>
              <button
                onClick={() => setShowNewAppMenu(true)}
                className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-semibold hover:scale-105 transition-all"
              >
                <Plus className="w-5 h-5" />
                {t.createNew}
              </button>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {applications.map((app) => {
                const StatusIcon = statusIcons[app.status] || Clock;
                const statusColor = statusColors[app.status] || statusColors.draft;
                
                return (
                  <Link
                    key={app.id}
                    to={`/application/${app.id}`}
                    className="group bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20 hover:bg-white/15 hover:border-purple-400/50 hover:scale-105 hover:shadow-xl hover:shadow-purple-500/20 transition-all duration-300"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className={`px-3 py-1 rounded-full text-sm font-medium flex items-center gap-2 ${statusColor}`}>
                        <StatusIcon className="w-4 h-4" />
                        {t.status[app.status] || app.status}
                      </div>
                      <span className="text-xs text-gray-400">
                        {new Date(app.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    
                    <h3 className="text-lg font-semibold text-white mb-2 group-hover:text-purple-300 transition-colors">
                      {app.packageType?.charAt(0).toUpperCase() + app.packageType?.slice(1)} Package
                    </h3>
                    
                    <div className="flex items-center gap-2 text-gray-400 text-sm">
                      <FileText className="w-4 h-4" />
                      <span>Application #{app.id.slice(0, 8)}</span>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}