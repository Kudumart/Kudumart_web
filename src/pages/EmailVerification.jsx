import { useEffect, useRef, useState } from 'react';
import { CheckCircle2, MailCheck, RefreshCcw, XCircle } from 'lucide-react';
import { Link, useSearchParams } from 'react-router-dom';
import { accountApi } from '../api/account';
import { Button, TextField } from '../components/ui';

export default function EmailVerification() {
  const [params] = useSearchParams();
  const email = params.get('email')?.trim() || '';
  const token = params.get('token')?.trim() || '';
  const [otpCode, setOtpCode] = useState('');
  const [status, setStatus] = useState(token && email ? 'loading' : 'code');
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);
  const attempted = useRef(false);
  useEffect(() => { if (!token || !email || attempted.current) return; attempted.current = true; accountApi.verifyEmailToken(email, token).then(() => setStatus('success')).catch(error => { setMessage(error.message); setStatus('error'); }); }, [email, token]);
  const verify = async event => { event.preventDefault(); setBusy(true); setMessage(''); try { await accountApi.verifyEmail(email, otpCode.trim()); setStatus('success'); } catch (error) { setMessage(error.message); } finally { setBusy(false); } };
  const resend = async () => { if (!email) return; setBusy(true); setMessage(''); try { await accountApi.resendVerification(email); setMessage('A fresh verification email has been sent.'); } catch (error) { setMessage(error.message); } finally { setBusy(false); } };
  return <div className="auth-flow"><div className="auth-flow__card auth-flow__card--center"><div className={`auth-flow__icon auth-flow__icon--${status}`}>{status === 'success' ? <CheckCircle2/> : status === 'error' ? <XCircle/> : <MailCheck/>}</div>{status === 'loading' ? <><span className="eyebrow">EMAIL VERIFICATION</span><h1>Verifying your email…</h1><p>Please keep this page open for a moment.</p><span className="spinner auth-flow__spinner"/></> : status === 'success' ? <><span className="eyebrow">EMAIL VERIFIED</span><h1>Your account is ready.</h1><p>Your email address has been verified successfully. You can now sign in and continue.</p><Link className="button button--primary button--md" to="/login"><span>Continue to sign in</span></Link></> : status === 'error' ? <><span className="eyebrow">LINK NOT ACCEPTED</span><h1>We couldn’t verify this link.</h1><p>{message || 'The verification link may be invalid or expired.'}</p><Button icon={RefreshCcw} onClick={resend} loading={busy}>Send another email</Button><Link className="text-action" to="/login">Back to sign in</Link></> : <><span className="eyebrow">VERIFY YOUR EMAIL</span><h1>Enter your verification code.</h1><p>{email ? <>We sent a six-digit code to <strong>{email}</strong>.</> : 'Open the verification link from your email, or return to registration.'}</p>{email ? <form className="auth-form" onSubmit={verify}><TextField label="Six-digit code" value={otpCode} onChange={event => setOtpCode(event.target.value.replace(/\D/g, '').slice(0, 6))} inputMode="numeric" autoComplete="one-time-code" minLength="6" maxLength="6" required/>{message && <div className={message.includes('sent') ? 'form-success' : 'form-alert'} role="status">{message}</div>}<Button type="submit" loading={busy} disabled={otpCode.length !== 6}>Verify email</Button><button className="text-action" type="button" disabled={busy} onClick={resend}>Send another code</button></form> : <Link className="button button--primary button--md" to="/register"><span>Create an account</span></Link>}</>}</div></div>;
}
