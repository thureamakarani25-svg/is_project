const STORAGE_KEY = "routesData";

const defaultRoutes = [
  {
    id: "r1",
    from: "Dar es Salaam",
    to: "Dodoma",
    busName: "Thurea Express",
    busNumber: "T123 ABC",
    schedule: "08:00 AM",
    price: 35000,
    seats: Array.from({ length: 10 }).map((_, i) => ({
      id: `r1-s${i + 1}`,
      number: `A${i + 1}`,
      booked: false,
    })),
  },
  {
    id: "r2",
    from: "Arusha",
    to: "Moshi",
    busName: "Kilimanjaro Line",
    busNumber: "T987 XYZ",
    schedule: "02:30 PM",
    price: 15000,
    seats: Array.from({ length: 8 }).map((_, i) => ({
      id: `r2-s${i + 1}`,
      number: `B${i + 1}`,
      booked: false,
    })),
  },
];

export const loadRoutes = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultRoutes;
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : defaultRoutes;
  } catch {
    return defaultRoutes;
  }
};

export const saveRoutes = (routes) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(routes));
};

export const buildSeats = (routeId, count) => {
  const total = Number.isFinite(count) && count > 0 ? count : 10;
  return Array.from({ length: total }).map((_, i) => ({
    id: `${routeId}-s${i + 1}`,
    number: `S${i + 1}`,
    booked: false,
  }));
};
