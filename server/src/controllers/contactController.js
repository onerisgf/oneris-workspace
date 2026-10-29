const nodemailer = require('nodemailer');

// Envia os dados do formulário de contato por e-mail.
// As credenciais SMTP ficam no .env para evitar exposição de dados sensíveis no código.
async function sendContactEmail(req, res) {
  try {
    const { name, email, phone, message } = req.body;

    if (!name || !email || !phone || !message) {
      return res.status(400).json({
        message: 'Name, email, phone and message are required',
      });
    }

    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT),
      secure: Number(process.env.SMTP_PORT) === 465,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    await transporter.sendMail({
      from: process.env.MAIL_FROM,
      to: process.env.MAIL_TO,
      replyTo: email,
      subject: 'Novo contato via OnPlan Work',
      html: `
        <h2>New contact message</h2>

        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Phone:</strong> ${phone}</p>

        <p><strong>Message:</strong></p>
        <p>${message}</p>
      `,
    });

    return res.json({
      message: 'Email sent successfully',
    });
  } catch (error) {
    console.error('Contact email error:', error);

    return res.status(500).json({
      message: 'Error sending email',
    });
  }
}

module.exports = {
  sendContactEmail,
};