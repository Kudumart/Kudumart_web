import { BadgeCheck, Clock3, ShieldCheck, TriangleAlert } from 'lucide-react';
import { useEffect, useState } from 'react';
import { sellerApi } from '../../api/seller';
import { Button, EmptyState, Modal, SelectField, Skeleton, TextField } from '../../components/ui';
import { useApp } from '../../contexts/AppContext';
import { fieldLocked, fieldReason, isKycRecord, kycStatus } from '../../utils/kyc';
import { PHONE_COUNTRIES, internationalPhone, nationalPhoneInput, phoneCountryFor } from '../../utils/phone';
import { SellerHeading } from './SellerPages';

const empty = {
  businessName: '', contactEmail: '', contactPhoneNumber: '', businessDescription: '',
  businessLink: '', businessAddress: '', businessRegistrationNumber: '',
  idName: '', idNumber: '', expiryDate: '',
};

export default function SellerVerification() {
  const { user, updateUser, notify } = useApp();
  const [record, setRecord] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [submissionUnconfirmed, setSubmissionUnconfirmed] = useState(false);
  const [values, setValues] = useState(() => ({ ...empty, contactEmail: user?.email || '' }));
  const [phoneCountry, setPhoneCountry] = useState('NG');
  const [successOpen, setSuccessOpen] = useState(false);

  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    sellerApi.kyc(controller.signal).then(data => {
      if (controller.signal.aborted) return;
      const result = isKycRecord(data) ? data : null;
      setRecord(result);
      updateUser({ isVerified: kycStatus(result) === 'approved' });
      setSubmissionUnconfirmed(false);
      if (result) {
        const detectedCountry = phoneCountryFor(result.contactPhoneNumber, 'NG');
        setPhoneCountry(detectedCountry);
        setValues({
        businessName: result.businessName || '', contactEmail: result.contactEmail || user?.email || '',
        contactPhoneNumber: nationalPhoneInput(result.contactPhoneNumber || '', detectedCountry),
        businessDescription: result.businessDescription || '', businessLink: result.businessLink || '',
        businessAddress: result.businessAddress || '', businessRegistrationNumber: result.businessRegistrationNumber || '',
        idName: result.idVerification?.name || '', idNumber: result.idVerification?.number || '',
        expiryDate: result.idVerification?.expiryDate ? String(result.idVerification.expiryDate).slice(0, 10) : result.expiryDate ? String(result.expiryDate).slice(0, 10) : '',
        });
      }
      setLoadError('');
    }).catch(failure => {
      if (controller.signal.aborted) return;
      if (failure.status === 404) { setRecord(null); updateUser({ isVerified: false }); setLoadError(''); }
      else setLoadError(failure.message || 'Verification details could not be loaded.');
    }).finally(() => { if (!controller.signal.aborted) setLoading(false); });
    return () => controller.abort();
  }, [user?.id, user?.email]);

  const status = submissionUnconfirmed ? 'unconfirmed' : kycStatus(record);
  const identityLocked = status === 'approved';
  const change = event => setValues(current => ({ ...current, [event.target.name]: event.target.value }));
  const submit = async event => {
    event.preventDefault();
    if (busy) return;
    setError('');
    const phone = internationalPhone(values.contactPhoneNumber, phoneCountry);
    if (!phone) { setError('Enter a valid contact phone number.'); return; }
    if (values.expiryDate && values.expiryDate < new Date().toISOString().slice(0, 10)) { setError('Choose an ID that has not expired.'); return; }
    const payload = {
      businessName: values.businessName.trim(), contactEmail: values.contactEmail.trim(),
      contactPhoneNumber: phone, businessDescription: values.businessDescription.trim(),
      businessLink: values.businessLink.trim(), businessAddress: values.businessAddress.trim(),
      businessRegistrationNumber: values.businessRegistrationNumber.trim(),
      idVerification: { name: values.idName, number: values.idNumber.trim(), expiryDate: values.expiryDate },
    };
    setBusy(true);
    try {
      await sellerApi.submitKyc(payload);
      try {
        const updated = await sellerApi.kyc();
        if (!isKycRecord(updated)) throw new Error('Saved verification details were not found.');
        setRecord(updated);
        updateUser({ isVerified: kycStatus(updated) === 'approved' });
        setSubmissionUnconfirmed(false);
        if (!identityLocked) setSuccessOpen(true);
        notify(identityLocked ? 'Your business information was updated.' : 'Your verification details were submitted for review.', 'success');
      } catch {
        setSubmissionUnconfirmed(true);
        notify('Submission accepted, but its review status could not be confirmed. Please check again shortly.', 'info');
      }
    } catch (failure) { setError(failure.message || 'Verification could not be submitted.'); }
    finally { setBusy(false); }
  };

  return <>
    <SellerHeading eyebrow="SELLER TRUST" title="Business verification" description="Confirm who is behind your store so customers can shop with confidence."/>
    {loading ? <Skeleton className="seller-loading"/> : loadError ? <EmptyState icon={TriangleAlert} title="Verification is unavailable" description={loadError} action={<Button variant="outline" onClick={() => window.location.reload()}>Try again</Button>}/> : <div className="seller-form seller-kyc">
      <section className={`seller-kyc-status seller-kyc-status--${status}`} role="status">
        {status === 'approved' ? <BadgeCheck size={24}/> : status === 'changes_requested' || status === 'unconfirmed' ? <TriangleAlert size={24}/> : status === 'pending' ? <Clock3 size={24}/> : <ShieldCheck size={24}/>}
        <div><strong>{status === 'approved' ? 'Your business is verified' : status === 'changes_requested' ? 'Changes requested' : status === 'unconfirmed' ? 'Submission status needs checking' : status === 'pending' ? 'Your details are under review' : 'Complete your verification'}</strong>
          <p>{status === 'approved' ? 'Your seller verification has been approved.' : status === 'changes_requested' ? 'Update the highlighted details below. Details already approved by the review team are protected.' : status === 'unconfirmed' ? 'The submission request was accepted, but we could not confirm that your KYC record is available for admin review. Check again shortly before submitting another form.' : status === 'pending' ? 'Your saved business and ID details are awaiting admin review.' : 'Tell us about your business and provide an identification number to begin.'}</p>
          {status === 'unconfirmed' && <Button variant="outline" size="sm" onClick={() => window.location.reload()}>Check again</Button>}
        </div>
      </section>
      {status !== 'unconfirmed' && <form className="seller-form" onSubmit={submit}>
        <section className="seller-panel"><h2>Business information</h2><p>Use the details customers and our review team can rely on.</p>
          <div className="seller-form-grid"><TextField label="Business name" name="businessName" required disabled={fieldLocked(record, 'businessName')} error={fieldReason(record, 'businessName')} value={values.businessName} onChange={change}/><TextField label="Contact email" name="contactEmail" type="email" required disabled={fieldLocked(record, 'contactEmail')} error={fieldReason(record, 'contactEmail')} value={values.contactEmail} onChange={change}/>
            <div className="seller-kyc-phone"><SelectField label="Country code" value={phoneCountry} disabled={fieldLocked(record, 'contactPhoneNumber')} onChange={event => { setPhoneCountry(event.target.value); setValues(current => ({ ...current, contactPhoneNumber: '' })); }}>{PHONE_COUNTRIES.map(country => <option key={country.code} value={country.code}>{country.flag} +{country.dialCode}</option>)}</SelectField><TextField label="Contact phone" name="contactPhoneNumber" type="tel" inputMode="tel" required disabled={fieldLocked(record, 'contactPhoneNumber')} error={fieldReason(record, 'contactPhoneNumber')} value={values.contactPhoneNumber} onChange={event => setValues(current => ({ ...current, contactPhoneNumber: nationalPhoneInput(event.target.value, phoneCountry) }))}/></div>
            <TextField label="Business address" name="businessAddress" required disabled={fieldLocked(record, 'businessAddress')} error={fieldReason(record, 'businessAddress')} value={values.businessAddress} onChange={change}/><TextField label="Business website (optional)" name="businessLink" type="url" placeholder="https://" disabled={fieldLocked(record, 'businessLink')} error={fieldReason(record, 'businessLink')} value={values.businessLink} onChange={change}/><TextField label="Registration number (optional)" name="businessRegistrationNumber" disabled={identityLocked || fieldLocked(record, 'businessRegistrationNumber')} error={fieldReason(record, 'businessRegistrationNumber')} value={values.businessRegistrationNumber} onChange={change}/></div>
          <label className="field"><span className="field__label">Business description</span><textarea className={`field__input seller-textarea ${fieldReason(record, 'businessDescription') ? 'field__input--error' : ''}`} name="businessDescription" required disabled={fieldLocked(record, 'businessDescription')} rows="4" value={values.businessDescription} onChange={change}/>{fieldReason(record, 'businessDescription') && <span className="field__error">{fieldReason(record, 'businessDescription')}</span>}</label>
        </section>
        <section className="seller-panel"><h2>Identity details</h2><p>Choose the ID type and enter the number shown on it.</p><div className="seller-form-grid">
          <div className="field"><SelectField label="ID type" name="idName" required={!identityLocked} disabled={identityLocked || fieldLocked(record, 'idVerification.name')} value={values.idName} onChange={change}><option value="">Select ID type</option>{['NIN', 'International Passport', "Voter's Card", 'Drivers Licence'].map(name => <option key={name} value={name}>{name}</option>)}</SelectField>{fieldReason(record, 'idVerification.name') && <span className="field__error">{fieldReason(record, 'idVerification.name')}</span>}</div>
          <TextField label="ID number" name="idNumber" required={!identityLocked} disabled={identityLocked || fieldLocked(record, 'idVerification.number')} error={fieldReason(record, 'idVerification.number')} value={values.idNumber} onChange={change}/><TextField label="Expiry date" name="expiryDate" type="date" required={!identityLocked} disabled={identityLocked || fieldLocked(record, 'idVerification.expiryDate')} error={fieldReason(record, 'idVerification.expiryDate')} value={values.expiryDate} onChange={change}/></div>
          {identityLocked && <p className="seller-kyc-lock-note">Your registration and identity details are locked after approval. Business and contact information can still be updated.</p>}
        </section>
        {error && <div className="form-alert" role="alert">{error}</div>}
        <div className="seller-form-actions"><Button type="submit" loading={busy}>{identityLocked ? 'Update business information' : status === 'changes_requested' ? 'Submit corrections for review' : status === 'pending' ? 'Update submission' : 'Submit for review'}</Button></div>
      </form>}
    </div>}
    {successOpen && <Modal title="Submitted for review" icon={<ShieldCheck size={20}/>} onClose={() => setSuccessOpen(false)} footer={<Button onClick={() => setSuccessOpen(false)}>Close</Button>}><p>Your verification details have been received. Our team will review them and notify you when the review is complete or if another correction is needed.</p></Modal>}
  </>;
}
