import { NextResponse } from "next/server";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request) {
  try {
    const bookingData = await request.json();

    if (!bookingData) {
      return NextResponse.json(
        { error: "Booking data is required" },
        { status: 400 }
      );
    }

    // Send email to user
    const userEmail = await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL || "Royal Moss Hotel <bookings@royalmoss.org>",
      to: bookingData.guest_email,
      subject: `Booking Confirmation - ${bookingData.booking_id}`,
      html: generateUserBookingEmailHTML(bookingData),
      text: generateUserBookingEmailText(bookingData),
    });

    // Send email to admin
    // const adminEmail = await resend.emails.send({
    //   from: process.env.RESEND_FROM_EMAIL || "Royal Moss Hotel <bookings@royalmoss.org>",
    //   to: "horlayinkah2005@gmail.com",
    //   subject: `📋 New Booking - ${bookingData.booking_id}`,
    //   html: generateAdminBookingEmailHTML(bookingData),
    //   text: generateAdminBookingEmailText(bookingData),
    // });

    return NextResponse.json({
      success: true,
      message: "Emails sent successfully",
      userEmailId: userEmail.id,
    //   adminEmailId: adminEmail.id,
    });

  } catch (error) {
    console.error("Error sending booking emails:", error);
    return NextResponse.json(
      { error: "Failed to send confirmation emails" },
      { status: 500 }
    );
  }
}

