import React from "react";

export default function Footer() {
  return (
    <footer className="p-4 bg-gray-800 text-white text-center mt-10">
      <p>© {new Date().getFullYear()} Waste Management System. All rights reserved.</p>
    </footer>
  );
}
