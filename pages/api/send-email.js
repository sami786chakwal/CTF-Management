// pages/api/send-email.js
import nodemailer from "nodemailer";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { senderEmail, senderPassword, toEmail, subject, html } = req.body;

  if (!senderEmail || !senderPassword || !toEmail || !subject || !html) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: senderEmail,
        pass: senderPassword, // Gmail App Password (16 chars, no spaces)
      },
    });

    await transporter.sendMail({
      from: `"CTF Management" <${senderEmail}>`,
      to: toEmail,
      subject,
      html,
    });

    res.status(200).json({ success: true });
  } catch (err) {
    console.error("Email error:", err.message);
    res.status(500).json({ error: err.message || "Failed to send email" });
  }
}
