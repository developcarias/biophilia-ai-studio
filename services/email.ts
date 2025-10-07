
import nodemailer from 'nodemailer';
import { config } from '../config';

const transporter = nodemailer.createTransport(config.smtp);

export async function sendContactEmail(name: string, fromEmail: string, message: string) {
  const mailOptions = {
    from: `"Biophilia Website" <${config.smtp.auth.user}>`,
    to: config.smtp.auth.user,
    replyTo: fromEmail,
    subject: `New Contact Form Message from ${name}`,
    text: message,
    html: `
      <p><strong>From:</strong> ${name}</p>
      <p><strong>Email:</strong> ${fromEmail}</p>
      <p><strong>Message:</strong></p>
      <p>${message.replace(/\n/g, '<br>')}</p>
    `,
  };

  await transporter.sendMail(mailOptions);
}

export async function sendDonationNotificationEmail(firstName: string, lastName: string, fromEmail: string, amount: number) {
  const mailOptions = {
    from: `"Biophilia Website" <${config.smtp.auth.user}>`,
    to: config.smtp.auth.user, // Send to admin
    replyTo: fromEmail,
    subject: `New Donation Received: $${amount} from ${firstName} ${lastName}`,
    html: `
      <h1>New Donation Notification</h1>
      <p>A new donation has been submitted through the website.</p>
      <ul>
        <li><strong>Name:</strong> ${firstName} ${lastName}</li>
        <li><strong>Email:</strong> ${fromEmail}</li>
        <li><strong>Amount:</strong> $${amount}</li>
      </ul>
      <p>This is a notification email. Payment processing would be handled by a separate service.</p>
    `,
  };

  await transporter.sendMail(mailOptions);
}