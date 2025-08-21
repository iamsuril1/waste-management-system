import React, { useContext, useEffect, useState } from "react";
import { AuthContext } from "../context/AuthContext";
import api from "../utils/axios";
import { Link } from "react-router-dom";

export default function Dashboard() {
  const { user } = useContext(AuthContext);
  const [stats, setStats] = useState({ purchases: 0, sales: 0, giveaways: 0 });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await api.get("/dashboard/stats");
        setStats(res.data);
      } catch (err) {
        console.error("Failed to load stats:", err);
      }
    };
    fetchStats();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 py-10">
      <div className="max-w-6xl mx-auto px-6">
        <h1 className="text-3xl font-bold mb-6">
          Welcome, {user?.name || "User"} 👋
        </h1>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          <div className="bg-white p-6 rounded-xl shadow">
            <h3 className="text-lg font-semibold">Total Purchases</h3>
            <p className="text-2xl font-bold text-blue-600">{stats.purchases}</p>
          </div>
          <div className="bg-white p-6 rounded-xl shadow">
            <h3 className="text-lg font-semibold">Total Sales</h3>
            <p className="text-2xl font-bold text-green-600">{stats.sales}</p>
          </div>
          <div className="bg-white p-6 rounded-xl shadow">
            <h3 className="text-lg font-semibold">Giveaways</h3>
            <p className="text-2xl font-bold text-purple-600">{stats.giveaways}</p>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Link
            to="/marketplace"
            className="block bg-blue-600 text-white text-center py-6 rounded-xl shadow hover:bg-blue-700 transition"
          >
            Go to Marketplace
          </Link>
          <Link
            to="/giveaway"
            className="block bg-purple-600 text-white text-center py-6 rounded-xl shadow hover:bg-purple-700 transition"
          >
            Create Giveaway
          </Link>
          <Link
            to="/profile"
            className="block bg-gray-600 text-white text-center py-6 rounded-xl shadow hover:bg-gray-700 transition"
          >
            View Profile
          </Link>
        </div>
      </div>
    </div>
  );
}
