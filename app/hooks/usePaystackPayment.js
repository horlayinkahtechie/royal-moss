"use client";

import { useState } from "react";

export const usePaystackPayment = () => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentError, setPaymentError] = useState(null);

  const processPayment = async (paymentData) => {
    try {
      setIsProcessing(true);
      setPaymentError(null);

      const { email, amount, reference, metadata, onSuccess, onClose } = paymentData;

      // Dynamically import Paystack inline JS
      const PaystackPop = (await import("@paystack/inline-js")).default;
      const paystack = new PaystackPop();

      paystack.newTransaction({
        key: process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY,
        email,
        amount: amount * 100, // convert to kobo
        reference,
        metadata,
        onSuccess: (transaction) => {
          console.log("Payment successful:", transaction);
          onSuccess?.(transaction);
        },
        onCancel: () => {
          console.log("Payment cancelled");
          onClose?.();
        },
      });
    } catch (error) {
      console.error("Payment initialization failed:", error);
      setPaymentError(error.message || "Payment initialization failed");
      throw error;
    } finally {
      setIsProcessing(false);
    }
  };

  return { processPayment, isProcessing, paymentError };
};