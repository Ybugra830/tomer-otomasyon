from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from .models import Announcement
from django.db.models import Q
from accounts.models import InstructorProfile

# education.views içerisinden ilgili yardımcı fonksiyonların alınması
from education.views import LANGUAGE_ALIASES, _normalize_language, _get_student_language

class InstructorAnnouncementView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        if not user.user_type or str(user.user_type).strip().upper() != 'INSTRUCTOR':
            return Response({'error': 'Yetkiniz yok.'}, status=status.HTTP_403_FORBIDDEN)
        
        announcements = Announcement.objects.filter(instructor=user).order_by('-created_at')
        data = []
        for ann in announcements:
            data.append({
                'id': ann.id,
                'title': ann.title,
                'content': ann.content,
                'created_at': ann.created_at.strftime("%d %B %Y - %H:%M")
            })
        return Response(data, status=status.HTTP_200_OK)

    def post(self, request):
        user = request.user
        if not user.user_type or str(user.user_type).strip().upper() != 'INSTRUCTOR':
            return Response({'error': 'Yetkiniz yok.'}, status=status.HTTP_403_FORBIDDEN)
        
        title = request.data.get('title', '').strip()
        content = request.data.get('content', '').strip()

        if not title or not content:
            return Response({'error': 'Başlık ve içerik zorunludur.'}, status=status.HTTP_400_BAD_REQUEST)
        
        announcement = Announcement.objects.create(
            instructor=user,
            title=title,
            content=content
        )

        return Response({
            'message': 'Duyuru başarıyla oluşturuldu.',
            'id': announcement.id,
            'title': announcement.title,
            'content': announcement.content,
            'created_at': announcement.created_at.strftime("%d %B %Y - %H:%M")
        }, status=status.HTTP_201_CREATED)


class StudentAnnouncementView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        if not user.user_type or str(user.user_type).strip().upper() != 'STUDENT':
            return Response({'error': 'Yetkiniz yok.'}, status=status.HTTP_403_FORBIDDEN)
        
        student_canonical_lang = _get_student_language(user)
        if not student_canonical_lang:
            return Response({'error': 'Dil bilginiz bulunamadı.'}, status=status.HTTP_404_NOT_FOUND)

        # Öğrencinin diline denk gelen tüm varyasyonları araştırmak
        aliases = LANGUAGE_ALIASES.get(student_canonical_lang, [student_canonical_lang])
        q = Q()
        for alias in aliases:
            q |= Q(department__icontains=alias)
            
        matching_instructor_ids = InstructorProfile.objects.filter(q).values_list('user_id', flat=True)
        
        announcements = Announcement.objects.filter(
            instructor_id__in=matching_instructor_ids
        ).select_related('instructor').order_by('-created_at')

        data = []
        for ann in announcements:
            instructor_name = f"{ann.instructor.first_name} {ann.instructor.last_name}"
            data.append({
                'id': ann.id,
                'title': ann.title,
                'content': ann.content,
                'instructor_name': instructor_name,
                'created_at': ann.created_at.strftime("%d %B %Y - %H:%M")
            })
        return Response(data, status=status.HTTP_200_OK)


class StudentNotificationCountView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        if not user.user_type or str(user.user_type).strip().upper() != 'STUDENT':
            return Response({'error': 'Yetkiniz yok.'}, status=status.HTTP_403_FORBIDDEN)
        
        student_canonical_lang = _get_student_language(user)
        if not student_canonical_lang:
            return Response({'total_count': 0, 'latest_id': 0}, status=status.HTTP_200_OK)

        aliases = LANGUAGE_ALIASES.get(student_canonical_lang, [student_canonical_lang])
        q = Q()
        for alias in aliases:
            q |= Q(department__icontains=alias)
            
        matching_instructor_ids = InstructorProfile.objects.filter(q).values_list('user_id', flat=True)
        
        announcements = Announcement.objects.filter(instructor_id__in=matching_instructor_ids).order_by('-created_at')
        total_count = announcements.count()
        latest_id = announcements.first().id if total_count > 0 else 0

        return Response({'total_count': total_count, 'latest_id': latest_id}, status=status.HTTP_200_OK)
