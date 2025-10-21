import { useState } from "react";

export default function LoginPage() {
  const [step, setStep] = useState(1); // 1 = login, 2 = OTP verification
  const [form, setForm] = useState({ username: "", password: "", otp: "" });
  const [message, setMessage] = useState("");
  const [username, setUsername] = useState("");

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // Step 1 — kirim username & password
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
        setStep(2); // lanjut ke OTP verification
      } else {
        setMessage(`❌ ${data.message}`);
      }
    } catch (err) {
      setMessage("❌ Server error");
    }
  };

  // Step 2 — verifikasi OTP
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
        // bisa redirect ke dashboard
        window.location.href = "/admin/dashboard";
      } else {
        setMessage(`❌ ${data.message}`);
      }
    } catch (err) {
      setMessage("❌ Server error");
    }
  };

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>Login</h1>

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
  );
}

const styles = {
  container: {
    maxWidth: "400px",
    margin: "50px auto",
    padding: "20px",
    border: "1px solid #ccc",
    borderRadius: "10px",
    textAlign: "center",
    fontFamily: "sans-serif",
  },
  title: {
    marginBottom: "20px",
  },
  form: {
    display: "flex",
    flexDirection: "column",
    gap: "10px",
  },
  input: {
    padding: "8px",
    borderRadius: "5px",
    border: "1px solid #aaa",
  },
  button: {
    marginTop: "15px",
    padding: "10px",
    border: "none",
    backgroundColor: "#0070f3",
    color: "white",
    borderRadius: "5px",
    cursor: "pointer",
  },
  message: {
    marginTop: "15px",
    color: "#333",
  },
};
