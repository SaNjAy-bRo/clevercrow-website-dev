import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

export async function POST(request: Request) {
  try {
    const data = await request.formData();
    const name = (data.get('name') as string || '').trim();
    const phone = (data.get('phone') as string || '').trim();
    const email = (data.get('email') as string || '').trim();
    const intent = (data.get('intent') as string || 'Website Enquiry').trim();
    const page = (data.get('page') as string || '').trim();

    if (!name || !phone) {
      return NextResponse.json({ error: 'Name and Phone are required' }, { status: 422 });
    }

    const host = process.env.SMTP_HOST || 'smtp.gmail.com';
    const port = parseInt(process.env.SMTP_PORT || '465');
    const user = process.env.SMTP_USER || '';
    const pass = process.env.SMTP_PASS || '';
    const from = process.env.MAIL_FROM || `"Lead-capture" <${user}>`;
    const to = process.env.MAIL_TO || 'kalyanapura.krishna@gmail.com';

    if (!user || !pass) {
      console.warn('SMTP credentials not set. Lead received but email not sent.');
      console.log(`Lead => Name: ${name}, Phone: ${phone}, Email: ${email}, Intent: ${intent}`);
      return NextResponse.json({ success: true, message: 'Lead recorded (email not configured)' });
    }

    const transporter = nodemailer.createTransport({
      host,
      port,
      secure: port === 465, // true for 465, false for other ports
      auth: {
        user,
        pass,
      },
    });

    const html = `
      <html>
        <body style="font-family: Arial, sans-serif; background:#f8fafc; padding:20px;">
          <div style="max-width:600px; margin:0 auto; background:#ffffff; border-radius:10px; padding:24px; border:1px solid #e2e8f0;">
            <h2 style="margin:0 0 16px; color:#0f172a; border-bottom: 2px solid #f6b410; padding-bottom: 10px;">New Quote Request</h2>
            <div style="padding:10px 0;">
              <p><strong>Form / Intent:</strong> ${intent}</p>
              <p><strong>Name:</strong> ${name}</p>
              <p><strong>Phone:</strong> ${phone}</p>
              <p><strong>Email:</strong> ${email || 'Not provided'}</p>
              <p><strong>Page URL:</strong> ${page || 'N/A'}</p>
            </div>
            <div style="margin-top: 20px; font-size: 12px; color: #64748b; border-top: 1px solid #f1f5f9; padding-top: 15px;">
              Sent from Clevercrow Website Lead Capture
            </div>
          </div>
        </body>
      </html>
    `;

    await transporter.sendMail({
      from,
      to,
      subject: `New Lead: ${intent} - ${name}`,
      html,
      replyTo: email && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ? email : undefined,
    });

    return NextResponse.json({ success: true, message: 'Message sent successfully!' });
  } catch (error) {
    console.error('API route error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
