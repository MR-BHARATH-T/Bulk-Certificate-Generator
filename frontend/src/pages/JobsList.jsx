import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { useModal } from '../context/ModalContext';
import DownloadFormatDropdown from '../components/DownloadFormatDropdown';
import { 
  Briefcase, 
  Layers, 
  Eye, 
  Download, 
  RefreshCw, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  Loader2, 
  Plus, 
  Calendar, 
  Building, 
  Search, 
  Users, 
  Trash2 
} from 'lucide-react';

const JobsList = () => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [deletingJobId, setDeletingJobId] = useState(null);
  const navigate = useNavigate();
  const { showConfirm, showAlert } = useModal();

  const fetchJobs = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await api.listJobs(50);
      setJobs(data || []);
    } catch (err) {
      setError(err.response?.data?.detail || err.message || 'Failed to load jobs');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteJob = async (jobId, eventName) => {
    const confirmed = await showConfirm({
      title: 'Delete Batch Job?',
      message: `Are you sure you want to delete the batch "${eventName}" (ID: ${jobId.substring(0, 8)})?\n\nThis will permanently delete all associated recipient certificates and generated files from storage.`,
      confirmText: 'Delete Batch',
      cancelText: 'Cancel',
      type: 'danger'
    });
    if (!confirmed) return;

    try {
      setDeletingJobId(jobId);
      await api.deleteJob(jobId);
      setJobs(prev => prev.filter(j => j.id !== jobId));
      showAlert({
        title: "Batch Deleted",
        message: `Batch "${eventName}" has been permanently removed.`,
        type: "success"
      });
    } catch (err) {
      showAlert({
        title: "Failed to Delete Batch",
        message: err.response?.data?.detail || err.message,
        type: "error"
      });
    } finally {
      setDeletingJobId(null);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, []);

  const filteredJobs = jobs.filter((job) => {
    const matchesSearch = 
      (job.event_name && job.event_name.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (job.organization_name && job.organization_name.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (job.id && job.id.toLowerCase().includes(searchQuery.toLowerCase()));

    if (!matchesSearch) return false;
    if (statusFilter === 'ALL') return true;
    return job.status === statusFilter;
  });

  const getStatusBadge = (status) => {
    switch (status) {
      case 'COMPLETED':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <CheckCircle2 size={13} className="text-emerald-600" />
            <span>Completed</span>
          </span>
        );
      case 'PROCESSING':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">
            <Loader2 size={13} className="animate-spin text-blue-600" />
            <span>Processing</span>
          </span>
        );
      case 'FAILED':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200">
            <AlertCircle size={13} className="text-rose-600" />
            <span>Failed</span>
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
            <Clock size={13} className="text-amber-600" />
            <span>Pending</span>
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-lg bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600">
              <Briefcase size={20} />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-900 tracking-tight">Generation Jobs & Batches</h1>
              <p className="text-xs text-slate-500">Monitor all bulk generation batches, check worker progress, and download ZIP archives.</p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={fetchJobs}
            disabled={loading}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-colors cursor-pointer border border-slate-200"
            title="Refresh Jobs"
          >
            <RefreshCw size={14} className={loading ? "animate-spin text-slate-600" : "text-slate-600"} />
            <span>Refresh</span>
          </button>

          <Link
            to="/"
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold transition-colors cursor-pointer shadow-sm"
          >
            <Plus size={15} />
            <span>New Generation Batch</span>
          </Link>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search by event, organization, or ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:bg-white transition-colors"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <span className="text-xs text-slate-500 font-medium">Status:</span>
          {['ALL', 'COMPLETED', 'PROCESSING', 'PENDING', 'FAILED'].map((st) => (
            <button
              key={st}
              type="button"
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                statusFilter === st
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Error state */}
      {error && (
        <div className="bg-rose-50 border border-rose-200 text-rose-700 rounded-xl p-4 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <AlertCircle size={16} className="text-rose-600 flex-shrink-0" />
            <span>{error}</span>
          </div>
          <button 
            type="button" 
            onClick={fetchJobs} 
            className="underline font-semibold text-rose-800 hover:text-rose-950 cursor-pointer"
          >
            Retry
          </button>
        </div>
      )}

      {/* Jobs Table */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
        {loading && jobs.length === 0 ? (
          <div className="py-20 flex flex-col items-center justify-center text-slate-400">
            <Loader2 size={32} className="animate-spin text-blue-600 mb-3" />
            <p className="text-sm font-medium text-slate-600">Loading batch generation history...</p>
          </div>
        ) : filteredJobs.length === 0 ? (
          <div className="py-16 text-center text-slate-500 space-y-3">
            <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mx-auto text-slate-400">
              <Briefcase size={22} />
            </div>
            <p className="text-sm font-medium text-slate-700">No generation jobs found matching your criteria</p>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">Create a new batch from the Studio to automatically generate and bundle certificates.</p>
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
                  <th className="py-3 px-4">Event & Organization</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Progress / Output</th>
                  <th className="py-3 px-4">Date Issued</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {filteredJobs.map((job) => {
                  const percent = job.total_count > 0 
                    ? Math.round((job.completed_count / job.total_count) * 100) 
                    : 0;

                  return (
                    <tr key={job.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-slate-900 text-sm">{job.event_name}</div>
                        <div className="flex items-center gap-2 mt-0.5 text-slate-500">
                          <Building size={12} className="text-slate-400" />
                          <span>{job.organization_name}</span>
                          <span className="text-slate-300">&bull;</span>
                          <span className="font-mono text-[10px] text-slate-400">ID: {job.id.substring(0, 8)}</span>
                        </div>
                      </td>

                      <td className="py-3.5 px-4 whitespace-nowrap">
                        {getStatusBadge(job.status)}
                      </td>

                      <td className="py-3.5 px-4 min-w-[160px]">
                        <div className="flex items-center justify-between text-[11px] mb-1 font-medium">
                          <span className="text-slate-700">{job.completed_count} of {job.total_count} certs</span>
                          <span className="text-slate-500 font-mono">{percent}%</span>
                        </div>
                        <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                          <div 
                            className={`h-full transition-all duration-300 ${
                              job.status === 'COMPLETED' ? 'bg-emerald-500' : 'bg-blue-600'
                            }`}
                            style={{ width: `${percent}%` }}
                          />
                        </div>
                      </td>

                      <td className="py-3.5 px-4 whitespace-nowrap text-slate-500">
                        <div className="flex items-center gap-1.5">
                          <Calendar size={13} className="text-slate-400" />
                          <span>
                            {job.created_at ? new Date(job.created_at).toLocaleDateString() : 'N/A'}
                          </span>
                        </div>
                      </td>

                      <td className="py-3.5 px-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => navigate(`/jobs/${job.id}`)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200 font-semibold text-xs transition-colors cursor-pointer"
                            title="View Job Details"
                          >
                            <Eye size={13} />
                            <span>View Job</span>
                          </button>

                          {job.status === 'COMPLETED' && (
                            <DownloadFormatDropdown 
                              jobId={job.id}
                              isZip={true}
                              buttonText="ZIP"
                              variant="secondary"
                              size="sm"
                            />
                          )}

                          <button
                            type="button"
                            onClick={() => handleDeleteJob(job.id, job.event_name)}
                            disabled={deletingJobId === job.id}
                            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200 font-semibold text-xs transition-colors cursor-pointer disabled:opacity-50"
                            title="Hard Delete Batch & All PDFs"
                          >
                            {deletingJobId === job.id ? (
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
    </div>
  );
};

export default JobsList;
