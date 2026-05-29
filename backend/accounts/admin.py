from django.contrib import admin
from .models import CustomUser, StudentProfile, InstructorProfile

admin.site.register(CustomUser)
admin.site.register(StudentProfile)
admin.site.register(InstructorProfile)
