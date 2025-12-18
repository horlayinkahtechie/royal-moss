import { NextResponse } from 'next/server';
import supabase from '@/lib/supabase';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const ref = searchParams.get('ref');

    if (!ref) {
      return NextResponse.json(
        { exists: false, error: 'No reference provided' },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from('bookings')
      .select('id, booking_id, payment_status')
      .eq('booking_id', ref)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        // No booking found
        return NextResponse.json({ exists: false });
      }
      throw error;
    }

    return NextResponse.json({ 
      exists: true, 
      booking: data 
    });

  } catch (error) {
    console.error('Error checking booking:', error);
    return NextResponse.json(
      { exists: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}