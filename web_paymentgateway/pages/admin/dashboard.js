import { useState, useEffect } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip } from "recharts";

export default function AdminDashboard() {
  // --- Product state ---
  const [products, setProducts] = useState([]);
  const [form, setForm] = useState({
    name: "",
    description: "",
    price: "",
    category: "",
    image: "",
  });

  // --- Checkout & revenue state ---
  const [checkouts, setCheckouts] = useState([]);
  const [total, setTotal] = useState(0);
  const [dailyData, setDailyData] = useState([]);

  // Fetch product list
  useEffect(() => {
    fetch("/api/products")
      .then((r) => r.json())
      .then((d) => setProducts(d.data || []));
  }, []);

  // Fetch checkout & summary data
  useEffect(() => {
    fetch("/api/admin/summary")
      .then((res) => res.json())
      .then((data) => {
        setCheckouts(data.checkouts || []);
        setTotal(data.total || 0);

        const grouped = (data.checkouts || []).reduce((acc, c) => {
          const date = new Date(c.createdAt).toLocaleDateString();
          const existing = acc.find((d) => d.date === date);
          if (existing) {
            existing.total += c.total;
          } else {
            acc.push({ date, total: c.total });
          }
          return acc;
        }, []);
        setDailyData(grouped);
      });
  }, []);

  // Add new product
  const handleSubmit = async (e) => {
    e.preventDefault();
    const res = await fetch("/api/products", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });

    const data = await res.json();
    alert(data.message);

    if (res.ok) {
      setProducts([...products, data.product]);
      setForm({ name: "", description: "", price: "", category: "", image: "" });
    }
  };

  return (
    <div style={{ padding: 20, fontFamily: "sans-serif" }}>
      <h1>📊 Admin Dashboard</h1>

      {/* --- Revenue Summary --- */}
      <h3>Total Pendapatan: Rp {total.toLocaleString()}</h3>

      <div style={{ marginTop: 40 }}>
        <h2>Grafik Pendapatan Harian</h2>
        <BarChart width={700} height={300} data={dailyData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="date" />
          <YAxis />
          <Tooltip />
          <Bar dataKey="total" fill="#82ca9d" />
        </BarChart>
      </div>

      {/* --- Checkout Table --- */}
      <div style={{ marginTop: 50 }}>
        <h2>Daftar Checkout</h2>
        <table
          border="1"
          cellPadding="8"
          style={{ borderCollapse: "collapse", width: "100%", marginTop: 10, textAlign: "left" }}
        >
          <thead>
            <tr style={{ backgroundColor: "#f4f4f4" }}>
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

      {/* --- Product Management --- */}
      <div style={{ marginTop: 50 }}>
        <h2>Add Product</h2>
        <form onSubmit={handleSubmit} style={{ marginBottom: 30 }}>
          <input
            type="text"
            placeholder="Name"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
          /><br />
          <input
            type="text"
            placeholder="Description"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
          /><br />
          <input
            type="number"
            placeholder="Price"
            value={form.price}
            onChange={(e) => setForm({ ...form, price: e.target.value })}
          /><br />
          <input
            type="text"
            placeholder="Category"
            value={form.category}
            onChange={(e) => setForm({ ...form, category: e.target.value })}
          /><br />
          <input
            type="text"
            placeholder="Image URL"
            value={form.image}
            onChange={(e) => setForm({ ...form, image: e.target.value })}
          /><br />
          <button type="submit">Add Product</button>
        </form>

        <h2>Product List</h2>
        <table border="1" cellPadding="8">
          <thead>
            <tr>
              <th>Name</th>
              <th>Category</th>
              <th>Price</th>
              <th>Image</th>
            </tr>
          </thead>
          <tbody>
            {products.map((p) => (
              <tr key={p._id}>
                <td>{p.name}</td>
                <td>{p.category}</td>
                <td>Rp {p.price}</td>
                <td>
                  <img src={p.image} alt={p.name} width="60" />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
