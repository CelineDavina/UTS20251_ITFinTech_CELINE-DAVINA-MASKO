import { useEffect, useState } from "react";
import { useRouter } from "next/router";

export default function CheckoutPage() {
  const [cart, setCart] = useState([]);
  const [subtotal, setSubtotal] = useState(0);
  const router = useRouter();

  useEffect(() => {
    const c = JSON.parse(localStorage.getItem("cart") || "[]");
    setCart(c);
  }, []);

  useEffect(() => {
    const s = cart.reduce((acc, i) => acc + i.price * i.quantity, 0);
    setSubtotal(s);
  }, [cart]);

  function changeQty(idx, delta) {
    const c = [...cart];
    c[idx].quantity = Math.max(1, c[idx].quantity + delta);
    setCart(c);
    localStorage.setItem("cart", JSON.stringify(c));
  }

  async function continueToPayment() {
    const tax = Math.round(subtotal * 0.1); // sample 10% tax
    const total = subtotal + tax;
    const res = await fetch("/api/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ items: cart, subtotal, tax, total }),
    });
    const data = await res.json();
    if (data.checkoutId) {
      localStorage.removeItem("cart"); // clear cart after creating checkout
      router.push(`/payment?checkoutId=${data.checkoutId}`);
    } else {
      alert("Error creating checkout");
    }
  }

  return (
    <div style={{ padding: 20 }}>
      <h2>Checkout</h2>
      {cart.map((item, i) => (
        <div key={item.productId} style={{ borderBottom: "1px solid #eee", padding: 10 }}>
          <div>{item.name}</div>
          <div>Rp {item.price} x {item.quantity}</div>
          <button onClick={() => changeQty(i, -1)}>-</button>
          <button onClick={() => changeQty(i, +1)}>+</button>
        </div>
      ))}

      <div style={{ marginTop: 20 }}>
        <div>Subtotal: Rp {subtotal}</div>
        <div>Tax (10%): Rp {Math.round(subtotal * 0.1)}</div>
        <div><strong>Total: Rp {subtotal + Math.round(subtotal * 0.1)}</strong></div>
        <button onClick={continueToPayment} style={{ marginTop: 10 }}>Continue to Payment →</button>
      </div>
    </div>
  );
}
