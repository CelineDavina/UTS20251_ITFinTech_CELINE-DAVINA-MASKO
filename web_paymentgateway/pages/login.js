import { useState } from "react";

export default function LoginPage() {
  const [step, setStep] = useState(1); // 1 = login, 2 = OTP verification
  const [form, setForm] = useState({ username: "", password: "", otp: "" });
  const [message, setMessage] = useState("");
  const [username, setUsername] = useState("");

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // Step 1 — login
  const handleLogin = async (e) => {
    e.preventDefault();
    setMessage("Logging in...");

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: form.username,
          password: form.password,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        setMessage("✅ OTP sent to your WhatsApp!");
        setUsername(form.username);
        setStep(2);
      } else {
        setMessage(`❌ ${data.message}`);
      }
    } catch (err) {
      setMessage("❌ Server error");
    }
  };

  // Step 2 — verify OTP
  const handleVerify = async (e) => {
    e.preventDefault();
    setMessage("Verifying OTP...");

    try {
      const res = await fetch("/api/auth/verify-mfa", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: username,
          code: form.otp,
        }),
      });

const data = await res.json();
if (res.ok) {
  setMessage("✅ Login successful!");

  const redirect = new URLSearchParams(window.location.search).get("redirect");

  // ✅ If user is admin, always send to dashboard
  if (data.user?.role === "admin") {
    window.location.href = "/admin/dashboard";
  } 
  // ✅ If normal user and there is a redirect, send them back
  else if (redirect) {
    window.location.href = redirect;
  } 
  // ✅ Otherwise, send to home
  else {
    window.location.href = "/";
  }
} else {
  setMessage(`❌ ${data.message}`);
}

  } catch (err) {
    setMessage("❌ Server error");
  }
};


  return (
    <div style={styles.wrapper}>
      <div style={{ ...styles.container, animation: "fadeInUp 0.8s ease" }}>
        <h1 style={styles.title}>☕ Stem's Coffee Shop</h1>

        {step === 1 && (
          <form onSubmit={handleLogin} style={styles.form}>
            <label>Username:</label>
            <input
              type="text"
              name="username"
              value={form.username}
              onChange={handleChange}
              required
              style={styles.input}
            />

            <label>Password:</label>
            <input
              type="password"
              name="password"
              value={form.password}
              onChange={handleChange}
              required
              style={styles.input}
            />

            <button type="submit" style={styles.button}>Login</button>

            <p style={styles.registerText}>
              Don’t have an account?{" "}
              <span
                style={styles.registerLink}
                onClick={() => window.location.href = "/register"}
              >
                Register
              </span>
            </p>
          </form>
        )}

        {step === 2 && (
          <form onSubmit={handleVerify} style={styles.form}>
            <label>Enter OTP (sent via WhatsApp):</label>
            <input
              type="text"
              name="otp"
              value={form.otp}
              onChange={handleChange}
              required
              style={styles.input}
            />
            <button type="submit" style={styles.button}>Verify OTP</button>
          </form>
        )}

        <p style={styles.message}>{message}</p>
      </div>

      <style jsx>{`
        @keyframes fadeInUp {
          0% {
            opacity: 0;
            transform: translateY(20px);
          }
          100% {
            opacity: 1;
            transform: translateY(0);
          }
        }

        input:focus {
          border-color: #c49c81;
          box-shadow: 0 0 8px rgba(196, 156, 129, 0.5);
        }

        button:hover {
          transform: scale(1.05);
        }

        span:hover {
          color: #c49c81;
          text-decoration: underline;
          transform: translateY(-2px);
          transition: all 0.3s;
        }
      `}</style>
    </div>
  );
}

const styles = {
  wrapper: {
    minHeight: "100vh",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    fontFamily: "'Comic Neue', cursive, Arial, sans-serif",
    background: "linear-gradient(135deg, #fdf6f0 0%, #f4e4d8 100%)",
    padding: "20px",
  },
  container: {
    width: "100%",
    maxWidth: "400px",
    padding: "30px",
    borderRadius: "20px",
    textAlign: "center",
    backgroundColor: "#fff3e6",
    boxShadow: "0px 8px 20px rgba(0,0,0,0.15)",
  },
  title: {
    marginBottom: "25px",
    fontSize: "28px",
    color: "#6b4f3f",
    animation: "fadeInUp 1s ease",
  },
  form: {
    display: "flex",
    flexDirection: "column",
    gap: "12px",
  },
  input: {
    padding: "10px 15px",
    borderRadius: "25px",
    border: "2px solid #d9b79f",
    outline: "none",
    fontSize: "16px",
    boxShadow: "2px 2px 5px rgba(0,0,0,0.05)",
    transition: "0.3s",
  },
  button: {
    marginTop: "15px",
    padding: "12px",
    border: "none",
    borderRadius: "25px",
    backgroundColor: "#d9b79f",
    color: "#fff",
    fontWeight: "bold",
    cursor: "pointer",
    boxShadow: "0px 4px 12px rgba(0,0,0,0.1)",
    transition: "0.3s",
  },
  registerText: {
    marginTop: "10px",
    fontSize: "14px",
    color: "#6b4f3f",
  },
  registerLink: {
    color: "#d9b79f",
    fontWeight: "bold",
    cursor: "pointer",
    transition: "all 0.3s",
  },
  message: {
    marginTop: "15px",
    color: "#7a5c49",
    fontWeight: "bold",
  },
};
