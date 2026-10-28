import { useState } from 'react';
import { ArrowLeft, CheckCircle2, KeyRound, Mail } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { accountApi } from '../api/account';
import { Button, TextField } from '../components/ui';

export default function PasswordRecovery() {
  const navigate = useNavigate();
  const [step, setStep] = useState('email');
  const [values, setValues] = useState({ email: '', otpCode: '', newPassword: '', confirmPassword: '' });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const change = event => setValues(current => ({ ...current, [event.target.name]: event.target.value }));
  const send = async event => { event.preventDefault(); setBusy(true); setError(''); try { await accountApi.forgotPassword(values.email.trim()); setStep('reset'); setMessage('We sent a six-digit reset code to your email. It expires in one hour.'); } catch (reason) { setError(reason.message); } finally { setBusy(false); } };
  const reset = async event => { event.preventDefault(); setError(''); if (values.newPassword !== values.confirmPassword) { setError('The passwords do not match.'); return; } setBusy(true); try { await accountApi.resetPassword({ email: values.email.trim(), otpCode: values.otpCode.trim(), newPassword: values.newPassword, confirmPassword: values.confirmPassword }); setStep('done'); } catch (reason) { setError(reason.message); } finally { setBusy(false); } };
  const resend = async () => { setBusy(true); setError(''); try { await accountApi.forgotPassword(values.email.trim()); setMessage('A fresh reset code has been sent.'); } catch (reason) { setError(reason.message); } finally { setBusy(false); } };
  return <div className="auth-flow"><div className="auth-flow__card"><Link to="/login" className="back-link"><ArrowLeft size={16}/> Back to sign in</Link><div className="auth-flow__icon">{step === 'done' ? <CheckCircle2/> : step === 'email' ? <Mail/> : <KeyRound/>}</div>{step === 'email' ? <><span className="eyebrow">ACCOUNT RECOVERY</span><h1>Reset your password.</h1><p>Enter the email connected to your KuduMart account. We’ll send you a secure reset code.</p><form onSubmit={send} className="auth-form"><TextField label="Email address" name="email" type="email" autoComplete="email" required value={values.email} onChange={change}/>{error && <div className="form-alert" role="alert">{error}</div>}<Button type="submit" loading={busy}>Send reset code</Button></form></> : step === 'reset' ? <><span className="eyebrow">CHECK YOUR EMAIL</span><h1>Choose a new password.</h1><p>{message}</p><form onSubmit={reset} className="auth-form"><TextField label="Six-digit code" name="otpCode" inputMode="numeric" autoComplete="one-time-code" minLength="6" maxLength="6" required value={values.otpCode} onChange={change}/><TextField label="New password" name="newPassword" type="password" autoComplete="new-password" minLength="6" required value={values.newPassword} onChange={change}/><TextField label="Confirm password" name="confirmPassword" type="password" autoComplete="new-password" minLength="6" required value={values.confirmPassword} onChange={change}/>{error && <div className="form-alert" role="alert">{error}</div>}<Button type="submit" loading={busy}>Reset password</Button><button className="text-action" type="button" disabled={busy} onClick={resend}>Send another code</button></form></> : <><span className="eyebrow">PASSWORD UPDATED</span><h1>You’re all set.</h1><p>Your password has been changed successfully. Use your new password the next time you sign in.</p><Button onClick={() => navigate('/login', { replace: true })}>Continue to sign in</Button></>}</div></div>;
}
