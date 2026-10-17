import { ArrowRight, Landmark, WalletCards } from 'lucide-react';
import { useState } from 'react';
import { sellerApi, sellerList } from '../../api/seller';
import { Button, EmptyState, Skeleton, TextField } from '../../components/ui';
import { useApp } from '../../contexts/AppContext';
import { useResource } from '../../hooks/useResource';
import { money } from '../../utils/format';
import { SellerHeading } from './SellerPages';

const transactionList = value => sellerList(value?.data || value);

export default function SellerFinance() {
  const { user, notify } = useApp();
  const [refresh, setRefresh] = useState(0);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [values, setValues] = useState({ bankName: '', accountNumber: '', accountHolderName: '' });
  const finance = useResource(async signal => {
    const [wallet, banks, transactions, plans] = await Promise.allSettled([
      sellerApi.wallet(signal), sellerApi.banks(signal), sellerApi.transactions(1, signal), sellerApi.subscriptionPlans(signal),
    ]);
    return {
      wallet: wallet.status === 'fulfilled' ? wallet.value : null,
      banks: banks.status === 'fulfilled' ? sellerList(banks.value) : [],
      transactions: transactions.status === 'fulfilled' ? transactionList(transactions.value) : [],
      plans: plans.status === 'fulfilled' ? sellerList(plans.value) : [],
      error: [wallet, banks, transactions, plans].some(result => result.status === 'rejected' && result.reason?.status !== 404),
    };
  }, [user?.id, refresh]);
  const data = finance.data || {};
  const stats = data.wallet || {};
  const activePlan = data.plans?.find(plan => plan.isActiveForVendor);
  const change = event => setValues(current => ({ ...current, [event.target.name]: event.target.value }));
  const addBank = async event => {
    event.preventDefault(); setBusy(true); setError('');
    try {
      await sellerApi.addBank({ ...values, bankName: values.bankName.trim(), accountNumber: values.accountNumber.trim(), accountHolderName: values.accountHolderName.trim() });
      setValues({ bankName: '', accountNumber: '', accountHolderName: '' });
      setRefresh(value => value + 1); notify('Payout account added.', 'success');
    } catch (failure) { setError(failure.message || 'The payout account could not be added.'); }
    finally { setBusy(false); }
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
        <section className="seller-panel"><div className="seller-panel__head"><div><span className="eyebrow">PAYOUTS</span><h2>Bank accounts</h2></div></div>
          {data.banks?.length ? <div className="seller-simple-list">{data.banks.map(bank => <div key={bank.id}><Landmark size={19}/><span><strong>{bank.bankName || bank.bankInfo?.bankName}</strong><small>{bank.accountHolderName || bank.bankInfo?.accountName} · ••••{String(bank.accountNumber || bank.bankInfo?.accountNumber || '').slice(-4)}</small></span></div>)}</div> : <EmptyState icon={Landmark} title="No payout account" description={user?.isVerified ? 'Add the account where withdrawals should be paid.' : 'Your KYC must be approved before adding a payout account.'}/>} 
          {user?.isVerified && <form className="seller-form" onSubmit={addBank}><div className="seller-form-grid"><TextField label="Bank name" name="bankName" required value={values.bankName} onChange={change}/><TextField label="Account name" name="accountHolderName" required value={values.accountHolderName} onChange={change}/><TextField label="Account number" name="accountNumber" inputMode="numeric" required value={values.accountNumber} onChange={change}/></div>{error && <div className="form-alert">{error}</div>}<Button type="submit" loading={busy}>Add payout account</Button></form>}
        </section>
        <section className="seller-panel"><div className="seller-panel__head"><div><span className="eyebrow">ACTIVITY</span><h2>Recent transactions</h2></div></div>{data.transactions?.length ? <div className="seller-simple-list">{data.transactions.map(item => <div key={item.id}><WalletCards size={19}/><span><strong>{item.transactionType || 'Transaction'}</strong><small>{item.status || 'pending'} · {item.createdAt ? new Date(item.createdAt).toLocaleDateString() : ''}</small></span><b>{money(item.amount || 0, item.currency === 'USD' ? '$' : '₦')}</b></div>)}</div> : <p className="seller-muted">Sales and withdrawals will appear here.</p>}<p className="seller-muted">Funds become available after an order is confirmed as delivered. Withdrawal requests are reviewed before transfer.</p></section>
      </div>
    </>}
  </>;
}
