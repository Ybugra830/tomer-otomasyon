from django.db import models
from django.contrib.auth.models import AbstractUser
from django.db.models.signals import post_save
from django.dispatch import receiver
import uuid

class CustomUser(AbstractUser):
    USER_TYPE_CHOICES = [
        ('ADMIN', 'Admin'),
        ('INSTRUCTOR', 'Instructor'),
        ('STUDENT', 'Student'),
    ]
    user_type = models.CharField(max_length=20, choices=USER_TYPE_CHOICES, default='STUDENT')
    is_first_login = models.BooleanField(default=True)

    def __str__(self):
        # first_name ve last_name boş ise username döner
        full_name = f"{self.first_name} {self.last_name}".strip()
        return full_name if full_name else self.username

class StudentProfile(models.Model):
    APPLICATION_TYPE_CHOICES = [
        ('KURS', 'Kurs'),
        ('SINAV', 'Sınav'),
    ]
    EDUCATION_MODE_CHOICES = [
        ('YUZ_YUZE', 'Yüz Yüze'),
        ('CEVRIM_ICI', 'Çevrim İçi'),
    ]
    LEVEL_CHOICES = [
        ('A1', 'A1'),
        ('A2', 'A2'),
        ('B1', 'B1'),
        ('B2', 'B2'),
        ('C1', 'C1'),
        ('C2', 'C2'),
    ]
    IDENTITY_TYPE_CHOICES = [
        ('TC', 'TC Kimlik'),
        ('PASSPORT', 'Pasaport'),
        ('OTHER', 'Diğer'),
    ]

    user = models.OneToOneField(CustomUser, on_delete=models.CASCADE, related_name='student_profile')
    
    # Başvuru
    application_type = models.CharField(max_length=20, choices=APPLICATION_TYPE_CHOICES, blank=True, null=True)
    education_mode = models.CharField(max_length=20, choices=EDUCATION_MODE_CHOICES, blank=True, null=True)
    language = models.CharField(max_length=50, blank=True, null=True)
    level = models.CharField(max_length=10, choices=LEVEL_CHOICES, blank=True, null=True)
    branch = models.CharField(max_length=100, blank=True, null=True)

    # Kişisel
    identity_type = models.CharField(max_length=20, choices=IDENTITY_TYPE_CHOICES, blank=True, null=True)
    nationality = models.CharField(max_length=50, blank=True, null=True)
    identity_no = models.CharField(max_length=50, unique=True, blank=True, null=True)
    father_name = models.CharField(max_length=50, blank=True, null=True)
    mother_name = models.CharField(max_length=50, blank=True, null=True)
    place_of_birth = models.CharField(max_length=100, blank=True, null=True)
    date_of_birth = models.DateField(blank=True, null=True)

    # İletişim
    phone = models.CharField(max_length=20, blank=True, null=True)
    phone_secondary = models.CharField(max_length=20, blank=True, null=True)
    email_address = models.EmailField(blank=True, null=True)

    # Dosya ve Ekstra
    additional_notes = models.TextField(blank=True, null=True)
    discount_status = models.CharField(max_length=100, blank=True, null=True)
    identity_document = models.FileField(upload_to='kimlik_dosyalari/', blank=True, null=True)
    discount_document = models.FileField(upload_to='indirim_belgeleri/', blank=True, null=True)
    is_approved = models.BooleanField(default=False)

    def __str__(self):
        return f"{self.user.first_name} {self.user.last_name} - Öğrenci Profili".strip()

class InstructorProfile(models.Model):
    DEPARTMENT_CHOICES = [
        ('turkce', 'Türkçe Öğretimi (TÖMER)'),
        ('ingilizce', 'İngilizce Hazırlık Koordinatörlüğü'),
        ('almanca', 'Almanca Hazırlık Koordinatörlüğü'),
        ('diger', 'Diğer')
    ]

    user = models.OneToOneField(CustomUser, on_delete=models.CASCADE, related_name='instructor_profile')
    sicil_no = models.CharField(max_length=50, unique=True)
    department = models.CharField(max_length=50, choices=DEPARTMENT_CHOICES)

    def __str__(self):
        return f"{self.user.first_name} {self.user.last_name} - Eğitmen Profili".strip()


# ==============================================================================
# SİNYALLER (SIGNALS) - OTOMATİK PROFİL OLUŞTURMA
# ==============================================================================
@receiver(post_save, sender=CustomUser)
def create_user_profile(sender, instance, created, **kwargs):
    if created:
        try:
            if instance.user_type == 'STUDENT':
                # get_or_create kullanarak mükerrer kayıt hatasını önlüyoruz
                # defaults kısmında identity_no (önceki tc_pasaport_no) gibi benzersiz alanları UUID ile tamamen benzersiz yapıyoruz
                unique_suffix = uuid.uuid4().hex[:8]
                StudentProfile.objects.get_or_create(
                    user=instance,
                    defaults={
                        'identity_no': f"GECICI_{unique_suffix}",
                        'application_type': 'KURS',
                        'education_mode': 'YUZ_YUZE',
                        'language': 'Belirtilmedi',
                        'level': 'A1',
                        'identity_type': 'OTHER',
                        'nationality': 'Belirtilmedi',
                        'father_name': '-',
                        'mother_name': '-',
                        'place_of_birth': '-',
                        'date_of_birth': '1900-01-01',
                        'phone': '-',
                        'email_address': instance.email or f"{unique_suffix}@example.com"
                    }
                )
            elif instance.user_type == 'INSTRUCTOR':
                unique_suffix = uuid.uuid4().hex[:8]
                InstructorProfile.objects.get_or_create(
                    user=instance,
                    defaults={
                        'sicil_no': f"SICIL_{unique_suffix}",
                        'department': 'OTHER'
                    }
                )
        except Exception as e:
            # Hata çıksa bile sadece terminale bas, asla 'raise' edip ana CustomUser kaydını bozma!
            print(f"!!! PROFIL OLUŞTURULURKEN HATA ÇIKTI AMA KAYIT DEVAM EDİYOR: {e}")

@receiver(post_save, sender=CustomUser)
def save_user_profile(sender, instance, **kwargs):
    try:
        if instance.user_type == 'STUDENT' and hasattr(instance, 'student_profile'):
            instance.student_profile.save()
        elif instance.user_type == 'INSTRUCTOR' and hasattr(instance, 'instructor_profile'):
            instance.instructor_profile.save()
    except Exception as e:
        pass