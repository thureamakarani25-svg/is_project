import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { loadRoutes } from "../utils/routesStorage";

const UserDashboard = () => {
  const [routes, setRoutes] = useState([]);

  useEffect(() => {
    setRoutes(loadRoutes());
  }, []);

  return (
    <div style={{ padding: "20px" }}>
      <h2>User Dashboard</h2>
      <p>Choose a route to book your seat.</p>

      {routes.length === 0 ? (
        <p>No routes available.</p>
      ) : (
        <div style={{ display: "grid", gap: "12px", marginTop: "10px" }}>
          {routes.map((route) => (
            <div
              key={route.id}
              style={{
                border: "1px solid #ddd",
                borderRadius: "8px",
                padding: "12px",
                background: "#fff",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                gap: "12px",
              }}
            >
              <div>
                <strong>
                  {route.from} → {route.to}
                </strong>
                <div>
                  {route.busName} ({route.busNumber})
                </div>
                <div>Schedule: {route.schedule}</div>
                <div>Price: {route.price} TZS</div>
              </div>
              <Link
                to="/booking"
                state={{
                  seatsData: route.seats,
                  routeInfo: {
                    from: route.from,
                    to: route.to,
                    busName: route.busName,
                    busNumber: route.busNumber,
                    schedule: route.schedule,
                    price: route.price,
                  },
                }}
                style={{
                  padding: "10px 16px",
                  backgroundColor: "blue",
                  color: "white",
                  borderRadius: "6px",
                  textDecoration: "none",
                }}
              >
                Book
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default UserDashboard;
