import React, { useEffect, useState } from "react";
import api from "../utils/axios";

export default function Marketplace() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchItems = async () => {
      try {
        const res = await api.get("/marketplace");
        setItems(res.data);
      } catch (err) {
        console.error("Failed to fetch marketplace items:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchItems();
  }, []);

  if (loading) return <p className="text-center mt-10">Loading marketplace...</p>;

  return (
    <div className="min-h-screen bg-gray-50 py-10">
      <div className="max-w-6xl mx-auto px-6">
        <h1 className="text-3xl font-bold mb-6">Marketplace</h1>

        {items.length === 0 ? (
          <p className="text-gray-600">No listings available yet.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {items.map((item) => (
              <div
                key={item._id}
                className="bg-white p-6 rounded-xl shadow flex flex-col justify-between"
              >
                <h3 className="text-xl font-semibold">{item.name}</h3>
                <p className="text-gray-600 mt-2">
                  {item.type === "sell" ? "Selling at" : "Buying for"}:{" "}
                  <span className="font-bold text-green-600">${item.price}</span>
                </p>

                <button
                  className={`mt-4 py-2 px-4 rounded text-white transition ${
                    item.type === "sell"
                      ? "bg-blue-600 hover:bg-blue-700"
                      : "bg-green-600 hover:bg-green-700"
                  }`}
                >
                  {item.type === "sell" ? "Buy Now" : "Sell Now"}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
