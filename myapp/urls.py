from django.urls import path
from . import views
from .views import RegisterView, LoginView, LogoutView
from rest_framework.routers import DefaultRouter
from .views import RouteViewSet, BusViewSet, ScheduleViewSet, BookingViewSet, UserViewSet


urlpatterns = [
    path('book/', views.book_ticket, name='book-ticket'),
    path('register/', RegisterView.as_view(), name='register'),
    path('login/', LoginView.as_view(), name='login'),
    path('logout/', LogoutView.as_view(), name='logout'),

    path('available-seats/<int:pk>/', ScheduleViewSet.as_view({'get': 'available_seats'}), name='available-seats'),
]

router =   DefaultRouter()
router.register(r'routes', RouteViewSet)
router.register(r'buses', BusViewSet)
router.register(r'schedules', ScheduleViewSet)
router.register(r'bookings', BookingViewSet)
router.register(r'users', UserViewSet)

urlpatterns += router.urls
