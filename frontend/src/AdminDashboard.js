import React, { useEffect, useState } from 'react';
import api from './api';
import './Dashboard.css';

function AdminDashboard({ user }) {
  const [activeTab, setActiveTab] = useState('routes');
  const [routes, setRoutes] = useState([]);
  const [buses, setBuses] = useState([]);
  const [schedules, setSchedules] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [routeForm, setRouteForm] = useState({ from_location: '', to_location: '', distance: '' });
  const [busForm, setBusForm] = useState({ bus_number: '', bus_name: '', total_seats: '' });
  const [scheduleForm, setScheduleForm] = useState({
    route: '',
    bus: '',
    departure_time: '',
    price: '',
    available_seats: '',
  });
  const [bookingForm, setBookingForm] = useState({ user: '', schedule: '', seat_number: '' });
  const [createNewBookingUser, setCreateNewBookingUser] = useState(false);
  const [newBookingUser, setNewBookingUser] = useState({ username: '', email: '', password: '' });
  const [editingBookingId, setEditingBookingId] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setError('');
    try {
      const [routesRes, busesRes, schedulesRes, bookingsRes, usersRes] = await Promise.all([
        api.get('/routes/'),
        api.get('/buses/'),
        api.get('/schedules/'),
        api.get('/bookings/'),
        api.get('/users/'),
      ]);
      setRoutes(routesRes.data);
      setBuses(busesRes.data);
      setSchedules(schedulesRes.data);
      setBookings(bookingsRes.data);
      setUsers(usersRes.data.filter((account) => !account.is_staff));
    } catch (err) {
      setError('Failed to load admin data');
    } finally {
      setLoading(false);
    }
  };

  const clearMessages = () => {
    setError('');
    setSuccess('');
  };

  const handleCreateRoute = async (e) => {
    e.preventDefault();
    clearMessages();
    try {
      await api.post('/routes/', {
        ...routeForm,
        distance: parseFloat(routeForm.distance),
      });
      setRouteForm({ from_location: '', to_location: '', distance: '' });
      setSuccess('Route created');
      fetchData();
    } catch (err) {
      setError('Failed to create route');
    }
  };

  const handleCreateBus = async (e) => {
    e.preventDefault();
    clearMessages();
    try {
      await api.post('/buses/', {
        ...busForm,
        total_seats: parseInt(busForm.total_seats, 10),
      });
      setBusForm({ bus_number: '', bus_name: '', total_seats: '' });
      setSuccess('Bus created');
      fetchData();
    } catch (err) {
      setError('Failed to create bus');
    }
  };

  const handleCreateSchedule = async (e) => {
    e.preventDefault();
    clearMessages();
    try {
      await api.post('/schedules/', {
        route: parseInt(scheduleForm.route, 10),
        bus: parseInt(scheduleForm.bus, 10),
        departure_time: scheduleForm.departure_time,
        price: parseFloat(scheduleForm.price),
      });
      setScheduleForm({ route: '', bus: '', departure_time: '', price: '', available_seats: '' });
      setSuccess('Schedule created');
      fetchData();
    } catch (err) {
      setError(
        err.response?.data?.non_field_errors?.[0] ||
          err.response?.data?.detail ||
          'Failed to create schedule'
      );
    }
  };

  const resetBookingForm = () => {
    setBookingForm({ user: '', schedule: '', seat_number: '' });
    setCreateNewBookingUser(false);
    setNewBookingUser({ username: '', email: '', password: '' });
    setEditingBookingId(null);
  };

  const handleSaveBooking = async (e) => {
    e.preventDefault();
    clearMessages();

    const payload = {
      schedule: parseInt(bookingForm.schedule, 10),
      seat_number: parseInt(bookingForm.seat_number, 10),
    };

    if (createNewBookingUser && !editingBookingId) {
      payload.new_username = newBookingUser.username.trim();
      payload.new_email = newBookingUser.email.trim();
      payload.new_password = newBookingUser.password;
    } else {
      payload.user = parseInt(bookingForm.user, 10);
    }

    try {
      if (editingBookingId) {
        await api.put(`/bookings/${editingBookingId}/`, payload);
        setSuccess('Booking updated');
      } else {
        await api.post('/bookings/', payload);
        setSuccess('Booking created');
      }
      resetBookingForm();
      fetchData();
    } catch (err) {
      setError(
        err.response?.data?.non_field_errors?.[0] ||
          err.response?.data?.detail ||
          'Failed to save booking'
      );
    }
  };

  const handleDelete = async (resource, id) => {
    if (!window.confirm('Are you sure?')) {
      return;
    }
    clearMessages();
    try {
      await api.delete(`/${resource}/${id}/`);
      setSuccess(`${resource.slice(0, -1)} deleted`);
      fetchData();
    } catch (err) {
      setError(`Failed to delete ${resource.slice(0, -1)}`);
    }
  };

  const startBookingEdit = (booking) => {
    setActiveTab('bookings');
    setEditingBookingId(booking.id);
    setCreateNewBookingUser(false);
    setNewBookingUser({ username: '', email: '', password: '' });
    setBookingForm({
      user: String(booking.user),
      schedule: String(booking.schedule),
      seat_number: String(booking.seat_number),
    });
  };

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h1>Admin Dashboard</h1>
        <p>Welcome, {user.username} (Administrator)</p>
      </div>

      <div className="dashboard-tabs">
        <button className={activeTab === 'routes' ? 'tab-btn active' : 'tab-btn'} onClick={() => setActiveTab('routes')}>
          Routes
        </button>
        <button className={activeTab === 'buses' ? 'tab-btn active' : 'tab-btn'} onClick={() => setActiveTab('buses')}>
          Buses
        </button>
        <button className={activeTab === 'schedules' ? 'tab-btn active' : 'tab-btn'} onClick={() => setActiveTab('schedules')}>
          Schedules
        </button>
        <button className={activeTab === 'bookings' ? 'tab-btn active' : 'tab-btn'} onClick={() => setActiveTab('bookings')}>
          Bookings
        </button>
      </div>

      <div className="tab-content">
        {error && <div className="error-message">{error}</div>}
        {success && <div className="success-message">{success}</div>}

        {activeTab === 'routes' && (
          <>
            <h2>Manage Routes</h2>
            <form onSubmit={handleCreateRoute} className="form-box">
              <input
                type="text"
                placeholder="From Location"
                value={routeForm.from_location}
                onChange={(e) => setRouteForm({ ...routeForm, from_location: e.target.value })}
                required
              />
              <input
                type="text"
                placeholder="To Location"
                value={routeForm.to_location}
                onChange={(e) => setRouteForm({ ...routeForm, to_location: e.target.value })}
                required
              />
              <input
                type="number"
                placeholder="Distance (km)"
                value={routeForm.distance}
                onChange={(e) => setRouteForm({ ...routeForm, distance: e.target.value })}
                required
              />
              <button type="submit" className="btn-primary">
                Create Route
              </button>
            </form>
            <div className="items-list">
              {routes.map((route) => (
                <div key={route.id} className="item-card">
                  <div>
                    <h4>
                      {route.from_location} - {route.to_location}
                    </h4>
                    <p>Distance: {route.distance} km</p>
                  </div>
                  <button className="btn-danger" onClick={() => handleDelete('routes', route.id)}>
                    Delete
                  </button>
                </div>
              ))}
            </div>
          </>
        )}

        {activeTab === 'buses' && (
          <>
            <h2>Manage Buses</h2>
            <form onSubmit={handleCreateBus} className="form-box">
              <input
                type="text"
                placeholder="Bus Number"
                value={busForm.bus_number}
                onChange={(e) => setBusForm({ ...busForm, bus_number: e.target.value })}
                required
              />
              <input
                type="text"
                placeholder="Bus Name"
                value={busForm.bus_name}
                onChange={(e) => setBusForm({ ...busForm, bus_name: e.target.value })}
                required
              />
              <input
                type="number"
                placeholder="Total Seats"
                value={busForm.total_seats}
                onChange={(e) => setBusForm({ ...busForm, total_seats: e.target.value })}
                required
              />
              <button type="submit" className="btn-primary">
                Create Bus
              </button>
            </form>
            <div className="items-list">
              {buses.map((bus) => (
                <div key={bus.id} className="item-card">
                  <div>
                    <h4>{bus.bus_name}</h4>
                    <p>Bus Number: {bus.bus_number}</p>
                    <p>Total Seats: {bus.total_seats}</p>
                  </div>
                  <button className="btn-danger" onClick={() => handleDelete('buses', bus.id)}>
                    Delete
                  </button>
                </div>
              ))}
            </div>
          </>
        )}

        {activeTab === 'schedules' && (
          <>
            <h2>Manage Schedules</h2>
            <form onSubmit={handleCreateSchedule} className="form-box">
              <select
                value={scheduleForm.route}
                onChange={(e) => setScheduleForm({ ...scheduleForm, route: e.target.value })}
                required
              >
                <option value="">Select Route</option>
                {routes.map((route) => (
                  <option key={route.id} value={route.id}>
                    {route.from_location} - {route.to_location}
                  </option>
                ))}
              </select>
              <select
                value={scheduleForm.bus}
                onChange={(e) => setScheduleForm({ ...scheduleForm, bus: e.target.value })}
                required
              >
                <option value="">Select Bus</option>
                {buses.map((bus) => (
                  <option key={bus.id} value={bus.id}>
                    {bus.bus_name} ({bus.bus_number})
                  </option>
                ))}
              </select>
              <input
                type="datetime-local"
                value={scheduleForm.departure_time}
                onChange={(e) => setScheduleForm({ ...scheduleForm, departure_time: e.target.value })}
                required
              />
              <input
                type="number"
                step="0.01"
                placeholder="Price"
                value={scheduleForm.price}
                onChange={(e) => setScheduleForm({ ...scheduleForm, price: e.target.value })}
                required
              />
              <button type="submit" className="btn-primary">
                Create Schedule
              </button>
            </form>
            <div className="items-list">
              {schedules.map((schedule) => (
                <div key={schedule.id} className="item-card">
                  <div>
                    <h4>
                      {schedule.route_details?.from_location} - {schedule.route_details?.to_location}
                    </h4>
                    <p>
                      Bus: {schedule.bus_name} ({schedule.bus_number})
                    </p>
                    <p>Departure: {new Date(schedule.departure_time).toLocaleString()}</p>
                    <p>Price: TZS {schedule.price}</p>
                    <p>Available Seats: {schedule.available_seats}</p>
                  </div>
                  <button className="btn-danger" onClick={() => handleDelete('schedules', schedule.id)}>
                    Delete
                  </button>
                </div>
              ))}
            </div>
          </>
        )}

        {activeTab === 'bookings' && (
          <>
            <h2>Manage Bookings</h2>
            <form onSubmit={handleSaveBooking} className="form-box">
              {!editingBookingId && (
                <label style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                  <input
                    type="checkbox"
                    checked={createNewBookingUser}
                    onChange={(e) => setCreateNewBookingUser(e.target.checked)}
                  />
                  Create new user for this booking
                </label>
              )}

              {createNewBookingUser && !editingBookingId ? (
                <>
                  <input
                    type="text"
                    placeholder="New username"
                    value={newBookingUser.username}
                    onChange={(e) =>
                      setNewBookingUser({ ...newBookingUser, username: e.target.value })
                    }
                    required
                  />
                  <input
                    type="email"
                    placeholder="New user email (optional)"
                    value={newBookingUser.email}
                    onChange={(e) => setNewBookingUser({ ...newBookingUser, email: e.target.value })}
                  />
                  <input
                    type="password"
                    placeholder="New user password"
                    value={newBookingUser.password}
                    onChange={(e) =>
                      setNewBookingUser({ ...newBookingUser, password: e.target.value })
                    }
                    required
                  />
                </>
              ) : (
                <select
                  value={bookingForm.user}
                  onChange={(e) => setBookingForm({ ...bookingForm, user: e.target.value })}
                  required
                >
                  <option value="">Select User</option>
                  {users.map((account) => (
                    <option key={account.id} value={account.id}>
                      {account.username}
                    </option>
                  ))}
                </select>
              )}

              <select
                value={bookingForm.schedule}
                onChange={(e) => setBookingForm({ ...bookingForm, schedule: e.target.value })}
                required
              >
                <option value="">Select Schedule</option>
                {schedules.map((schedule) => (
                  <option key={schedule.id} value={schedule.id}>
                    {schedule.route_details?.from_location} - {schedule.route_details?.to_location} |{' '}
                    {new Date(schedule.departure_time).toLocaleString()}
                  </option>
                ))}
              </select>

              <input
                type="number"
                min="1"
                placeholder="Seat Number"
                value={bookingForm.seat_number}
                onChange={(e) => setBookingForm({ ...bookingForm, seat_number: e.target.value })}
                required
              />
              <button type="submit" className="btn-primary">
                {editingBookingId ? 'Update Booking' : 'Create Booking'}
              </button>
              {editingBookingId && (
                <button type="button" className="btn-secondary" onClick={resetBookingForm}>
                  Cancel Edit
                </button>
              )}
            </form>

            <div className="items-list">
              {bookings.length === 0 && <p>No bookings found.</p>}
              {bookings.map((booking) => (
                <div key={booking.id} className={`item-card ${booking.status}`}>
                  <div>
                    <h4>{booking.schedule_route}</h4>
                    <p>User: {booking.user_username}</p>
                    <p>Seat: {booking.seat_number}</p>
                    <p>Status: {booking.status}</p>
                    <p>Booked At: {new Date(booking.booked_at).toLocaleString()}</p>
                  </div>
                  <div className="card-actions">
                    <button className="btn-secondary" onClick={() => startBookingEdit(booking)}>
                      Edit
                    </button>
                    <button className="btn-danger" onClick={() => handleDelete('bookings', booking.id)}>
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default AdminDashboard;
