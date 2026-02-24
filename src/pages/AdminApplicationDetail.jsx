import { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { Sparkles, ArrowLeft, FileText, CheckCircle, AlertCircle, Clock, User, Mail, Phone, Download, Shield } from 'lucide-react';
import api from '../services/api';

export default function AdminApplicationDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [application, setApplication] = useState(null);
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    loadApplication();
  }, [id]);

  const loadApplication = async () => {
    try {
      const response = await api.get(`/admin/applications/${id}`);
      setApplication(response.data.application);
      setDocuments(response.data.documents || []);
    } catch (error) {
      console.error('Error loading application:', error);
      if (error.response?.status === 403) {
        navigate('/dashboard');
      }
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (newStatus) => {
    setUpdating(true);
    try {
      await api.put(`/admin/applications/${id}/status`, { status: newStatus });
      setApplication({ ...application, status: newStatus });
      alert('Durum güncellendi!');
    } catch (error) {
      console.error('Error updating status:', error);
      alert('Hata oluştu!');
    } finally {
      setUpdating(false);
    }
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

  const getValidationColor = (status) => {
    if (status === 'passed') return 'text-green-400 bg-green-400/20';
    if (status === 'issues') return 'text-yellow-400 bg-yellow-400/20';
    return 'text-blue-400 bg-blue-400/20';
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

  const getDocumentTypeLabel = (type) => {
    const labels = {
      passport: 'Pasaport',
      photo: 'Biyometrik Fotoğraf',
      residence_proof: 'İkamet Belgesi',
      insurance: 'Sağlık Sigortası',
      work_contract: 'İş Sözleşmesi',
      application_form: 'Başvuru Formu'
    };
    return labels[type] || type;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <Sparkles className="w-16 h-16 text-yellow-400 animate-spin" />
      </div>
    );
  }

  if (!application) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <p className="text-white">Başvuru bulunamadı</p>
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
        </div>
      </nav>

      <div className="max-w-5xl mx-auto px-4 py-8">
        <Link to="/admin" className="inline-flex items-center gap-2 text-gray-400 hover:text-white mb-6 transition-colors">
          <ArrowLeft className="w-5 h-5" />
          Admin Panel'e Dön
        </Link>

        {/* Kullanıcı Bilgileri */}
        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20 mb-6">
          <h2 className="text-xl font-bold text-white mb-4">Kullanıcı Bilgileri</h2>
          <div className="grid md:grid-cols-3 gap-4">
            <div className="flex items-center gap-3">
              <User className="w-5 h-5 text-purple-400" />
              <div>
                <p className="text-gray-400 text-sm">Ad Soyad</p>
                <p className="text-white">{application.full_name}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Mail className="w-5 h-5 text-purple-400" />
              <div>
                <p className="text-gray-400 text-sm">Email</p>
                <p className="text-white">{application.email}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Phone className="w-5 h-5 text-purple-400" />
              <div>
                <p className="text-gray-400 text-sm">Telefon</p>
                <p className="text-white">{application.phone || '-'}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Başvuru Bilgileri */}
        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20 mb-6">
          <h2 className="text-xl font-bold text-white mb-4">Başvuru Bilgileri</h2>
          <div className="grid md:grid-cols-4 gap-4 mb-6">
            <div>
              <p className="text-gray-400 text-sm">Paket</p>
              <p className="text-white font-semibold capitalize">{application.package_type}</p>
            </div>
            <div>
              <p className="text-gray-400 text-sm">Durum</p>
              <span className={`inline-block px-3 py-1 ${getStatusColor(application.status)} text-white rounded-full text-sm mt-1`}>
                {application.status}
              </span>
            </div>
            <div>
              <p className="text-gray-400 text-sm">Ödeme</p>
              <p className={`font-semibold ${application.paid ? 'text-green-400' : 'text-yellow-400'}`}>
                {application.paid ? 'Ödendi' : 'Ödenmedi'}
              </p>
            </div>
            <div>
              <p className="text-gray-400 text-sm">Tarih</p>
              <p className="text-white">{formatDate(application.created_at)}</p>
            </div>
          </div>

          {/* Durum Güncelleme */}
          <div className="border-t border-white/10 pt-4">
            <p className="text-gray-400 text-sm mb-3">Durumu Güncelle:</p>
            <div className="flex flex-wrap gap-2">
              {['pending', 'reviewing', 'approved', 'rejected'].map((status) => (
                <button
                  key={status}
                  onClick={() => updateStatus(status)}
                  disabled={updating || application.status === status}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    application.status === status
                      ? 'bg-white/20 text-white cursor-not-allowed'
                      : 'bg-white/10 text-gray-300 hover:bg-white/20 hover:text-white'
                  }`}
                >
                  {status === 'pending' && 'Beklemede'}
                  {status === 'reviewing' && 'İnceleniyor'}
                  {status === 'approved' && 'Onayla'}
                  {status === 'rejected' && 'Reddet'}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Belgeler */}
        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20">
          <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
            <FileText className="w-6 h-6 text-purple-400" />
            Yüklenen Belgeler ({documents.length})
          </h2>

          {documents.length === 0 ? (
            <p className="text-gray-400 text-center py-8">Henüz belge yüklenmemiş</p>
          ) : (
            <div className="grid md:grid-cols-2 gap-4">
              {documents.map((doc) => {
                const validation = doc.ai_validation_result || {};
                return (
                  <div key={doc.id} className="bg-white/5 rounded-xl p-4 border border-white/10">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="text-white font-medium">{getDocumentTypeLabel(doc.document_type)}</h3>
                        <p className="text-gray-400 text-sm truncate max-w-[200px]">{doc.original_filename}</p>
                      </div>
                      <span className={`px-2 py-1 rounded-full text-xs ${getValidationColor(doc.ai_validation_status)}`}>
                        {doc.ai_validation_status === 'passed' ? 'Geçti' : doc.ai_validation_status === 'issues' ? 'Sorunlu' : 'Bekliyor'}
                      </span>
                    </div>

                    {validation.score !== undefined && (
                      <div className="mb-2">
                        <div className="flex justify-between text-sm mb-1">
                          <span className="text-gray-400">AI Puanı</span>
                          <span className="text-white">{validation.score}/100</span>
                        </div>
                        <div className="w-full bg-white/10 rounded-full h-2">
                          <div
                            className={`h-2 rounded-full ${validation.score >= 70 ? 'bg-green-500' : 'bg-yellow-500'}`}
                            style={{ width: `${validation.score}%` }}
                          ></div>
                        </div>
                      </div>
                    )}

                    {validation.summary && (
                      <p className="text-gray-300 text-sm mb-2">{validation.summary}</p>
                    )}

                    {validation.issues && validation.issues.length > 0 && (
                      <div className="mt-2 p-2 bg-yellow-500/10 rounded-lg">
                        <p className="text-yellow-400 text-xs font-medium mb-1">Sorunlar:</p>
                        <ul className="text-yellow-300 text-xs space-y-1">
                          {validation.issues.map((issue, i) => (
                            <li key={i}>• {issue}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}