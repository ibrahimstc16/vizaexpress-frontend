import { useState } from 'react';
import { Mail, Phone, MapPin, Send, CheckCircle, MessageCircle, Clock } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const translations = {
  en: {
    hero: { title: 'Get in', highlight: 'Touch' },
    form: { name: 'Your Name', email: 'Email Address', subject: 'Subject', message: 'Your Message', btn: 'Send Message', success: 'Message sent! We will respond within 24 hours.' },
    info: { title: 'Contact Information', email: 'hello@vizaexpress.pl', phone: '+48 123 456 789', address: 'Warsaw, Poland', hours: 'Mon-Fri: 9:00 - 18:00 CET' }
  },
  pl: {
    hero: { title: 'Skontaktuj', highlight: 'się' },
    form: { name: 'Imię i nazwisko', email: 'Adres email', subject: 'Temat', message: 'Wiadomość', btn: 'Wyślij', success: 'Wiadomość wysłana! Odpowiemy w ciągu 24 godzin.' },
    info: { title: 'Dane kontaktowe', email: 'hello@vizaexpress.pl', phone: '+48 123 456 789', address: 'Warszawa, Polska', hours: 'Pon-Pt: 9:00 - 18:00' }
  },
  uk: {
    hero: { title: 'Зв\'яжіться', highlight: 'з нами' },
    form: { name: 'Ваше ім\'я', email: 'Email', subject: 'Тема', message: 'Повідомлення', btn: 'Надіслати', success: 'Повідомлення надіслано!' },
    info: { title: 'Контактна інформація', email: 'hello@vizaexpress.pl', phone: '+48 123 456 789', address: 'Варшава, Польща', hours: 'Пн-Пт: 9:00 - 18:00' }
  },
  tr: {
    hero: { title: 'Bize', highlight: 'Ulaşın' },
    form: { name: 'Adınız', email: 'E-posta', subject: 'Konu', message: 'Mesajınız', btn: 'Gönder', success: 'Mesaj gönderildi! 24 saat içinde yanıt vereceğiz.' },
    info: { title: 'İletişim Bilgileri', email: 'hello@vizaexpress.pl', phone: '+48 123 456 789', address: 'Varşova, Polonya', hours: 'Pzt-Cum: 9:00 - 18:00' }
  },
  ru: {
    hero: { title: 'Свяжитесь', highlight: 'с нами' },
    form: { name: 'Ваше имя', email: 'Email', subject: 'Тема', message: 'Сообщение', btn: 'Отправить', success: 'Сообщение отправлено!' },
    info: { title: 'Контактная информация', email: 'hello@vizaexpress.pl', phone: '+48 123 456 789', address: 'Варшава, Польша', hours: 'Пн-Пт: 9:00 - 18:00' }
  }
};

