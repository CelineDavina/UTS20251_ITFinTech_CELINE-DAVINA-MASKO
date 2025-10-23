import { useEffect, useState } from "react";
import { useRouter } from "next/router";

export default function Payment() {
  const router = useRouter();
  const { checkoutId } = router.query;
  const [checkout, setCheckout] = useState(null);
  const [invoiceUrl, setInvoiceUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [paidClicked, setPaidClicked] = useState(false);


  useEffect(() => {
    if (!checkoutId) return;
    fetch(`/api/checkout/${checkoutId}`)
      .then((r) => r.json())
      .then((d) => setCheckout(d.checkout));
  }, [checkoutId]);

  async function payNow() {
    setLoading(true);
    const res = await fetch("/api/create-invoice", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ checkoutId }),
    });
    const data = await res.json();
    setLoading(false);

    if (data.invoice_url) {
      setInvoiceUrl(data.invoice_url);
      localStorage.removeItem("cart");
      setPaidClicked(true); // Hide back button


    } else {
      alert("Failed to create invoice: " + JSON.stringify(data));
    }
  }

  if (!checkout) return <div style={{ padding: 20 }}>Loading...</div>;
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
        <h1 style={{ fontSize: 40, color: "#fff", margin: 0 }}>
          💳 Secure Payment
        </h1>
        <p style={{ marginTop: 8, color: "#fff" }}>
          Review your order & pay securely
        </p>
      </div>

      {/* Flex container */}
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          justifyContent: "center",
          gap: "30px",
          padding: "40px 20px",
        }}
      >
        {/* Order Summary */}
        <div
          style={{
            flex: "1 1 300px",
            maxWidth: 400,
            backgroundColor: "#fff8f2",
            borderRadius: 20,
            boxShadow: "0px 5px 15px rgba(0,0,0,0.1)",
            padding: 25,
            alignSelf: "flex-start",
          }}
        >
          {/* Back button */}
          {!paidClicked && (
          <button
            onClick={() => router.push("/checkout")}
            style={{
              marginBottom: 20,
              // padding: "8px 16px",
              // borderRadius: 20,
              border: "none",
              color: "#6b4f3f",
              fontWeight: "bold",
              cursor: "pointer",
              transition: "all 0.2s ease", // smooth transition

            }}
                className="back-btn"

          >
            ← Back
          </button>
          )}

          <h2 style={{ margin: "0 0 20px 0", color: "#6b4f3f" }}>
            Order Summary
          </h2>

          {/* Bill-style item list */}
          <div style={{ marginBottom: 15 }}>
            {checkout.items.map((item, i) => (
              <div
                key={i}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  marginBottom: 6,
                  fontSize: 15,
                  color: "#6b4f3f",
                }}
              >
                <span>
                  {item.name} × {item.quantity}
                </span>
                <span>Rp {item.price * item.quantity}</span>
              </div>
            ))}
          </div>

          <hr
            style={{
              border: "none",
              borderTop: "1px dashed #c4a892",
              margin: "15px 0",
            }}
          />

          <div style={{ marginBottom: 8, color: "#6b4f3f" }}>
            Subtotal: Rp {checkout.subtotal}
          </div>
          <div style={{ marginBottom: 8, color: "#6b4f3f" }}>
            Tax (10%): Rp {checkout.tax}
          </div>
          <div
            style={{
              fontWeight: "bold",
              fontSize: 18,
              color: "#9b6b4f",
              marginBottom: 20,
            }}
          >
            Total: Rp {checkout.total}
          </div>

          <button
            onClick={payNow}
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
              width: "100%",
            }}
            onMouseEnter={(e) => {
              if (!loading) {
                e.currentTarget.style.backgroundColor = "#c49c81";
                e.currentTarget.style.transform = "scale(1.05)";
              }
            }}
            onMouseLeave={(e) => {
              if (!loading) {
                e.currentTarget.style.backgroundColor = "#d9b79f";
                e.currentTarget.style.transform = "scale(1)";
              }
            }}
          >
            {loading ? "Processing..." : "Pay Now →"}
          </button>
        </div>

        {/* Payment Iframe */}
        {invoiceUrl && (
          <div
            style={{
              flex: "1 1 500px",
              maxWidth: 700,
              height: 600,
              borderRadius: 15,
              overflow: "hidden",
              boxShadow: "0px 6px 15px rgba(0,0,0,0.15)",
              animation: "fadeIn 0.6s ease",
            }}
          >
            <iframe
              src={invoiceUrl}
              width="100%"
              height="100%"
              style={{ border: "none" }}
              title="Xendit Payment"
            />
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
            .back-btn:hover {
    transform: scale(1.05); /* slightly enlarge */
    color: #d9b79f; /* change text color */
  }
      `}</style>
    </div>
  );
}
