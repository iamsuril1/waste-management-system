import React, { useContext } from "react";
import { AuthContext } from "../context/AuthContext";

export default function Dashboard() {
  const { user } = useContext(AuthContext);

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100">
      <div className="bg-white p-8 rounded shadow-md w-full max-w-2xl">
        <h1 className="text-3xl font-bold mb-4">
          Welcome, {user ? user.name : "User"} 👋
        </h1>
        <p className="text-gray-600">This is your dashboard.</p>
      </div>
    </div>
  );
}