// Generate HTML email for user
function generateUserBookingEmailHTML(bookingData) {
  const checkInDate = new Date(bookingData.check_in_date).toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
  
  const checkOutDate = new Date(bookingData.check_out_date).toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
  
  const nights = bookingData.no_of_nights;
  const totalAmount = new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency: 'NGN'
  }).format(bookingData.total_amount);

  return `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Royal Moss - Booking Confirmation</title>
        <style>
            body {
                font-family: 'Georgia', serif;
                line-height: 1.6;
                color: #333;
                margin: 0;
                padding: 0;
                background-color: #f5f5f5;
            }
            
            .email-wrapper {
                max-width: 600px;
                margin: 0 auto;
                background-color: #ffffff;
                box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
            }
            
            .letterhead {
                text-align: center;
                padding: 40px 20px;
                border-bottom: 2px solid #d4af37;
                background: linear-gradient(135deg, #1a365d 0%, #2d4a80 100%);
                color: white;
            }
            
            .hotel-name {
                font-size: 32px;
                font-weight: normal;
                letter-spacing: 4px;
                margin: 0;
            }
            
            .hotel-tagline {
                font-size: 13px;
                letter-spacing: 1.5px;
                margin-top: 8px;
                text-transform: uppercase;
                font-weight: 300;
                opacity: 0.9;
            }
            
            .content-area {
                padding: 50px 40px;
            }
            
            .confirmation-header {
                font-size: 20px;
                color: #1a365d;
                margin-bottom: 30px;
                text-align: center;
                font-weight: 500;
            }
            
            .booking-id {
                background-color: #f8f9fa;
                border: 1px solid #e0e0e0;
                padding: 15px;
                text-align: center;
                margin: 20px 0;
                border-radius: 5px;
            }
            
            .booking-id span {
                font-family: 'Courier New', monospace;
                font-size: 16px;
                font-weight: bold;
                color: #1a365d;
            }
            
            .details-panel {
                margin: 30px 0;
                padding: 25px;
                background-color: #f9f9f9;
                border: 1px solid #e0e0e0;
                border-radius: 5px;
            }
            
            .details-grid {
                display: grid;
                grid-template-columns: 1fr 1fr;
                gap: 20px;
                margin-top: 20px;
            }
            
            .detail-item {
                margin-bottom: 15px;
            }
            
            .detail-label {
                font-size: 13px;
                color: #666;
                text-transform: uppercase;
                letter-spacing: 0.5px;
                margin-bottom: 5px;
            }
            
            .detail-value {
                font-size: 16px;
                color: #1a365d;
                font-weight: 500;
            }
            
            .price-summary {
                background-color: #f0f7ff;
                border: 1px solid #cfe2ff;
                padding: 25px;
                margin: 30px 0;
                border-radius: 5px;
            }
            
            .price-item {
                display: flex;
                justify-content: space-between;
                margin-bottom: 10px;
                padding-bottom: 10px;
                border-bottom: 1px dashed #dee2e6;
            }
            
            .price-total {
                display: flex;
                justify-content: space-between;
                margin-top: 15px;
                padding-top: 15px;
                border-top: 2px solid #1a365d;
                font-size: 18px;
                font-weight: bold;
                color: #1a365d;
            }
            
            .instructions {
                background-color: #fff8e1;
                border: 1px solid #ffecb3;
                padding: 20px;
                margin: 30px 0;
                border-radius: 5px;
            }
            
            .instructions-title {
                color: #1a365d;
                font-weight: 500;
                margin-bottom: 10px;
                display: flex;
                align-items: center;
                gap: 8px;
            }
            
            .instructions-list {
                margin: 15px 0 0 20px;
            }
            
            .instructions-list li {
                margin-bottom: 8px;
                color: #555;
            }
            
            .contact-info {
                text-align: center;
                margin: 40px 0;
                padding: 25px;
                background-color: #f8f9fa;
                border-radius: 5px;
            }
            
            .footer {
                background-color: #1a365d;
                color: #ffffff;
                padding: 30px 20px;
                text-align: center;
            }
            
            .footer-content {
                max-width: 400px;
                margin: 0 auto;
            }
            
            .contact-line {
                font-size: 13px;
                color: rgba(255, 255, 255, 0.8);
                margin: 5px 0;
            }
            
            .security-message {
                font-size: 11px;
                color: rgba(255, 255, 255, 0.6);
                margin-top: 20px;
                line-height: 1.5;
            }
            
            @media (max-width: 600px) {
                .content-area {
                    padding: 30px 20px;
                }
                
                .details-grid {
                    grid-template-columns: 1fr;
                }
            }
        </style>
    </head>
    <body>
        <div class="email-wrapper">
            <!-- Letterhead -->
            <div class="letterhead">
                <h1 class="hotel-name">ROYAL MOSS</h1>
                <p class="hotel-tagline">Luxury Hotel & Resorts</p>
            </div>
            
            <!-- Content -->
            <div class="content-area">
                <h2 class="confirmation-header">Booking Confirmation</h2>
                
                <p style="font-size: 16px; color: #555; margin-bottom: 25px; line-height: 1.8;">
                    Dear ${bookingData.guest_name},<br><br>
                    Thank you for choosing Royal Moss Hotel & Resorts. Your booking has been confirmed and we're delighted to welcome you.
                </p>
                
                <!-- Booking ID -->
                <div class="booking-id">
                    <div style="font-size: 13px; color: #666; margin-bottom: 5px;">BOOKING REFERENCE</div>
                    <span>${bookingData.booking_id}</span>
                </div>
                
                <!-- Booking Details -->
                <div class="details-panel">
                    <div style="font-size: 18px; color: #1a365d; margin-bottom: 20px; font-weight: 500;">
                        Booking Details
                    </div>
                    
                    <div class="details-grid">
                        <div class="detail-item">
                            <div class="detail-label">Guest Name</div>
                            <div class="detail-value">${bookingData.guest_name}</div>
                        </div>
                        
                        <div class="detail-item">
                            <div class="detail-label">Check-in Date</div>
                            <div class="detail-value">${checkInDate}</div>
                        </div>
                        
                        <div class="detail-item">
                            <div class="detail-label">Room Type</div>
                            <div class="detail-value">${bookingData.room_title}</div>
                        </div>
                        
                        <div class="detail-item">
                            <div class="detail-label">Check-out Date</div>
                            <div class="detail-value">${checkOutDate}</div>
                        </div>
                        
                        <div class="detail-item">
                            <div class="detail-label">Number of Guests</div>
                            <div class="detail-value">${bookingData.no_of_guests}</div>
                        </div>
                        
                        <div class="detail-item">
                            <div class="detail-label">Number of Nights</div>
                            <div class="detail-value">${nights}</div>
                        </div>
                        
                        <div class="detail-item">
                            <div class="detail-label">Room Number</div>
                            <div class="detail-value">${bookingData.room_number}</div>
                        </div>
                        
                        <div class="detail-item">
                            <div class="detail-label">Booking Status</div>
                            <div class="detail-value" style="color: #28a745; font-weight: bold;">Confirmed</div>
                        </div>
                    </div>
                </div>
                
                <!-- Price Summary -->
                <div class="price-summary">
                    <div style="font-size: 18px; color: #1a365d; margin-bottom: 20px; font-weight: 500;">
                        Payment Summary
                    </div>
                    
                    <div class="price-item">
                        <span>Room Rate (${nights} nights)</span>
                        <span>${new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN' }).format(bookingData.price_per_night * nights)}</span>
                    </div>
                    
                    <div class="price-total">
                        <span>TOTAL AMOUNT PAID</span>
                        <span>${totalAmount}</span>
                    </div>
                    
                    <div style="margin-top: 15px; font-size: 13px; color: #28a745; text-align: center;">
                        ✓ Payment Status: <strong>Paid</strong>
                    </div>
                </div>
                
                <!-- Important Instructions -->
                <div class="instructions">
                    <div class="instructions-title">📋 Important Information</div>
                    <ul class="instructions-list">
                        <li>Check-in time: 2:00 PM | Check-out time: 11:00 AM</li>
                        <li>Please present this confirmation email and a valid ID at check-in</li>
                        <li>Early check-in and late check-out are subject to availability</li>
                        <li>Cancellation policy: Free cancellation up to 48 hours before check-in</li>
                    </ul>
                </div>
                
                <!-- Contact Information -->
                <div class="contact-info">
                    <div style="font-size: 18px; color: #1a365d; margin-bottom: 15px; font-weight: 500;">
                        Need Assistance?
                    </div>
                    <p style="font-size: 14px; color: #555; margin: 10px 0;">
                        Email: <a href="mailto:reservations@royalmoss.org" style="color: #1a365d;">reservations@royalmoss.org</a>
                    </p>
                    <p style="font-size: 14px; color: #555; margin: 10px 0;">
                        Phone: <a href="tel:+2341234567890" style="color: #1a365d;">+234 123 456 7890</a>
                    </p>
                </div>
                
                <p style="font-size: 16px; color: #555; margin-top: 40px; line-height: 1.8; text-align: center;">
                    We look forward to welcoming you to Royal Moss Hotel & Resorts.<br>
                    Safe travels!
                </p>
                
                <p style="font-style: italic; color: #555; margin-top: 40px; padding-top: 30px; border-top: 1px solid #eee; text-align: center;">
                    With warm regards,<br>
                    The Royal Moss Team
                </p>
            </div>
            
            <!-- Footer -->
            <div class="footer">
                <div class="footer-content">
                    <p class="contact-line">Royal Moss Hotel & Resorts</p>
                    <p class="contact-line">Iworo-Aradagun Road, Badagry (Moghoto)</p>
                    <p class="contact-line">reservations@royalmoss.org | +234 123 456 7890</p>
                    
                    <p class="security-message">
                        This email confirms your booking. Please save it for your records.<br>
                        Royal Moss will never ask for your payment details via email.
                    </p>
                    
                    <p class="security-message" style="margin-top: 10px;">
                        © ${new Date().getFullYear()} Royal Moss. All rights reserved.
                    </p>
                </div>
            </div>
        </div>
    </body>
    </html>
  `;
}

