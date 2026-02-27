import React, { useState, useEffect } from 'react';
import api from './api';
import './Dashboard.css';

function UserDashboard({ user }) {
  const [routes, setRoutes] = useState([]);
  const [schedules, setSchedules] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [selectedRoute, setSelectedRoute] = useState(null);
  const [selectedSchedule, setSelectedSchedule] = useState(null);
  const [availableSeats, setAvailableSeats] = useState([]);
  const [selectedSeat, setSelectedSeat] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('search');
  const [error, setError] = useState('');
  const [bookingModal, setBookingModal] = useState(false);

  useEffect(() => {
    fetchRoutes();
    fetchSchedules();
    fetchBookings();
  }, []);

  const fetchRoutes = async () => {
    try {
      const response = await api.get('/routes/');
      setRoutes(response.data);
    } catch (err) {
      console.error('Failed to load routes');
    }
  };

  const fetchSchedules = async () => {
    try {
      const response = await api.get('/schedules/');
      setSchedules(response.data);
    } catch (err) {
      setError('Failed to load schedules');
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    if (tab === 'search') {
      fetchRoutes();
      fetchSchedules();
    }
  };

  const fetchBookings = async () => {
    try {
      const response = await api.get('/bookings/');
      setBookings(response.data);
    } catch (err) {
      console.error('Failed to load bookings');
    }
  };

  const handleSelectSchedule = async (schedule) => {
    setSelectedSchedule(schedule);
    setSelectedSeat(null);
    setError('');
    try {
      const response = await api.get(`/schedules/${schedule.id}/available_seats/`);
      setAvailableSeats(response.data.available_seats);
      setBookingModal(true);
    } catch (err) {
      setError('Failed to load available seats');
    }
  };

  const handleSelectSeat = (seatNumber) => {
    setSelectedSeat(seatNumber);
  };

  const handleConfirmBooking = async () => {
    if (!selectedSeat) {
      setError('Please select a seat');
      return;
    }

    try {
      await api.post('/bookings/', {
        schedule: selectedSchedule.id,
        seat_number: selectedSeat,
      });
      alert(`✓ Booking Confirmed!\nSeat ${selectedSeat} has been booked successfully!`);
      setBookingModal(false);
      setSelectedSchedule(null);
      setSelectedSeat(null);
      fetchBookings();
      handleSelectSchedule(selectedSchedule);
      setActiveTab('bookings');
    } catch (err) {
      setError(err.response?.data?.non_field_errors?.[0] || err.response?.data?.detail || 'Failed to book seat');
    }
  };

  const handleCancelBooking = async (bookingId) => {
    if (window.confirm('Are you sure you want to cancel this booking?')) {
      try {
        await api.delete(`/bookings/${bookingId}/`);
        alert('Booking cancelled successfully!');
        fetchBookings();
      } catch (err) {
        setError('Failed to cancel booking');
      }
    }
  };

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h1>Welcome, {user.username}!</h1>
        <p>Bus Ticket Booking System</p>
      </div>

      <div className="dashboard-tabs">
        <button
          className={activeTab === 'search' ? 'tab-btn active' : 'tab-btn'}
          onClick={() => handleTabChange('search')}
        >
          Search & Book
        </button>
        <button
          className={activeTab === 'bookings' ? 'tab-btn active' : 'tab-btn'}
          onClick={() => handleTabChange('bookings')}
        >
          My Bookings ({bookings.length})
        </button>
      </div>

      {error && <div className="error-message">{error}</div>}

      {activeTab === 'search' && (
        <div className="tab-content">
          <h2>Available Routes & Schedules</h2>
          
          <div className="route-filter">
            <label htmlFor="route-select"><strong>Filter by Route:</strong></label>
            <select 
              id="route-select"
              value={selectedRoute ? selectedRoute.id : ''}
              onChange={(e) => {
                const routeId = e.target.value;
                if (routeId) {
                  const route = routes.find(r => r.id === parseInt(routeId));
                  setSelectedRoute(route);
                } else {
                  setSelectedRoute(null);
                }
              }}
            >
              <option value="">-- Show all routes --</option>
              {routes.map(route => (
                <option key={route.id} value={route.id}>
                  {route.from_location} → {route.to_location}
                </option>
              ))}
            </select>
          </div>

          <div className="schedules-grid">
            {schedules.filter(schedule => !selectedRoute || schedule.route === selectedRoute.id).length === 0 ? (
              <p>{schedules.length === 0 ? 'No schedules available' : 'No schedules for selected route'}</p>
            ) : (
              schedules.filter(schedule => !selectedRoute || schedule.route === selectedRoute.id).map((schedule) => (
                <div key={schedule.id} className="schedule-card">
                  <div className="schedule-info">
                    <h3>
                      {schedule.route_details?.from_location} → {schedule.route_details?.to_location}
                    </h3>
                    <p>
                      <strong>Bus Number:</strong> {schedule.bus_number}
                    </p>
                    <p>
                      <strong>Bus Name:</strong> {schedule.bus_name}
                    </p>
                    <p>
                      <strong>Departure:</strong> {new Date(schedule.departure_time).toLocaleString()}
                    </p>
                    <p>
                      <strong>Price:</strong> TZS {schedule.price}
                    </p>
                    <p>
                      <strong>Available Seats:</strong> {schedule.available_seats}
                    </p>
                  </div>
                  <button
                    className="btn-primary"
                    onClick={() => handleSelectSchedule(schedule)}
                  >
                    Select & Book
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {activeTab === 'bookings' && (
        <div className="tab-content">
          <h2>My Bookings</h2>
          {bookings.length === 0 ? (
            <p>You have no bookings yet. <button type="button" className="link-button" onClick={() => setActiveTab('search')}>Search and book a ticket</button></p>
          ) : (
            <div className="bookings-list">
              {bookings.map((booking) => (
                <div key={booking.id} className={`booking-card ${booking.status}`}>
                  <div className="booking-info">
                    <h4>Booking ID: {booking.id}</h4>
                    <p>
                      <strong>Route:</strong> {booking.schedule_route}
                    </p>
                    <p>
                      <strong>Seat Number:</strong> {booking.seat_number}
                    </p>
                    <p>
                      <strong>Booked At:</strong> {new Date(booking.booked_at).toLocaleString()}
                    </p>
                    <p>
                      <strong>Status:</strong> 
                      <span className={`status-badge ${booking.status}`}>
                        {booking.status === 'confirmed' ? '✓ Confirmed' : '✗ Cancelled'}
                      </span>
                    </p>
                    {booking.cancelled_at && (
                      <p>
                        <strong>Cancelled At:</strong> {new Date(booking.cancelled_at).toLocaleString()}
                      </p>
                    )}
                  </div>
                  {booking.status === 'confirmed' && (
                    <button
                      className="btn-danger"
                      onClick={() => handleCancelBooking(booking.id)}
                    >
                      Cancel Booking
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {bookingModal && selectedSchedule && (
        <div className="modal-overlay" onClick={() => setBookingModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2>Confirm Your Booking</h2>
            <div className="booking-details">
              <div className="detail-row">
                <strong>Route:</strong>
                <span>{selectedSchedule.route_details?.from_location} → {selectedSchedule.route_details?.to_location}</span>
              </div>
              <div className="detail-row">
                <strong>Bus Number:</strong>
                <span>{selectedSchedule.bus_number}</span>
              </div>
              <div className="detail-row">
                <strong>Bus Name:</strong>
                <span>{selectedSchedule.bus_name}</span>
              </div>
              <div className="detail-row">
                <strong>Departure Date:</strong>
                <span>{new Date(selectedSchedule.departure_time).toLocaleString()}</span>
              </div>
              <div className="detail-row">
                <strong>Price:</strong>
                <span className="price">TZS {selectedSchedule.price}</span>
              </div>
              <div className="detail-row">
                <strong>Selected Seat:</strong>
                <span className="seat-display">{selectedSeat || 'Not selected'}</span>
              </div>
            </div>

            <h3>Select Your Seat</h3>
            <p className="seats-info">Available Seats: {availableSeats.length} | Total Seats: {selectedSchedule.bus_total_seats}</p>
            <div className="seats-grid">
              {Array.from({ length: selectedSchedule.bus_total_seats }, (_, i) => i + 1).map(
                (seatNum) => (
                  <button
                    key={seatNum}
                    className={`seat ${
                      availableSeats.includes(seatNum) ? 'available' : 'booked'
                    } ${selectedSeat === seatNum ? 'selected' : ''}`}
                    disabled={!availableSeats.includes(seatNum)}
                    onClick={() => handleSelectSeat(seatNum)}
                  >
                    {seatNum}
                  </button>
                )
              )}
            </div>

            <div className="modal-actions">
              <button className="btn-secondary" onClick={() => setBookingModal(false)}>
                Cancel
              </button>
              <button 
                className="btn-primary" 
                onClick={handleConfirmBooking}
                disabled={!selectedSeat}
              >
                Confirm Booking
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default UserDashboard;
