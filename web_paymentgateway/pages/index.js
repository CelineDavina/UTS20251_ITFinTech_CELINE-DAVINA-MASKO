import { useEffect, useState } from "react";
import Link from "next/link";

export default function Home() {
  const [products, setProducts] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [category, setCategory] = useState("All");
  const [search, setSearch] = useState("");

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
        image: product.image,
        quantity: 1,
      });
    localStorage.setItem("cart", JSON.stringify(cart));
    alert("Added to cart");
  }

  function filterCategory(cat) {
    setCategory(cat);
    const filteredByCat =
      cat === "All" ? products : products.filter((p) => p.category === cat);
    const filteredBySearch = filteredByCat.filter((p) =>
      p.name.toLowerCase().includes(search.toLowerCase())
    );
    setFiltered(filteredBySearch);
  }

  function handleSearch(e) {
    setSearch(e.target.value);
    const filteredByCat =
      category === "All"
        ? products
        : products.filter((p) => p.category === category);
    setFiltered(
      filteredByCat.filter((p) =>
        p.name.toLowerCase().includes(e.target.value.toLowerCase())
      )
    );
  }

  const categories = ["All", "Coffee", "Tea", "Milk", "Smoothies", "Dessert"];

  return (
    <div
      style={{
        fontFamily: "'Comic Neue', cursive, Arial, sans-serif",
        backgroundColor: "#fdf6f0",
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        padding: 0,
        overflowX: "hidden",  

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

        }}
      >
        <h1
          style={{
            fontSize: 48,
            color: "#fff",
            margin: 0,
            letterSpacing: 2,
          }}
        >
          ☕ Stem's Coffee Shop ☕
        </h1>
        <p style={{ marginTop: 10, color: "#fff", fontSize: 18 }}>
          Your daily dose of happiness!
        </p>
      </div>

      {/* Checkout cart in top-right */}
<div
  style={{
    position: "absolute",
    top: 20,
    right: 20,
    display: "flex",
    flexDirection: "column",
    gap: 10, // space between buttons
  }}
>
  {/* Checkout button */}
  <div
    style={{
      backgroundColor: "#fff",
      borderRadius: 50,
      padding: "10px 18px",
      boxShadow: "0px 4px 12px rgba(0,0,0,0.15)",
      transition: "transform 0.3s",
    }}
    onMouseEnter={(e) => (e.currentTarget.style.transform = "scale(1.1)")}
    onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
  >
    <Link
      href="/checkout"
      style={{
        fontSize: 20,
        fontWeight: "bold",
        color: "#6b4f3f",
        textDecoration: "none",
      }}
    >
      🛒Checkout
    </Link>
  </div>

  {/* History button */}
  <div
    style={{
      backgroundColor: "#fff",
      borderRadius: 50,
      padding: "10px 18px",
      boxShadow: "0px 4px 12px rgba(0,0,0,0.15)",
      transition: "transform 0.3s",
    }}
    onMouseEnter={(e) => (e.currentTarget.style.transform = "scale(1.1)")}
    onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
  >
    <Link
      href="/history"
      style={{
        fontSize: 20,
        fontWeight: "bold",
        color: "#6b4f3f",
        textDecoration: "none",
      }}
    >
      🧾Status
    </Link>
  </div>
</div>



      {/* Search bar */}
      <div
        style={{
          marginTop: 40,
          marginBottom: 40,
          display: "flex",
          justifyContent: "center",
          width: "80%",
        }}
      >
        <input
          type="text"
          placeholder="Search your favorite drinks..."
          value={search}
          onChange={handleSearch}
          style={{
            width: "100%",
            maxWidth: 500,
            padding: "12px 24px",
            borderRadius: 30,
            border: "2px solid #d9b79f",
            outline: "none",
            fontSize: 16,
            boxShadow: "2px 2px 5px rgba(0,0,0,0.1)",
            transition: "0.3s",
          }}
        />
      </div>

      {/* Category buttons with animation */}
      <div
        style={{
          marginBottom: 40,
          display: "flex",
          flexWrap: "wrap",
          justifyContent: "center",
          gap: 15,
        }}
      >
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => filterCategory(cat)}
            style={{
              padding: "10px 20px",
              borderRadius: 25,
              border: "none",
              backgroundColor: category === cat ? "#d9b79f" : "#f5e4d8",
              color: category === cat ? "#fff" : "#6b4f3f",
              fontWeight: "bold",
              cursor: "pointer",
              transition: "all 0.3s ease",
              transform: category === cat ? "scale(1.1)" : "scale(1)",
              boxShadow:
                category === cat
                  ? "0px 4px 10px rgba(0,0,0,0.15)"
                  : "0px 2px 5px rgba(0,0,0,0.1)",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.transform = "scale(1.15)")}
            onMouseLeave={(e) =>
              (e.currentTarget.style.transform =
                category === cat ? "scale(1.1)" : "scale(1)")
            }
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Products */}
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          justifyContent: "center",
          gap: 22,
          width: "88%",
        }}
      >
        {filtered.map((p, i) => (
        <div
            key={p._id}
            style={{
              borderRadius: 20,
              backgroundColor: "#fff8f2",
              width: 250,
              overflow: "hidden",
              boxShadow: "0px 5px 15px rgba(0,0,0,0.1)",
              cursor: "pointer",
              transition: "transform 0.3s, box-shadow 0.3s",
            }}
            onMouseEnter={e => { e.currentTarget.style.transform = "scale(1.05)"; e.currentTarget.style.boxShadow = "0px 10px 20px rgba(0,0,0,0.15)"; }}
            onMouseLeave={e => { e.currentTarget.style.transform = "scale(1)"; e.currentTarget.style.boxShadow = "0px 5px 15px rgba(0,0,0,0.1)"; }}
          

          >
            <div style={{ width: "100%", height: 180, overflow: "hidden" }}>
              {p.image ? (
                <img
                  src={p.image}
                  alt={p.name}
                  style={{ width: "100%", height: "100%", objectFit: "cover" }}
                />
              ) : (
                <div
                  style={{
                    width: "100%",
                    height: "100%",
                    backgroundColor: "#f0e6de",
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    fontSize: 50,
                  }}
                >
                  ☕
                </div>
              )}
            </div>
            <div style={{ padding: 15, textAlign: "center" }}>
              <h3 style={{ margin: "1px 0 5px", color: "#6b4f3f" }}>
                {p.name}
              </h3>
              <p
                style={{
                  margin: "5px 0",
                  fontWeight: "bold",
                  color: "#9b6b4f",
                }}
              >
                Rp {p.price}
              </p>
              <p
                style={{
                  fontSize: 14,
                  color: "#7a5c49",
                  minHeight: 10,
                }}
              >
                {p.description}
              </p>
              <button
                onClick={() => addToCart(p)}
                style={{
                  marginTop: 5,
                  padding: "8px 20px",
                  borderRadius: 30,
                  border: "none",
                  backgroundColor: "#d9b79f",
                  color: "#fff",
                  fontWeight: "bold",
                  cursor: "pointer",
                  transition: "0.3s",
                }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.backgroundColor = "#c49c81")
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.backgroundColor = "#d9b79f")
                }
              >
                Add +
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Footer */}
      <footer
        style={{
          marginTop: 80,
          width: "100%",
          backgroundColor: "#d9b79f",
          padding: 20,
          textAlign: "center",
          color: "#fff",
          marginBottom: 0,
        }}
      >
        <p style={{ margin: 0 }}>
          © 2025 Stem's Coffee Shop. Made with ❤️ for coffee lovers.
        </p>
      </footer>

      {/* Keyframes for fade-in */}
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
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
}