// Generate plain text email for user
function generateUserBookingEmailText(bookingData) {
  return `
ROYAL MOSS HOTEL & RESORTS - BOOKING CONFIRMATION

Dear ${bookingData.guest_name},

Thank you for choosing Royal Moss Hotel & Resorts. Your booking has been confirmed.

BOOKING DETAILS:
────────────────
Booking Reference: ${bookingData.booking_id}
Guest Name: ${bookingData.guest_name}
Email: ${bookingData.guest_email}
Phone: ${bookingData.guest_phone}

Room Details:
• Room Type: ${bookingData.room_title}
• Room Number: ${bookingData.room_number}
• Check-in: ${new Date(bookingData.check_in_date).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
• Check-out: ${new Date(bookingData.check_out_date).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
• Nights: ${bookingData.no_of_nights}
• Guests: ${bookingData.no_of_guests}

PAYMENT SUMMARY:
────────────────
Total Amount: ₦${bookingData.total_amount.toLocaleString('en-NG')}
Payment Status: Paid ✓
Payment Method: ${bookingData.payment_method}
Payment Reference: ${bookingData.payment_reference}

IMPORTANT INFORMATION:
─────────────────────
• Check-in: 2:00 PM | Check-out: 11:00 AM
• Present this confirmation and valid ID at check-in
• Early check-in/late check-out subject to availability
• Cancellation: Free up to 48 hours before check-in

CONTACT INFORMATION:
───────────────────
📍 Royal Moss Hotel & Resorts
📞 +234 123 456 7890
✉️ reservations@royalmoss.org

We look forward to welcoming you!

With warm regards,
The Royal Moss Team

────────────────────────────────────────────
This is an automated confirmation. Please save for your records.
© ${new Date().getFullYear()} Royal Moss. All rights reserved.
  `;
}

