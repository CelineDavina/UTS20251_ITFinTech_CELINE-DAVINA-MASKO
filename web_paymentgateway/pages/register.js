import { useState } from "react";

export default function RegisterPage() {
  const [form, setForm] = useState({
    username: "",
    password: "",
    phone: "",
    role: "user",
  });
  const [message, setMessage] = useState("");

  // Handle input perubahan
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // Handle submit
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
        setMessage("✅ User registered successfully!");
        setForm({ username: "", password: "", phone: "", role: "user" });
      } else {
        setMessage(`❌ ${data.message}`);
      }
    } catch (err) {
      setMessage("❌ Error connecting to server");
    }
  };

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>User Registration</h1>
      <form onSubmit={handleSubmit} style={styles.form}>
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
        <select name="role" value={form.role} onChange={handleChange} style={styles.select}>
          <option value="user">User</option>
          <option value="admin">Admin</option>
        </select>

        <button type="submit" style={styles.button}>Register</button>
      </form>
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
  select: {
    padding: "8px",
    borderRadius: "5px",
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
