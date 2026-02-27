import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'ticketsystemproject.settings')
django.setup()

from django.contrib.auth.models import User
from myapp.models import Route, Bus, Schedule
from datetime import datetime, timedelta

# Create admin user if doesn't exist
admin_user, created = User.objects.get_or_create(
    username='admin',
    defaults={'email': 'admin@bus.com', 'is_staff': True, 'is_superuser': True}
)
if created:
    admin_user.set_password('admin123')
    admin_user.save()
    print("✓ Admin user created: admin / admin123")
else:
    print("✓ Admin user already exists")

# Create regular user if doesn't exist
regular_user, created = User.objects.get_or_create(
    username='john',
    defaults={'email': 'john@example.com'}
)
if created:
    regular_user.set_password('john123')
    regular_user.save()
    print("✓ Regular user created: john / john123")
else:
    print("✓ Regular user already exists")

# Create routes
routes_data = [
    {'from_location': 'Dar es Salaam', 'to_location': 'Morogoro', 'distance': 200},
    {'from_location': 'Dar es Salaam', 'to_location': 'Iringa', 'distance': 500},
    {'from_location': 'Dar es Salaam', 'to_location': 'Arusha', 'distance': 640},
    {'from_location': 'Mbeya', 'to_location': 'Iringa', 'distance': 300},
]

routes = {}
for route_data in routes_data:
    route, created = Route.objects.get_or_create(**route_data)
    routes[f"{route_data['from_location']}-{route_data['to_location']}"] = route
    if created:
        print(f"✓ Route created: {route_data['from_location']} → {route_data['to_location']}")

# Create buses
buses_data = [
    {'bus_number': 'BUS-001', 'bus_name': 'Express Deluxe', 'total_seats': 48},
    {'bus_number': 'BUS-002', 'bus_name': 'Safari Comfort', 'total_seats': 40},
    {'bus_number': 'BUS-003', 'bus_name': 'Premier Class', 'total_seats': 32},
]

buses = {}
for bus_data in buses_data:
    bus, created = Bus.objects.get_or_create(**bus_data)
    buses[bus_data['bus_number']] = bus
    if created:
        print(f"✓ Bus created: {bus_data['bus_number']} ({bus_data['bus_name']}, {bus_data['total_seats']} seats)")

# Create schedules
now = datetime.now()
schedules_data = [
    {
        'route': routes['Dar es Salaam-Morogoro'],
        'bus': buses['BUS-001'],
        'departure_time': now + timedelta(hours=2),
        'price': 15000,
        'available_seats': 48
    },
    {
        'route': routes['Dar es Salaam-Iringa'],
        'bus': buses['BUS-002'],
        'departure_time': now + timedelta(hours=5),
        'price': 35000,
        'available_seats': 40
    },
    {
        'route': routes['Dar es Salaam-Arusha'],
        'bus': buses['BUS-003'],
        'departure_time': now + timedelta(hours=8),
        'price': 45000,
        'available_seats': 32
    },
    {
        'route': routes['Mbeya-Iringa'],
        'bus': buses['BUS-001'],
        'departure_time': now + timedelta(hours=12),
        'price': 20000,
        'available_seats': 48
    },
    {
        'route': routes['Dar es Salaam-Morogoro'],
        'bus': buses['BUS-002'],
        'departure_time': now + timedelta(days=1),
        'price': 15000,
        'available_seats': 40
    },
]

schedule_count = 0
for schedule_data in schedules_data:
    schedule, created = Schedule.objects.get_or_create(**schedule_data)
    if created:
        schedule_count += 1
        route = schedule_data['route']
        bus = schedule_data['bus']
        departure = schedule_data['departure_time'].strftime('%Y-%m-%d %H:%M')
        print(f"✓ Schedule created: {route.from_location} → {route.to_location} ({bus.bus_name}) @ {departure} - TZS {schedule_data['price']}")

if schedule_count == 0:
    print("✓ Schedules already exist")

print("\n✅ Test data ready!")
print("\nLogin credentials:")
print("  Admin: admin / admin123")
print("  User:  john / john123")
