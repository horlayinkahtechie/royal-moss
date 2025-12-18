import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const { reference } = await request.json();

    if (!reference) {
      return NextResponse.json(
        { success: false, error: 'No reference provided' },
        { status: 400 }
      );
    }

    const response = await fetch(`https://api.paystack.co/transaction/verify/${reference}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
        'Content-Type': 'application/json',
      },
    });

    const data = await response.json();

    console.log('PayStack verification response:', data);

    if (!data.status) {
      return NextResponse.json(
        { 
          success: false, 
          error: data.message || 'Payment verification failed'
        },
        { status: 400 }
      );
    }

    // Check if payment was successful
    if (data.data.status !== 'success') {
      return NextResponse.json(
        { 
          success: false, 
          error: `Payment status: ${data.data.status}`,
          data: data.data 
        },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      data: data.data
    });

  } catch (error) {
    console.error('Payment verification error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}