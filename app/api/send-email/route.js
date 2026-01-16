import { Resend } from 'resend';
import { NextResponse } from 'next/server';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request) {
  try {
    const { to, subject, html, from = 'Royal Moss <contact@royalmoss.com>' } = await request.json();
    
    const { data, error } = await resend.emails.send({
      from,
      to,
      subject,
      html,
    });

    if (error) throw error;

    return NextResponse.json({ success: true, data });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}