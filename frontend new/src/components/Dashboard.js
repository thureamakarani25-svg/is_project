import React from "react";
import { Link } from "react-router-dom";

const Dashboard = () => {
  return (
    <div style={{ padding: "20px" }}>
      <h2>Dashboard</h2>
      <p>Choose your dashboard.</p>
      <div style={{ display: "flex", gap: "12px" }}>
        <Link
          to="/admin"
          style={{
            padding: "12px 18px",
            backgroundColor: "black",
            color: "white",
            borderRadius: "6px",
            textDecoration: "none",
          }}
        >
          Admin Dashboard
        </Link>
        <Link
          to="/user"
          style={{
            padding: "12px 18px",
            backgroundColor: "blue",
            color: "white",
            borderRadius: "6px",
            textDecoration: "none",
          }}
        >
          User Dashboard
        </Link>
      </div>
    </div>
  );
};

export default Dashboard;
