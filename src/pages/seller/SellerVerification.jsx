import { BadgeCheck, Clock3, ShieldCheck, TriangleAlert } from 'lucide-react';
import { useEffect, useState } from 'react';
import { sellerApi } from '../../api/seller';
import { Button, EmptyState, SelectField, Skeleton, TextField } from '../../components/ui';
import { useApp } from '../../contexts/AppContext';
import { PHONE_COUNTRIES, internationalPhone, nationalPhoneInput } from '../../utils/phone';
import { SellerHeading } from './SellerPages';

const empty = {
  businessName: '', contactEmail: '', contactPhoneNumber: '', businessDescription: '',
  businessLink: '', businessAddress: '', businessRegistrationNumber: '',
  idName: '', idNumber: '', expiryDate: '',
};

const isKycRecord = value => value && typeof value === 'object' && !Array.isArray(value) && Boolean(value.id || value.kycId || (value.businessName && value.idVerification?.number));

function statusFor(record) {
  if (!record || !Object.keys(record).length) return 'not-started';
  if (record.isVerified || String(record.status || '').toLowerCase() === 'approved') return 'approved';
  if (String(record.status || '').toLowerCase() === 'rejected' || (!record.isVerified && Boolean(record.adminNote))) return 'rejected';
  return 'pending';
}

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

  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    sellerApi.kyc(controller.signal).then(data => {
      if (controller.signal.aborted) return;
      const result = isKycRecord(data) ? data : null;
      setRecord(result);
      updateUser({ isVerified: Boolean(result?.isVerified || String(result?.status || '').toLowerCase() === 'approved') });
      setSubmissionUnconfirmed(false);
      if (result) setValues({
        businessName: result.businessName || '', contactEmail: result.contactEmail || user?.email || '',
        contactPhoneNumber: nationalPhoneInput(result.contactPhoneNumber || '', 'NG'),
        businessDescription: result.businessDescription || '', businessLink: result.businessLink || '',
        businessAddress: result.businessAddress || '', businessRegistrationNumber: result.businessRegistrationNumber || '',
        idName: result.idVerification?.name || '', idNumber: result.idVerification?.number || '',
        expiryDate: result.idVerification?.expiryDate ? String(result.idVerification.expiryDate).slice(0, 10) : result.expiryDate ? String(result.expiryDate).slice(0, 10) : '',
      });
      setLoadError('');
    }).catch(failure => {
      if (controller.signal.aborted) return;
      if (failure.status === 404) { setRecord(null); updateUser({ isVerified: false }); setLoadError(''); }
      else setLoadError(failure.message || 'Verification details could not be loaded.');
    }).finally(() => { if (!controller.signal.aborted) setLoading(false); });
    return () => controller.abort();
  }, [user?.id, user?.email]);

  const status = submissionUnconfirmed ? 'unconfirmed' : statusFor(record);
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
        updateUser({ isVerified: Boolean(updated.isVerified || String(updated.status || '').toLowerCase() === 'approved') });
        setSubmissionUnconfirmed(false);
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
        {status === 'approved' ? <BadgeCheck size={24}/> : status === 'rejected' || status === 'unconfirmed' ? <TriangleAlert size={24}/> : status === 'pending' ? <Clock3 size={24}/> : <ShieldCheck size={24}/>}
        <div><strong>{status === 'approved' ? 'Your business is verified' : status === 'rejected' ? 'Verification needs attention' : status === 'unconfirmed' ? 'Submission status needs checking' : status === 'pending' ? 'Your details are under review' : 'Complete your verification'}</strong>
          <p>{status === 'approved' ? 'Your seller verification has been approved.' : status === 'rejected' ? 'Your previous submission was not approved. Review the details below and submit them again.' : status === 'unconfirmed' ? 'The submission request was accepted, but we could not confirm that your KYC record is available for admin review. Check again shortly before submitting another form.' : status === 'pending' ? 'Your saved business and ID details are awaiting admin review.' : 'Tell us about your business and provide an identification number to begin.'}</p>
          {status === 'rejected' && (record?.adminNote || record?.note || record?.rejectionReason) && <p><strong>Reason:</strong> {record.adminNote || record.note || record.rejectionReason}</p>}
          {status === 'unconfirmed' && <Button variant="outline" size="sm" onClick={() => window.location.reload()}>Check again</Button>}
        </div>
      </section>
      {status !== 'unconfirmed' && <form className="seller-form" onSubmit={submit}>
        <section className="seller-panel"><h2>Business information</h2><p>Use the details customers and our review team can rely on.</p>
          <div className="seller-form-grid"><TextField label="Business name" name="businessName" required value={values.businessName} onChange={change}/><TextField label="Contact email" name="contactEmail" type="email" required value={values.contactEmail} onChange={change}/>
            <div className="seller-kyc-phone"><SelectField label="Country code" value={phoneCountry} onChange={event => { setPhoneCountry(event.target.value); setValues(current => ({ ...current, contactPhoneNumber: '' })); }}>{PHONE_COUNTRIES.map(country => <option key={country.code} value={country.code}>{country.flag} +{country.dialCode}</option>)}</SelectField><TextField label="Contact phone" name="contactPhoneNumber" type="tel" inputMode="tel" required value={values.contactPhoneNumber} onChange={event => setValues(current => ({ ...current, contactPhoneNumber: nationalPhoneInput(event.target.value, phoneCountry) }))}/></div>
            <TextField label="Business address" name="businessAddress" required value={values.businessAddress} onChange={change}/><TextField label="Business website (optional)" name="businessLink" type="url" placeholder="https://" value={values.businessLink} onChange={change}/><TextField label="Registration number (optional)" name="businessRegistrationNumber" disabled={identityLocked} value={values.businessRegistrationNumber} onChange={change}/></div>
          <label className="field"><span className="field__label">Business description</span><textarea className="field__input seller-textarea" name="businessDescription" required rows="4" value={values.businessDescription} onChange={change}/></label>
        </section>
        <section className="seller-panel"><h2>Identity details</h2><p>Choose the ID type and enter the number shown on it.</p><div className="seller-form-grid">
          <SelectField label="ID type" name="idName" required={!identityLocked} disabled={identityLocked} value={values.idName} onChange={change}><option value="">Select ID type</option>{['NIN', 'International Passport', "Voter's Card", 'Drivers Licence'].map(name => <option key={name} value={name}>{name}</option>)}</SelectField>
          <TextField label="ID number" name="idNumber" required={!identityLocked} disabled={identityLocked} value={values.idNumber} onChange={change}/><TextField label="Expiry date" name="expiryDate" type="date" required={!identityLocked} disabled={identityLocked} value={values.expiryDate} onChange={change}/></div>
          {identityLocked && <p className="seller-kyc-lock-note">Your registration and identity details are locked after approval. Business and contact information can still be updated.</p>}
        </section>
        {error && <div className="form-alert" role="alert">{error}</div>}
        <div className="seller-form-actions"><Button type="submit" loading={busy}>{identityLocked ? 'Update business information' : status === 'rejected' ? 'Resubmit verification' : status === 'pending' ? 'Update submission' : 'Submit for review'}</Button></div>
      </form>}
    </div>}
  </>;
}
