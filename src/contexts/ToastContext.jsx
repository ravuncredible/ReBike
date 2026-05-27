import { createContext, useContext, useState, useCallback, useId } from 'react';
import { useModalA11y } from '../hooks/useModalA11y';

const ToastContext = createContext({});

/** ตัด emoji นำหน้าที่ซ้ำกับ toast-icon */
function stripDuplicateToastEmoji(message) {
  if (typeof message !== 'string') return message;
  return message.replace(/^[\s]*(?:✅|❌|⚠️|ℹ️|👋|🚪)\s*/u, '').trimStart();
}

function ConfirmModal({ confirmModal, onOverlayClick }) {
  const titleId = useId();
  const contentRef = useModalA11y(!!confirmModal, () => confirmModal?.onCancel?.());

  if (!confirmModal) return null;

  return (
    <div
      className="custom-modal-overlay"
      onClick={onOverlayClick}
      role="presentation"
    >
      <div
        ref={contentRef}
        className="custom-modal-content modal-slide-in"
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        onClick={(e) => e.stopPropagation()}
      >
        <div className={`custom-modal-header type-${confirmModal.type || 'warning'}`}>
          {confirmModal.icon && <div className="custom-modal-icon">{confirmModal.icon}</div>}
          <h3 id={titleId} className="custom-modal-title">{confirmModal.title}</h3>
        </div>
        <div className="custom-modal-body">
          {confirmModal.messageContent ? (
            <div className="custom-modal-message">{confirmModal.messageContent}</div>
          ) : (
            <p className="custom-modal-message">{confirmModal.message}</p>
          )}
        </div>
        <div className="custom-modal-footer">
          {confirmModal.cancelText && (
            <button type="button" className="custom-modal-btn custom-modal-btn-cancel" onClick={confirmModal.onCancel}>
              {confirmModal.cancelText}
            </button>
          )}
          <button
            type="button"
            className={`custom-modal-btn custom-modal-btn-confirm type-${confirmModal.type || 'warning'}`}
            onClick={confirmModal.onConfirm}
          >
            {confirmModal.confirmText || 'ยืนยัน'}
          </button>
        </div>
      </div>
    </div>
  );
}

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);
  const [confirmModal, setConfirmModal] = useState(null);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  const addToast = useCallback((message, type = 'info', duration = 3000) => {
    const id = Date.now().toString();
    const cleanMessage = stripDuplicateToastEmoji(message);
    setToasts((prev) => [...prev, { id, message: cleanMessage, type }]);

    if (duration > 0) {
      setTimeout(() => removeToast(id), duration);
    }
  }, [removeToast]);

  const success = useCallback((message, duration) => addToast(message, 'success', duration), [addToast]);
  const error = useCallback((message, duration) => addToast(message, 'error', duration), [addToast]);
  const warning = useCallback((message, duration) => addToast(message, 'warning', duration), [addToast]);
  const info = useCallback((message, duration) => addToast(message, 'info', duration), [addToast]);

  const showConfirm = useCallback((options) => {
    return new Promise((resolve) => {
      setConfirmModal({
        ...options,
        onConfirm: () => {
          setConfirmModal(null);
          resolve(true);
        },
        onCancel: () => {
          setConfirmModal(null);
          resolve(false);
        }
      });
    });
  }, []);

  const customAlert = useCallback((message, type = 'info') => {
    return showConfirm({
      title: type === 'error' ? 'เกิดข้อผิดพลาด' : type === 'success' ? 'สำเร็จ' : 'แจ้งเตือน',
      message,
      confirmText: 'ตกลง',
      cancelText: '',
      type: type === 'error' ? 'danger' : type === 'success' ? 'success' : type === 'warning' ? 'warning' : 'info',
    });
  }, [showConfirm]);

  const handleConfirmOverlay = (e) => {
    if (e.target !== e.currentTarget) return;
    if (confirmModal?.cancelText) {
      confirmModal.onCancel();
    }
  };

  return (
    <ToastContext.Provider value={{ success, error, warning, info, showConfirm, customAlert }}>
      {children}

      <div className="toast-container" aria-live="polite">
        {toasts.map((toast) => (
          <div key={toast.id} className={`custom-toast custom-toast-${toast.type}`}>
            <div className="toast-icon" aria-hidden="true">
              {toast.type === 'success' && '✅'}
              {toast.type === 'error' && '❌'}
              {toast.type === 'warning' && '⚠️'}
              {toast.type === 'info' && 'ℹ️'}
            </div>
            <div className="toast-message">{toast.message}</div>
            <button type="button" className="toast-close" onClick={() => removeToast(toast.id)} aria-label="ปิดการแจ้งเตือน">×</button>
          </div>
        ))}
      </div>

      <ConfirmModal confirmModal={confirmModal} onOverlayClick={handleConfirmOverlay} />
    </ToastContext.Provider>
  );
};

export const useToast = () => useContext(ToastContext);
