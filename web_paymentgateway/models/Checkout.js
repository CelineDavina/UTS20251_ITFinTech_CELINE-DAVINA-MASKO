import mongoose from "mongoose";

const CheckoutSchema = new mongoose.Schema({
  items: [
    {
      productId: { type: mongoose.Schema.Types.ObjectId, ref: "Product" },
      name: String,
      price: Number,
      quantity: Number,
      image: String, 
    },
  ],
  subtotal: Number,
  tax: Number,
  total: Number,
  status: { type: String, default: "PENDING" }, // PENDING, PAID, EXPIRED
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.models.Checkout || mongoose.model("Checkout", CheckoutSchema);
