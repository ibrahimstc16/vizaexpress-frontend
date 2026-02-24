import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Sparkles, Users, FileText, CreditCard, CheckCircle, Clock, AlertCircle, LogOut, Eye, Shield } from 'lucide-react';
import api from '../services/api';

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const userData = localStorage.getItem('user');
    const token = localStorage.getItem('token');
    
    if (!token || !userData) {
      navigate('/login');
      return;
    }
    
    setUser(JSON.parse(userData));
    loadData();
  }, [navigate]);

  const loadData = async () => {
    try {
      const [statsRes, appsRes] = await Promise.all([
        api.get('/admin/stats'),
        api.get('/admin/applications')
      ]);
      setStats(statsRes.data);
      setApplications(appsRes.data.applications || []);
    } catch (error) {
      console.error('Error loading admin data:', error);
      if (error.response?.status === 403) {
        alert('Admin access required!');
        navigate('/dashboard');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/');
  };

  const getStatusColor = (status) => {
    const colors = {
      created: 'bg-gray-500',
      pending: 'bg-yellow-500',
      reviewing: 'bg-blue-500',
      approved: 'bg-green-500',
      rejected: 'bg-red-500',
      paid: 'bg-purple-500'
    };
    return colors[status] || 'bg-gray-500';
  };

  const getStatusText = (status) => {
    const texts = {
      created: 'Oluşturuldu',
      pending: 'Beklemede',
      reviewing: 'İnceleniyor',
      approved: 'Onaylandı',
      rejected: 'Reddedildi',
      paid: 'Ödendi'
    };
    return texts[status] || status;
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('tr-TR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <Sparkles className="w-16 h-16 text-yellow-400 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Navbar */}
      <nav className="bg-white/10 backdrop-blur-md border-b border-white/20">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <Link to="/" className="text-2xl font-bold text-white flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-yellow-400" />
            VizaExpress
            <span className="ml-2 px-2 py-1 bg-red-500 text-white text-xs rounded-full flex items-center gap-1">
              <Shield className="w-3 h-3" />
              ADMIN
            </span>
          </Link>
          <div className="flex items-center gap-4">
            <span className="text-white">{user?.email}</span>
            <button onClick={handleLogout} className="flex items-center gap-2 px-4 py-2 bg-red-500/20 hover:bg-red-500/30 border border-red-500/30 rounded-xl text-red-300">
              <LogOut className="w-5 h-5" />
              Çıkış
            </button>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-white mb-8">Admin Panel</h1>

        {/* İstatistikler */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center">
                <Users className="w-6 h-6 text-blue-400" />
              </div>
              <div>
                <p className="text-gray-400 text-sm">Toplam Kullanıcı</p>
                <p className="text-2xl font-bold text-white">{stats?.totalUsers || 0}</p>
              </div>
            </div>
          </div>

          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-purple-500/20 rounded-xl flex items-center justify-center">
                <FileText className="w-6 h-6 text-purple-400" />
              </div>
              <div>
                <p className="text-gray-400 text-sm">Toplam Başvuru</p>
                <p className="text-2xl font-bold text-white">{stats?.totalApplications || 0}</p>
              </div>
            </div>
          </div>

          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-green-500/20 rounded-xl flex items-center justify-center">
                <CreditCard className="w-6 h-6 text-green-400" />
              </div>
              <div>
                <p className="text-gray-400 text-sm">Ödenen Başvuru</p>
                <p className="text-2xl font-bold text-white">{stats?.paidApplications || 0}</p>
              </div>
            </div>
          </div>

          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-yellow-500/20 rounded-xl flex items-center justify-center">
                <FileText className="w-6 h-6 text-yellow-400" />
              </div>
              <div>
                <p className="text-gray-400 text-sm">Toplam Belge</p>
                <p className="text-2xl font-bold text-white">{stats?.totalDocuments || 0}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Başvuru Listesi */}
        <div className="bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 overflow-hidden">
          <div className="p-6 border-b border-white/10">
            <h2 className="text-xl font-bold text-white">Tüm Başvurular</h2>
          </div>

          {applications.length === 0 ? (
            <div className="p-12 text-center">
              <FileText className="w-16 h-16 text-gray-500 mx-auto mb-4" />
              <p className="text-gray-400">Henüz başvuru yok</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-white/5">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-medium text-gray-400">Kullanıcı</th>
                    <th className="px-6 py-4 text-left text-sm font-medium text-gray-400">Paket</th>
                    <th className="px-6 py-4 text-left text-sm font-medium text-gray-400">Durum</th>
                    <th className="px-6 py-4 text-left text-sm font-medium text-gray-400">Belgeler</th>
                    <th className="px-6 py-4 text-left text-sm font-medium text-gray-400">Tarih</th>
                    <th className="px-6 py-4 text-left text-sm font-medium text-gray-400">İşlem</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/10">
                  {applications.map((app) => (
                    <tr key={app.id} className="hover:bg-white/5 transition-colors">
                      <td className="px-6 py-4">
                        <div>
                          <p className="text-white font-medium">{app.full_name}</p>
                          <p className="text-gray-400 text-sm">{app.email}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="px-3 py-1 bg-purple-500/20 text-purple-300 rounded-full text-sm">
                          {app.package_type}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1 ${getStatusColor(app.status)} text-white rounded-full text-sm`}>
                          {getStatusText(app.status)}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-white">
                        {app.document_count || 0} belge
                      </td>
                      <td className="px-6 py-4 text-gray-400 text-sm">
                        {formatDate(app.created_at)}
                      </td>
                      <td className="px-6 py-4">
                        <Link
                          to={`/admin/application/${app.id}`}
                          className="flex items-center gap-1 px-3 py-2 bg-blue-500/20 hover:bg-blue-500/30 text-blue-300 rounded-lg text-sm transition-colors"
                        >
                          <Eye className="w-4 h-4" />
                          İncele
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}