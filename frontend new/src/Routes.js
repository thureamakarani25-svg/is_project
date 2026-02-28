import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import BookingPage from "./components/BookingPage";
import SeatsSelection from "./components/SeatsSelection";
import Dashboard from "./components/Dashboard";
import AdminDashboard from "./components/AdminDashboard";
import UserDashboard from "./components/UserDashboard";
import Login from "./Login";

function RoutesComponent() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/" element={<Dashboard />} />
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/user" element={<UserDashboard />} />
        <Route path="/booking" element={<BookingPage />} />
        <Route path="/seats" element={<SeatsSelection />} />
      </Routes>
    </Router>
  );
}

export default RoutesComponent;
