import mongoose from "mongoose";

const PaymentSchema = new mongoose.Schema({
  external_id: String, 
  checkout: { type: mongoose.Schema.Types.ObjectId, ref: "Checkout" },
  amount: Number,
  invoice_id: String,
  invoice_url: String,
  status: { type: String, default: "PENDING" }, // PENDING, PAID, EXPIRED
  raw: mongoose.Schema.Types.Mixed,
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.models.Payment || mongoose.model("Payment", PaymentSchema);
