from django.urls import path
from .views import StudentLoginView, InstructorLoginView, StudentRegisterView, StudentProfileDetailView, StudentProfileUpdateView

urlpatterns = [
    path('login/student/', StudentLoginView.as_view(), name='student-login'),
    path('login/instructor/', InstructorLoginView.as_view(), name='instructor-login'),
    path('register/student/', StudentRegisterView.as_view(), name='student-register'),
    path('profile/', StudentProfileDetailView.as_view(), name='student-profile'),
    path('profile/update/', StudentProfileUpdateView.as_view(), name='student-profile-update'),
]
