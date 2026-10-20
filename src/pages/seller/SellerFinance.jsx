import { CheckCircle2, Landmark, ShieldCheck, Trash2, WalletCards } from 'lucide-react';
import { useState } from 'react';
import { sellerApi, sellerList } from '../../api/seller';
import { Button, ConfirmModal, EmptyState, SelectField, Skeleton, TextField } from '../../components/ui';
import { useApp } from '../../contexts/AppContext';
import { useResource } from '../../hooks/useResource';
import { money } from '../../utils/format';
import { SellerHeading } from './SellerPages';

const transactionList = value => sellerList(value?.data || value);
const emptyBank = { bankCode: '', accountNumber: '', accountHolderName: '' };

export default function SellerFinance() {
  const { user, notify } = useApp();
  const [refresh, setRefresh] = useState(0);
  const [busy, setBusy] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [error, setError] = useState('');
  const [values, setValues] = useState(emptyBank);
  const [bankToDelete, setBankToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const supportedBanks = useResource(signal => sellerApi.supportedBanks(signal), []);
  const finance = useResource(async signal => {
    const [wallet, savedBanks, transactions, plans] = await Promise.allSettled([
      sellerApi.wallet(signal), sellerApi.banks(signal), sellerApi.transactions(1, signal), sellerApi.subscriptionPlans(signal),
    ]);
    return {
      wallet: wallet.status === 'fulfilled' ? wallet.value : null,
      banks: savedBanks.status === 'fulfilled' ? sellerList(savedBanks.value) : [],
      transactions: transactions.status === 'fulfilled' ? transactionList(transactions.value) : [],
      plans: plans.status === 'fulfilled' ? sellerList(plans.value) : [],
      error: [wallet, savedBanks, transactions, plans].some(result => (
        result.status === 'rejected'
        && result.reason?.name !== 'AbortError'
        && result.reason?.status !== 404
      )),
    };
  }, [user?.id, refresh]);
  const data = finance.data || {};
  const stats = data.wallet || {};
  const banks = sellerList(supportedBanks.data);
  const activePlan = data.plans?.find(plan => plan.isActiveForVendor);

  const change = event => {
    const { name, value } = event.target;
    setError('');
    setValues(current => ({
      ...current,
      [name]: name === 'accountNumber' ? value.replace(/\D/g, '').slice(0, 10) : value,
      accountHolderName: '',
    }));
  };
  const verifyBank = async () => {
    if (!values.bankCode || values.accountNumber.length !== 10) {
      setError('Choose a bank and enter a valid 10 digit account number.');
      return;
    }
    setVerifying(true); setError('');
    try {
      const result = await sellerApi.resolveBank(values.bankCode, values.accountNumber);
      setValues(current => ({ ...current, accountHolderName: result.accountName || '' }));
    } catch (failure) { setError(failure.message || 'The account could not be verified.'); }
    finally { setVerifying(false); }
  };
  const addBank = async event => {
    event.preventDefault(); setBusy(true); setError('');
    try {
      const bank = banks.find(item => String(item.code) === values.bankCode);
      if (!bank || !values.accountHolderName) throw new Error('Verify the bank account before adding it.');
      await sellerApi.addBank({ ...values, bankName: bank.name, accountNumber: values.accountNumber.trim() });
      setValues(emptyBank);
      setRefresh(value => value + 1);
      notify('Payout account added.', 'success');
    } catch (failure) { setError(failure.message || 'The payout account could not be added.'); }
    finally { setBusy(false); }
  };
  const deleteBank = async () => {
    if (!bankToDelete) return;
    setDeleting(true);
    try {
      await sellerApi.deleteBank(bankToDelete.id);
      notify('Payout account deleted.', 'success');
      setBankToDelete(null);
      setRefresh(value => value + 1);
    } catch (failure) { notify(failure.message || 'The payout account could not be deleted.', 'error'); }
    finally { setDeleting(false); }
  };

  return <>
    <SellerHeading eyebrow="MONEY" title="Finance" description="See pending sales, available funds, payout accounts, and transaction history."/>
    {finance.loading ? <Skeleton className="seller-loading"/> : <>
      {data.error && <div className="form-alert">Some finance information could not be loaded. Refresh before making a withdrawal.</div>}
      <div className="seller-metrics">
        <div className="seller-metric"><span className="seller-metric__icon seller-metric__icon--green"><WalletCards size={22}/></span><span>Available balance</span><strong>{money(stats.availableNGN || stats.balance?.NGN || 0)}</strong><small>Eligible for withdrawal</small></div>
        <div className="seller-metric"><span className="seller-metric__icon seller-metric__icon--orange"><WalletCards size={22}/></span><span>Pending sales</span><strong>{money(stats.pendingNGN || stats.pending?.NGN || 0)}</strong><small>Released after delivery</small></div>
        <div className="seller-metric"><span className="seller-metric__icon seller-metric__icon--blue"><Landmark size={22}/></span><span>Current plan</span><strong>{activePlan?.name || 'No active plan'}</strong><small>{activePlan ? `Up to ${activePlan.productLimit ?? '—'} products` : 'Choose a plan to see its limits'}</small></div>
      </div>
      <div className="seller-overview-grid">
        <section className="seller-panel">
          <div className="seller-panel__head"><div><span className="eyebrow">PAYOUTS</span><h2>Bank accounts</h2></div></div>
          {data.banks?.length ? <div className="seller-bank-list">{data.banks.map(bank => <div className="seller-bank-card" key={bank.id}>
            <span className="seller-bank-card__icon"><Landmark size={20}/></span>
            <span className="seller-bank-card__details"><strong>{bank.bankName || bank.bankInfo?.bankName}</strong><small>{bank.accountHolderName || bank.bankInfo?.accountName}</small></span>
            <span className="seller-bank-card__number">•••• {String(bank.accountNumber || bank.bankInfo?.accountNumber || '').slice(-4)}</span>
            <span className="seller-bank-card__verified"><CheckCircle2 size={15}/> Saved</span>
            <button type="button" className="seller-bank-card__delete" aria-label={`Delete ${bank.bankName || bank.bankInfo?.bankName} payout account`} title="Delete payout account" onClick={() => setBankToDelete(bank)}><Trash2 size={17}/></button>
          </div>)}</div> : <EmptyState icon={Landmark} title="No payout account" description={user?.isVerified ? 'Add the account where withdrawals should be paid.' : 'Your KYC must be approved before adding a payout account.'}/>}
          {user?.isVerified && <form className="seller-form seller-bank-form" onSubmit={addBank}>
            <div className="seller-form-grid">
              <SelectField label="Bank" name="bankCode" required value={values.bankCode} onChange={change} disabled={supportedBanks.loading || !!supportedBanks.error}>
                <option value="">{supportedBanks.loading ? 'Loading banks…' : 'Select your bank'}</option>
                {banks.map(bank => <option key={`${bank.code}-${bank.slug || bank.name}`} value={bank.code}>{bank.name}</option>)}
              </SelectField>
              <TextField label="Account number" name="accountNumber" inputMode="numeric" pattern="[0-9]{10}" maxLength="10" placeholder="10 digit account number" required value={values.accountNumber} onChange={change}/>
            </div>
            <div className="seller-bank-verify">
              <Button type="button" variant="secondary" loading={verifying} disabled={!values.bankCode || values.accountNumber.length !== 10} onClick={verifyBank}>Verify account</Button>
              {values.accountHolderName && <div className="seller-bank-result"><ShieldCheck size={20}/><span><small>Verified account name</small><strong>{values.accountHolderName}</strong></span></div>}
            </div>
            {supportedBanks.error && <div className="form-alert">The bank list could not be loaded. Refresh and try again.</div>}
            {error && <div className="form-alert">{error}</div>}
            <Button type="submit" loading={busy} disabled={!values.accountHolderName}>Add payout account</Button>
          </form>}
        </section>
        <section className="seller-panel">
          <div className="seller-panel__head"><div><span className="eyebrow">ACTIVITY</span><h2>Recent transactions</h2></div></div>
          {data.transactions?.length ? <div className="seller-simple-list">{data.transactions.map(item => <div className="seller-order-line" key={item.id}><WalletCards size={19}/><span><strong>{item.transactionType || 'Transaction'}</strong><small>{item.status || 'pending'} · {item.createdAt ? new Date(item.createdAt).toLocaleDateString() : ''}</small></span><b>{money(item.amount || 0, item.currency === 'USD' ? '$' : '₦')}</b></div>)}</div> : <p className="seller-muted">Sales and withdrawals will appear here.</p>}
          <p className="seller-muted">Funds become available after an order is confirmed as delivered. Withdrawal requests are reviewed before transfer.</p>
        </section>
      </div>
    </>}
    {bankToDelete && <ConfirmModal title="Delete payout account?" description={<>Remove <strong>{bankToDelete.bankName || bankToDelete.bankInfo?.bankName}</strong> ending in <strong>{String(bankToDelete.accountNumber || bankToDelete.bankInfo?.accountNumber || '').slice(-4)}</strong>? It will no longer be available for withdrawals.</>} confirmLabel="Delete account" loading={deleting} onClose={() => setBankToDelete(null)} onConfirm={deleteBank}/>}
  </>;
}
