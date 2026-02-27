from django.shortcuts import render
from rest_framework.decorators import api_view, action, permission_classes
from rest_framework.response import Response
from .models import Route, Bus, Schedule, Booking
from .Serializers import (
    RouteSerializer,
    BookingSerializer,
    BusSerializer,
    ScheduleSerializer,
    RegisterSerializer,
    LoginSerializer,
    UserSerializer,
)
from rest_framework import generics, viewsets, permissions, serializers
from rest_framework.permissions import AllowAny, IsAuthenticated
from django.contrib.auth.models import User
from rest_framework.authtoken.models import Token
from django.contrib.auth import authenticate
from .permissions import IsAdminOrReadOnly
from django.utils import timezone
# Create your views here.
class RouteViewSet(viewsets.ModelViewSet):
    queryset = Route.objects.all()
    serializer_class = RouteSerializer
    permission_classes = [IsAdminOrReadOnly]

class BusViewSet(viewsets.ModelViewSet):
    queryset = Bus.objects.all()
    serializer_class = BusSerializer
    permission_classes = [IsAdminOrReadOnly]

class BookingViewSet(viewsets.ModelViewSet):
    queryset = Booking.objects.all()
    serializer_class = BookingSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if user.is_staff:
            return Booking.objects.all()
        return Booking.objects.filter(user=user)

    def perform_create(self, serializer):
        booking_user = self.request.user

        if self.request.user.is_staff:
            selected_user_id = self.request.data.get('user')
            new_username = self.request.data.get('new_username')
            new_password = self.request.data.get('new_password')
            new_email = self.request.data.get('new_email', '')

            if selected_user_id:
                try:
                    booking_user = User.objects.get(pk=selected_user_id)
                except User.DoesNotExist:
                    raise serializers.ValidationError({"user": "Selected user does not exist"})
            elif new_username and new_password:
                if User.objects.filter(username=new_username).exists():
                    raise serializers.ValidationError(
                        {"new_username": "Username already exists. Select that user from the list."}
                    )
                booking_user = User.objects.create_user(
                    username=new_username,
                    email=new_email,
                    password=new_password,
                )
            else:
                raise serializers.ValidationError(
                    {"detail": "Select an existing user or provide new_username and new_password."}
                )

        serializer.save(user=booking_user)
    
    def update(self, request, *args, **kwargs):
        # Only admins can edit bookings (change seat)
        if not request.user.is_staff:
            return Response({"detail": "You cannot edit bookings. Only cancel them."}, status=403)
        return super().update(request, *args, **kwargs)
    
    def destroy(self, request, *args, **kwargs):
        booking = self.get_object()

        # Admins perform a hard delete
        if request.user.is_staff:
            return super().destroy(request, *args, **kwargs)

        # Non-admins may only cancel their own bookings
        if booking.user != request.user:
            return Response({"detail": "You can only cancel your own bookings."}, status=403)

        # Mark as cancelled for regular users (soft-cancel)
        if booking.status == 'cancelled':
            return Response({"detail": "Booking is already cancelled"}, status=400)

        booking.status = 'cancelled'
        booking.cancelled_at = timezone.now()
        booking.save()

        return Response({"detail": "Booking cancelled successfully"}, status=200)


class ScheduleViewSet(viewsets.ModelViewSet):
    queryset = Schedule.objects.all()
    serializer_class = ScheduleSerializer
    permission_classes = [IsAdminOrReadOnly]

    def perform_create(self, serializer):
        bus = serializer.validated_data.get('bus')
        serializer.save(available_seats=bus.total_seats)

    @action(detail=True, methods=['get'], permission_classes=[AllowAny])
    def available_seats(self, request, pk=None):
        schedule = self.get_object()
        booked_seats = Booking.objects.filter(schedule=schedule, status='confirmed').values_list('seat_number', flat=True)
        all_seats = [i for i in range(1, schedule.bus.total_seats + 1)]
        available = [seat for seat in all_seats if seat not in booked_seats]
        return Response({'available_seats': available})


class UserViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = User.objects.all().order_by('username')
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAdminUser]


class RegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    permission_classes = (AllowAny,)
    serializer_class = RegisterSerializer

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        token, created = Token.objects.get_or_create(user=user)
        return Response({"token": token.key, "user_id": user.id, "username": user.username}, status=201)

class LoginView(generics.GenericAPIView):
    permission_classes = (AllowAny,)
    serializer_class = LoginSerializer

    def post(self, request):
        serializer = self.get_serializer(data=request.data)
        if serializer.is_valid():
            username = serializer.validated_data.get('username')
            password = serializer.validated_data.get('password')
            user = authenticate(username=username, password=password)
            if user:
                token, created = Token.objects.get_or_create(user=user)
                return Response({
                    "token": token.key,
                    "user_id": user.id,
                    "username": user.username,
                    "is_staff": user.is_staff,
                })
            else:
                return Response({"error": "Invalid Credentials"}, status=400)
        return Response(serializer.errors, status=400)


class LogoutView(generics.GenericAPIView):
    permission_classes = (IsAuthenticated,)

    def post(self, request):
        Token.objects.filter(user=request.user).delete()
        return Response({"detail": "Logged out"})

@api_view(['GET','POST'])
def route_list(request):
    routes = Route.objects.all()
    serializer = RouteSerializer(routes, many=True)
    return Response(serializer.data)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def book_ticket(request):
    serializer = BookingSerializer(data=request.data)
    if serializer.is_valid():
        serializer.save(user=request.user)
        return Response(serializer.data)
    return Response(serializer.errors, status=400)

@api_view(['GET'])
def available_seats(request, schedule_id):
    try:
        schedule = Schedule.objects.get(id=schedule_id)
    except Schedule.DoesNotExist:
        return Response({"error": "Schedule not found"}, status=404)

    booked_seats = Booking.objects.filter(schedule=schedule, status='confirmed').values_list('seat_number', flat=True)
    all_seats = [i for i in range(1, schedule.bus.total_seats + 1)]
    available = [seat for seat in all_seats if seat not in booked_seats]
    return Response({'available_seats': available})

