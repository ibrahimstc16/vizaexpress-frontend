import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getApplication, uploadDocument } from '../services/api';
import { Upload, CheckCircle, AlertCircle, Clock, FileText } from 'lucide-react';

export default function ApplicationDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [application, setApplication] = useState(null);
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    fetchApplication();
  }, [id]);

  const fetchApplication = async () => {
    try {
      const response = await getApplication(id);
      setApplication(response.data.application);
      setDocuments(response.data.documents || []);
    } catch (err) {
      console.error('Failed to fetch application:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (documentType, file) => {
    setUploading(true);
    const formData = new FormData();
    formData.append('file', file);
    formData.append('applicationId', id);
    formData.append('documentType', documentType);

    try {
      await uploadDocument(formData);
      fetchApplication();
      alert('Document uploaded successfully!');
    } catch (err) {
      alert('Upload failed: ' + (err.response?.data?.error || 'Unknown error'));
    } finally {
      setUploading(false);
    }
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  const getStatusIcon = (status) => {
    if (status === 'passed') return <CheckCircle className="w-5 h-5 text-green-500" />;
    if (status === 'warning') return <AlertCircle className="w-5 h-5 text-yellow-500" />;
    if (status === 'failed') return <AlertCircle className="w-5 h-5 text-red-500" />;
    return <Clock className="w-5 h-5 text-gray-400" />;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-indigo-600">VizaExpress</h1>
          <button onClick={() => navigate('/dashboard')} className="text-gray-600 hover:text-indigo-600">
            ← Back to Dashboard
          </button>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="bg-white rounded-xl shadow-md p-6 mb-6">
          <h2 className="text-2xl font-bold mb-4 capitalize">{application.package_type} Package</h2>
          <div className="w-full bg-gray-200 rounded-full h-3 mb-2">
            <div 
              className="bg-indigo-600 h-3 rounded-full"
              style={{ width: `${application.progress_percentage}%` }}
            />
          </div>
          <p className="text-sm text-gray-600">{application.progress_percentage}% Complete</p>
        </div>

        <div className="bg-white rounded-xl shadow-md p-6">
          <h3 className="text-xl font-bold mb-4">Required Documents</h3>
          
          <div className="space-y-4">
            {['passport', 'photo', 'residence_proof'].map((docType) => {
              const doc = documents.find(d => d.document_type === docType);
              
              return (
                <div key={docType} className="border rounded-lg p-4">
                  <div className="flex justify-between items-center mb-2">
                    <div className="flex items-center gap-2">
                      <FileText className="w-5 h-5" />
                      <h4 className="font-semibold capitalize">{docType.replace('_', ' ')}</h4>
                    </div>
                    {doc && getStatusIcon(doc.ai_validation_status)}
                  </div>

                  {!doc ? (
                    <label className="block">
                      <input
                        type="file"
                        className="hidden"
                        accept="image/*,.pdf"
                        onChange={(e) => handleFileUpload(docType, e.target.files[0])}
                        disabled={uploading}
                      />
                      <div className="border-2 border-dashed rounded-lg p-4 text-center cursor-pointer hover:bg-gray-50">
                        <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                        <p className="text-sm text-gray-600">Click to upload</p>
                      </div>
                    </label>
                  ) : (
                    <div className="bg-gray-50 rounded p-3">
                      <p className="text-sm text-gray-600 mb-1">
                        <strong>Status:</strong> {doc.ai_validation_status || 'Processing...'}
                      </p>
                      {doc.ai_validation_result && (
                        <div className="text-sm mt-2">
                          <p><strong>Confidence:</strong> {(doc.ai_validation_result.confidence * 100).toFixed(0)}%</p>
                          {doc.ai_validation_result.issues?.length > 0 && (
                            <div className="mt-2">
                              <strong>Issues:</strong>
                              <ul className="list-disc ml-5 mt-1">
                                {doc.ai_validation_result.issues.map((issue, i) => (
                                  <li key={i} className="text-red-600">{issue.message}</li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
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