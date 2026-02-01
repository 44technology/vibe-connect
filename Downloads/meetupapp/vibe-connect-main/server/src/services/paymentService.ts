/**
 * Payment Service
 * Handles payment processing, commission calculations, and payouts
 */

const STRIPE_FEE_PERCENTAGE = 0.03; // 3% Stripe processing fee
const PLATFORM_FEE_PERCENTAGE = 0.03; // 3% Platform commission

export interface PaymentCalculation {
  grossAmount: number;      // Amount paid by user (e.g., 100$)
  stripeFee: number;        // Stripe processing fee (e.g., 3$ = 3% of grossAmount)
  netAmount: number;        // Amount after Stripe fee (e.g., 97$)
  platformFee: number;      // Our platform fee (3% of netAmount, e.g., 2.91$)
  payoutAmount: number;     // Amount to be paid to venue/instructor (e.g., 94.09$)
}

/**
 * Calculate payment breakdown
 * 
 * Example: User pays 100$
 * - Stripe fee (3%): 3$ → Net: 97$
 * - Platform fee (3% of net): 2.91$ → Payout: 94.09$
 * 
 * @param grossAmount - Amount paid by user
 * @returns Payment breakdown
 */
export function calculatePaymentBreakdown(grossAmount: number): PaymentCalculation {
  // Stripe fee is calculated on gross amount
  const stripeFee = grossAmount * STRIPE_FEE_PERCENTAGE;
  
  // Net amount after Stripe fee
  const netAmount = grossAmount - stripeFee;
  
  // Platform fee is calculated on net amount (after Stripe fee)
  // This ensures Stripe fee doesn't affect our commission
  const platformFee = netAmount * PLATFORM_FEE_PERCENTAGE;
  
  // Payout amount to venue/instructor
  const payoutAmount = netAmount - platformFee;
  
  return {
    grossAmount: Math.round(grossAmount * 100) / 100,
    stripeFee: Math.round(stripeFee * 100) / 100,
    netAmount: Math.round(netAmount * 100) / 100,
    platformFee: Math.round(platformFee * 100) / 100,
    payoutAmount: Math.round(payoutAmount * 100) / 100,
  };
}

/**
 * Generate payment number
 */
export function generatePaymentNumber(): string {
  const year = new Date().getFullYear();
  const random = Math.floor(Math.random() * 1000000).toString().padStart(6, '0');
  return `PAY-${year}-${random}`;
}

/**
 * Generate payout number
 */
export function generatePayoutNumber(): string {
  const year = new Date().getFullYear();
  const random = Math.floor(Math.random() * 1000000).toString().padStart(6, '0');
  return `PO-${year}-${random}`;
}

/**
 * Format amount for display
 */
export function formatAmount(amount: number, currency: string = 'USD'): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
  }).format(amount);
}

/**
 * Example usage:
 * 
 * const breakdown = calculatePaymentBreakdown(100);
 * console.log(breakdown);
 * // {
 * //   grossAmount: 100,
 * //   stripeFee: 3,
 * //   netAmount: 97,
 * //   platformFee: 2.91,
 * //   payoutAmount: 94.09
 * // }
 */