// Generate HTML email for admin (using your provided template)
function generateAdminBookingEmailHTML(bookingData) {
  const checkInDate = new Date(bookingData.check_in_date).toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
  
  const checkOutDate = new Date(bookingData.check_out_date).toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
  
  const bookingTime = new Date(bookingData.created_at).toLocaleString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });

  return `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Royal Moss - New Booking Notification</title>
        <style>
            body {
                font-family: 'Georgia', serif;
                line-height: 1.6;
                color: #333;
                margin: 0;
                padding: 0;
                background-color: #f5f5f5;
            }
            
            .email-wrapper {
                max-width: 700px;
                margin: 0 auto;
                background-color: #ffffff;
                box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
            }
            
            .letterhead {
                text-align: center;
                padding: 40px 20px;
                border-bottom: 2px solid #d4af37;
                background-color: #ffffff;
            }
            
            .hotel-name {
                font-size: 28px;
                font-weight: normal;
                letter-spacing: 4px;
                color: #1a365d;
                margin: 0;
            }
            
            .hotel-tagline {
                font-size: 13px;
                color: #666;
                letter-spacing: 1.5px;
                margin-top: 8px;
                text-transform: uppercase;
                font-weight: 300;
            }
            
            .content-area {
                padding: 50px 40px;
            }
            
            .notification-header {
                font-size: 22px;
                color: #1a365d;
                margin-bottom: 30px;
                text-align: center;
                font-weight: 500;
                background-color: #f0f7ff;
                padding: 20px;
                border-radius: 5px;
                border-left: 4px solid #1a365d;
            }
            
            .booking-id {
                background-color: #1a365d;
                color: white;
                padding: 15px;
                text-align: center;
                margin: 20px 0;
                border-radius: 5px;
                font-family: 'Courier New', monospace;
                font-size: 18px;
                font-weight: bold;
            }
            
            .admin-alert {
                background-color: #fff3cd;
                border: 1px solid #ffecb5;
                padding: 20px;
                margin: 25px 0;
                border-radius: 5px;
            }
            
            .alert-title {
                color: #856404;
                font-weight: 500;
                margin-bottom: 10px;
                display: flex;
                align-items: center;
                gap: 8px;
            }
            
            .booking-details-grid {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
                gap: 20px;
                margin: 30px 0;
            }
            
            .detail-card {
                background-color: #f8f9fa;
                border: 1px solid #e0e0e0;
                padding: 20px;
                border-radius: 5px;
            }
            
            .detail-card h3 {
                color: #1a365d;
                font-size: 16px;
                margin-bottom: 15px;
                padding-bottom: 10px;
                border-bottom: 1px solid #dee2e6;
            }
            
            .detail-item {
                margin-bottom: 12px;
                display: flex;
                justify-content: space-between;
            }
            
            .detail-label {
                font-size: 13px;
                color: #666;
                font-weight: 500;
            }
            
            .detail-value {
                font-size: 14px;
                color: #1a365d;
                font-weight: 500;
                text-align: right;
            }
            
            .payment-card {
                background-color: #e7f5e9;
                border: 1px solid #c3e6cb;
                padding: 25px;
                margin: 25px 0;
                border-radius: 5px;
            }
            
            .payment-card h3 {
                color: #155724;
                font-size: 18px;
                margin-bottom: 20px;
            }
            
            .payment-summary {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
                gap: 15px;
            }
            
            .total-amount {
                grid-column: 1 / -1;
                background-color: #155724;
                color: white;
                padding: 15px;
                border-radius: 5px;
                text-align: center;
                font-size: 20px;
                font-weight: bold;
                margin-top: 10px;
            }
            
            .guest-info {
                background-color: #f8f9fa;
                border: 1px solid #e0e0e0;
                padding: 25px;
                margin: 25px 0;
                border-radius: 5px;
            }
            
            .guest-info h3 {
                color: #1a365d;
                font-size: 18px;
                margin-bottom: 20px;
                padding-bottom: 10px;
                border-bottom: 1px solid #dee2e6;
            }
            
            .action-buttons {
                text-align: center;
                margin: 40px 0;
                padding: 30px;
                background-color: #f0f7ff;
                border-radius: 5px;
            }
            
            .action-button {
                display: inline-block;
                background-color: #1a365d;
                color: white;
                padding: 12px 30px;
                margin: 0 10px;
                text-decoration: none;
                border-radius: 4px;
                font-weight: 500;
                transition: background-color 0.2s;
            }
            
            .action-button:hover {
                background-color: #152642;
            }
            
            .footer {
                background-color: #1a365d;
                color: #ffffff;
                padding: 30px 20px;
                text-align: center;
            }
            
            .footer-content {
                max-width: 400px;
                margin: 0 auto;
            }
            
            .contact-line {
                font-size: 13px;
                color: rgba(255, 255, 255, 0.8);
                margin: 5px 0;
            }
            
            @media (max-width: 600px) {
                .content-area {
                    padding: 30px 20px;
                }
                
                .action-buttons {
                    padding: 20px;
                }
                
                .action-button {
                    display: block;
                    margin: 10px 0;
                }
            }
        </style>
    </head>
    <body>
        <div class="email-wrapper">
            <!-- Letterhead -->
            <div class="letterhead">
                <h1 class="hotel-name">ROYAL MOSS</h1>
                <p class="hotel-tagline">New Booking Notification - Admin</p>
            </div>
            
            <!-- Content -->
            <div class="content-area">
                <div class="notification-header">
                    📋 NEW BOOKING RECEIVED
                </div>
                
                <div class="booking-id">
                    ${bookingData.booking_id}
                </div>
                
                <!-- Admin Alert -->
                <div class="admin-alert">
                    <div class="alert-title">🕒 Immediate Attention Required</div>
                    <p style="margin: 0; color: #856404;">
                        A new booking has been confirmed. Guest is expecting arrival on <strong>${checkInDate}</strong>.
                        Please prepare the room and ensure all guest requirements are met.
                    </p>
                </div>
                
                <!-- Booking Timeline -->
                <div style="background-color: #f8f9fa; padding: 20px; border-radius: 5px; margin: 25px 0;">
                    <div style="display: flex; justify-content: space-between; align-items: center;">
                        <div>
                            <div style="font-size: 13px; color: #666;">Booking Created</div>
                            <div style="font-size: 15px; color: #1a365d; font-weight: 500;">${bookingTime}</div>
                        </div>
                        <div style="text-align: center;">
                            <div style="font-size: 13px; color: #666;">Arrival In</div>
                            <div style="font-size: 15px; color: #1a365d; font-weight: 500;">
                                ${Math.ceil((new Date(bookingData.check_in_date) - new Date()) / (1000 * 60 * 60 * 24))} days
                            </div>
                        </div>
                        <div style="text-align: right;">
                            <div style="font-size: 13px; color: #666;">Booking Type</div>
                            <div style="font-size: 15px; color: ${bookingData.user_id ? '#28a745' : '#ffc107'}; font-weight: 500;">
                                ${bookingData.user_id ? 'Registered User' : 'Guest Booking'}
                            </div>
                        </div>
                    </div>
                </div>
                
                <!-- Booking Details Grid -->
                <div class="booking-details-grid">
                    <div class="detail-card">
                        <h3>Room Details</h3>
                        <div class="detail-item">
                            <span class="detail-label">Room Type:</span>
                            <span class="detail-value">${bookingData.room_title}</span>
                        </div>
                        <div class="detail-item">
                            <span class="detail-label">Room Number:</span>
                            <span class="detail-value">${bookingData.room_number}</span>
                        </div>
                        <div class="detail-item">
                            <span class="detail-label">Room Category:</span>
                            <span class="detail-value">${bookingData.room_category}</span>
                        </div>
                    </div>
                    
                    <div class="detail-card">
                        <h3>Stay Details</h3>
                        <div class="detail-item">
                            <span class="detail-label">Check-in:</span>
                            <span class="detail-value">${checkInDate}</span>
                        </div>
                        <div class="detail-item">
                            <span class="detail-label">Check-out:</span>
                            <span class="detail-value">${checkOutDate}</span>
                        </div>
                        <div class="detail-item">
                            <span class="detail-label">Nights:</span>
                            <span class="detail-value">${bookingData.no_of_nights}</span>
                        </div>
                        <div class="detail-item">
                            <span class="detail-label">Guests:</span>
                            <span class="detail-value">${bookingData.no_of_guests}</span>
                        </div>
                    </div>
                </div>
                
                <!-- Guest Information -->
                <div class="guest-info">
                    <h3>Guest Information</h3>
                    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px;">
                        <div>
                            <div style="font-size: 13px; color: #666; margin-bottom: 5px;">Full Name</div>
                            <div style="font-size: 16px; color: #1a365d; font-weight: 500;">${bookingData.guest_name}</div>
                        </div>
                        <div>
                            <div style="font-size: 13px; color: #666; margin-bottom: 5px;">Email Address</div>
                            <div style="font-size: 16px; color: #1a365d; font-weight: 500;">
                                <a href="mailto:${bookingData.guest_email}" style="color: #1a365d; text-decoration: none;">${bookingData.guest_email}</a>
                            </div>
                        </div>
                        <div>
                            <div style="font-size: 13px; color: #666; margin-bottom: 5px;">Phone Number</div>
                            <div style="font-size: 16px; color: #1a365d; font-weight: 500;">
                                <a href="tel:${bookingData.guest_phone}" style="color: #1a365d; text-decoration: none;">${bookingData.guest_phone}</a>
                            </div>
                        </div>
                    </div>
                    
                    ${bookingData.special_requests ? `
                    <div style="margin-top: 20px; padding-top: 20px; border-top: 1px solid #dee2e6;">
                        <div style="font-size: 13px; color: #666; margin-bottom: 10px;">Special Requests</div>
                        <div style="font-size: 14px; color: #555; background-color: #fff8e1; padding: 15px; border-radius: 4px; border-left: 3px solid #ffc107;">
                            ${bookingData.special_requests}
                        </div>
                    </div>
                    ` : ''}
                </div>
                
                <!-- Payment Information -->
                <div class="payment-card">
                    <h3>Payment Information</h3>
                    <div class="payment-summary">
                        <div>
                            <div style="font-size: 13px; color: #666; margin-bottom: 5px;">Payment Method</div>
                            <div style="font-size: 15px; color: #1a365d; font-weight: 500;">${bookingData.payment_method.toUpperCase()}</div>
                        </div>
                        <div>
                            <div style="font-size: 13px; color: #666; margin-bottom: 5px;">Payment Status</div>
                            <div style="font-size: 15px; color: #28a745; font-weight: 500;">PAID ✓</div>
                        </div>
                        <div>
                            <div style="font-size: 13px; color: #666; margin-bottom: 5px;">Reference</div>
                            <div style="font-size: 14px; color: #1a365d; font-weight: 500;">${bookingData.payment_reference}</div>
                        </div>
                    </div>
                    
                    <div class="total-amount">
                        Total Amount: ₦${bookingData.total_amount.toLocaleString('en-NG')}
                    </div>
                </div>
                
                <!-- Action Buttons -->
                <div class="action-buttons">
                    <div style="font-size: 16px; color: #1a365d; margin-bottom: 20px; font-weight: 500;">
                        Quick Actions
                    </div>
                    <a href="${process.env.NEXT_PUBLIC_APP_URL}/admin/bookings/${bookingData.booking_id}" class="action-button">
                        View Booking Details
                    </a>
                    <a href="mailto:${bookingData.guest_email}?subject=Royal Moss Booking ${bookingData.booking_id}" class="action-button">
                        Contact Guest
                    </a>
                    <a href="${process.env.NEXT_PUBLIC_APP_URL}/admin/rooms" class="action-button">
                        Manage Rooms
                    </a>
                </div>
                
                <!-- System Information -->
                <div style="background-color: #f8f9fa; padding: 20px; border-radius: 5px; margin-top: 40px;">
                    <div style="font-size: 13px; color: #666; margin-bottom: 10px;">System Information</div>
                    <div style="font-size: 12px; color: #888;">
                        • This booking was ${bookingData.user_id ? 'made by a registered user' : 'created as a guest booking'}<br>
                        • ${bookingData.user_id ? `User ID: ${bookingData.user_id}` : 'No user account associated'}
                    </div>
                </div>
            </div>
            
            <!-- Footer -->
            <div class="footer">
                <div class="footer-content">
                    <p class="contact-line">Royal Moss Hotel & Resorts - Admin Panel</p>
                    <p class="contact-line">This is an automated notification. No reply needed.</p>
                    <p class="contact-line">© ${new Date().getFullYear()} Royal Moss. All rights reserved.</p>
                </div>
            </div>
        </div>
    </body>
    </html>
  `;
}

