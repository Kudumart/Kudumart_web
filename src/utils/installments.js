// utils/installments.js
/**
 * Returns dynamic UI metadata, titles, and explanations matching the Admin's system_mode setting.
 * Supports: 'layaway_only', 'bnpl_only', 'hybrid' / 'enabled'
 */
export function getInstallmentModeMeta(config) {
  const mode = config?.system_mode;
  const trigger = config?.fulfillment_trigger;

  if (mode === 'bnpl_only') {
    return {
      mode: 'bnpl',
      name: 'BNPL',
      shortName: 'BNPL',
      fullLabel: 'Buy Now, Pay Later (BNPL)',
      badgeText: (pct = 20) => `Buy Now, Pay Later • From ${pct}% down`,
      checkoutOptionTitle: 'Buy Now, Pay Later (BNPL)',
      checkoutOptionDesc: 'Pay deposit today; order dispatches immediately while you settle the remainder',
      holdingNote: '⚡ Immediate dispatch: Item is dispatched upon deposit confirmation. Remaining installments are paid on schedule.',
      reserveButtonLabel: (amt) => `Pay Deposit & Dispatch Order (${amt})`,
      walletPayButtonLabel: (amt) => `Pay Deposit with Wallet (${amt})`,
      cancelModalTitle: 'Cancel BNPL Financing Plan?',
      cancelModalDesc: (name) =>
        `Are you sure you want to cancel your BNPL financing plan for "${name || 'this item'}"? Outstanding balances will be closed and any applicable fees deducted.`,
      completedMessage: (name) =>
        `Congratulations! Your BNPL financing plan for "${name || 'this item'}" is now fully settled. Thank you for shopping with KuduMart!`,
      planBadgeTone: 'info',
    };
  }

  if (mode === 'hybrid') {
    return {
      mode: 'hybrid',
      name: 'Installments',
      shortName: 'Installments',
      fullLabel: 'Pay in Installments (Layaway / BNPL)',
      badgeText: (pct = 20) => `Pay in Installments • From ${pct}% down`,
      checkoutOptionTitle: 'Pay in Installments',
      checkoutOptionDesc: 'Flexible financing: pay initial deposit today and spread the remainder',
      holdingNote:
        trigger === 'on_deposit'
          ? '⚡ Immediate dispatch: Item is dispatched upon deposit confirmation. Outstanding milestones are paid on schedule.'
          : '🔒 Holding reservation: Stock is reserved exclusively for you. Order fulfills immediately upon final payment settlement.',
      reserveButtonLabel: (amt) => `Pay Deposit & Start Plan (${amt})`,
      walletPayButtonLabel: (amt) => `Pay Deposit with Wallet (${amt})`,
      cancelModalTitle: 'Cancel Installment Plan?',
      cancelModalDesc: (name) =>
        `Are you sure you want to cancel your installment plan for "${name || 'this item'}"? The held product will be returned to store inventory and any net refund will be credited to your KuduMart Wallet.`,
      completedMessage: (name) =>
        `Congratulations! Your installment plan for "${name || 'this item'}" is now fully settled. Your order has been dispatched for fulfillment.`,
      planBadgeTone: 'neutral',
    };
  }

  // Default: layaway_only
  return {
    mode: 'layaway',
    name: 'Layaway',
    shortName: 'Layaway',
    fullLabel: 'Layaway Reservation',
    badgeText: (pct = 20) => `Pay in installments with Layaway • Reserve from ${pct}% down`,
    checkoutOptionTitle: 'Layaway / Installment',
    checkoutOptionDesc: 'Reserve item with deposit; pay in parts and ship on final milestone',
    holdingNote: '🔒 Holding reservation: Stock is reserved exclusively for you. Order fulfills immediately upon final payment settlement.',
    reserveButtonLabel: (amt) => `Pay Deposit & Reserve Item (${amt})`,
    walletPayButtonLabel: (amt) => `Pay Deposit with Wallet (${amt})`,
    cancelModalTitle: 'Cancel Layaway Reservation?',
    cancelModalDesc: (name) =>
      `Are you sure you want to cancel your layaway for "${name || 'this item'}"? The held product will be returned to store inventory. An 8% restocking fee will be deducted, and your remaining paid balance will be credited directly to your KuduMart Wallet.`,
    completedMessage: (name) =>
      `Congratulations! Your installment plan for "${name || 'this item'}" is now fully settled. Your order has been dispatched for fulfillment.`,
    planBadgeTone: 'warning',
  };
}
