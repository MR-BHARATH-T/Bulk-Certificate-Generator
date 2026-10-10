import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useJob } from '../hooks/useJob';
import { api } from '../services/api';
import { ArrowLeft, CheckCircle, XCircle, Clock, Download, Loader2, AlertCircle } from 'lucide-react';

const JobDetails = () => {
  const { jobId } = useParams();
  const { job, loading, error } = useJob(jobId);
  const [downloadingCert, setDownloadingCert] = useState(null);

  if (loading && !job) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="animate-spin text-blue-500" size={32} />
      </div>
    );
  }

  if (error || !job) {
    return (
      <div className="text-center py-12">
        <AlertCircle className="mx-auto text-red-500 mb-4" size={48} />
        <h2 className="text-xl font-bold text-slate-800">Job Not Found</h2>
        <p className="text-slate-500 mt-2">{error || "The job could not be loaded."}</p>
        <Link to="/" className="inline-block mt-6 text-blue-600 hover:underline">
          &larr; Back to Dashboard
        </Link>
      </div>
    );
  }

  const handleDownload = async (certId) => {
    try {
      setDownloadingCert(certId);
      const res = await api.getCertificateLink(certId);
      window.open(res.download_url, '_blank');
    } catch (err) {
      alert("Could not download certificate: " + (err.response?.data?.detail || err.message));
    } finally {
      setDownloadingCert(null);
    }
  };

  const StatusBadge = ({ status }) => {
    switch(status) {
      case 'COMPLETED': return <span className="px-2.5 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800 border border-green-200">Completed</span>;
      case 'PARTIALLY_COMPLETED': return <span className="px-2.5 py-1 text-xs font-medium rounded-full bg-yellow-100 text-yellow-800 border border-yellow-200">Partial Success</span>;
      case 'FAILED': return <span className="px-2.5 py-1 text-xs font-medium rounded-full bg-red-100 text-red-800 border border-red-200">Failed</span>;
      case 'PROCESSING': return <span className="px-2.5 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800 border border-blue-200 animate-pulse">Processing</span>;
      default: return <span className="px-2.5 py-1 text-xs font-medium rounded-full bg-slate-100 text-slate-800 border border-slate-200">Pending</span>;
    }
  };

  const isTerminal = ['COMPLETED', 'PARTIALLY_COMPLETED', 'FAILED'].includes(job.status);

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Link to="/" className="text-slate-400 hover:text-slate-600 transition-colors p-2 rounded-full hover:bg-slate-200">
          <ArrowLeft size={20} />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-slate-900">{job.event_name}</h1>
          <p className="text-sm text-slate-500">ID: {job.id}</p>
        </div>
        <div className="ml-auto flex items-center gap-4">
          <StatusBadge status={job.status} />
          {isTerminal && job.completed_count > 0 && (
            <a 
              href={api.getJobDownloadUrl(job.id)}
              className="inline-flex items-center px-4 py-2 bg-slate-900 text-white text-sm font-medium rounded-md hover:bg-slate-800 transition-colors shadow-sm"
            >
              <Download size={16} className="mr-2" /> Download All (ZIP)
            </a>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <div className="text-slate-500 text-sm mb-1 font-medium">Total Recipients</div>
          <div className="text-3xl font-bold text-slate-900">{job.total_count}</div>
        </div>
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <div className="text-slate-500 text-sm mb-1 font-medium">Completed</div>
          <div className="text-3xl font-bold text-green-600 flex items-center gap-2">
            {job.completed_count} <CheckCircle size={20} className="text-green-500 opacity-70" />
          </div>
        </div>
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <div className="text-slate-500 text-sm mb-1 font-medium">Failed</div>
          <div className="text-3xl font-bold text-red-600 flex items-center gap-2">
            {job.failed_count} <XCircle size={20} className="text-red-500 opacity-70" />
          </div>
        </div>
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <div className="text-slate-500 text-sm mb-1 font-medium">Progress</div>
          <div className="text-3xl font-bold text-blue-600">{job.percentage_completed}%</div>
          <div className="w-full bg-slate-100 h-2 rounded-full mt-3 overflow-hidden">
            <div 
              className="bg-blue-500 h-full rounded-full transition-all duration-500"
              style={{ width: `${job.percentage_completed}%` }}
            ></div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200 bg-slate-50">
          <h3 className="font-medium text-slate-800">Recipients List</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-slate-500 bg-white border-b border-slate-100 uppercase">
              <tr>
                <th className="px-6 py-3 font-medium">Name</th>
                <th className="px-6 py-3 font-medium">Email</th>
                <th className="px-6 py-3 font-medium">Status</th>
                <th className="px-6 py-3 font-medium">Message</th>
                <th className="px-6 py-3 font-medium text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {job.recipients?.map((rec) => (
                <tr key={rec.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-6 py-4 font-medium text-slate-900">{rec.full_name}</td>
                  <td className="px-6 py-4 text-slate-500">{rec.email || '-'}</td>
                  <td className="px-6 py-4">
                    {rec.status === 'COMPLETED' ? (
                      <span className="flex items-center text-green-600 gap-1.5"><CheckCircle size={14}/> Success</span>
                    ) : rec.status === 'FAILED' ? (
                      <span className="flex items-center text-red-600 gap-1.5"><XCircle size={14}/> Failed</span>
                    ) : (
                      <span className="flex items-center text-blue-600 gap-1.5"><Clock size={14} className={rec.status === 'PROCESSING' ? 'animate-spin' : ''}/> {rec.status}</span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-slate-500 max-w-xs truncate" title={rec.error_message || ''}>
                    {rec.error_message || '-'}
                  </td>
                  <td className="px-6 py-4 text-right">
                    {rec.status === 'COMPLETED' && (
                      <button 
                        onClick={() => handleDownload(rec.certificate_id)}
                        disabled={downloadingCert === rec.certificate_id}
                        className="inline-flex items-center text-blue-600 hover:text-blue-800 font-medium transition-colors disabled:opacity-50"
                      >
                        {downloadingCert === rec.certificate_id ? (
                          <><Loader2 size={16} className="animate-spin mr-1.5" /> Loading</>
                        ) : (
                          <><Download size={16} className="mr-1.5" /> PDF</>
                        )}
                      </button>
                    )}
                  </td>
                </tr>
              ))}
              {job.recipients?.length === 0 && (
                <tr>
                  <td colSpan="5" className="px-6 py-8 text-center text-slate-500">
                    No recipients found for this job.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default JobDetails;
