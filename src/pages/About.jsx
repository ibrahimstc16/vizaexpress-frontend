import { Link } from 'react-router-dom';
import { Users, Target, Heart, Award, ArrowRight, Linkedin, Twitter, Github } from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { useLanguage } from '../contexts/LanguageContext';

const translations = {
  en: {
    hero: { title: 'About', highlight: 'VizaExpress', subtitle: 'Helping expats navigate Polish immigration since 2024' },
    mission: {
      title: 'Our Mission',
      text: 'We believe everyone deserves a fair chance at building a life in Poland. Our AI-powered platform eliminates the guesswork from visa applications, giving you confidence that your documents are perfect before submission.'
    },
    values: {
      title: 'Our Values',
      v1: { title: 'Transparency', desc: 'No hidden fees, clear pricing, honest timelines' },
      v2: { title: 'Innovation', desc: 'Using Claude AI for 95% accurate document validation' },
      v3: { title: 'Empathy', desc: 'We understand the stress of immigration processes' },
      v4: { title: 'Excellence', desc: 'Committed to the highest quality service' }
    },
    team: {
      title: 'Our Team',
      members: [
        { name: 'Ibrahim S.', role: 'Founder & CEO', bio: 'Former expat who experienced the Karta Pobytu process firsthand' },
        { name: 'Anna K.', role: 'Immigration Expert', bio: '10+ years helping foreigners in Poland' },
        { name: 'Tech Team', role: 'AI & Development', bio: 'Building the future of immigration tech' }
      ]
    },
    stats: [
      { value: '127+', label: 'Clients Helped' },
      { value: '95%', label: 'Success Rate' },
      { value: '9mo', label: 'Avg Process Time' },
      { value: '5', label: 'Languages' }
    ],
    cta: { title: 'Ready to Start?', btn: 'Begin Your Application' }
  },
  pl: {
    hero: { title: 'O', highlight: 'VizaExpress', subtitle: 'Pomagamy obcokrajowcom od 2024' },
    mission: { title: 'Nasza Misja', text: 'Wierzymy, że każdy zasługuje na szansę. Nasza platforma AI eliminuje domysły z wniosków wizowych.' },
    values: {
      title: 'Nasze Wartości',
      v1: { title: 'Przejrzystość', desc: 'Brak ukrytych opłat' },
      v2: { title: 'Innowacja', desc: '95% dokładności AI' },
      v3: { title: 'Empatia', desc: 'Rozumiemy stres' },
      v4: { title: 'Doskonałość', desc: 'Najwyższa jakość' }
    },
    team: {
      title: 'Zespół',
      members: [
        { name: 'Ibrahim S.', role: 'Założyciel', bio: 'Sam przeszedł proces' },
        { name: 'Anna K.', role: 'Ekspert', bio: '10+ lat doświadczenia' },
        { name: 'Tech Team', role: 'Rozwój', bio: 'Budujemy przyszłość' }
      ]
    },
    stats: [
      { value: '127+', label: 'Klientów' },
      { value: '95%', label: 'Sukces' },
      { value: '9mies', label: 'Śr. Czas' },
      { value: '5', label: 'Języków' }
    ],
    cta: { title: 'Gotowy?', btn: 'Rozpocznij' }
  },
  uk: {
    hero: { title: 'Про', highlight: 'VizaExpress', subtitle: 'Допомагаємо з 2024 року' },
    mission: { title: 'Наша Місія', text: 'Ми віримо, що кожен заслуговує на шанс. AI платформа усуває здогадки.' },
    values: {
      title: 'Цінності',
      v1: { title: 'Прозорість', desc: 'Без прихованих платежів' },
      v2: { title: 'Інновації', desc: '95% точність AI' },
      v3: { title: 'Емпатія', desc: 'Розуміємо стрес' },
      v4: { title: 'Досконалість', desc: 'Найвища якість' }
    },
    team: {
      title: 'Команда',
      members: [
        { name: 'Ibrahim S.', role: 'Засновник', bio: 'Сам пройшов процес' },
        { name: 'Anna K.', role: 'Експерт', bio: '10+ років досвіду' },
        { name: 'Tech Team', role: 'Розробка', bio: 'Будуємо майбутнє' }
      ]
    },
    stats: [
      { value: '127+', label: 'Клієнтів' },
      { value: '95%', label: 'Успіх' },
      { value: '9міс', label: 'Сер. Час' },
      { value: '5', label: 'Мов' }
    ],
    cta: { title: 'Готові?', btn: 'Почати' }
  },
  tr: {
    hero: { title: '', highlight: 'VizaExpress', subtitle: '2024\'ten beri yardım ediyoruz' },
    mission: { title: 'Misyonumuz', text: 'Herkesin hak ettiğine inanıyoruz. AI platformumuz tahminleri ortadan kaldırır.' },
    values: {
      title: 'Değerlerimiz',
      v1: { title: 'Şeffaflık', desc: 'Gizli ücret yok' },
      v2: { title: 'İnovasyon', desc: '%95 AI doğruluğu' },
      v3: { title: 'Empati', desc: 'Stresi anlıyoruz' },
      v4: { title: 'Mükemmellik', desc: 'En yüksek kalite' }
    },
    team: {
      title: 'Ekibimiz',
      members: [
        { name: 'Ibrahim S.', role: 'Kurucu', bio: 'Süreci bizzat yaşadı' },
        { name: 'Anna K.', role: 'Uzman', bio: '10+ yıl deneyim' },
        { name: 'Tech Team', role: 'Geliştirme', bio: 'Geleceği inşa ediyoruz' }
      ]
    },
    stats: [
      { value: '127+', label: 'Müşteri' },
      { value: '%95', label: 'Başarı' },
      { value: '9ay', label: 'Ort. Süre' },
      { value: '5', label: 'Dil' }
    ],
    cta: { title: 'Hazır mısınız?', btn: 'Başla' }
  },
  ru: {
    hero: { title: 'О', highlight: 'VizaExpress', subtitle: 'Помогаем с 2024 года' },
    mission: { title: 'Наша Миссия', text: 'Мы верим, что каждый заслуживает шанс. AI платформа устраняет догадки.' },
    values: {
      title: 'Ценности',
      v1: { title: 'Прозрачность', desc: 'Без скрытых платежей' },
      v2: { title: 'Инновации', desc: '95% точность AI' },
      v3: { title: 'Эмпатия', desc: 'Понимаем стресс' },
      v4: { title: 'Совершенство', desc: 'Высшее качество' }
    },
    team: {
      title: 'Команда',
      members: [
        { name: 'Ibrahim S.', role: 'Основатель', bio: 'Сам прошел процесс' },
        { name: 'Anna K.', role: 'Эксперт', bio: '10+ лет опыта' },
        { name: 'Tech Team', role: 'Разработка', bio: 'Строим будущее' }
      ]
    },
    stats: [
      { value: '127+', label: 'Клиентов' },
      { value: '95%', label: 'Успех' },
      { value: '9мес', label: 'Ср. Время' },
      { value: '5', label: 'Языков' }
    ],
    cta: { title: 'Готовы?', btn: 'Начать' }
  }
};

