import { NextResponse } from 'next/server';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

const rateLimit = new Map();

function isRateLimited(ip, limit = 5, windowMs = 15 * 60 * 1000) {
  const now = Date.now();
  const windowStart = now - windowMs;
  
  if (!rateLimit.has(ip)) {
    rateLimit.set(ip, []);
  }
  
  const requests = rateLimit.get(ip).filter(time => time > windowStart);
  rateLimit.set(ip, requests);
  
  if (requests.length >= limit) {
    return true;
  }
  
  requests.push(now);
  return false;
}

// Optional: Clean up old rate limit entries periodically
setInterval(() => {
  const now = Date.now();
  const windowStart = now - (15 * 60 * 1000);
  
  for (const [ip, requests] of rateLimit.entries()) {
    const validRequests = requests.filter(time => time > windowStart);
    if (validRequests.length === 0) {
      rateLimit.delete(ip);
    } else {
      rateLimit.set(ip, validRequests);
    }
  }
}, 5 * 60 * 1000); // Clean every 5 minutes

export async function POST(request) {
  try {
    const ip = request.headers.get('x-forwarded-for') || 'unknown';
    const userAgent = request.headers.get('user-agent') || 'unknown';
    
    // Rate limiting check
    if (isRateLimited(ip)) {
      return NextResponse.json(
        { error: 'Too many requests. Please try again later.' },
        { status: 429 }
      );
    }
    
    const formData = await request.json();
    
    // Validate required fields
    const requiredFields = ['name', 'email', 'subject', 'message'];
    const missingFields = requiredFields.filter(field => !formData[field]);
    
    if (missingFields.length > 0) {
      return NextResponse.json(
        { error: `Missing required fields: ${missingFields.join(', ')}` },
        { status: 400 }
      );
    }
    
    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      return NextResponse.json(
        { error: 'Invalid email address format' },
        { status: 400 }
      );
    }
    
    // Validate message length
    if (formData.message.length < 10) {
      return NextResponse.json(
        { error: 'Message is too short. Please provide more details.' },
        { status: 400 }
      );
    }
    
    if (formData.message.length > 5000) {
      return NextResponse.json(
        { error: 'Message is too long. Maximum 5000 characters allowed.' },
        { status: 400 }
      );
    }
    
    // Sanitize inputs
    const sanitizedData = {
      name: formData.name.substring(0, 100).trim(),
      email: formData.email.substring(0, 100).trim(),
      phone: formData.phone ? formData.phone.substring(0, 20).trim() : null,
      subject: formData.subject.substring(0, 200).trim(),
      message: formData.message.substring(0, 5000).trim(),
      ip_address: ip.substring(0, 45),
      user_agent: userAgent.substring(0, 500),
      timestamp: new Date().toISOString()
    };
    
    // Generate a unique message ID
    const messageId = `MSG_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    // Log the submission (for debugging)
    console.log('Contact form submission:', {
      messageId,
      name: sanitizedData.name,
      email: sanitizedData.email,
      timestamp: sanitizedData.timestamp
    });
    
    // Send email using Resend
    try {
      const emailData = await resend.emails.send({
        from: process.env.RESEND_FROM_EMAIL || 'Royal Moss <noreply@royalmoss.org>',
        to: process.env.RESEND_TO_EMAIL || 'royalmossng@gmail.com',
        subject: `Royal Moss Contact - ${sanitizedData.subject}`,
        replyTo: sanitizedData.email,
        html: buildEmailHTML(sanitizedData, messageId),
        text: buildEmailText(sanitizedData, messageId),
      });
      
      console.log('Email sent successfully:', emailData);
      
    } catch (emailError) {
      console.error('Email sending error:', emailError);
      // Don't fail the request if email fails, just log it
      // Continue to return success to the user
    }
    
    return NextResponse.json({
      success: true,
      message: 'Your message has been sent successfully',
      data: {
        id: messageId,
        timestamp: sanitizedData.timestamp
      }
    });
    
  } catch (error) {
    console.error('API route error:', error);
    
    return NextResponse.json(
      { 
        error: 'Internal server error',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      },
      { status: 500 }
    );
  }
}

function buildEmailHTML(data, messageId) {
  // Helper function to detect if message contains urgent/emergency keywords
  const isUrgent = () => {
    const urgentKeywords = ['urgent', 'emergency', 'asap', 'immediately', 'critical'];
    const subject = data.subject.toLowerCase();
    const message = data.message.toLowerCase();
    
    return urgentKeywords.some(keyword => 
      subject.includes(keyword) || message.includes(keyword)
    );
  };
  
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>New Contact Form Submission - Royal Moss Hotel</title>
      <style>
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }
        
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, sans-serif;
          line-height: 1.6;
          color: #333;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          min-height: 100vh;
          padding: 20px;
        }
        
        .container {
          max-width: 800px;
          margin: 0 auto;
          background: white;
          border-radius: 15px;
          overflow: hidden;
          box-shadow: 0 20px 60px rgba(0,0,0,0.15);
        }
        
        .header {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          padding: 40px 30px;
          text-align: center;
        }
        
        .header h1 {
          font-size: 28px;
          font-weight: 700;
          margin-bottom: 10px;
          letter-spacing: -0.5px;
        }
        
        .header p {
          opacity: 0.9;
          font-size: 16px;
          margin-top: 5px;
        }
        
        .hotel-logo {
          font-size: 32px;
          font-weight: 800;
          color: white;
          margin-bottom: 15px;
          display: inline-block;
        }
        
        .content {
          padding: 40px;
        }
        
        .info-card {
          background: #f8f9fa;
          border-radius: 12px;
          padding: 25px;
          margin-bottom: 30px;
          border-left: 5px solid #667eea;
        }
        
        .info-item {
          display: grid;
          grid-template-columns: 120px 1fr;
          gap: 15px;
          margin-bottom: 15px;
          align-items: start;
        }
        
        .info-item:last-child {
          margin-bottom: 0;
        }
        
        .label {
          font-weight: 600;
          color: #667eea;
          font-size: 14px;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }
        
        .value {
          font-size: 16px;
          color: #2d3748;
        }
        
        .value a {
          color: #667eea;
          text-decoration: none;
          font-weight: 500;
        }
        
        .value a:hover {
          text-decoration: underline;
        }
        
        .message-box {
          background: #fff;
          border: 2px solid #e2e8f0;
          border-radius: 10px;
          padding: 25px;
          margin-top: 30px;
          font-style: italic;
          line-height: 1.8;
          color: #4a5568;
          position: relative;
        }
        
        .message-box:before {
          content: '"';
          font-size: 80px;
          color: #e2e8f0;
          position: absolute;
          top: -20px;
          left: 15px;
          font-family: Georgia, serif;
        }
        
        .actions {
          display: flex;
          gap: 15px;
          margin-top: 40px;
          flex-wrap: wrap;
        }
        
        .btn {
          padding: 14px 28px;
          border-radius: 8px;
          text-decoration: none;
          font-weight: 600;
          font-size: 15px;
          transition: all 0.3s ease;
          display: inline-flex;
          align-items: center;
          gap: 8px;
        }
        
        .btn-primary {
          background: #667eea;
          color: white;
        }
        
        .btn-primary:hover {
          background: #5a67d8;
          transform: translateY(-2px);
          box-shadow: 0 10px 20px rgba(102, 126, 234, 0.2);
        }
        
        .btn-secondary {
          background: #edf2f7;
          color: #4a5568;
        }
        
        .btn-secondary:hover {
          background: #e2e8f0;
          transform: translateY(-2px);
        }
        
        .metadata {
          margin-top: 40px;
          padding-top: 20px;
          border-top: 1px solid #e2e8f0;
          font-size: 13px;
          color: #718096;
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 15px;
        }
        
        .metadata-item {
          padding: 10px;
          background: #f8f9fa;
          border-radius: 6px;
        }
        
        .footer {
          background: #2d3748;
          color: #a0aec0;
          padding: 25px 40px;
          text-align: center;
          font-size: 13px;
          line-height: 1.6;
        }
        
        .footer a {
          color: #667eea;
          text-decoration: none;
        }
        
        .urgent {
          background: #fff5f5;
          border: 2px solid #fc8181;
          padding: 15px;
          border-radius: 8px;
          margin-top: 20px;
          display: flex;
          align-items: center;
          gap: 10px;
        }
        
        .urgent span {
          background: #fc8181;
          color: white;
          padding: 4px 10px;
          border-radius: 20px;
          font-size: 12px;
          font-weight: 600;
        }
        
        @media (max-width: 600px) {
          .content {
            padding: 25px;
          }
          
          .info-item {
            grid-template-columns: 1fr;
            gap: 5px;
          }
          
          .header {
            padding: 30px 20px;
          }
          
          .header h1 {
            font-size: 24px;
          }
          
          .actions {
            flex-direction: column;
          }
          
          .btn {
            width: 100%;
            justify-content: center;
          }
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <div class="hotel-logo">ROYAL MOSS</div>
          <h1>New Contact Form Submission</h1>
          <p>Hotel & Suites</p>
        </div>
        
        <div class="content">
          <div class="info-card">
            <div class="info-item">
              <div class="label">From:</div>
              <div class="value"><strong>${escapeHtml(data.name)}</strong></div>
            </div>
            
            <div class="info-item">
              <div class="label">Email:</div>
              <div class="value">
                <a href="mailto:${escapeHtml(data.email)}">${escapeHtml(data.email)}</a>
              </div>
            </div>
            
            ${data.phone ? `
            <div class="info-item">
              <div class="label">Phone:</div>
              <div class="value">
                <a href="tel:${escapeHtml(data.phone)}">${escapeHtml(data.phone)}</a>
              </div>
            </div>
            ` : ''}
            
            <div class="info-item">
              <div class="label">Subject:</div>
              <div class="value"><strong>${escapeHtml(data.subject)}</strong></div>
            </div>
            
            <div class="info-item">
              <div class="label">Received:</div>
              <div class="value">${new Date(data.timestamp).toLocaleString('en-US', { 
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
                timeZoneName: 'short'
              })}</div>
            </div>
          </div>
          
          ${isUrgent() ? `
          <div class="urgent">
            <span>URGENT</span>
            This message has been flagged as urgent
          </div>
          ` : ''}
          
          <div class="message-box">
            ${escapeHtml(data.message).replace(/\n/g, '<br>')}
          </div>
          
          <div class="actions">
            <a href="mailto:${escapeHtml(data.email)}?subject=Re: ${encodeURIComponent(data.subject)}" class="btn btn-primary">
              📧 Reply to ${escapeHtml(data.name.split(' ')[0])}
            </a>
            
            <a href="tel:${data.phone || '+2348089553225'}" class="btn btn-secondary">
              📞 Call ${data.phone ? 'Client' : 'Hotel'}
            </a>
          </div>
          
          <div class="metadata">
            <div class="metadata-item">
              <strong>Message ID:</strong><br>
              <code>${messageId}</code>
            </div>
            
            <div class="metadata-item">
              <strong>IP Address:</strong><br>
              ${data.ip_address}
            </div>
            
            <div class="metadata-item">
              <strong>Browser:</strong><br>
              ${data.user_agent.substring(0, 50)}...
            </div>
          </div>
        </div>
        
        <div class="footer">
          <p>
            This message was automatically generated by the Royal Moss Hotel contact form system.<br>
            Please respond within <strong>24 hours</strong> to ensure excellent customer service.
          </p>
          <p style="margin-top: 10px;">
            <a href="https://royalmoss.org">royalmoss.org</a> | 
            <a href="https://royalmoss.org/admin/dashboard">Admin Dashboard</a> | 
            <a href="mailto:contact@royalmoss.org">Support</a>
          </p>
        </div>
      </div>
    </body>
    </html>
  `;
}

function buildEmailText(data, messageId) {
  return `
NEW CONTACT FORM SUBMISSION - ROYAL MOSS HOTEL
===============================================

From: ${data.name}
Email: ${data.email}
${data.phone ? `Phone: ${data.phone}` : ''}
Subject: ${data.subject}
Time: ${new Date(data.timestamp).toLocaleString()}
Message ID: ${messageId}
IP Address: ${data.ip_address}

MESSAGE:
${data.message}

---
Please respond within 24 hours.
This message was sent via the Royal Moss Hotel contact form.
  `;
}

// Helper function to escape HTML to prevent XSS
function escapeHtml(text) {
  const map = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;'
  };
  return text.replace(/[&<>"']/g, m => map[m]);
}
