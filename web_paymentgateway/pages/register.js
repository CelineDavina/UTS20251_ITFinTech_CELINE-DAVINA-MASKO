import { useState } from "react";

export default function RegisterPage() {
  const [form, setForm] = useState({
    username: "",
    password: "",
    phone: "",
    role: "user",
  });
  const [message, setMessage] = useState("");

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
  e.preventDefault();
  setMessage("Registering...");

  try {
    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });

    const data = await res.json();
    if (res.ok) {
      setMessage("✅ User registered successfully! Redirecting to login...");

      // Wait a short moment before redirect
      setTimeout(() => {
        window.location.href = "/login";
      }, 1500);

      setForm({ username: "", password: "", phone: "", role: "user" });
    } else {
      setMessage(`❌ ${data.message}`);
    }
  } catch (err) {
    setMessage("❌ Error connecting to server");
  }
};


  return (
    <div style={styles.wrapper}>
      <div style={{ ...styles.container, animation: "fadeInUp 0.8s ease" }}>
        <h1 style={styles.title}>☕ Register at Stem's Coffee Shop</h1>

        <form onSubmit={handleSubmit} style={styles.form}>

        <label>Email:</label>
        <input
          type="email"
          name="email"
          value={form.email} 
          onChange={handleChange}
          required
          style={styles.input}
        />

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

          <label>Phone (for WhatsApp MFA):</label>
          <input
            type="text"
            name="phone"
            value={form.phone}
            onChange={handleChange}
            placeholder="+6281234567890"
            style={styles.input}
          />

          <label>Role:</label>
          <select
            name="role"
            value={form.role}
            onChange={handleChange}
            style={styles.select}
          >
            <option value="user">User</option>
            <option value="admin">Admin</option>
          </select>

          <button type="submit" style={styles.button}>Register</button>

          <p style={styles.loginText}>
            Already have an account?{" "}
            <span
              style={styles.loginLink}
              onClick={() => window.location.href = "/login"}
            >
              Login
            </span>
          </p>
        </form>

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

        input:focus, select:focus {
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
    maxWidth: "500px",
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
  select: {
    padding: "10px 15px",
    borderRadius: "25px",
    border: "2px solid #d9b79f",
    outline: "none",
    fontSize: "16px",
    boxShadow: "2px 2px 5px rgba(0,0,0,0.05)",
    transition: "0.3s",
    backgroundColor: "#fff3e6",
    cursor: "pointer",
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
  loginText: {
    marginTop: "12px",
    fontSize: "14px",
    color: "#6b4f3f",
  },
  loginLink: {
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
