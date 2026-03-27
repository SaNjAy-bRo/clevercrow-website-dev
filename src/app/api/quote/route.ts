import { NextResponse } from 'next/server';

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

    const resendApiKey = process.env.RESEND_API_KEY || '';
    const fromEmail = process.env.RESEND_FROM || 'onboarding@resend.dev';
    const toEmail = process.env.RESEND_TO || 'kalyanapura.krishna@gmail.com';

    if (!resendApiKey) {
      console.warn('RESEND_API_KEY not set. Lead received but email not sent.');
      console.log(`Lead => Name: ${name}, Phone: ${phone}, Email: ${email}, Intent: ${intent}`);
      return NextResponse.json({ success: true, message: 'Lead recorded (email not configured)' });
    }

    const html = `
      <html>
        <body style="font-family: Manrope, Arial, sans-serif; background:#f8fafc; padding:20px;">
          <div style="max-width:600px; margin:0 auto; background:#ffffff; border-radius:10px; padding:24px; border:1px solid #e2e8f0;">
            <h2 style="margin:0 0 16px; color:#0f172a;">New Quote Request</h2>
            <p><strong>Form / Intent:</strong> ${intent}</p>
            <p><strong>Name:</strong> ${name}</p>
            <p><strong>Phone:</strong> ${phone}</p>
            <p><strong>Email:</strong> ${email || 'Not provided'}</p>
            <p><strong>Page URL:</strong> ${page || 'N/A'}</p>
          </div>
        </body>
      </html>
    `;

    const payload: Record<string, unknown> = {
      from: fromEmail,
      to: [toEmail],
      subject: 'WD Quote Request from Clevercrow Website',
      html,
    };

    // Set reply-to if a valid email was provided
    if (email && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      payload.reply_to = email;
    }

    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${resendApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const resBody = await response.text();
      console.error('Resend API failure:', response.status, resBody);
      return NextResponse.json({ error: 'Failed to send email' }, { status: 500 });
    }

    return NextResponse.json({ success: true, message: 'Message sent successfully!' });
  } catch (error) {
    console.error('API route error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
