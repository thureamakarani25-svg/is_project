import React from "react";

const SeatsSelection = ({ seats, onSelect }) => {
  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: "10px" }}>
      {Array.isArray(seats) && seats.length > 0 ? (
        seats.map((seat) => (
          <button
            key={seat.id}
            onClick={() => !seat.booked && onSelect(seat.id)}
            style={{
              backgroundColor: seat.booked ? "red" : "green",
              color: "white",
              padding: "10px",
              border: "none",
              borderRadius: "5px",
              cursor: seat.booked ? "not-allowed" : "pointer",
            }}
          >
            {seat.number}
          </button>
        ))
      ) : (
        <p>No seats available.</p>
      )}
    </div>
  );
};

export default SeatsSelection;
