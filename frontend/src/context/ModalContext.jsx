import React, { createContext, useContext, useState, useCallback, useRef } from 'react';
import { 
  AlertTriangle, 
  AlertCircle, 
  CheckCircle2, 
  Info, 
  X, 
  Trash2 
} from 'lucide-react';

const ModalContext = createContext(null);

export const ModalProvider = ({ children }) => {
  const [modalConfig, setModalConfig] = useState(null);
  const resolverRef = useRef(null);

  const closeModal = useCallback((result = false) => {
    if (resolverRef.current) {
      resolverRef.current(result);
      resolverRef.current = null;
    }
    setModalConfig(null);
  }, []);

  const showConfirm = useCallback(({
    title = 'Confirm Action',
    message = 'Are you sure you want to proceed?',
    confirmText = 'Confirm',
    cancelText = 'Cancel',
    type = 'danger', // 'danger' | 'warning' | 'info'
    icon = null
  }) => {
    return new Promise((resolve) => {
      resolverRef.current = resolve;
      setModalConfig({
        mode: 'confirm',
        title,
        message,
        confirmText,
        cancelText,
        type,
        icon
      });
    });
  }, []);

  const showAlert = useCallback(({
    title = 'Notification',
    message = '',
    confirmText = 'OK',
    type = 'info', // 'info' | 'warning' | 'error' | 'success'
    icon = null
  }) => {
    return new Promise((resolve) => {
      resolverRef.current = resolve;
      setModalConfig({
        mode: 'alert',
        title,
        message,
        confirmText,
        type,
        icon
      });
    });
  }, []);

  const getIconAndColors = (type, mode) => {
    if (type === 'danger' || type === 'error') {
      return {
        icon: mode === 'confirm' ? <Trash2 size={22} className="text-rose-600" /> : <AlertCircle size={22} className="text-rose-600" />,
        badgeBg: 'bg-rose-50 border-rose-200',
        confirmBtn: 'bg-rose-600 hover:bg-rose-700 text-white focus:ring-rose-500'
      };
    }
    if (type === 'warning') {
      return {
        icon: <AlertTriangle size={22} className="text-amber-600" />,
        badgeBg: 'bg-amber-50 border-amber-200',
        confirmBtn: 'bg-amber-600 hover:bg-amber-700 text-white focus:ring-amber-500'
      };
    }
    if (type === 'success') {
      return {
        icon: <CheckCircle2 size={22} className="text-emerald-600" />,
        badgeBg: 'bg-emerald-50 border-emerald-200',
        confirmBtn: 'bg-emerald-600 hover:bg-emerald-700 text-white focus:ring-emerald-500'
      };
    }
    return {
      icon: <Info size={22} className="text-blue-600" />,
      badgeBg: 'bg-blue-50 border-blue-200',
      confirmBtn: 'bg-blue-600 hover:bg-blue-700 text-white focus:ring-blue-500'
    };
  };

  return (
    <ModalContext.Provider value={{ showConfirm, showAlert, closeModal }}>
      {children}

      {/* Global Custom Pop-up Modal */}
      {modalConfig && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200"
          onClick={(e) => {
            if (e.target === e.currentTarget && modalConfig.mode === 'alert') {
              closeModal(false);
            }
          }}
        >
          <div 
            className="w-full max-w-md bg-white rounded-2xl border border-slate-200 shadow-2xl overflow-hidden flex flex-col animate-in zoom-in-95 duration-150"
            role="dialog"
            aria-modal="true"
          >
            {/* Modal Body */}
            <div className="p-6">
              <div className="flex items-start gap-4">
                {/* Visual Icon Badge */}
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center border flex-shrink-0 ${getIconAndColors(modalConfig.type, modalConfig.mode).badgeBg}`}>
                  {modalConfig.icon || getIconAndColors(modalConfig.type, modalConfig.mode).icon}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0 pt-0.5">
                  <div className="flex items-center justify-between">
                    <h3 className="text-base font-bold text-slate-900 tracking-tight leading-snug">
                      {modalConfig.title}
                    </h3>
                    <button
                      type="button"
                      onClick={() => closeModal(false)}
                      className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100 transition-colors -mr-1 -mt-1 cursor-pointer"
                      title="Close"
                    >
                      <X size={16} />
                    </button>
                  </div>
                  <div className="mt-2 text-xs text-slate-600 leading-relaxed whitespace-pre-line">
                    {modalConfig.message}
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Actions Footer */}
            <div className="px-6 py-3.5 bg-slate-50 border-t border-slate-200 flex items-center justify-end gap-2.5">
              {modalConfig.mode === 'confirm' && (
                <button
                  type="button"
                  onClick={() => closeModal(false)}
                  className="px-4 py-2 rounded-lg bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 text-xs font-semibold transition-colors cursor-pointer"
                >
                  {modalConfig.cancelText || 'Cancel'}
                </button>
              )}
              <button
                type="button"
                onClick={() => closeModal(true)}
                autoFocus
                className={`px-4 py-2 rounded-lg text-xs font-semibold transition-colors shadow-xs cursor-pointer focus:outline-none focus:ring-2 focus:ring-offset-2 ${getIconAndColors(modalConfig.type, modalConfig.mode).confirmBtn}`}
              >
                {modalConfig.confirmText || 'Confirm'}
              </button>
            </div>
          </div>
        </div>
      )}
    </ModalContext.Provider>
  );
};

export const useModal = () => {
  const context = useContext(ModalContext);
  if (!context) {
    throw new Error('useModal must be used within a ModalProvider');
  }
  return context;
};

export default ModalContext;
