import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getApplications, createApplication } from '../services/api';
import { Plus, FileText, Clock, CheckCircle } from 'lucide-react';

export default function Dashboard() {
  const navigate = useNavigate();
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (!userData) {
      navigate('/login');
      return;
    }
    setUser(JSON.parse(userData));
    fetchApplications();
  }, []);

  const fetchApplications = async () => {
    try {
      const response = await getApplications();
      setApplications(response.data.applications);
    } catch (err) {
      console.error('Failed to fetch applications:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleNewApplication = async (packageType) => {
    try {
      const response = await createApplication({ packageType });
      navigate(`/application/${response.data.application.id}`);
    } catch (err) {
      alert('Failed to create application');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/');
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-indigo-600">VizaExpress</h1>
          <div className="flex items-center gap-4">
            <span className="text-gray-600">Hello, {user?.fullName}</span>
            <button onClick={handleLogout} className="text-red-600 hover:text-red-700">
              Logout
            </button>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-3xl font-bold">My Applications</h2>
          <div className="relative group">
            <button className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 flex items-center gap-2">
              <Plus className="w-5 h-5" />
              New Application
            </button>
            <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-xl hidden group-hover:block z-10">
              <button onClick={() => handleNewApplication('express')} className="block w-full text-left px-4 py-2 hover:bg-gray-100">
                Express (199 PLN)
              </button>
              <button onClick={() => handleNewApplication('smart')} className="block w-full text-left px-4 py-2 hover:bg-gray-100">
                Smart (499 PLN)
              </button>
              <button onClick={() => handleNewApplication('concierge')} className="block w-full text-left px-4 py-2 hover:bg-gray-100">
                Concierge (999 PLN)
              </button>
            </div>
          </div>
        </div>

        {applications.length === 0 ? (
          <div className="bg-white rounded-xl shadow-md p-12 text-center">
            <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">No applications yet</h3>
            <p className="text-gray-600 mb-6">Start your first application to get your Karta Pobytu</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {applications.map((app) => (
              <div
                key={app.id}
                onClick={() => navigate(`/application/${app.id}`)}
                className="bg-white rounded-xl shadow-md p-6 cursor-pointer hover:shadow-lg transition"
              >
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="font-semibold text-lg capitalize">{app.package_type}</h3>
                    <p className="text-sm text-gray-500">
                      {new Date(app.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  {app.status === 'created' && <Clock className="w-5 h-5 text-yellow-500" />}
                  {app.status === 'completed' && <CheckCircle className="w-5 h-5 text-green-500" />}
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                  <div 
                    className="bg-indigo-600 h-2 rounded-full"
                    style={{ width: `${app.progress_percentage}%` }}
                  />
                </div>
                <p className="text-sm text-gray-600">{app.progress_percentage}% Complete</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}