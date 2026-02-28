import React, { useMemo, useState } from "react";
import { loadRoutes, saveRoutes, buildSeats } from "../utils/routesStorage";

const emptyForm = {
  from: "",
  to: "",
  busName: "",
  busNumber: "",
  schedule: "",
  price: "",
  seatsCount: "10",
};

const AdminDashboard = () => {
  const initialRoutes = useMemo(() => loadRoutes(), []);
  const [routes, setRoutes] = useState(initialRoutes);
  const [form, setForm] = useState(emptyForm);

  const updateForm = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleAddRoute = (e) => {
    e.preventDefault();
    if (!form.from || !form.to || !form.busName || !form.busNumber || !form.schedule || !form.price) {
      alert("Please fill all required fields.");
      return;
    }

    const id = `r${Date.now()}`;
    const newRoute = {
      id,
      from: form.from.trim(),
      to: form.to.trim(),
      busName: form.busName.trim(),
      busNumber: form.busNumber.trim(),
      schedule: form.schedule.trim(),
      price: Number(form.price),
      seats: buildSeats(id, Number(form.seatsCount)),
    };

    const updated = [newRoute, ...routes];
    setRoutes(updated);
    saveRoutes(updated);
    setForm(emptyForm);
  };

  return (
    <div style={{ padding: "20px" }}>
      <h2>Admin Dashboard</h2>
      <p>Manage routes, buses, and schedules.</p>

      <form onSubmit={handleAddRoute} style={{ display: "grid", gap: "10px", maxWidth: "520px" }}>
        <input
          type="text"
          placeholder="From"
          value={form.from}
          onChange={(e) => updateForm("from", e.target.value)}
        />
        <input
          type="text"
          placeholder="To"
          value={form.to}
          onChange={(e) => updateForm("to", e.target.value)}
        />
        <input
          type="text"
          placeholder="Bus Name"
          value={form.busName}
          onChange={(e) => updateForm("busName", e.target.value)}
        />
        <input
          type="text"
          placeholder="Bus Number"
          value={form.busNumber}
          onChange={(e) => updateForm("busNumber", e.target.value)}
        />
        <input
          type="text"
          placeholder="Schedule (e.g. 08:00 AM)"
          value={form.schedule}
          onChange={(e) => updateForm("schedule", e.target.value)}
        />
        <input
          type="number"
          placeholder="Price (TZS)"
          value={form.price}
          onChange={(e) => updateForm("price", e.target.value)}
        />
        <input
          type="number"
          placeholder="Seats Count"
          value={form.seatsCount}
          onChange={(e) => updateForm("seatsCount", e.target.value)}
        />
        <button type="submit" style={{ padding: "10px", backgroundColor: "black", color: "white", border: "none" }}>
          Add Route
        </button>
      </form>

      <h3 style={{ marginTop: "30px" }}>Routes</h3>
      {routes.length === 0 ? (
        <p>No routes yet.</p>
      ) : (
        <div style={{ display: "grid", gap: "12px", marginTop: "10px" }}>
          {routes.map((route) => (
            <div
              key={route.id}
              style={{
                border: "1px solid #ddd",
                borderRadius: "8px",
                padding: "12px",
                background: "#fafafa",
              }}
            >
              <strong>
                {route.from} → {route.to}
              </strong>
              <div>
                {route.busName} ({route.busNumber})
              </div>
              <div>Schedule: {route.schedule}</div>
              <div>Price: {route.price} TZS</div>
              <div>Seats: {route.seats?.length || 0}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
