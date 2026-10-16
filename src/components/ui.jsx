import { useEffect, useRef } from 'react';
import { AlertCircle, Check, Info, X } from 'lucide-react';
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
export function AppOverlays() {
  const { toasts, setToasts, modal, setModal } = useApp();
  const icons = { success: Check, error: AlertCircle, info: Info };
  return <><div className="toast-stack" aria-live="polite">{toasts.map(toast => { const Icon = icons[toast.type] || Info; return <div className={`toast toast--${toast.type}`} role="status" key={toast.id}><span className="toast__icon"><Icon size={17}/></span><span>{toast.message}</span><button aria-label="Dismiss notification" onClick={() => setToasts(items => items.filter(item => item.id !== toast.id))}><X size={16}/></button></div>; })}</div>{modal && <Modal title={modal.title} footer={modal.footer} onClose={() => setModal(null)}>{modal.content}</Modal>}</>;
}
