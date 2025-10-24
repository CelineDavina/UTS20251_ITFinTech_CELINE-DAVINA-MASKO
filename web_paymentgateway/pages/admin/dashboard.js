import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

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
  const [monthlyData, setMonthlyData] = useState([]);
  const [chartMode, setChartMode] = useState("daily");
  const [chartPage, setChartPage] = useState(0);

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

        const checkoutsData = data.checkouts || [];

        // --- Group per hari ---
        const daily = checkoutsData.reduce((acc, c) => {
          const date = new Date(c.createdAt).toLocaleDateString();
          const existing = acc.find((d) => d.date === date);
          if (existing) existing.total += c.total;
          else acc.push({ date, total: c.total });
          return acc;
        }, []);
        setDailyData(daily);

        // --- Group per bulan ---
        const monthly = checkoutsData.reduce((acc, c) => {
          const date = new Date(c.createdAt);
          const month = date.toLocaleString("default", { month: "short" });
          const year = date.getFullYear();
          const key = `${month} ${year}`;
          const existing = acc.find((d) => d.month === key);
          if (existing) existing.total += c.total;
          else acc.push({ month: key, total: c.total });
          return acc;
        }, []);
        setMonthlyData(monthly);
      });
  }, []);

  const getVisibleData = (data) => {
    const start = chartPage * 5;
    return data.slice(start, start + 5);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const method = editingProduct ? "PUT" : "POST";
    const url = editingProduct
      ? `/api/products/${editingProduct._id}`
      : "/api/products";

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });

    if (!res.ok) return alert("Error saving product");
    alert(editingProduct ? "Product updated!" : "Product added!");

    const updated = await fetch("/api/products").then((r) => r.json());
    setProducts(updated.data || []);
    setForm({
      name: "",
      description: "",
      price: "",
      category: "Coffee",
      image: "",
    });
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
    router.push("/");
  };

  return (
    <div
      style={{
        backgroundColor: "#fdf6f0",
        minHeight: "100vh",
        fontFamily: "'Comic Neue', cursive, Arial, sans-serif",
      }}
    >
      {/* Banner */}
      <div className="banner">
        <button onClick={handleLogout} className="logout-btn">
          🚪 Logout
        </button>
        <h1>☕ Admin Dashboard</h1>
        <p>Manage your products, view checkouts, and monitor revenue.</p>
      </div>

      <div className="content">
        {/* First Row */}
        <div className="row">
          <div className="card chart">
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <h2>📊 Total Pendapatan</h2>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <select
                  value={chartMode}
                  onChange={(e) => {
                    setChartMode(e.target.value);
                    setChartPage(0);
                  }}
                  style={{
                    padding: "6px 10px",
                    borderRadius: "8px",
                    border: "1px solid #d9b79f",
                    fontWeight: "bold",
                    backgroundColor: "#fffaf5",
                    cursor: "pointer",
                  }}
                >
                  <option value="daily">Per Hari</option>
                  <option value="monthly">Per Bulan</option>
                </select>

                <div style={{ display: "flex", gap: "5px" }}>
                  <button
                    onClick={() => setChartPage((p) => Math.max(0, p - 1))}
                    disabled={chartPage === 0}
                    style={{
                      backgroundColor: "#f5e4d8",
                      border: "none",
                      borderRadius: "8px",
                      padding: "5px 10px",
                      cursor: chartPage === 0 ? "not-allowed" : "pointer",
                    }}
                  >
                    ⬅️
                  </button>
                  <button
                    onClick={() => {
                      const dataLength =
                        chartMode === "daily"
                          ? dailyData.length
                          : monthlyData.length;
                      if ((chartPage + 1) * 5 < dataLength)
                        setChartPage((p) => p + 1);
                    }}
                    style={{
                      backgroundColor: "#f5e4d8",
                      border: "none",
                      borderRadius: "8px",
                      padding: "5px 10px",
                      cursor: "pointer",
                    }}
                  >
                    ➡️
                  </button>
                </div>
              </div>
            </div>
            <h3>Rp {total.toLocaleString()}</h3>
            <div style={{ marginTop: 10, width: "100%", height: 250 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={getVisibleData(
                    chartMode === "daily" ? dailyData : monthlyData
                  )}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    dataKey={chartMode === "daily" ? "date" : "month"}
                  />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="total" fill="#d9b79f" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="card form">
            <h2>➕ Add Product</h2>
            <form onSubmit={handleSubmit}>
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
                onChange={(e) =>
                  setForm({ ...form, description: e.target.value })
                }
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
              <button type="submit" className="animated-btn">
                {editingProduct ? "Update" : "Add Product"}
              </button>
            </form>
          </div>
        </div>

        {/* Checkout Table */}
        <div className="card table">
          <h2>🧾 Daftar Checkout</h2>
          <div className="table-container">
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
        </div>

        {/* Product Table */}
        <div className="card table">
          <h2>📦 Product List</h2>
          <div className="table-container">
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
                        <img
                          src={p.image}
                          alt={p.name}
                          width="60"
                          style={{ borderRadius: 8 }}
                        />
                      ) : (
                        "-"
                      )}
                    </td>
                    <td>
                      <button
                        onClick={() => {
                          setEditingProduct(p);
                          setForm({
                            name: p.name,
                            description: p.description,
                            price: p.price,
                            category: p.category,
                            image: p.image,
                          });
                        }}
                        className="btn-small primary"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(p._id)}
                        className="btn-small delete"
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
      </div>

      {/* Modal */}
      {editingProduct && (
        <div style={modalOverlay}>
          <div style={modalBox}>
            <h2>✏️ Edit Product</h2>
            <form
              onSubmit={handleSubmit}
              style={{ display: "flex", flexDirection: "column", gap: 10 }}
            >
              <input
                type="text"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                style={inputStyle}
              />
              <textarea
                value={form.description}
                onChange={(e) =>
                  setForm({ ...form, description: e.target.value })
                }
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
                onChange={(e) =>
                  setForm({ ...form, category: e.target.value })
                }
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
                <button type="submit" className="animated-btn">
                  Update
                </button>
                <button
                  type="button"
                  onClick={() => setEditingProduct(null)}
                  className="btn-cancel"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Styles */}
      <style jsx>{`
        .banner {
          background-color: #d9b79f;
          padding: 40px 0;
          text-align: center;
          color: white;
          position: relative;
          box-shadow: 0px 5px 15px rgba(0, 0, 0, 0.1);
          background-image: repeating-linear-gradient(
            45deg,
            rgba(255, 255, 255, 0.05) 0,
            rgba(255, 255, 255, 0.05) 20px,
            transparent 20px,
            transparent 40px
          );
          background-size: 200% 200%;
          animation: moveBg 10s linear infinite;
        }

        .logout-btn {
          position: absolute;
          top: 20px;
          left: 20px;
          background: #fff;
          border: none;
          border-radius: 50px;
          padding: 10px 20px;
          color: #6b4f3f;
          font-weight: bold;
          cursor: pointer;
          transition: all 0.3s ease;
        }
        .logout-btn:hover {
          transform: scale(1.1);
          box-shadow: 0 0 10px rgba(107, 79, 63, 0.3);
        }

        .content {
          padding: 40px 20px;
        }

        .row {
          display: flex;
          flex-wrap: wrap;
          gap: 20px;
          margin-bottom: 40px;
        }

        .card {
          flex: 1 1 350px;
          background: #fff8f2;
          border-radius: 20px;
          padding: 20px;
          box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
        }

        form {
          display: flex;
          flex-direction: column;
          gap: 10px;
          margin-top: 15px;
        }

        .animated-btn {
          background-color: #d9b79f;
          color: white;
          border: none;
          border-radius: 10px;
          padding: 10px 20px;
          font-weight: bold;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .animated-btn:hover {
          transform: scale(1.05);
          box-shadow: 0 4px 10px rgba(217, 183, 159, 0.4);
        }

        .btn-small {
          border: none;
          border-radius: 8px;
          padding: 6px 12px;
          margin-right: 5px;
          color: white;
          cursor: pointer;
          font-weight: bold;
          transition: all 0.3s ease;
        }

        .btn-small.primary {
          background-color: #d9b79f;
        }
        .btn-small.delete {
          background-color: #b85c5c;
        }
        .btn-small:hover {
          transform: scale(1.1);
          box-shadow: 0 3px 8px rgba(0, 0, 0, 0.2);
        }

        .btn-cancel {
          background-color: #f5e4d8;
          color: #6b4f3f;
          border-radius: 10px;
          padding: 10px 20px;
          cursor: pointer;
          transition: all 0.3s ease;
        }
        .btn-cancel:hover {
          transform: scale(1.05);
          box-shadow: 0 4px 10px rgba(245, 228, 216, 0.5);
        }

        .table-container {
          overflow-x: auto;
        }

        @keyframes moveBg {
          from {
            background-position: 0 0;
          }
          to {
            background-position: 100% 100%;
          }
        }

        @media (max-width: 768px) {
          .row {
            flex-direction: column;
          }
          .card {
            width: 100%;
          }
          .banner h1 {
            font-size: 28px;
          }
          .banner p {
            font-size: 16px;
          }
          .logout-btn {
            top: 10px;
            left: 10px;
            padding: 8px 15px;
          }
        }
      `}</style>
    </div>
  );
}

const inputStyle = {
  padding: "10px 15px",
  borderRadius: 10,
  border: "1px solid #d9b79f",
  outline: "none",
  fontSize: 15,
};
const tableStyle = {
  borderCollapse: "collapse",
  width: "100%",
  marginTop: 10,
  fontSize: 15,
};
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
  zIndex: 999,
};
const modalBox = {
  background: "#fff8f2",
  borderRadius: 20,
  padding: 30,
  width: "90%",
  maxWidth: 400,
  boxShadow: "0 4px 20px rgba(0,0,0,0.2)",
};
