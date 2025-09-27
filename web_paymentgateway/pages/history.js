import { useEffect, useState } from "react";

export default function HistoryPage() {
  const [payments, setPayments] = useState([]);
  const [activeInvoice, setActiveInvoice] = useState(null);

  useEffect(() => {
    async function fetchHistory() {
      try {
        const res = await fetch("/api/history");
        const data = await res.json();
        setPayments(data.payments || []);
      } catch (err) {
        console.error("Failed to load history:", err);
        setPayments([]);
      }
    }
    fetchHistory();
  }, []);

  function getStatusColor(status) {
    switch (status) {
      case "PAID":
        return "#4caf50"; // green
      case "PENDING":
        return "#ff9800"; // orange
      case "EXPIRED":
        return "#f44336"; // red
      default:
        return "#9e9e9e"; // gray
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
        <h1 style={{ fontSize: 40, color: "#fff", margin: 0 }}>
          🧾 Payment Satus
        </h1>
        <p style={{ marginTop: 8, color: "#fff" }}>
            Check your payment status
        </p>
      </div>

      {/* History list */}
      <div
        style={{
          flexGrow: 1,
          padding: "40px 20px",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        {payments.length === 0 ? (
          <p style={{ textAlign: "center", color: "#6b4f3f" }}>
            No payment history yet 😢
          </p>
        ) : (
          payments.map((p, index) => (
            <div
              key={p._id}
              style={{
                width: "100%",
                maxWidth: 700,
                backgroundColor: "#fff8f2",
                borderRadius: 20,
                boxShadow: "0px 5px 15px rgba(0,0,0,0.1)",
                padding: 25,
                marginBottom: 25,
                animation: `fadeIn 0.6s ease ${index * 0.1}s forwards`,
                opacity: 0,
                transition: "transform 0.3s ease, box-shadow 0.3s ease",
              }}
              className="history-card"
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: 15,
                }}
              >
                <h2 style={{ margin: 0, color: "#6b4f3f", fontSize: 20 }}>
                  Rp {p.amount}
                </h2>
                <span
                  style={{
                    padding: "6px 14px",
                    borderRadius: 20,
                    backgroundColor: getStatusColor(p.status),
                    color: "#fff",
                    fontWeight: "bold",
                    fontSize: 14,
                  }}
                >
                  {p.status}
                </span>
              </div>

              <p style={{ margin: "0 0 10px 0", color: "#9b6b4f" }}>
                Date: {new Date(p.createdAt).toLocaleString()}
              </p>

              {/* Show checkout items */}
              {p.checkout && p.checkout.items && (
                <div style={{ marginBottom: 10 }}>
                  {p.checkout.items.map((item, i) => (
                    <div
                      key={i}
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        marginBottom: 5,
                        fontSize: 14,
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
              )}

              {/* If pending and has invoice */}
              {p.status === "PENDING" && p.invoice_url && (
                <>
                  {activeInvoice === p._id ? (
                    <div
                      style={{
                        marginTop: 15,
                        height: 500,
                        borderRadius: 15,
                        overflow: "hidden",
                        boxShadow: "0px 6px 15px rgba(0,0,0,0.15)",
                        animation: "slideIn 0.5s ease forwards",
                      }}
                    >
                      <iframe
                        src={p.invoice_url}
                        width="100%"
                        height="100%"
                        style={{ border: "none" }}
                        title="Xendit Payment"
                      />
                    </div>
                  ) : (
                    <button
                      onClick={() => setActiveInvoice(p._id)}
                      style={{
                        display: "inline-block",
                        marginTop: 10,
                        padding: "10px 20px",
                        borderRadius: 30,
                        backgroundColor: "#d9b79f",
                        color: "#fff",
                        fontWeight: "bold",
                        border: "none",
                        cursor: "pointer",
                        transition: "transform 0.2s ease, background-color 0.2s ease",
                      }}
                      className="pay-btn"
                    >
                      Pay Now →
                    </button>
                  )}
                </>
              )}
            </div>
          ))
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

        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateY(50px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .history-card:hover {
          transform: scale(1.02);
          box-shadow: 0px 10px 25px rgba(0,0,0,0.2);
        }

        .pay-btn:hover {
          transform: translateY(-3px);
          background-color: #cfa07d;
        }
      `}</style>
    </div>
  );
}
