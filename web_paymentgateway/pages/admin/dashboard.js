import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip } from "recharts";

export default function AdminDashboard() {
  const router = useRouter();
  const [products, setProducts] = useState([]);
  const [form, setForm] = useState({
    name: "",
    description: "",
    price: "",
    category: "Coffee",
    image: "",
  });
  const [editingProduct, setEditingProduct] = useState(null);
  const [checkouts, setCheckouts] = useState([]);
  const [total, setTotal] = useState(0);
  const [dailyData, setDailyData] = useState([]);

  const categories = ["All", "Coffee", "Tea", "Milk", "Smoothies", "Dessert"];

  useEffect(() => {
    fetch("/api/products")
      .then((r) => r.json())
      .then((d) => setProducts(d.data || []));
    fetch("/api/admin/summary")
      .then((r) => r.json())
      .then((data) => {
        setCheckouts(data.checkouts || []);
        setTotal(data.total || 0);

        const grouped = (data.checkouts || []).reduce((acc, c) => {
          const date = new Date(c.createdAt).toLocaleDateString();
          const existing = acc.find((d) => d.date === date);
          if (existing) existing.total += c.total;
          else acc.push({ date, total: c.total });
          return acc;
        }, []);
        setDailyData(grouped);
      });
  }, []);

  // --- Submit new or edit ---
  const handleSubmit = async (e) => {
    e.preventDefault();
    const method = editingProduct ? "PUT" : "POST";
    const url = editingProduct ? `/api/products/${editingProduct._id}` : "/api/products";

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });

    if (!res.ok) return alert("Error saving product");
    alert(editingProduct ? "Product updated!" : "Product added!");

    // Refresh product list
    const updated = await fetch("/api/products").then((r) => r.json());
    setProducts(updated.data || []);

    // Reset
    setForm({ name: "", description: "", price: "", category: "Coffee", image: "" });
    setEditingProduct(null);
  };

  const handleDelete = async (id) => {
    if (!confirm("Delete this product?")) return;
    const res = await fetch(`/api/products/${id}`, { method: "DELETE" });
    if (res.ok) {
      alert("Deleted!");
      setProducts(products.filter((p) => p._id !== id));
    }
  };

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
  };

  return (
    <div
      style={{
        backgroundColor: "#fdf6f0",
        minHeight: "100vh",
        fontFamily: "'Comic Neue', cursive, Arial, sans-serif",
        padding: 0,
      }}
    >
      {/* Banner */}
      <div
        style={{
          width: "100%",
          backgroundColor: "#d9b79f",
          padding: "40px 0",
          textAlign: "center",
          boxShadow: "0px 5px 15px rgba(0,0,0,0.1)",
          backgroundImage:
            "repeating-linear-gradient(45deg, rgba(255,255,255,0.05) 0, rgba(255,255,255,0.05) 20px, transparent 20px, transparent 40px)",
          backgroundSize: "200% 200%",
          animation: "moveBg 10s linear infinite",
          position: "relative",
        }}
      >
        <button
          onClick={handleLogout}
          style={{
            position: "absolute",
            top: 20,
            left: 20,
            backgroundColor: "#fff",
            borderRadius: 50,
            border: "none",

            padding: "10px 20px",
            fontWeight: "bold",
            cursor: "pointer",
            color: "#6b4f3f",
                          transition: "transform 0.3s",

          }}
           onMouseEnter={(e) => (e.currentTarget.style.transform = "scale(1.1)")}
            onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
        >
          🚪 Logout
        </button>
        <h1 style={{ fontSize: 42, color: "#fff", margin: 0 }}>☕ Admin Dashboard</h1>
        <p style={{ color: "#fff", fontSize: 18, marginTop: 10 }}>
          Manage your products, view checkouts, and monitor daily revenue.
        </p>
      </div>

      <div style={{ padding: "40px 60px" }}>
        {/* First row: Graph + Add product */}
        <div style={{ display: "flex", gap: 30, marginBottom: 40 }}>
          {/* Graph */}
          <div
            style={{
              flex: 1,
              background: "#fff8f2",
              borderRadius: 20,
              padding: 20,
              boxShadow: "0 4px 10px rgba(0,0,0,0.1)",
              height: 400,
            }}
          >
            <h2 style={{ color: "#6b4f3f" }}>📊 Total Pendapatan</h2>
            <h3 style={{ color: "#9b6b4f" }}>Rp {total.toLocaleString()}</h3>
            <div style={{ marginTop: 20 }}>
              <BarChart width={500} height={250} data={dailyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="total" fill="#d9b79f" />
              </BarChart>
            </div>
          </div>

          {/* Add Product */}
          <div
            style={{
              flex: 1,
              background: "#fff8f2",
              borderRadius: 20,
              padding: 20,
              boxShadow: "0 4px 10px rgba(0,0,0,0.1)",
              height: 400,
            }}
          >
            <h2 style={{ color: "#6b4f3f" }}>➕ Add Product</h2>
            <form
              onSubmit={handleSubmit}
              style={{ display: "flex", flexDirection: "column", gap: 10, marginTop: 15 }}
            >
              <input
                type="text"
                placeholder="Name"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                style={inputStyle}
              />
              <textarea
                placeholder="Description"
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                style={inputStyle}
              />
              <input
                type="number"
                placeholder="Price"
                value={form.price}
                onChange={(e) => setForm({ ...form, price: e.target.value })}
                style={inputStyle}
              />
              <select
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
                style={inputStyle}
              >
                {categories.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
              <input
                type="text"
                placeholder="Image URL"
                value={form.image}
                onChange={(e) => setForm({ ...form, image: e.target.value })}
                style={inputStyle}
              />
              <button type="submit" style={btnPrimary}>
                {editingProduct ? "Update" : "Add Product"}
              </button>
            </form>
          </div>
        </div>

        {/* Checkout list */}
        <div
          style={{
            background: "#fff8f2",
            borderRadius: 20,
            padding: 20,
            marginBottom: 40,
            boxShadow: "0 4px 10px rgba(0,0,0,0.1)",
          }}
        >
          <h2 style={{ color: "#6b4f3f" }}>🧾 Daftar Checkout</h2>
          <table style={tableStyle}>
            <thead>
              <tr style={{ backgroundColor: "#d9b79f", color: "white" }}>
                <th>Produk</th>
                <th>Status</th>
                <th>Total</th>
                <th>Tanggal</th>
              </tr>
            </thead>
            <tbody>
              {checkouts.map((c) => (
                <tr key={c._id}>
                  <td>{c.items?.map((i) => i.name).join(", ")}</td>
                  <td>{c.status}</td>
                  <td>Rp {c.total.toLocaleString()}</td>
                  <td>{new Date(c.createdAt).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Product list */}
        <div
          style={{
            background: "#fff8f2",
            borderRadius: 20,
            padding: 20,
            boxShadow: "0 4px 10px rgba(0,0,0,0.1)",
          }}
        >
          <h2 style={{ color: "#6b4f3f" }}>📦 Product List</h2>
          <table style={tableStyle}>
            <thead>
              <tr style={{ backgroundColor: "#d9b79f", color: "white" }}>
                <th>Name</th>
                <th>Description</th>
                <th>Category</th>
                <th>Price</th>
                <th>Image</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.map((p) => (
                <tr key={p._id}>
                  <td>{p.name}</td>
                  <td>{p.description}</td>
                  <td>{p.category}</td>
                  <td>Rp {p.price}</td>
                  <td>
                    {p.image ? (
                      <img src={p.image} alt={p.name} width="60" style={{ borderRadius: 8 }} />
                    ) : (
                      "-"
                    )}
                  </td>
                  <td>
                    <button
                      onClick={() => setEditingProduct(p)}
                      style={btnSmallPrimary}
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(p._id)}
                      style={btnSmallDelete}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Popup edit modal */}
      {editingProduct && (
        <div style={modalOverlay}>
          <div style={modalBox}>
            <h2>✏️ Edit Product</h2>
            <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              <input
                type="text"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                style={inputStyle}
              />
              <textarea
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                style={inputStyle}
              />
              <input
                type="number"
                value={form.price}
                onChange={(e) => setForm({ ...form, price: e.target.value })}
                style={inputStyle}
              />
              <select
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
                style={inputStyle}
              >
                {categories.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
              <input
                type="text"
                value={form.image}
                onChange={(e) => setForm({ ...form, image: e.target.value })}
                style={inputStyle}
              />
              <div style={{ display: "flex", gap: 10 }}>
                <button type="submit" style={btnPrimary}>
                  Update
                </button>
                <button
                  type="button"
                  onClick={() => setEditingProduct(null)}
                  style={btnCancel}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes moveBg {
          from { background-position: 0 0; }
          to { background-position: 100% 100%; }
        }
      `}</style>
    </div>
  );
}

// --- Styles ---
const inputStyle = {
  padding: "10px 15px",
  borderRadius: 10,
  border: "1px solid #d9b79f",
  outline: "none",
  fontSize: 15,
};
const btnPrimary = {
  backgroundColor: "#d9b79f",
  color: "white",
  border: "none",
  borderRadius: 10,
  padding: "10px 20px",
  cursor: "pointer",
  fontWeight: "bold",
};
const btnSmallPrimary = { ...btnPrimary, borderRadius: 8, padding: "6px 12px", marginRight: 5 };
const btnSmallDelete = { ...btnSmallPrimary, backgroundColor: "#b85c5c" };
const btnCancel = { backgroundColor: "#f5e4d8", color: "#6b4f3f", borderRadius: 10, padding: "10px 20px", cursor: "pointer" };
const tableStyle = { borderCollapse: "collapse", width: "100%", marginTop: 10, fontSize: 15 };
const modalOverlay = {
  position: "fixed",
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  background: "rgba(0,0,0,0.4)",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
};
const modalBox = {
  background: "#fff8f2",
  borderRadius: 20,
  padding: 30,
  width: 400,
  boxShadow: "0 4px 20px rgba(0,0,0,0.2)",
};