// Generate plain text email for admin
function generateAdminBookingEmailText(bookingData) {
  return `
ROYAL MOSS HOTEL - NEW BOOKING NOTIFICATION ⚠️
────────────────────────────────────────────

📋 NEW BOOKING RECEIVED
Booking ID: ${bookingData.booking_id}
Time: ${new Date(bookingData.created_at).toLocaleString('en-US')}

URGENT: Guest arriving in ${Math.ceil((new Date(bookingData.check_in_date) - new Date()) / (1000 * 60 * 60 * 24))} days
Arrival Date: ${new Date(bookingData.check_in_date).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
GUEST INFORMATION
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
• Name: ${bookingData.guest_name}
• Email: ${bookingData.guest_email}
• Phone: ${bookingData.guest_phone}
• Booking Type: ${bookingData.user_id ? 'Registered User' : 'Guest Booking'}

${bookingData.special_requests ? `
Special Requests:
${bookingData.special_requests}
` : ''}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
BOOKING DETAILS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
• Room: ${bookingData.room_title} (${bookingData.room_number})
• Category: ${bookingData.room_category}
• Check-in: ${new Date(bookingData.check_in_date).toLocaleDateString('en-US')}
• Check-out: ${new Date(bookingData.check_out_date).toLocaleDateString('en-US')}
• Nights: ${bookingData.no_of_nights}
• Guests: ${bookingData.no_of_guests}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
PAYMENT INFORMATION
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
• Amount: ₦${bookingData.total_amount.toLocaleString('en-NG')}
• Status: PAID ✓
• Method: ${bookingData.payment_method.toUpperCase()}
• Reference: ${bookingData.payment_reference}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
QUICK ACTIONS REQUIRED
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
1. Prepare room ${bookingData.room_number}
2. Note special requests
3. Confirm availability with housekeeping
4. Add to arrival list for ${new Date(bookingData.check_in_date).toLocaleDateString('en-US')}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
VIEW IN ADMIN PANEL:
${process.env.NEXT_PUBLIC_APP_URL || 'https://royalmoss.org'}/admin/bookings/${bookingData.booking_id}

CONTACT GUEST:
Email: ${bookingData.guest_email}
Phone: ${bookingData.guest_phone}

────────────────────────────────────────────
This is an automated notification from Royal Moss Hotel.
No reply is needed to this email.
© ${new Date().getFullYear()} Royal Moss Hotel & Resorts
  `;
}