const valueIcons = [Target, Heart, Users, Award];
const valueColors = ['from-blue-500 to-cyan-500', 'from-purple-500 to-pink-500', 'from-pink-500 to-red-500', 'from-yellow-500 to-orange-500'];

export default function About() {
  const { lang } = useLanguage();
  const t = translations[lang];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 relative overflow-hidden">
      {/* Animated background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-96 h-96 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse"></div>
        <div className="absolute top-40 right-10 w-96 h-96 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse" style={{animationDelay: '1s'}}></div>
        <div className="absolute bottom-20 left-1/2 w-96 h-96 bg-pink-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse" style={{animationDelay: '2s'}}></div>
      </div>

      <Navbar />

      <div className="relative z-10 max-w-7xl mx-auto px-4 py-16">
        {/* Hero */}
        <div className="text-center mb-20">
          <h1 className="text-5xl md:text-7xl font-extrabold text-white mb-6">
            {t.hero.title}{' '}
            <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
              {t.hero.highlight}
            </span>
          </h1>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">{t.hero.subtitle}</p>
        </div>

        {/* Mission */}
        <div className="group bg-white/10 backdrop-blur-md rounded-3xl p-8 md:p-12 border border-white/20 mb-16 hover:bg-white/15 hover:border-white/30 hover:shadow-2xl hover:shadow-purple-500/20 transition-all duration-500 cursor-pointer">
          <h2 className="text-3xl font-bold text-white mb-6 flex items-center gap-3">
            <div className="bg-gradient-to-br from-purple-500 to-pink-500 w-12 h-12 rounded-xl flex items-center justify-center group-hover:rotate-12 transition-transform duration-300">
              <Target className="w-6 h-6 text-white" />
            </div>
            {t.mission.title}
          </h2>
          <p className="text-lg text-gray-300 leading-relaxed">{t.mission.text}</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-16">
          {t.stats.map((stat, i) => (
            <div 
              key={i} 
              className="group bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20 text-center hover:bg-white/20 hover:scale-110 hover:border-purple-400/50 hover:shadow-xl hover:shadow-purple-500/20 transition-all duration-300 cursor-pointer"
            >
              <div className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent mb-2 group-hover:scale-110 transition-transform">
                {stat.value}
              </div>
              <div className="text-gray-300 group-hover:text-white transition-colors">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Values */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-white mb-8 text-center">{t.values.title}</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[t.values.v1, t.values.v2, t.values.v3, t.values.v4].map((value, i) => {
              const Icon = valueIcons[i];
              return (
                <div 
                  key={i} 
                  className="group bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20 hover:-translate-y-4 hover:bg-white/15 hover:border-white/40 hover:shadow-2xl hover:shadow-purple-500/20 transition-all duration-500 cursor-pointer"
                >
                  <div className={`bg-gradient-to-br ${valueColors[i]} w-14 h-14 rounded-xl flex items-center justify-center mb-4 group-hover:rotate-12 group-hover:scale-110 transition-all duration-300 shadow-lg`}>
                    <Icon className="w-7 h-7 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-2 group-hover:text-purple-300 transition-colors">{value.title}</h3>
                  <p className="text-gray-300 group-hover:text-gray-200 transition-colors">{value.desc}</p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Team */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-white mb-8 text-center">{t.team.title}</h2>
          <div className="grid md:grid-cols-3 gap-8">
            {t.team.members.map((member, i) => (
              <div 
                key={i} 
                className="group bg-white/10 backdrop-blur-md rounded-2xl p-8 border border-white/20 text-center hover:bg-white/15 hover:scale-105 hover:border-purple-400/50 hover:shadow-2xl hover:shadow-purple-500/20 transition-all duration-500 cursor-pointer"
              >
                <div className="w-24 h-24 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full mx-auto mb-4 flex items-center justify-center group-hover:scale-110 group-hover:rotate-6 transition-all duration-300 shadow-xl shadow-purple-500/30">
                  <Users className="w-12 h-12 text-white" />
                </div>
                <h3 className="text-xl font-bold text-white mb-1 group-hover:text-purple-300 transition-colors">{member.name}</h3>
                <p className="text-purple-400 font-medium mb-3">{member.role}</p>
                <p className="text-gray-300 text-sm group-hover:text-gray-200 transition-colors">{member.bio}</p>
                <div className="flex justify-center gap-3 mt-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <a href="#" className="text-gray-400 hover:text-purple-400 hover:scale-125 transition-all"><Linkedin className="w-5 h-5" /></a>
                  <a href="#" className="text-gray-400 hover:text-purple-400 hover:scale-125 transition-all"><Twitter className="w-5 h-5" /></a>
                  <a href="#" className="text-gray-400 hover:text-purple-400 hover:scale-125 transition-all"><Github className="w-5 h-5" /></a>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
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