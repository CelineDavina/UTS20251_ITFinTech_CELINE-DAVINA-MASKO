import { useEffect, useState } from "react";
import Link from "next/link";

export default function Home() {
  const [products, setProducts] = useState([]);
  
  useEffect(() => {
    fetch("/api/products")
      .then((r) => r.json())
      .then((d) => setProducts(d.data || []));
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

  return (
    <div style={{ padding: 20 }}>
      <header
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <h1>Store</h1>
        <Link href="/checkout">Checkout</Link>
      </header>

      <div>
        {products.map((p) => (
          <div
            key={p._id}
            style={{ border: "1px solid #ddd", margin: 10, padding: 10 }}
          >
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
