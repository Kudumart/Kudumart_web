import { useEffect, useRef } from 'react';
import { AlertCircle, Check, Info, Trash2, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../contexts/AppContext';
export function Button({ variant = 'primary', size = 'md', loading = false, icon: Icon, children, className = '', ...props }) {
  return <button className={`button button--${variant} button--${size} ${className}`} disabled={loading || props.disabled} {...props}>{loading ? <span className="spinner" aria-hidden="true"/> : Icon ? <Icon size={18} strokeWidth={2.1}/> : null}<span>{children}</span></button>;
}
export function IconButton({ label, icon: Icon, className = '', ...props }) { return <button className={`icon-button ${className}`} aria-label={label} title={label} {...props}><Icon size={20} strokeWidth={1.9}/></button>; }
export function Badge({ children, tone = 'neutral' }) { return <span className={`badge badge--${tone}`}>{children}</span>; }
export function TextField({ label, error, hint, ...props }) { const id = props.id || props.name; return <label className="field" htmlFor={id}><span className="field__label">{label}</span><input id={id} className={`field__input ${error ? 'field__input--error' : ''}`} aria-invalid={!!error} aria-describedby={error ? `${id}-error` : undefined} {...props}/>{error && <span id={`${id}-error`} className="field__error">{error}</span>}{hint && !error && <span className="field__hint">{hint}</span>}</label>; }
export function SelectField({ label, children, ...props }) { const id = props.id || props.name; return <label className="field" htmlFor={id}><span className="field__label">{label}</span><select id={id} className="field__input" {...props}>{children}</select></label>; }
export function Skeleton({ className = '' }) { return <div className={`skeleton ${className}`} aria-hidden="true"/>; }
export function EmptyState({ icon: Icon = AlertCircle, title, description, action }) { return <div className="empty-state"><div className="empty-state__icon"><Icon size={27}/></div><h3>{title}</h3><p>{description}</p>{action}</div>; }
export function Modal({ title, children, footer, onClose }) {
  const closeRef = useRef(null);
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;
  useEffect(() => { closeRef.current?.focus(); const onKey = event => { if (event.key === 'Escape') onCloseRef.current(); }; document.addEventListener('keydown', onKey); document.body.style.overflow = 'hidden'; return () => { document.removeEventListener('keydown', onKey); document.body.style.overflow = ''; }; }, []);
  return <div className="modal-backdrop" onMouseDown={event => { if (event.target === event.currentTarget) onClose(); }}><section className="modal" role="dialog" aria-modal="true" aria-label={title}><div className="modal__head"><h2>{title}</h2><button ref={closeRef} className="icon-button" aria-label="Close dialog" onClick={onClose}><X size={20}/></button></div><div className="modal__body">{children}</div>{footer && <div className="modal__footer">{footer}</div>}</section></div>;
}
export function ConfirmModal({ title, description, confirmLabel = 'Confirm', cancelLabel = 'Cancel', tone = 'danger', loading = false, onConfirm, onClose }) {
  const Icon = tone === 'danger' ? Trash2 : AlertCircle;
  return <Modal title={title} onClose={loading ? () => {} : onClose} footer={<><Button variant="ghost" disabled={loading} onClick={onClose}>{cancelLabel}</Button><Button variant={tone === 'danger' ? 'danger' : 'primary'} loading={loading} onClick={onConfirm}>{confirmLabel}</Button></>}><div className={`confirm-modal confirm-modal--${tone}`}><span className="confirm-modal__icon"><Icon size={22}/></span><p>{description}</p></div></Modal>;
}
export function AppOverlays() {
  const { toasts, setToasts, modal, setModal, sessionExpired, setSessionExpired, signOut } = useApp();
  const navigate = useNavigate();
  const icons = { success: Check, error: AlertCircle, info: Info };
  const signInAgain = () => {
    const returnTo = sessionExpired?.returnTo || '/account';
    setSessionExpired(null);
    signOut();
    navigate('/login', { replace: true, state: { from: returnTo } });
  };
  return <><div className="toast-stack" aria-live="polite">{toasts.map(toast => { const Icon = icons[toast.type] || Info; return <div className={`toast toast--${toast.type}`} role="status" key={toast.id}><span className="toast__icon"><Icon size={17}/></span><span>{toast.message}</span><button aria-label="Dismiss notification" onClick={() => setToasts(items => items.filter(item => item.id !== toast.id))}><X size={16}/></button></div>; })}</div>{sessionExpired ? <Modal title="Your session has expired" footer={<Button onClick={signInAgain}>Sign in again</Button>} onClose={signInAgain}><div className="confirm-modal"><span className="confirm-modal__icon"><AlertCircle size={22}/></span><p>For your security, please sign in again to continue where you left off.</p></div></Modal> : modal && <Modal title={modal.title} footer={modal.footer} onClose={() => setModal(null)}>{modal.content}</Modal>}</>;
}
