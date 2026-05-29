from rest_framework import serializers
from accounts.models import CustomUser, StudentProfile

class StudentProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = StudentProfile
        fields = [
            'id', 'application_type', 'education_mode', 'language', 'level', 'branch',
            'identity_type', 'nationality', 'identity_no', 'father_name', 'mother_name',
            'place_of_birth', 'date_of_birth', 'phone', 'phone_secondary', 'email_address',
            'additional_notes', 'discount_status', 'is_approved'
        ]

class StudentUserSerializer(serializers.ModelSerializer):
    profile = StudentProfileSerializer(source='student_profile', read_only=True)

    class Meta:
        model = CustomUser
        fields = ['id', 'username', 'first_name', 'last_name', 'email', 'user_type', 'is_first_login', 'profile']
