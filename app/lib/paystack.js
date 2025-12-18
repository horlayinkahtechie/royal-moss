"use client";

const PAYSTACK_PUBLIC_KEY = process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY;
const PAYSTACK_BASE_URL = "https://api.paystack.co";

const isClient = typeof window !== "undefined";

export const initializePayment = async (email, amount, reference, metadata = {}) => {
  try {
    if (!PAYSTACK_PUBLIC_KEY) {
      throw new Error('PayStack public key is not configured');
    }

    const amountInKobo = Math.round(amount * 100);
    
    console.log('Initializing PayStack payment:', {
      email,
      amount: amountInKobo,
      reference,
      metadata
    });

    const response = await fetch(`${PAYSTACK_BASE_URL}/transaction/initialize`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${PAYSTACK_PUBLIC_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email,
        amount: amountInKobo,
        reference,
        currency: 'NGN',
        callback_url: isClient ? `${window.location.origin}/booking-status?ref=${reference}` : '',
        metadata: {
          custom_fields: Object.entries(metadata).map(([key, value]) => ({
            display_name: key,
            variable_name: key.replace(/\s+/g, '_').toLowerCase(),
            value: String(value)
          }))
        }
      }),
    });

    const data = await response.json();

    console.log('PayStack API response:', data);

    if (!data.status) {
      throw new Error(data.message || 'Payment initialization failed');
    }

    if (!data.data?.authorization_url) {
      throw new Error('No authorization URL returned from PayStack');
    }

    return data.data;
  } catch (error) {
    console.error('PayStack initialization error:', error);
    throw new Error(`Payment initialization failed: ${error.message}`);
  }
};

export const verifyPayment = async (reference) => {
  try {
    if (!PAYSTACK_PUBLIC_KEY) {
      throw new Error('PayStack public key is not configured');
    }

    const response = await fetch(`${PAYSTACK_BASE_URL}/transaction/verify/${encodeURIComponent(reference)}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${process.env.PAYSTACK_SECRET_KEY || PAYSTACK_PUBLIC_KEY}`,
        'Content-Type': 'application/json',
      },
    });

    const data = await response.json();

    console.log('PayStack verification response:', data);

    if (!data.status) {
      throw new Error(data.message || 'Payment verification failed');
    }

    return data.data;
  } catch (error) {
    console.error('PayStack verification error:', error);
    throw new Error(`Payment verification failed: ${error.message}`);
  }
};