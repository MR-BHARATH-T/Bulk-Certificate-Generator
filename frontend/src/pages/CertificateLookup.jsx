import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../services/api';
import { useModal } from '../context/ModalContext';
import DownloadFormatDropdown from '../components/DownloadFormatDropdown';
import { 
  Award, 
  Search, 
  Eye, 
  Download, 
  RefreshCw, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  Loader2, 
  ExternalLink, 
  X,
  Calendar,
  Building,
  User,
  Mail,
  ShieldCheck,
  Plus,
  Trash2
} from 'lucide-react';

const CertificateLookup = () => {
  const { showConfirm, showAlert } = useModal();
  const [certificates, setCertificates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [viewingCert, setViewingCert] = useState(null);
  const [deletingCertId, setDeletingCertId] = useState(null);

  const fetchCertificates = async (query = '') => {
    try {
      setLoading(true);
      setError(null);
      const data = await api.listCertificates(query, 50);
      setCertificates(data || []);
    } catch (err) {
      setError(err.response?.data?.detail || err.message || 'Failed to load certificates');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteCertificate = async (cert) => {
    const confirmed = await showConfirm({
      title: 'Delete Certificate?',
      message: `Are you sure you want to delete ${cert.full_name}'s certificate (${cert.certificate_id})?\n\nThis will permanently remove the recipient record from the database and delete the generated certificate file from storage.`,
      confirmText: 'Delete Certificate',
      cancelText: 'Cancel',
      type: 'danger'
    });
    if (!confirmed) {
      return;
    }

    try {
      setDeletingCertId(cert.certificate_id);
      await api.deleteCertificate(cert.certificate_id);
      setCertificates(prev => prev.filter(c => c.certificate_id !== cert.certificate_id));
      if (viewingCert && viewingCert.certificate_id === cert.certificate_id) {
        setViewingCert(null);
      }
      showAlert({
        title: 'Certificate Deleted',
        message: `Certificate ${cert.certificate_id} for ${cert.full_name} has been permanently deleted.`,
        type: 'success'
      });
    } catch (err) {
      showAlert({
        title: 'Failed to Delete Certificate',
        message: err.response?.data?.detail || err.message || 'Failed to delete certificate',
        type: 'error'
      });
    } finally {
      setDeletingCertId(null);
    }
  };

  useEffect(() => {
    fetchCertificates(searchQuery);
  }, []);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchCertificates(searchQuery);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-lg bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600">
              <Award size={20} />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-900 tracking-tight">Certificates Directory</h1>
              <p className="text-xs text-slate-500">Search, preview inline, and download generated recipient certificates across all batches.</p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => fetchCertificates(searchQuery)}
            disabled={loading}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-colors cursor-pointer border border-slate-200"
            title="Refresh List"
          >
            <RefreshCw size={14} className={loading ? "animate-spin text-slate-600" : "text-slate-600"} />
            <span>Refresh</span>
          </button>

          <Link
            to="/"
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold transition-colors cursor-pointer shadow-sm"
          >
            <Plus size={15} />
            <span>Create Certificates</span>
          </Link>
        </div>
      </div>

      {/* Search Input Bar */}
      <form onSubmit={handleSearchSubmit} className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm flex flex-col sm:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search by recipient name, email, or Certificate ID (e.g., CERT-2026)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:bg-white transition-colors"
          />
        </div>
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <button
            type="submit"
            className="w-full sm:w-auto px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold transition-colors cursor-pointer"
          >
            Search
          </button>
          {searchQuery && (
            <button
              type="button"
              onClick={() => {
                setSearchQuery('');
                fetchCertificates('');
              }}
              className="px-3 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs font-semibold transition-colors cursor-pointer border border-slate-200"
            >
              Clear
            </button>
          )}
        </div>
      </form>

      {/* Error State */}
      {error && (
        <div className="bg-rose-50 border border-rose-200 text-rose-700 rounded-xl p-4 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <AlertCircle size={16} className="text-rose-600 flex-shrink-0" />
            <span>{error}</span>
          </div>
          <button 
            type="button" 
            onClick={() => fetchCertificates(searchQuery)} 
            className="underline font-semibold text-rose-800 hover:text-rose-950 cursor-pointer"
          >
            Retry
          </button>
        </div>
      )}

      {/* Certificates Table */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
        {loading && certificates.length === 0 ? (
          <div className="py-20 flex flex-col items-center justify-center text-slate-400">
            <Loader2 size={32} className="animate-spin text-blue-600 mb-3" />
            <p className="text-sm font-medium text-slate-600">Loading certificate catalog...</p>
          </div>
        ) : certificates.length === 0 ? (
          <div className="py-16 text-center text-slate-500 space-y-3">
            <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mx-auto text-slate-400">
              <Award size={22} />
            </div>
            <p className="text-sm font-medium text-slate-700">No certificates found</p>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">Generate certificates from the Studio to populate the directory.</p>
            <Link
              to="/"
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-blue-600 text-white text-xs font-semibold hover:bg-blue-700 transition-colors cursor-pointer"
            >
              <Plus size={14} />
              <span>Go to Studio</span>
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider text-[11px]">
                  <th className="py-3 px-4">Recipient</th>
                  <th className="py-3 px-4">Certificate ID</th>
                  <th className="py-3 px-4">Event & Organization</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {certificates.map((cert) => {
                  const isReady = cert.status === 'COMPLETED' && cert.has_file;

                  return (
                    <tr key={cert.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-slate-900 text-sm flex items-center gap-1.5">
                          <User size={13} className="text-blue-600" />
                          <span>{cert.full_name}</span>
                        </div>
                        <div className="flex items-center gap-1.5 mt-0.5 text-slate-500">
                          <Mail size={11} className="text-slate-400" />
                          <span>{cert.email}</span>
                        </div>
                      </td>

                      <td className="py-3.5 px-4 font-mono text-slate-600 font-semibold">
                        <span className="px-2 py-0.5 rounded bg-slate-100 border border-slate-200 text-[11px]">
                          {cert.certificate_id}
                        </span>
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="font-medium text-slate-800">{cert.event_name}</div>
                        <div className="text-slate-500 text-[11px] flex items-center gap-1 mt-0.5">
                          <Building size={11} className="text-slate-400" />
                          <span>{cert.organization_name || 'Organization'}</span>
                        </div>
                      </td>

                      <td className="py-3.5 px-4 whitespace-nowrap">
                        {cert.status === 'COMPLETED' ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                            <CheckCircle2 size={12} className="text-emerald-600" />
                            <span>Generated</span>
                          </span>
                        ) : cert.status === 'PROCESSING' ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">
                            <Loader2 size={12} className="animate-spin text-blue-600" />
                            <span>Processing</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
                            <Clock size={12} className="text-amber-600" />
                            <span>Pending</span>
                          </span>
                        )}
                      </td>

                      <td className="py-3.5 px-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-2">
                          {isReady ? (
                            <>
                              <button
                                type="button"
                                onClick={() => setViewingCert(cert)}
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200 font-semibold text-xs transition-colors cursor-pointer"
                                title="View Certificate Inline"
                              >
                                <Eye size={13} />
                                <span>View</span>
                              </button>

                              <DownloadFormatDropdown 
                                certificateId={cert.certificate_id}
                                buttonText="Download"
                                variant="secondary"
                                size="sm"
                              />
                            </>
                          ) : (
                            <span className="text-[11px] text-slate-400 italic">Generating...</span>
                          )}

                          <button
                            type="button"
                            onClick={() => handleDeleteCertificate(cert)}
                            disabled={deletingCertId === cert.certificate_id}
                            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 font-semibold text-xs transition-colors disabled:opacity-50 cursor-pointer"
                            title="Hard Delete Certificate & PDF"
                          >
                            {deletingCertId === cert.certificate_id ? (
                              <Loader2 size={13} className="animate-spin text-rose-600" />
                            ) : (
                              <Trash2 size={13} className="text-rose-600" />
                            )}
                            <span>Delete</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* PDF View Modal */}
      {viewingCert && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
          <div className="w-full max-w-4xl h-[85vh] bg-white border border-slate-200 rounded-xl shadow-2xl flex flex-col overflow-hidden">
            <div className="px-5 py-3.5 bg-white border-b border-slate-200 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600">
                  <ShieldCheck size={18} />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">
                    Certificate Viewer: {viewingCert.full_name}
                  </h3>
                  <p className="text-[11px] text-slate-500 font-mono">
                    ID: {viewingCert.certificate_id} &bull; {viewingCert.event_name}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <a
                  href={api.getCertificateViewUrl(viewingCert.certificate_id)}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold border border-slate-200 transition-colors cursor-pointer"
                  title="Open in new browser tab"
                >
                  <ExternalLink size={13} />
                  <span>Open Tab</span>
                </a>

                <DownloadFormatDropdown 
                  certificateId={viewingCert.certificate_id}
                  buttonText="Download"
                  variant="primary"
                  size="sm"
                />

                <button
                  type="button"
                  onClick={() => handleDeleteCertificate(viewingCert)}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-semibold transition-colors cursor-pointer"
                  title="Permanently Delete Certificate"
                >
                  <Trash2 size={13} className="text-rose-600" />
                  <span>Delete</span>
                </button>

                <button
                  type="button"
                  onClick={() => setViewingCert(null)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
                  title="Close viewer"
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            <div className="flex-1 bg-slate-100 relative">
              <iframe
                src={api.getCertificateViewUrl(viewingCert.certificate_id)}
                title={`Certificate for ${viewingCert.full_name}`}
                className="w-full h-full border-0"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CertificateLookup;
