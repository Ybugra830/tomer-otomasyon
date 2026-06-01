from django.urls import path
from .views import (
    CourseMaterialListView, StudentNoteView,
    InstructorMaterialUploadView, InstructorArchiveView, InstructorStudentListView
)

urlpatterns = [
    path('materials/', CourseMaterialListView.as_view(), name='material-list'),
    path('notes/', StudentNoteView.as_view(), name='student-notes'),
    path('instructor/upload/', InstructorMaterialUploadView.as_view(), name='instructor-upload'),
    path('instructor/archive/', InstructorArchiveView.as_view(), name='instructor-archive'),
    path('instructor/students/', InstructorStudentListView.as_view(), name='instructor-students'),
]
