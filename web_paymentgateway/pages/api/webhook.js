import dbConnect from "../../lib/dbConnect";
import Payment from "../../models/Payment";
import Checkout from "../../models/Checkout";
import axios from "axios";
import nodemailer from "nodemailer"; // ✅ Add this

export const config = {
  api: { bodyParser: true },
};

export default async function handler(req, res) {
  await dbConnect();

  if (req.method !== "POST") return res.status(405).end();

  const tokenHeader =
    req.headers["x-callback-token"] ||
    req.headers["x-callback-token".toLowerCase()];
  if (
    process.env.XENDIT_CALLBACK_TOKEN &&
    tokenHeader !== process.env.XENDIT_CALLBACK_TOKEN
  ) {
    console.warn("Invalid callback token", tokenHeader);
    return res.status(401).json({ message: "Invalid token" });
  }

  const payload = req.body;
  const externalId =
    payload?.data?.external_id || payload?.external_id || payload?.data?.id;
  const status = payload?.data?.status || payload?.status || null;

  try {
    let payment =
      (externalId && (await Payment.findOne({ external_id: externalId }))) ||
      (payload?.data?.id &&
        (await Payment.findOne({ invoice_id: payload.data.id })));

    if (!payment) {
      console.warn("Payment record not found for webhook payload", externalId, payload);
      return res.status(200).json({ ok: true, message: "No matching payment (ok)" });
    }

    // ✅ If paid
    if (status && (status.toLowerCase() === "paid" || status === "SETTLED" || status === "PAID")) {
      payment.status = "PAID";
      await payment.save();

      if (payment.checkout) {
        const checkout = await Checkout.findByIdAndUpdate(
          payment.checkout,
          { status: "PAID" },
          { new: true }
        ).populate("user");

        // ✅ Send WhatsApp notification
        if (checkout?.user?.phone) {
          try {
            await axios.post(
              "https://api.fonnte.com/send",
              {
                target: checkout.user.phone,
                message: `🎉 *Payment Successful!*\n\n☕ *STEM's Coffee Shop* ☕\n\nHello ${
                  checkout.user.username || "Customer"
                } 👋\nWe have received your payment of *Rp ${checkout.total.toLocaleString()}*.\n\nThank you for shopping with us!`,
              },
              { headers: { Authorization: process.env.FONNTE_TOKEN } }
            );
            console.log("✅ WhatsApp sent to:", checkout.user.phone);
          } catch (err) {
            console.error("❌ Gagal kirim WhatsApp:", err.response?.data || err.message);
          }
        }

        // ✅ Send Email Notification
        if (checkout?.user?.email) {
          try {
         const transporter = nodemailer.createTransport({
          host: "smtp.gmail.com",
          port: 465,
          secure: true,
          auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS,
          },
        });


            const mailOptions = {
              from: `"STEM's Coffee Shop" <${process.env.EMAIL_USER}>`,
              to: checkout.user.email,
              subject: "Payment Successful - STEM's Coffee Shop",
              html: `
                <div style="font-family: Arial, sans-serif; color: #333;">
                  <h2>🎉 Payment Successful!</h2>
                  <p>Hello <strong>${checkout.user.username || "Customer"}</strong>,</p>
                  <p>We have received your payment of <strong>Rp ${checkout.total.toLocaleString()}</strong>.</p>
                  <p>Thank you for shopping with <b>STEM's Coffee Shop</b> ☕</p>
                  <hr />
                  <p style="font-size: 12px; color: #888;">This is an automated message. Please do not reply.</p>
                </div>
              `,
            };

            await transporter.sendMail(mailOptions);
            console.log("✅ Email sent to:", checkout.user.email);
          } catch (err) {
            console.error("❌ Gagal kirim Email:", err.message);
          }
        }
      }

      return res.status(200).json({ ok: true });
    }

    payment.raw = payload;
    await payment.save();

    return res.status(200).json({ ok: true });
  } catch (err) {
    console.error("❌ Webhook error:", err);
    return res.status(500).json({ error: "webhook error" });
  }
}
