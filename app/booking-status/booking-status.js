"use client";

import { useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';

export default function BookingVerify() {
  const searchParams = useSearchParams();
  const router = useRouter();

  useEffect(() => {
    const bookingRef = searchParams.get('ref');
    
    if (bookingRef) {
      // Check if booking was already created
      const checkBooking = async () => {
        try {
          const response = await fetch(`/api/check-booking?ref=${bookingRef}`);
          const data = await response.json();
          
          if (data.exists) {
            // Booking already exists, redirect to success
            router.push(`/booking-success?ref=${bookingRef}`);
          } else {
            // Payment might still be processing
            router.push('/bookings');
          }
        } catch (error) {
          console.error('Error checking booking:', error);
          router.push('/bookings');
        }
      };
      
      checkBooking();
    } else {
      router.push('/bookings');
    }
  }, [searchParams, router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <Loader2 className="w-12 h-12 text-sky-600 animate-spin mx-auto mb-4" />
        <h1 className="text-xl font-semibold text-gray-900">Verifying Payment</h1>
        <p className="text-gray-600 mt-2">Please wait...</p>
      </div>
    </div>
  );
}