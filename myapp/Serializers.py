from rest_framework import serializers
from .models import Route, Booking, Bus, Schedule
from django.contrib.auth.models import User
from django.contrib.auth.password_validation import validate_password


class RouteSerializer(serializers.ModelSerializer):
    class Meta:
        model = Route
        fields = '__all__'


class BusSerializer(serializers.ModelSerializer):
    class Meta:
        model = Bus
        fields = '__all__'


class ScheduleSerializer(serializers.ModelSerializer):
    route_details = RouteSerializer(source='route', read_only=True)
    bus_number = serializers.CharField(source='bus.bus_number', read_only=True)
    bus_name = serializers.CharField(source='bus.bus_name', read_only=True)
    bus_total_seats = serializers.IntegerField(source='bus.total_seats', read_only=True)
    available_seats = serializers.SerializerMethodField(read_only=True)

    class Meta:
        model = Schedule
        fields = ['id', 'route', 'route_details', 'bus', 'bus_number', 'bus_name', 'bus_total_seats', 'departure_time', 'price', 'available_seats']

    def get_available_seats(self, obj):
        confirmed_bookings = Booking.objects.filter(schedule=obj, status='confirmed').count()
        return obj.bus.total_seats - confirmed_bookings


class BookingSerializer(serializers.ModelSerializer):
    user_username = serializers.CharField(source='user.username', read_only=True)
    schedule_route = serializers.SerializerMethodField(read_only=True)

    class Meta:
        model = Booking
        fields = ['id', 'user', 'user_username', 'schedule', 'schedule_route', 'seat_number', 'booked_at', 'status', 'cancelled_at']
        read_only_fields = ['booked_at', 'cancelled_at']
        extra_kwargs = {
            'user': {'required': False},
        }

    def get_schedule_route(self, obj):
        return f"{obj.schedule.route.from_location} → {obj.schedule.route.to_location}"

    def validate(self, data):
        instance = getattr(self, 'instance', None)
        schedule = data.get('schedule') or (instance.schedule if instance else None)
        seat_number = data.get('seat_number') or (instance.seat_number if instance else None)

        if schedule is None or seat_number is None:
            raise serializers.ValidationError("Schedule and seat number are required")

        existing_booking = Booking.objects.filter(schedule=schedule, seat_number=seat_number, status='confirmed')
        if instance:
            existing_booking = existing_booking.exclude(pk=instance.pk)

        if existing_booking.exists():
            raise serializers.ValidationError(f"Seat {seat_number} is already booked")
        if seat_number < 1 or seat_number > schedule.bus.total_seats:
            raise serializers.ValidationError(f"Seat number must be between 1 and {schedule.bus.total_seats}")
        return data
        


class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, required=True, validators=[validate_password])
    password2 = serializers.CharField(write_only=True, required=True)

    class Meta:
        model = User
        fields = ['username', 'email', 'password', 'password2']

    def validate(self, attrs):
        if attrs.get('password') != attrs.get('password2'):
            raise serializers.ValidationError({"password": "password fields didn't match."})
        return attrs

    def create(self, validated_data):
        username = validated_data.get('username')
        email = validated_data.get('email')
        password = validated_data.get('password')
        user = User.objects.create(username=username, email=email)
        user.set_password(password)
        user.save()
        return user


class LoginSerializer(serializers.Serializer):
    username = serializers.CharField(required=True)
    password = serializers.CharField(required=True, write_only=True)

    def validate(self, attrs):
        username = attrs.get('username')
        password = attrs.get('password')

        if not username or not password:
            raise serializers.ValidationError("Username and password are required.")

        return attrs


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'is_staff']
