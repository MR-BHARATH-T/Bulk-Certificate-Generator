import React, { useState, useRef, useEffect } from 'react';
import { Download, ChevronDown, FileText, Image as ImageIcon, Loader2 } from 'lucide-react';
import { api } from '../services/api';

const FORMAT_OPTIONS = [
  {
    key: 'pdf',
    label: 'PDF Document',
    ext: '.pdf',
    badge: 'Vector PDF',
    badgeColor: 'bg-rose-50 text-rose-700 border-rose-200',
    icon: FileText,
    desc: 'Official vector document with crisp text'
  },
  {
    key: 'png',
    label: 'PNG Image',
    ext: '.png',
    badge: '300 DPI',
    badgeColor: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    icon: ImageIcon,
    desc: 'Lossless high-resolution graphic'
  },
  {
    key: 'jpg',
    label: 'JPG Image',
    ext: '.jpg',
    badge: '300 DPI',
    badgeColor: 'bg-amber-50 text-amber-700 border-amber-200',
    icon: ImageIcon,
    desc: 'Universal photo format, easy sharing'
  },
  {
    key: 'jpeg',
    label: 'JPEG Image',
    ext: '.jpeg',
    badge: '300 DPI',
    badgeColor: 'bg-blue-50 text-blue-700 border-blue-200',
    icon: ImageIcon,
    desc: 'Full-fidelity 300 DPI JPEG raster'
  }
];

const DownloadFormatDropdown = ({
  certificateId = null,
  jobId = null,
  isZip = false,
  buttonText = 'Download',
  variant = 'secondary',
  size = 'sm',
  align = 'right',
  className = ''
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadingFormat, setDownloadingFormat] = useState(null);
  const dropdownRef = useRef(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleOutsideClick);
    }
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
    };
  }, [isOpen]);

  const handleDownload = async (formatKey) => {
    let url = '';
    if (isZip && jobId) {
      url = api.getJobDownloadUrl(jobId, formatKey);
    } else if (certificateId) {
      url = api.getCertificateDownloadUrl(certificateId, formatKey);
    }

    if (!url) return;

    setIsDownloading(true);
    setDownloadingFormat(formatKey);
    setIsOpen(false);

    try {
      const response = await fetch(url);
      if (!response.ok) {
        let errDetail = `Server returned status ${response.status}`;
        try {
          const errData = await response.json();
          errDetail = errData.detail || errDetail;
        } catch (_) {}
        throw new Error(errDetail);
      }

      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);

      // Extract filename from Content-Disposition header if available
      const disposition = response.headers.get('content-disposition');
      let filename = '';
      if (disposition && disposition.includes('filename=')) {
        const matches = /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/.exec(disposition);
        if (matches != null && matches[1]) {
          filename = matches[1].replace(/['"]/g, '');
        }
      }

      if (!filename) {
        const ext = formatKey === 'pdf' ? 'pdf' : formatKey;
        filename = isZip
          ? `certificates_${jobId ? String(jobId).slice(0, 8) : 'batch'}_${formatKey}.zip`
          : `certificate_${certificateId || 'export'}.${ext}`;
      }

      const link = document.createElement('a');
      link.href = blobUrl;
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      setTimeout(() => window.URL.revokeObjectURL(blobUrl), 2000);
    } catch (err) {
      console.warn('Direct blob download error, triggering native window fallback:', err);
      // Fallback: direct window navigation triggers browser native download
      window.location.href = url;
    } finally {
      setIsDownloading(false);
      setDownloadingFormat(null);
    }
  };

  // Styling variants
  const variantClasses = {
    primary: 'bg-blue-600 hover:bg-blue-700 text-white shadow-xs',
    secondary: 'bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-200 shadow-xs',
    subtle: 'bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200'
  }[variant] || 'bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-200 shadow-xs';

  const sizeClasses = {
    xs: 'px-2 py-1 text-[11px] gap-1',
    sm: 'px-2.5 py-1.5 text-xs gap-1.5',
    md: 'px-3.5 py-2 text-xs gap-2'
  }[size] || 'px-2.5 py-1.5 text-xs gap-1.5';

  return (
    <div className={`relative inline-block text-left ${className}`} ref={dropdownRef}>
      <button
        type="button"
        onClick={() => !isDownloading && setIsOpen(!isOpen)}
        disabled={isDownloading}
        className={`inline-flex items-center font-semibold rounded-lg transition-colors cursor-pointer select-none ${variantClasses} ${sizeClasses} ${isDownloading ? 'opacity-75 cursor-wait' : ''}`}
        aria-expanded={isOpen}
        aria-haspopup="true"
        title="Choose certificate download format (PDF, PNG, JPG, JPEG)"
      >
        {isDownloading ? (
          <>
            <Loader2 size={size === 'xs' ? 12 : 13} className="animate-spin text-current" />
            <span>{isZip ? 'Packaging ZIP...' : 'Downloading...'}</span>
          </>
        ) : (
          <>
            <Download size={size === 'xs' ? 12 : 13} />
            <span>{buttonText}</span>
            <ChevronDown 
              size={12} 
              className={`transition-transform duration-200 opacity-75 ${isOpen ? 'rotate-180' : ''}`} 
            />
          </>
        )}
      </button>

      {isOpen && (
        <div
          className={`absolute z-50 mt-1.5 w-60 rounded-xl bg-white border border-slate-200 shadow-xl py-1.5 text-slate-800 focus:outline-hidden animate-in fade-in-50 zoom-in-95 duration-100 ${
            align === 'right' ? 'right-0 origin-top-right' : 'left-0 origin-top-left'
          }`}
          role="menu"
        >
          <div className="px-3 py-1.5 border-b border-slate-100 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
            {isZip ? 'Download All As (ZIP)' : 'Select Export Format'}
          </div>

          <div className="py-1">
            {FORMAT_OPTIONS.map((opt) => {
              const Icon = opt.icon;
              return (
                <button
                  key={opt.key}
                  type="button"
                  onClick={() => handleDownload(opt.key)}
                  className="w-full px-3 py-2 text-left flex items-start gap-2.5 hover:bg-slate-50 transition-colors group cursor-pointer"
                  role="menuitem"
                >
                  <div className="p-1.5 rounded-lg bg-slate-100 group-hover:bg-blue-50 text-slate-600 group-hover:text-blue-600 transition-colors mt-0.5">
                    <Icon size={14} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-slate-900 group-hover:text-blue-600">
                        {isZip ? `${opt.label} Archive` : opt.label}
                      </span>
                      <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded border uppercase font-mono ${opt.badgeColor}`}>
                        {opt.ext}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 leading-tight mt-0.5">
                      {opt.desc}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default DownloadFormatDropdown;
