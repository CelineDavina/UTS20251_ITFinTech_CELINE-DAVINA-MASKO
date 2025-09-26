import { useEffect, useState } from "react";
import Link from "next/link";

export default function Home() {
  const [products, setProducts] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [category, setCategory] = useState("All");

  useEffect(() => {
    fetch("/api/products")
      .then((r) => r.json())
      .then((d) => {
        setProducts(d.data || []);
        setFiltered(d.data || []);
      });
  }, []);

  function addToCart(product) {
    const cart = JSON.parse(localStorage.getItem("cart") || "[]");
    const found = cart.find((c) => c.productId === product._id);
    if (found) found.quantity++;
    else
      cart.push({
        productId: product._id,
        name: product.name,
        price: product.price,
        quantity: 1,
      });
    localStorage.setItem("cart", JSON.stringify(cart));
    alert("Added to cart");
  }

  function filterCategory(cat) {
    setCategory(cat);
    if (cat === "All") setFiltered(products);
    else setFiltered(products.filter((p) => p.category === cat));
  }

  const categories = ["All", "Coffee", "Tea", "Milk", "Smoothies", "Dessert"];

  return (
    <div style={{ padding: 20 }}>
      <header
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <h1>Cafe Menu</h1>
        <Link href="/checkout">Checkout</Link>
      </header>

      {/* Category Filter */}
      <div style={{ margin: "20px 0" }}>
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => filterCategory(cat)}
            style={{
              marginRight: 10,
              padding: "5px 10px",
              backgroundColor: category === cat ? "#333" : "#eee",
              color: category === cat ? "#fff" : "#000",
              border: "none",
              borderRadius: 5,
              cursor: "pointer",
            }}
          >
            {cat}
          </button>
        ))}
      </div>

      <div style={{ display: "flex", flexWrap: "wrap" }}>
        {filtered.map((p) => (
          <div
            key={p._id}
            style={{
              border: "1px solid #ddd",
              margin: 10,
              padding: 10,
              width: 200,
            }}
          >
            <div
              style={{
                width: "100%",
                height: 150,
                backgroundColor: "#ccc",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                marginBottom: 10,
              }}
            >
              {p.image ? (
                <img
                  src={p.image}
                  alt={p.name}
                  style={{ maxWidth: "100%", maxHeight: "100%", objectFit: "cover",}
                }
                />
              ) : (
                <span style={{ fontSize: 40 }}>☕</span>
              )}
            </div>
            <h3>
              {p.name} — Rp {p.price}
            </h3>
            <p>{p.description}</p>
            <button onClick={() => addToCart(p)}>Add +</button>
          </div>
        ))}
      </div>
    </div>
  );
}
