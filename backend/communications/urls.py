from django.urls import path
from .views import InstructorAnnouncementView, StudentAnnouncementView, StudentNotificationCountView

urlpatterns = [
    path('instructor/announcements/', InstructorAnnouncementView.as_view(), name='instructor-announcements'),
    path('student/announcements/', StudentAnnouncementView.as_view(), name='student-announcements'),
    path('student/announcements/unread/', StudentNotificationCountView.as_view(), name='student-announcements-unread'),
]
