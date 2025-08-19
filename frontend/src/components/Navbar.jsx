import React, { useContext } from "react";
import { Link } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

export default function Navbar() {
  const { user, logout } = useContext(AuthContext);

  return (
    <nav className="flex justify-between items-center p-4 bg-green-600 text-white">
      <div className="flex gap-6">
        <Link to="/" className="font-bold">WasteMgmt</Link>
        <Link to="/marketplace">Marketplace</Link>
        <Link to="/giveaway">Giveaway</Link>
      </div>

      <div className="flex gap-4">
        {!user ? (
          <>
            <Link to="/login">Login</Link>
            <Link to="/register">Register</Link>
          </>
        ) : (
          <>
            <Link to="/dashboard">{user.name || "Profile"}</Link>
            <button
              onClick={logout}
              className="bg-white text-green-600 px-3 py-1 rounded"
            >
              Logout
            </button>
          </>
        )}
      </div>
    </nav>
  );
}
