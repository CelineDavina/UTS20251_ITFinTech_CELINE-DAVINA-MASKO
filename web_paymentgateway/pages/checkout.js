import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import Link from "next/link";

export default function CheckoutPage() {
  const [cart, setCart] = useState([]);
  const [subtotal, setSubtotal] = useState(0);
  const [loading, setLoading] = useState(false);
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
    c[idx].quantity = c[idx].quantity + delta;

    if (c[idx].quantity <= 0) {
      c.splice(idx, 1);
    }

    setCart(c);
    localStorage.setItem("cart", JSON.stringify(c));
  }

async function continueToPayment() {
  setLoading(true);

  // ✅ Check login status first
  const authRes = await fetch("/api/auth/check");
  if (!authRes.ok) {
    alert("Please login before proceeding to payment.");
    setLoading(false);
    return router.push("/login");
  }

  // ✅ Normalize & sanitize cart before sending
  const cleanCart = cart.map((item) => ({
    productId: item.productId || item._id || null,
    name: item.name || "Unknown Product",
    price: Number(item.price) || 0,
    quantity: Number(item.quantity) || 1,
    image: item.image || "",
  }));

  const subtotal = cleanCart.reduce((acc, i) => acc + i.price * i.quantity, 0);
  const tax = Math.round(subtotal * 0.1);
  const total = subtotal + tax;

  try {
    const res = await fetch("/api/checkout", {  
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ items: cleanCart, subtotal, tax, total }),
    });

    const data = await res.json();

    if (res.ok && data.checkoutId) {
      // localStorage.removeItem("cart");
      router.push(`/payment?checkoutId=${data.checkoutId}`);
    } else {
      alert(data.message || "Error creating checkout");
    }
  } catch (err) {
    console.error(err);
    alert("Something went wrong!");
  } finally {
    setLoading(false);
  }
}


  return (
    <div
      style={{
        fontFamily: "'Comic Neue', cursive, Arial, sans-serif",
        backgroundColor: "#fdf6f0",
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        overflowX: "hidden",  

      }}
    >
      {/* Banner */}
      <div
        style={{
          width: "100%",
          backgroundColor: "#d9b79f",
          padding: "30px 0",
          textAlign: "center",
          boxShadow: "0px 5px 15px rgba(0,0,0,0.1)",
          backgroundImage:
            "repeating-linear-gradient(45deg, rgba(255,255,255,0.05) 0, rgba(255,255,255,0.05) 20px, transparent 20px, transparent 40px)",
          backgroundSize: "200% 200%",
          animation: "moveBg 10s linear infinite",
        }}
      >
        <h1
          style={{
            fontSize: 40,
            color: "#fff",
            margin: 0,
            letterSpacing: 1,
          }}
        >
          🛒 Checkout
        </h1>
        <p style={{ marginTop: 8, color: "#fff" }}>
          Review your order before payment
        </p>
      </div>

      {/* Cart items */}
      <div
        style={{
          marginTop: 40,
          marginBottom: 60,
          width: "100%",
          maxWidth: 650,
          backgroundColor: "#fff8f2",
          borderRadius: 20,
          boxShadow: "0px 5px 15px rgba(0,0,0,0.1)",
          padding: 20,
          marginInline: "auto",
          flexGrow: 1,
        }}
      >
        {cart.length === 0 ? (
          <p style={{ textAlign: "center", color: "#6b4f3f" }}>
            Your cart is empty 😢
          </p>
        ) : (
          cart.map((item, i) => (
            <div
              key={item.productId}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "15px 10px",
                borderBottom: "1px solid #eee",
                animation: "fadeIn 0.6s ease",
                transition: "transform 0.3s, box-shadow 0.3s",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "translateY(-3px)";
                e.currentTarget.style.boxShadow =
                  "0px 6px 12px rgba(0,0,0,0.12)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow = "none";
              }}
            >
              {/* Thumbnail */}
              <div
                style={{
                  width: 60,
                  height: 60,
                  borderRadius: 10,
                  overflow: "hidden",
                  marginRight: 15,
                  backgroundColor: "#f0e6de",
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  fontSize: 28,
                  flexShrink: 0,
                }}
              >
                <img
                  src={item.image || "/fallback.png"} // ✅ fallback image
                  alt={item.name}
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                  }}
                />
              </div>

              {/* Info */}
              <div style={{ flexGrow: 1 }}>
                <div style={{ fontWeight: "bold", color: "#6b4f3f" }}>
                  {item.name}
                </div>
                <div style={{ fontSize: 14, color: "#9b6b4f" }}>
                  Rp {item.price} x {item.quantity}
                </div>
              </div>

              {/* Qty buttons */}
              <div>
                <button
                  onClick={() => changeQty(i, -1)}
                  style={{
                    border: "none",
                    backgroundColor: "#f5e4d8",
                    padding: "6px 12px",
                    borderRadius: 20,
                    marginRight: 5,
                    cursor: "pointer",
                  }}
                >
                  -
                </button>
                <button
                  onClick={() => changeQty(i, +1)}
                  style={{
                    border: "none",
                    backgroundColor: "#d9b79f",
                    color: "#fff",
                    padding: "6px 12px",
                    borderRadius: 20,
                    cursor: "pointer",
                  }}
                >
                  +
                </button>
              </div>
            </div>
          ))
        )}

        {/* Totals */}
        {cart.length > 0 && (
          <div style={{ marginTop: 20 }}>
            <div style={{ marginBottom: 5, color: "#6b4f3f" }}>
              Subtotal: Rp {subtotal}
            </div>
            <div style={{ marginBottom: 5, color: "#6b4f3f" }}>
              Tax (10%): Rp {Math.round(subtotal * 0.1)}
            </div>
            <div style={{ fontWeight: "bold", color: "#9b6b4f" }}>
              Total: Rp {subtotal + Math.round(subtotal * 0.1)}
            </div>

            {/* Buttons */}
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                marginTop: 20,
              }}
            >
              <Link href="/" style={{ textDecoration: "none" }}>
                <button
                  style={{
                    padding: "10px 20px",
                    borderRadius: 30,
                    border: "none",
                    backgroundColor: "#f5e4d8",
                    color: "#6b4f3f",
                    fontWeight: "bold",
                    cursor: "pointer",
                  }}
                >
                  ← Back to Shop
                </button>
              </Link>
              <button
                onClick={continueToPayment}
                disabled={loading}
                style={{
                  padding: "12px 28px",
                  borderRadius: 30,
                  border: "none",
                  backgroundColor: loading ? "#bfa89a" : "#d9b79f",
                  color: "#fff",
                  fontWeight: "bold",
                  cursor: loading ? "not-allowed" : "pointer",
                  transition: "all 0.3s ease",
                  boxShadow: "0px 4px 8px rgba(0,0,0,0.15)",
                }}
                onMouseEnter={(e) => {
                  if (!loading) {
                    e.currentTarget.style.backgroundColor = "#c49c81";
                    e.currentTarget.style.transform = "scale(1.05)";
                    e.currentTarget.style.boxShadow =
                      "0px 6px 14px rgba(0,0,0,0.2)";
                  }
                }}
                onMouseLeave={(e) => {
                  if (!loading) {
                    e.currentTarget.style.backgroundColor = "#d9b79f";
                    e.currentTarget.style.transform = "scale(1)";
                    e.currentTarget.style.boxShadow =
                      "0px 4px 8px rgba(0,0,0,0.15)";
                  }
                }}
              >
                {loading ? "Processing..." : "Continue to Payment →"}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <footer
        style={{
          marginTop: "auto",
          width: "100%",
          backgroundColor: "#d9b79f",
          padding: 20,
          textAlign: "center",
          color: "#fff",
        }}
      >
        <p style={{ margin: 0 }}>
          © 2025 Stem's Coffee Shop. Made with ❤️ for coffee lovers.
        </p>
      </footer>

      {/* Animations */}
      <style jsx>{`
        @keyframes moveBg {
          from {
            background-position: 0 0;
          }
          to {
            background-position: 100% 100%;
          }
        }
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(15px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
}
