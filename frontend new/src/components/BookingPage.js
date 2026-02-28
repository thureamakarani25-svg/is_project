import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import SeatsSelection from "./SeatsSelection";

const BookingPage = ({ seatsData }) => {
  const location = useLocation();
  const routeState = location?.state || {};
  const effectiveSeatsData = Array.isArray(seatsData) && seatsData.length > 0
    ? seatsData
    : routeState.seatsData;
  const [seats, setSeats] = useState([]);
  const [selectedSeats, setSelectedSeats] = useState([]);

  useEffect(() => {
    // load seats data from props or router state
    if (Array.isArray(effectiveSeatsData) && effectiveSeatsData.length > 0) {
      setSeats(effectiveSeatsData);
    }
  }, [effectiveSeatsData]);

  const handleSelect = (id) => {
    if (!selectedSeats.includes(id)) {
      setSelectedSeats([...selectedSeats, id]);
    } else {
      setSelectedSeats(selectedSeats.filter((seatId) => seatId !== id));
    }
  };

  const handleBook = () => {
    if (selectedSeats.length === 0) {
      alert("Please select at least one seat!");
      return;
    }

    const updatedSeats = seats.map((seat) =>
      selectedSeats.includes(seat.id) ? { ...seat, booked: true } : seat
    );

    setSeats(updatedSeats);
    setSelectedSeats([]);
    alert("Seats booked successfully!");
  };

  return (
    <div>
      <h2>Select Your Seats</h2>
      {routeState.routeInfo && (
        <p>
          {routeState.routeInfo.from} → {routeState.routeInfo.to} |{" "}
          {routeState.routeInfo.busName} ({routeState.routeInfo.busNumber}) |{" "}
          {routeState.routeInfo.schedule} | {routeState.routeInfo.price} TZS
        </p>
      )}
      {seats.length > 0 ? (
        <SeatsSelection seats={seats} onSelect={handleSelect} />
      ) : (
        <p>No seats available.</p>
      )}
      <div style={{ marginTop: "20px" }}>
        <button
          onClick={handleBook}
          style={{
            padding: "10px 20px",
            backgroundColor: "blue",
            color: "white",
            border: "none",
            borderRadius: "5px",
            cursor: "pointer",
          }}
        >
          Book Ticket
        </button>
      </div>
      {selectedSeats.length > 0 && (
        <p>
          Selected Seats:{" "}
          {selectedSeats
            .map((id) => seats.find((s) => s.id === id).number)
            .join(", ")}
        </p>
      )}
    </div>
  );
};

export default BookingPage;