export default function Contact() {
  const { lang } = useLanguage();
  const [sent, setSent] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' });
  const [focused, setFocused] = useState('');
  const t = translations[lang];

  const handleSubmit = (e) => {
    e.preventDefault();
    setSent(true);
    setForm({ name: '', email: '', subject: '', message: '' });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 relative overflow-hidden">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-96 h-96 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse"></div>
        <div className="absolute top-40 right-10 w-96 h-96 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse" style={{animationDelay: '1s'}}></div>
      </div>

      <Navbar />

      <div className="relative z-10 max-w-6xl mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <div className="inline-block p-4 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-full mb-6 hover:scale-110 transition-transform">
            <MessageCircle className="w-16 h-16 text-purple-400" />
          </div>
          <h1 className="text-5xl md:text-6xl font-extrabold text-white mb-4">
            {t.hero.title}{' '}
            <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
              {t.hero.highlight}
            </span>
          </h1>
        </div>

        <div className="grid md:grid-cols-2 gap-12">
          <div className="bg-white/10 backdrop-blur-md rounded-3xl p-8 border border-white/20 hover:border-white/30 hover:shadow-xl hover:shadow-purple-500/10 transition-all duration-500">
            {sent ? (
              <div className="text-center py-12">
                <div className="w-20 h-20 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6 animate-bounce">
                  <CheckCircle className="w-10 h-10 text-white" />
                </div>
                <p className="text-xl text-white">{t.form.success}</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                {[
                  { key: 'name', type: 'text', label: t.form.name },
                  { key: 'email', type: 'email', label: t.form.email },
                  { key: 'subject', type: 'text', label: t.form.subject },
                ].map((field) => (
                  <div key={field.key}>
                    <label className={`block text-sm font-medium mb-2 transition-colors duration-300 ${focused === field.key ? 'text-purple-400' : 'text-gray-200'}`}>
                      {field.label}
                    </label>
                    <input
                      type={field.type}
                      required
                      value={form[field.key]}
                      onChange={(e) => setForm({...form, [field.key]: e.target.value})}
                      onFocus={() => setFocused(field.key)}
                      onBlur={() => setFocused('')}
                      className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:border-purple-400 focus:ring-2 focus:ring-purple-400/50 focus:bg-white/15 hover:border-white/40 transition-all duration-300"
                    />
                  </div>
                ))}
                <div>
                  <label className={`block text-sm font-medium mb-2 transition-colors duration-300 ${focused === 'message' ? 'text-purple-400' : 'text-gray-200'}`}>
                    {t.form.message}
                  </label>
                  <textarea
                    required
                    rows={5}
                    value={form.message}
                    onChange={(e) => setForm({...form, message: e.target.value})}
                    onFocus={() => setFocused('message')}
                    onBlur={() => setFocused('')}
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:border-purple-400 focus:ring-2 focus:ring-purple-400/50 focus:bg-white/15 hover:border-white/40 transition-all duration-300 resize-none"
                  />
                </div>
                <button
                  type="submit"
                  className="group w-full py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-semibold hover:scale-105 hover:shadow-xl hover:shadow-purple-500/30 transition-all duration-300 flex items-center justify-center gap-2"
                >
                  <Send className="w-5 h-5 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                  {t.form.btn}
                </button>
              </form>
            )}
          </div>

          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-white mb-6">{t.info.title}</h2>
            
            {[
              { icon: Mail, label: 'Email', value: t.info.email, color: 'from-purple-500 to-pink-500' },
              { icon: Phone, label: 'Phone', value: t.info.phone, color: 'from-blue-500 to-cyan-500' },
              { icon: MapPin, label: 'Address', value: t.info.address, color: 'from-pink-500 to-red-500' },
            ].map((item, i) => (
              <div 
                key={i}
                className="group bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20 flex items-center gap-4 hover:bg-white/15 hover:scale-105 hover:border-purple-400/50 hover:shadow-xl hover:shadow-purple-500/20 transition-all duration-300 cursor-pointer"
              >
                <div className={`bg-gradient-to-br ${item.color} w-14 h-14 rounded-xl flex items-center justify-center group-hover:rotate-12 group-hover:scale-110 transition-all duration-300 shadow-lg`}>
                  <item.icon className="w-7 h-7 text-white" />
                </div>
                <div>
                  <p className="text-gray-400 text-sm group-hover:text-gray-300 transition-colors">{item.label}</p>
                  <p className="text-white font-medium text-lg group-hover:text-purple-300 transition-colors">{item.value}</p>
                </div>
              </div>
            ))}

            <div className="bg-gradient-to-r from-purple-600/30 to-pink-600/30 backdrop-blur-md rounded-2xl p-6 border border-white/20 hover:border-purple-400/50 hover:scale-105 transition-all duration-300 cursor-pointer group">
              <div className="flex items-center gap-3 text-gray-300 group-hover:text-white transition-colors">
                <Clock className="w-6 h-6 text-purple-400 group-hover:rotate-12 transition-transform" />
                <span className="text-lg">🕐 {t.info.hours}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}