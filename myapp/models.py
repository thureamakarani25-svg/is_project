from django.db import models
from django.contrib.auth.models import User

# Create your models here.
class Route(models.Model):
    from_location = models.CharField(max_length=100)
    to_location = models.CharField(max_length=100)
    distance = models.FloatField()
    def __str__(self):
        return f"{self.from_location} to {self.to_location}"
    
class Bus(models.Model):
    bus_number = models.CharField(max_length=50)
    bus_name = models.CharField(max_length=100)
    total_seats = models.IntegerField()
    def __str__(self):
        return self.bus_number

class Schedule(models.Model):
    route = models.ForeignKey(Route, on_delete=models.CASCADE)
    bus = models.ForeignKey(Bus, on_delete=models.CASCADE)
    departure_time = models.DateTimeField()
    price = models.DecimalField(max_digits=10, decimal_places=2  )
    available_seats = models.IntegerField()
    def __str__(self):
        return f"{self.route} - {self.departure_time}"
     


class Booking(models.Model):
    BOOKING_STATUS_CHOICES = [
        ('confirmed', 'Confirmed'),
        ('cancelled', 'Cancelled'),
    ]
    
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    schedule = models.ForeignKey(Schedule, on_delete=models.CASCADE)
    seat_number = models.IntegerField() 
    booked_at = models.DateTimeField(auto_now_add=True)
    status = models.CharField(max_length=20, choices=BOOKING_STATUS_CHOICES, default='confirmed')
    cancelled_at = models.DateTimeField(null=True, blank=True)
    
    def __str__(self):
        return f"{self.user.username} - {self.schedule} - {self.status}"