import React, { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useJob } from '../hooks/useJob';
import { api } from '../services/api';
import { useModal } from '../context/ModalContext';
import DownloadFormatDropdown from '../components/DownloadFormatDropdown';
import { 
  ArrowLeft, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  Download, 
  Loader2, 
  AlertCircle, 
  FileText, 
  Building, 
  Eye, 
  ExternalLink, 
  X, 
  Trash2 
} from 'lucide-react';

const JobDetails = () => {
  const { jobId } = useParams();
  const { job, loading, error } = useJob(jobId);
  const [downloadingCert, setDownloadingCert] = useState(null);
  const [viewingRec, setViewingRec] = useState(null);
  const [deletingBatch, setDeletingBatch] = useState(false);
  const [deletingRecId, setDeletingRecId] = useState(null);
  const navigate = useNavigate();
  const { showConfirm, showAlert } = useModal();

  const handleDeleteBatch = async () => {
    if (!job) return;
    const confirmed = await showConfirm({
      title: 'Delete Batch Job?',
      message: `Are you sure you want to delete the batch "${job.event_name}" (ID: ${job.id})?\n\nThis will permanently delete the batch, all ${job.total_count} recipient records, and all generated certificate files from storage.`,
      confirmText: 'Delete Entire Batch',
      cancelText: 'Cancel',
      type: 'danger'
    });
    if (!confirmed) return;

    try {
      setDeletingBatch(true);
      await api.deleteJob(job.id);
      navigate('/jobs');
    } catch (err) {
      showAlert({
        title: "Failed to Delete Batch",
        message: err.response?.data?.detail || err.message,
        type: "error"
      });
      setDeletingBatch(false);
    }
  };

  const handleDeleteRecipient = async (rec) => {
    const certLabel = rec.certificate_id ? `(${rec.certificate_id})` : `(ID: ${rec.id})`;
    const confirmed = await showConfirm({
      title: 'Delete Certificate?',
      message: `Are you sure you want to delete ${rec.full_name}'s certificate ${certLabel}?\n\nThis will permanently remove the recipient record from the database and delete the generated certificate file from storage.`,
      confirmText: 'Delete Certificate',
      cancelText: 'Cancel',
      type: 'danger'
    });
    if (!confirmed) return;

    try {
      setDeletingRecId(rec.id);
      if (rec.certificate_id) {
        await api.deleteCertificate(rec.certificate_id);
      }
      // Update local recipients list in job
      if (job && job.recipients) {
        job.recipients = job.recipients.filter(r => r.id !== rec.id);
        job.total_count = Math.max(0, job.total_count - 1);
        if (rec.status === 'COMPLETED') {
          job.completed_count = Math.max(0, job.completed_count - 1);
        }
      }
      if (viewingRec && viewingRec.id === rec.id) {
        setViewingRec(null);
      }
      showAlert({
        title: "Certificate Deleted",
        message: `${rec.full_name}'s certificate has been permanently deleted.`,
        type: "success"
      });
    } catch (err) {
      showAlert({
        title: "Failed to Delete Certificate",
        message: err.response?.data?.detail || err.message,
        type: "error"
      });
    } finally {
      setDeletingRecId(null);
    }
  };

  if (loading && !job) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[350px] space-y-3">
        <Loader2 className="animate-spin text-blue-600" size={36} />
        <p className="text-xs font-medium text-slate-500">Loading batch details...</p>
      </div>
    );
  }

  if (error || !job) {
    return (
      <div className="text-center py-12 bg-white border border-slate-200 rounded-xl max-w-lg mx-auto shadow-sm">
        <AlertCircle className="mx-auto text-red-500 mb-3" size={40} />
        <h2 className="text-lg font-bold text-slate-900">Batch Not Found</h2>
        <p className="text-slate-500 mt-1 text-xs">{error || "The requested job could not be retrieved."}</p>
        <Link 
          to="/" 
          className="inline-flex items-center gap-1.5 mt-5 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium transition-colors cursor-pointer"
        >
          <ArrowLeft size={14} /> Back to Studio
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
      showAlert({
        title: "Download Failed",
        message: "Could not download certificate: " + (err.response?.data?.detail || err.message),
        type: "error"
      });
    } finally {
      setDownloadingCert(null);
    }
  };

  const StatusBadge = ({ status }) => {
    switch(status) {
      case 'COMPLETED': 
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 text-xs font-bold rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
            <CheckCircle2 size={12} /> Completed
          </span>
        );
      case 'PARTIALLY_COMPLETED': 
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 text-xs font-bold rounded-full bg-amber-50 text-amber-700 border border-amber-200">
            Partial Success
          </span>
        );
      case 'FAILED': 
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 text-xs font-bold rounded-full bg-red-50 text-red-700 border border-red-200">
            <XCircle size={12} /> Failed
          </span>
        );
      case 'PROCESSING': 
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 text-xs font-bold rounded-full bg-blue-50 text-blue-700 border border-blue-200 animate-pulse">
            <Loader2 size={12} className="animate-spin" /> Processing
          </span>
        );
      default: 
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 text-xs font-bold rounded-full bg-slate-100 text-slate-700 border border-slate-200">
            <Clock size={12} /> Queued
          </span>
        );
    }
  };

  const isTerminal = ['COMPLETED', 'PARTIALLY_COMPLETED', 'FAILED'].includes(job.status);

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Top Header Card - Clean Light UI */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-start gap-4">
          <Link 
            to="/" 
            className="text-slate-600 hover:text-slate-900 transition-colors p-2 rounded-lg bg-slate-100 hover:bg-slate-200 border border-slate-200 mt-0.5 cursor-pointer"
            title="Return to Studio"
          >
            <ArrowLeft size={16} />
          </Link>
          <div className="space-y-1">
            <div className="flex items-center gap-3">
              <h1 className="text-xl font-bold text-slate-900">{job.event_name}</h1>
              <StatusBadge status={job.status} />
            </div>
            <div className="flex items-center gap-3 text-xs text-slate-500">
              <span className="flex items-center gap-1 text-slate-700 font-medium">
                <Building size={13} className="text-slate-500" />
                {job.organization_name}
              </span>
              <span>&bull;</span>
              <span className="font-mono text-slate-500">Batch ID: {job.id}</span>
            </div>
          </div>
        </div>

        {/* Action Buttons: Download All ZIP & Delete Batch */}
        <div className="flex items-center gap-2.5 self-end md:self-auto">
          {isTerminal && job.completed_count > 0 && (
            <DownloadFormatDropdown 
              jobId={job.id}
              isZip={true}
              buttonText="Download All (ZIP)"
              variant="primary"
              size="md"
            />
          )}

          <button
            type="button"
            onClick={handleDeleteBatch}
            disabled={deletingBatch}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-semibold rounded-lg transition-colors cursor-pointer disabled:opacity-50"
            title="Hard Delete Entire Batch & Storage"
          >
            {deletingBatch ? (
              <Loader2 size={14} className="animate-spin text-rose-600" />
            ) : (
              <Trash2 size={14} className="text-rose-600" />
            )}
            <span>Delete Batch</span>
          </button>
        </div>
      </div>

      {/* 4 Disciplined Metrics Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <div className="text-slate-500 text-xs font-semibold uppercase tracking-wider mb-1">Total Recipients</div>
          <div className="text-2xl font-bold text-slate-900">{job.total_count}</div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <div className="text-slate-500 text-xs font-semibold uppercase tracking-wider mb-1">Generated</div>
          <div className="text-2xl font-bold text-emerald-600 flex items-center gap-1.5">
            {job.completed_count} 
            <CheckCircle2 size={18} className="text-emerald-500" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <div className="text-slate-500 text-xs font-semibold uppercase tracking-wider mb-1">Failed</div>
          <div className="text-2xl font-bold text-red-600 flex items-center gap-1.5">
            {job.failed_count} 
            {job.failed_count > 0 && <XCircle size={18} className="text-red-500" />}
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <div className="text-slate-500 text-xs font-semibold uppercase tracking-wider mb-1">Batch Progress</div>
          <div className="text-2xl font-bold text-blue-600">{job.percentage_completed}%</div>
          <div className="w-full bg-slate-100 h-2 rounded-full mt-2.5 overflow-hidden">
            <div 
              className="bg-blue-600 h-full rounded-full transition-all duration-500"
              style={{ width: `${job.percentage_completed}%` }}
            />
          </div>
        </div>
      </div>

      {/* Recipients Table Card */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileText size={15} className="text-blue-600" />
            <h3 className="font-bold text-sm text-slate-900">Recipient Certificates</h3>
          </div>
          <span className="text-xs text-slate-500 font-mono">
            {job.recipients?.length || 0} Records
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="text-[11px] text-slate-500 bg-white border-b border-slate-200 uppercase tracking-wider font-semibold">
              <tr>
                <th className="px-6 py-3.5">Recipient Name</th>
                <th className="px-6 py-3.5">Email</th>
                <th className="px-6 py-3.5">Status</th>
                <th className="px-6 py-3.5">Certificate ID</th>
                <th className="px-6 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-sans">
              {job.recipients?.map((rec) => (
                <tr key={rec.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-3.5 font-semibold text-slate-900">{rec.full_name}</td>
                  <td className="px-6 py-3.5 text-slate-500 font-mono text-[11px]">{rec.email || '&mdash;'}</td>
                  <td className="px-6 py-3.5">
                    {rec.status === 'COMPLETED' ? (
                      <span className="inline-flex items-center text-emerald-700 gap-1 font-medium">
                        <CheckCircle2 size={13} className="text-emerald-600" /> Generated
                      </span>
                    ) : rec.status === 'FAILED' ? (
                      <span className="inline-flex items-center text-red-700 gap-1 font-medium">
                        <XCircle size={13} className="text-red-600" /> Failed
                      </span>
                    ) : (
                      <span className="inline-flex items-center text-blue-700 gap-1 font-medium">
                        <Loader2 size={12} className="animate-spin text-blue-600" /> In Progress
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-3.5 font-mono text-slate-500 text-[11px]">
                    {rec.certificate_id || '&mdash;'}
                  </td>
                  <td className="px-6 py-3.5 text-right">
                    <div className="flex items-center justify-end gap-2">
                      {rec.status === 'COMPLETED' && (
                        <>
                          {/* VIEW CERTIFICATE BUTTON */}
                          <button 
                            type="button"
                            onClick={() => setViewingRec(rec)}
                            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300 text-xs font-semibold transition-colors cursor-pointer"
                            title={`View ${rec.full_name}'s Certificate`}
                          >
                            <Eye size={13} className="text-slate-600" />
                            <span>View</span>
                          </button>

                          {/* DOWNLOAD FORMAT DROPDOWN */}
                          <DownloadFormatDropdown 
                            certificateId={rec.certificate_id}
                            buttonText="Download"
                            variant="subtle"
                            size="sm"
                          />
                        </>
                      )}

                      {/* DELETE CERTIFICATE BUTTON */}
                      <button
                        type="button"
                        onClick={() => handleDeleteRecipient(rec)}
                        disabled={deletingRecId === rec.id}
                        className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-semibold transition-colors disabled:opacity-50 cursor-pointer"
                        title={`Hard delete ${rec.full_name}'s certificate from database and disk`}
                      >
                        {deletingRecId === rec.id ? (
                          <Loader2 size={12} className="animate-spin text-rose-600" />
                        ) : (
                          <Trash2 size={12} className="text-rose-600" />
                        )}
                        <span>Delete</span>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}

              {(!job.recipients || job.recipients.length === 0) && (
                <tr>
                  <td colSpan="5" className="px-6 py-8 text-center text-slate-500">
                    No recipients found in this batch.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* POPUP MODAL TO VIEW COMPLETE CERTIFICATE */}
      {viewingRec && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="w-full max-w-4xl bg-white border border-slate-200 rounded-xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
            {/* Modal Header */}
            <div className="px-6 py-3.5 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <FileText size={18} className="text-blue-600" />
                <div>
                  <h3 className="font-bold text-sm text-slate-900">
                    {viewingRec.full_name}'s Certificate
                  </h3>
                  <span className="text-[11px] font-mono text-slate-500">
                    ID: {viewingRec.certificate_id}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <a
                  href={api.getCertificateViewUrl(viewingRec.certificate_id)}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 px-3 py-1.5 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold border border-slate-300 transition-colors cursor-pointer"
                  title="Open in new window"
                >
                  <ExternalLink size={13} />
                  <span>Open Tab</span>
                </a>

                <DownloadFormatDropdown 
                  certificateId={viewingRec.certificate_id}
                  buttonText="Download"
                  variant="primary"
                  size="sm"
                />

                <button
                  type="button"
                  onClick={() => handleDeleteRecipient(viewingRec)}
                  className="inline-flex items-center gap-1 px-3 py-1.5 rounded bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-semibold transition-colors cursor-pointer"
                  title="Permanently Delete Certificate"
                >
                  <Trash2 size={13} className="text-rose-600" />
                  <span>Delete</span>
                </button>

                <button
                  type="button"
                  onClick={() => setViewingRec(null)}
                  className="text-slate-400 hover:text-slate-700 p-1.5 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer ml-1"
                  title="Close viewer"
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            {/* Modal Body: Embedded PDF Canvas Viewer */}
            <div className="flex-1 p-4 bg-slate-100 min-h-[540px] flex items-center justify-center overflow-hidden">
              <iframe 
                src={api.getCertificateViewUrl(viewingRec.certificate_id)}
                title={`${viewingRec.full_name} Certificate Preview`}
                className="w-full h-[580px] border border-slate-300 rounded-lg bg-white shadow-sm"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default JobDetails;
