// src/services/paymentService.ts

/**
 * Service for handling payment processing with Stripe
 */
export const paymentService = {
  /**
   * Process payment through the backend API
   * @param paymentData Payment data to be sent to the API
   * @returns Promise with the transaction response
   */
  async processPayment(paymentData: {
    itinerary_uid: string;
    product_uid: string;
    currency: string;
    value: string;
    method: string;
    gateway: string;
    country: string;
    success_url: string;
    cancel_url: string;
  }) {
    try {
      const response = await fetch('http://localhost/transactions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(paymentData),
      });

      if (!response.ok) {
        throw new Error(`Payment request failed with status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Payment processing error:', error);
      throw error;
    }
  },

  /**
   * Redirect to Stripe checkout page
   * @param checkoutUrl URL provided by Stripe for checkout
   */
  redirectToCheckout(checkoutUrl: string) {
    window.location.href = checkoutUrl;
  }
};
