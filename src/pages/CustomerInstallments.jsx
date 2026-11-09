import { useState } from 'react';
import {
  CalendarClock,
  ArrowLeft,
  CheckCircle2,
  AlertTriangle,
  Clock,
  ShieldCheck,
  CreditCard,
  Package,
  Layers,
  ChevronRight,
  ExternalLink,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import PaystackPop from '@paystack/inline-js';
import { checkoutApi } from '../api/checkout';
import { Button, Badge, Modal, ConfirmModal, EmptyState, Skeleton } from '../components/ui';
import { useResource } from '../hooks/useResource';
import { useApp } from '../contexts/AppContext';
import { money } from '../utils/format';

export default function CustomerInstallments() {
  const { user, notify } = useApp();
  const [revision, setRevision] = useState(0);
  const [payingMilestoneId, setPayingMilestoneId] = useState(null);
  const [paymentError, setPaymentError] = useState('');
  const [successModal, setSuccessModal] = useState(null);
  const [cancellingPlan, setCancellingPlan] = useState(null);
  const [cancelLoading, setCancelLoading] = useState(false);

  const resource = useResource(
    (signal) => checkoutApi.installmentPlans({}, signal),
    [user?.id, revision],
  );

  const plans = Array.isArray(resource.data?.data)
    ? resource.data.data
    : Array.isArray(resource.data)
      ? resource.data
      : [];

  const handlePayMilestone = async (milestone, plan) => {
    setPayingMilestoneId(milestone.id);
    setPaymentError('');
    try {
      const prepared = await checkoutApi.prepareMilestonePayment(milestone.id);
      const accessCode = prepared?.paystackDetails?.access_code;
      const refId = prepared?.refId;

      if (!accessCode || !refId) {
        throw new Error('Payment gateway could not generate a secure checkout session.');
      }

      const paystack = new PaystackPop();
      paystack.resumeTransaction(accessCode, {
        onSuccess: async (result) => {
          try {
            const confirmedRef = result?.reference || refId;
            const res = await checkoutApi.confirmMilestonePayment(milestone.id, confirmedRef);
            notify('Milestone payment verified and recorded successfully!', 'success');
            setRevision((r) => r + 1);
            if (res?.data?.plan?.status === 'completed') {
              setSuccessModal({
                title: 'Layaway 100% Completed!',
                message: `Congratulations! Your installment plan for "${plan.product?.name}" is now fully settled. Your order has been dispatched for fulfillment.`,
              });
            }
          } catch (err) {
            setPaymentError(err.message || 'Payment confirmation failed. Please contact support.');
          } finally {
            setPayingMilestoneId(null);
          }
        },
        onCancel: () => {
          setPayingMilestoneId(null);
        },
        onError: (err) => {
          setPaymentError(err?.message || 'Payment provider encountered an error.');
          setPayingMilestoneId(null);
        },
      });
    } catch (err) {
      setPaymentError(err.message || 'Failed to initialize payment.');
      setPayingMilestoneId(null);
    }
  };

  const handleCancelPlan = async () => {
    if (!cancellingPlan) return;
    setCancelLoading(true);
    try {
      const res = await checkoutApi.cancelInstallmentPlan(cancellingPlan.id);
      notify(res?.message || 'Plan cancelled and refund processed.', 'success');
      setCancellingPlan(null);
      setRevision((r) => r + 1);
    } catch (err) {
      notify(err.message || 'Failed to cancel plan', 'error');
    } finally {
      setCancelLoading(false);
    }
  };

  return (
    <div className="container account-page" style={{ paddingBottom: '60px' }}>
      <Link to="/account" className="back-link" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', marginBottom: '16px', color: '#64748b', textDecoration: 'none', fontSize: '14px' }}>
        <ArrowLeft size={16} /> Back to account
      </Link>

      <div className="page-intro" style={{ marginBottom: '28px' }}>
        <span className="eyebrow" style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '0.08em', color: '#e11d48', textTransform: 'uppercase' }}>
          FINANCING & LAYAWAY
        </span>
        <h1 style={{ fontSize: '28px', fontWeight: 700, margin: '6px 0 8px 0', color: '#0f172a' }}>
          Your Installments & Layaways
        </h1>
        <p style={{ color: '#64748b', fontSize: '15px', margin: 0 }}>
          Manage your reserved items, check holding deadlines, and settle upcoming milestone payments.
        </p>
      </div>

      {paymentError && (
        <div className="form-alert" role="alert" style={{ background: '#fef2f2', border: '1px solid #fecaca', color: '#991b1b', padding: '14px 18px', borderRadius: '8px', marginBottom: '20px' }}>
          {paymentError}
        </div>
      )}

      {resource.loading ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <Skeleton style={{ height: '180px', borderRadius: '12px' }} />
          <Skeleton style={{ height: '180px', borderRadius: '12px' }} />
        </div>
      ) : resource.error ? (
        <EmptyState
          icon={AlertTriangle}
          title="Could not load your installment plans"
          description={resource.error.message || 'Please check your connection and try again.'}
          action={<Button onClick={() => setRevision((r) => r + 1)}>Retry</Button>}
        />
      ) : plans.length === 0 ? (
        <EmptyState
          icon={CalendarClock}
          title="No installment or layaway plans yet"
          description="When you select 'Pay in Installments' during checkout, your reserved items and payment schedule will appear here."
          action={
            <Link to="/catalog">
              <Button>Browse Eligible Products</Button>
            </Link>
          }
        />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {plans.map((plan) => {
            const milestones = plan.milestones || [];
            const paidCount = milestones.filter((m) => m.status === 'paid').length;
            const totalCount = milestones.length || plan.numberOfInstallments;
            const progress = Math.min(
              100,
              Math.round(((Number(plan.totalAmount) - Number(plan.remainingBalance)) / Number(plan.totalAmount)) * 100) || 0,
            );

            const nextPendingMilestone = milestones.find((m) => m.status === 'pending' || m.status === 'overdue');
            const isCompleted = plan.status === 'completed';

            return (
              <div
                key={plan.id}
                style={{
                  background: '#fff',
                  border: '1px solid #e2e8f0',
                  borderRadius: '16px',
                  padding: '24px',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.03)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '20px',
                }}
              >
                {/* Plan Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px' }}>
                  <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                    {plan.product?.image_url && (
                      <img
                        src={plan.product.image_url}
                        alt=""
                        style={{ width: '64px', height: '64px', borderRadius: '10px', objectFit: 'cover', border: '1px solid #f1f5f9' }}
                      />
                    )}
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                        <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 600, color: '#0f172a' }}>
                          {plan.product?.name || 'Product'}
                        </h3>
                        <Badge tone={plan.mode === 'bnpl' ? 'info' : 'neutral'}>
                          {plan.mode === 'bnpl' ? 'BNPL' : 'Layaway'}
                        </Badge>
                      </div>
                      <span style={{ fontSize: '13px', color: '#64748b' }}>
                        Sold by {plan.vendor?.firstName} {plan.vendor?.lastName} • Reserved until {plan.reservedUntil ? new Date(plan.reservedUntil).toLocaleDateString() : 'N/A'}
                      </span>
                    </div>
                  </div>

                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '13px', color: '#64748b' }}>Plan Total</div>
                    <strong style={{ fontSize: '20px', color: '#0f172a' }}>{money(plan.totalAmount)}</strong>
                    <div style={{ fontSize: '12px', color: Number(plan.remainingBalance) > 0 ? '#e11d48' : '#166534', fontWeight: 600 }}>
                      {Number(plan.remainingBalance) > 0 ? `Remaining: ${money(plan.remainingBalance)}` : 'Fully Settled'}
                    </div>
                  </div>
                </div>

                {/* Progress Bar */}
                <div style={{ background: '#f8fafc', padding: '14px 18px', borderRadius: '10px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', color: '#475569' }}>
                    <span>
                      <strong>{paidCount} of {totalCount}</strong> payments made
                    </span>
                    <span style={{ fontWeight: 600 }}>{progress}% Completed</span>
                  </div>
                  <div style={{ width: '100%', height: '8px', background: '#e2e8f0', borderRadius: '4px', overflow: 'hidden' }}>
                    <div
                      style={{
                        width: `${progress}%`,
                        height: '100%',
                        background: isCompleted ? '#10b981' : '#3b82f6',
                        transition: 'width 0.4s ease',
                      }}
                    />
                  </div>
                </div>

                {/* Milestones Schedule */}
                <div>
                  <h4 style={{ fontSize: '14px', fontWeight: 600, margin: '0 0 12px 0', color: '#334155' }}>
                    Milestone Payment Schedule
                  </h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {milestones.map((milestone) => {
                      const isPaid = milestone.status === 'paid';
                      const isNext = nextPendingMilestone?.id === milestone.id;
                      const isPaying = payingMilestoneId === milestone.id;

                      return (
                        <div
                          key={milestone.id}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            padding: '12px 16px',
                            borderRadius: '8px',
                            border: isPaid ? '1px solid #dcfce7' : isNext ? '1px solid #cbd5e1' : '1px solid #f1f5f9',
                            background: isPaid ? '#f0fdf4' : isNext ? '#fff' : '#f8fafc',
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            {isPaid ? (
                              <CheckCircle2 size={18} color="#16a34a" />
                            ) : (
                              <Clock size={18} color={isNext ? '#f59e0b' : '#94a3b8'} />
                            )}
                            <div>
                              <div style={{ fontSize: '14px', fontWeight: 600, color: '#1e293b' }}>
                                #{milestone.installmentNumber} {milestone.installmentNumber === 1 ? '(Deposit)' : 'Payment'}
                              </div>
                              <span style={{ fontSize: '12px', color: '#64748b' }}>
                                {isPaid
                                  ? `Paid on ${new Date(milestone.paidAt || milestone.updatedAt).toLocaleDateString()}`
                                  : `Due by ${new Date(milestone.dueDate).toLocaleDateString()}`}
                              </span>
                            </div>
                          </div>

                          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                            <strong style={{ fontSize: '15px', color: '#0f172a' }}>
                              {money(milestone.amount)}
                            </strong>

                            {isPaid ? (
                              <Badge tone="success">Paid</Badge>
                            ) : isNext ? (
                              <Button
                                size="sm"
                                icon={CreditCard}
                                loading={isPaying}
                                onClick={() => handlePayMilestone(milestone, plan)}
                              >
                                Pay Now
                              </Button>
                            ) : (
                              <Badge tone="neutral">Upcoming</Badge>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Fulfillment Status Banner */}
                <div
                  style={{
                    padding: '12px 16px',
                    borderRadius: '8px',
                    background: isCompleted ? '#f0fdf4' : '#eff6ff',
                    color: isCompleted ? '#166534' : '#1e40af',
                    fontSize: '13px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                  }}
                >
                  <ShieldCheck size={18} />
                  <span>
                    {isCompleted ? (
                      <strong>Fulfillment active: All installments are 100% complete! Your item is dispatched for delivery.</strong>
                    ) : plan.fulfillment_trigger === 'on_completion' ? (
                      <span>Inventory is safely held and reserved for you. Order dispatches upon completion of your final payment.</span>
                    ) : (
                      <span>Item dispatched upon initial deposit. Please keep to the payment schedule to prevent default charges.</span>
                    )}
                  </span>
                </div>

                {plan.status === 'active' && (
                  <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '-8px' }}>
                    <button
                      type="button"
                      onClick={() => setCancellingPlan(plan)}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: '#94a3b8',
                        fontSize: '12px',
                        cursor: 'pointer',
                        textDecoration: 'underline',
                      }}
                    >
                      Cancel layaway reservation & request refund
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Cancel Layaway Confirmation Modal */}
      {cancellingPlan && (
        <ConfirmModal
          title="Cancel Layaway Reservation?"
          description={`Are you sure you want to cancel your layaway for "${cancellingPlan.product?.name || 'this item'}"? The held product will be returned to store inventory. An 8% restocking fee will be deducted, and your remaining paid balance will be credited directly to your KuduMart Wallet.`}
          confirmLabel="Cancel Layaway & Refund"
          cancelLabel="Keep Reservation"
          tone="danger"
          loading={cancelLoading}
          onConfirm={handleCancelPlan}
          onClose={() => setCancellingPlan(null)}
        />
      )}

      {/* Completion Modal */}
      {successModal && (
        <Modal
          title={successModal.title}
          icon={<CheckCircle2 size={20} />}
          onClose={() => setSuccessModal(null)}
          footer={<Button onClick={() => setSuccessModal(null)}>Done</Button>}
        >
          <div style={{ textAlign: 'center', padding: '16px 8px' }}>
            <CheckCircle2 size={42} color="#16a34a" style={{ margin: '0 auto 12px auto' }} />
            <h3 style={{ margin: '0 0 8px 0', fontSize: '18px', fontWeight: 600 }}>Plan Completed!</h3>
            <p style={{ color: '#475569', fontSize: '14px', lineHeight: 1.5 }}>
              {successModal.message}
            </p>
          </div>
        </Modal>
      )}
    </div>
  );
}
