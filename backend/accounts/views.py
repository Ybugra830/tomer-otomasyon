from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.parsers import JSONParser, MultiPartParser, FormParser
from django.contrib.auth import authenticate
from django.db import IntegrityError
from rest_framework_simplejwt.tokens import RefreshToken
from accounts.models import CustomUser, InstructorProfile, StudentProfile

class StudentProfileDetailView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        try:
            profile = StudentProfile.objects.filter(user=user).first()

            data = {
                'adSoyad': f"{user.first_name} {user.last_name}".strip() or user.username,
                'tcNo': user.username,
                'email': user.email or '',
                'kayitTarihi': user.date_joined.strftime('%d.%m.%Y') if user.date_joined else '-',
                'basvuruTipi': 'Kurs / Sınav',
                'tahminiSeviye': 'A1',
                # Profil detayları (2. aşama)
                'father_name': '',
                'mother_name': '',
                'place_of_birth': '',
                'date_of_birth': '',
                'nationality': '',
                'phone': '',
                'identity_type': '',
                'identity_no': '',
                'identity_document_url': None,
                'discount_document_url': None,
                'is_profile_complete': False,
            }

            if profile:
                data['language'] = profile.language or ''
                data['tahminiSeviye'] = profile.level or 'A1'
                
                # Check if student has actual exam results (stamped definite level)
                from exams.models import StudentExamResult
                has_result = StudentExamResult.objects.filter(user=user).exists()
                if has_result:
                    data['kesinSeviye'] = profile.level
                else:
                    data['kesinSeviye'] = None
                    
                data['basvuruTipi'] = profile.get_application_type_display() if profile.application_type else 'Kurs / Sınav'
                data['father_name'] = profile.father_name or ''
                data['mother_name'] = profile.mother_name or ''
                data['place_of_birth'] = profile.place_of_birth or ''
                data['date_of_birth'] = str(profile.date_of_birth) if profile.date_of_birth else ''
                data['nationality'] = profile.nationality or ''
                data['phone'] = profile.phone or ''
                data['identity_type'] = profile.identity_type or ''
                data['identity_no'] = profile.identity_no or ''
                data['email'] = profile.email_address or user.email or ''
                if profile.identity_document and profile.identity_document.name:
                    data['identity_document_url'] = request.build_absolute_uri(profile.identity_document.url)
                if profile.discount_document and profile.discount_document.name:
                    data['discount_document_url'] = request.build_absolute_uri(profile.discount_document.url)

                # Profil tamamlanma kontrolü
                required = [profile.father_name, profile.mother_name, profile.place_of_birth]
                data['is_profile_complete'] = all(f and f not in ['-', '', 'Belirtilmedi'] for f in required)

            return Response(data)

        except Exception as e:
            print("=== BACKEND HATASI ===")
            print(e)
            return Response({'error': str(e)}, status=500)

class StudentLoginView(APIView):
    def post(self, request):
        tc_pasaport_no = request.data.get('tc_pasaport_no')
        password = request.data.get('password')

        # ModelBackend varsayılan olarak is_active=False olanları reddeder.
        # Bu yüzden manuel kontrol yapıyoruz.
        user = CustomUser.objects.filter(username=tc_pasaport_no).first()
        
        if user and user.check_password(password) and user.user_type == 'STUDENT':
            
            # Şimdilik eski kullanıcıları etkilememesi için sabit False dönüyoruz
            is_profile_complete = False

            refresh = RefreshToken.for_user(user)
            return Response({
                'access': str(refresh.access_token),
                'refresh': str(refresh),
                'is_profile_complete': is_profile_complete,
                'is_active': user.is_active,
                'user': {
                    'ad': user.first_name,
                    'soyad': user.last_name,
                    'user_type': user.user_type
                }
            }, status=status.HTTP_200_OK)
            
        else:
            return Response({
                'detail': "Kimlik numarası veya şifre hatalı.",
                'error': "Kimlik numarası veya şifre hatalı."
            }, status=status.HTTP_401_UNAUTHORIZED)


from rest_framework.permissions import IsAuthenticated, AllowAny

class StudentRegisterView(APIView):
    permission_classes = [AllowAny]
    parser_classes = [JSONParser, MultiPartParser, FormParser]

    def post(self, request):
        data = request.data

        # --- Gerekli alan kontrolleri ---
        identity_no = data.get('identityNo', '').strip()
        first_name = data.get('firstName', '').strip()
        last_name = data.get('lastName', '').strip()
        email = data.get('email', '').strip()

        password = data.get('password', '').strip()
        phone = data.get('phone', '').strip()

        if not identity_no or not first_name or not last_name or not password:
            return Response({
                'detail': "TC/Pasaport No, Ad, Soyad ve Şifre alanları zorunludur.",
                'error': "TC/Pasaport No, Ad, Soyad ve Şifre alanları zorunludur."
            }, status=status.HTTP_400_BAD_REQUEST)

        # --- Adım A: CustomUser Oluşturma ---
        try:
            user = CustomUser(
                username=identity_no,
                first_name=first_name,
                last_name=last_name,
                email=email,
                user_type='STUDENT',
                is_active=True,  # Anında aktif
            )
            user.set_password(password)
            user.save()
        except IntegrityError:
            return Response({
                'detail': "Bu kimlik numarası ile daha önce kayıt oluşturulmuş.",
                'error': "Bu kimlik numarası ile daha önce kayıt oluşturulmuş."
            }, status=status.HTTP_400_BAD_REQUEST)

        try:
            profile, created = StudentProfile.objects.get_or_create(user=user)
            profile.language = data.get('language', 'Türkçe')
            profile.level = data.get('level', 'A1')
            profile.identity_no = identity_no
            profile.phone = phone
            profile.email_address = email
            profile.is_approved = True  # Otomatik onaylandı
            
            if request.FILES.get('identify_document'):
                profile.identity_document = request.FILES['identify_document']
                
            profile.save()
        except Exception as e:
            # Profil oluşturulamazsa kullanıcıyı da sil (tutarlılık için)
            user.delete()
            return Response({
                'detail': f"Profil oluşturulurken bir hata oluştu: {str(e)}",
                'error': f"Profil oluşturulurken bir hata oluştu: {str(e)}"
            }, status=status.HTTP_400_BAD_REQUEST)

        return Response({
            'detail': "Kaydınız başarıyla tamamlandı. Sisteme giriş yapabilirsiniz.",
            'message': "Kaydınız başarıyla tamamlandı. Sisteme giriş yapabilirsiniz."
        }, status=status.HTTP_201_CREATED)


class StudentProfileUpdateView(APIView):
    """Öğrenci, eksik profil bilgilerini tamamlamak için bu endpoint'i kullanır."""
    permission_classes = [IsAuthenticated]
    parser_classes = [JSONParser, MultiPartParser, FormParser]

    def post(self, request):
        user = request.user
        data = request.data

        try:
            profile = StudentProfile.objects.get(user=user)
        except StudentProfile.DoesNotExist:
            return Response({'error': 'Profil bulunamadı.'}, status=status.HTTP_404_NOT_FOUND)

        # Metin alanlarını güncelle
        text_fields = [
            'father_name', 'mother_name', 'place_of_birth',
            'nationality', 'phone', 'phone_secondary',
            'email_address', 'identity_type', 'identity_no'
        ]
        for field in text_fields:
            val = data.get(field)
            if val is not None:
                setattr(profile, field, val)

        # Tarih alanı
        dob = data.get('date_of_birth')
        if dob and dob not in ['', 'null', 'undefined']:
            profile.date_of_birth = dob

        # Dosya alanları
        if request.FILES.get('identity_document'):
            profile.identity_document = request.FILES['identity_document']
        if request.FILES.get('discount_document'):
            profile.discount_document = request.FILES['discount_document']

        profile.save()

        # Kayıt başarıyla tamamlandıktan sonra kullanıcıyı anında aktif et!
        user.is_active = True
        user.save()

        return Response({
            'message': 'Profiliniz başarıyla güncellendi.',
            'detail': 'Profiliniz başarıyla güncellendi.'
        }, status=status.HTTP_200_OK)


class InstructorLoginView(APIView):
    def post(self, request):
        username_input = request.data.get('username')
        password = request.data.get('password')

        user = None
        if username_input:
            if '@' in username_input:
                try:
                    user = CustomUser.objects.get(email=username_input, user_type='INSTRUCTOR')
                except CustomUser.DoesNotExist:
                    pass
            else:
                try:
                    profile = InstructorProfile.objects.get(sicil_no=username_input)
                    user = profile.user
                except InstructorProfile.DoesNotExist:
                    try:
                        user = CustomUser.objects.get(username=username_input, user_type='INSTRUCTOR')
                    except CustomUser.DoesNotExist:
                        pass

        if user and user.user_type == 'INSTRUCTOR':
            # KRİTİK GEÇİŞ: Eğer ilk girişiyse ve default şifreyi yazdıysa kapıyı aç!
            if user.is_first_login and password == 'tomer':
                refresh = RefreshToken.for_user(user)
                return Response({
                    'access': str(refresh.access_token),
                    'refresh': str(refresh),
                    'is_first_login': True,
                    'user': {
                        'ad': user.first_name,
                        'soyad': user.last_name,
                        'user_type': user.user_type,
                        'department': getattr(user, 'instructor_profile', None).department if hasattr(user, 'instructor_profile') else ''
                    }
                }, status=status.HTTP_200_OK)
            elif user.check_password(password):
                refresh = RefreshToken.for_user(user)
                return Response({
                    'access': str(refresh.access_token),
                    'refresh': str(refresh),
                    'is_first_login': user.is_first_login,
                    'user': {
                        'ad': user.first_name,
                        'soyad': user.last_name,
                        'user_type': user.user_type,
                        'department': getattr(user, 'instructor_profile', None).department if hasattr(user, 'instructor_profile') else ''
                    }
                }, status=status.HTTP_200_OK)
            else:
                return Response({
                    'detail': "Kimlik bilgileri veya şifre hatalı.",
                    'error': "Kimlik bilgileri veya şifre hatalı."
                }, status=status.HTTP_401_UNAUTHORIZED)
        else:
            return Response({
                'detail': "Eğitmen bulunamadı veya kimlik bilgileri hatalı.",
                'error': "Eğitmen bulunamadı veya kimlik bilgileri hatalı."
            }, status=status.HTTP_401_UNAUTHORIZED)


class InstructorCreateView(APIView):
    permission_classes = [AllowAny]
    parser_classes = [JSONParser]

    def post(self, request):
        data = request.data

        first_name = data.get('first_name', '').strip()
        last_name = data.get('last_name', '').strip()
        username = data.get('username', '').strip()  # TC Kimlik No
        email = data.get('email', '').strip()
        sicil_no = data.get('sicil_no', '').strip()
        department = data.get('department', '').strip()

        if not all([first_name, last_name, username, email, sicil_no, department]):
            return Response({
                'error': 'Lütfen tüm alanları doldurun.'
            }, status=status.HTTP_400_BAD_REQUEST)

        try:
            # 1. CustomUser Oluştur
            user = CustomUser.objects.create_user(
                username=username,
                email=email,
                password=username,  # Şifre TC Kimlik No
                first_name=first_name,
                last_name=last_name,
                user_type='INSTRUCTOR',
                is_active=True
            )

            # 2. InstructorProfile Güncelle / Oluştur
            # Sinyal zaten InstructorProfile oluşturacak (uuid ile), biz güncelleyeceğiz
            # veya get_or_create ile ele alacağız
            profile, created = InstructorProfile.objects.get_or_create(user=user)
            profile.sicil_no = sicil_no
            profile.department = department
            profile.save()

            return Response({
                'message': f"Eğitmen başarıyla eklendi, varsayılan şifre: {username}"
            }, status=status.HTTP_201_CREATED)

        except IntegrityError:
            return Response({
                'error': 'Bu TC Kimlik No, E-Posta veya Sicil No numarasıyla daha önce kayıt oluşturulmuş.'
            }, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            # Profil oluşturulamazsa kullanıcıyı sil (tutarlılık için)
            if 'user' in locals():
                user.delete()
            return Response({
                'error': f'Eğitmen eklenirken hata oluştu: {str(e)}'
            }, status=status.HTTP_400_BAD_REQUEST)


class InstructorListView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        """
        Sistemdeki tüm eğitmenleri listeler.
        
        MİMARİ KURAL (Student-Instructor Eşleşmesi): 
        Öğrencileri listelemek veya sınav atamak için ileride yazılacak view'larda,
        eğer isteği yapan kişi INSTRUCTOR ise şu filtreleme uygulanmalıdır:
        
        StudentProfile.objects.filter(language=request.user.instructor_profile.department)
        
        Yani departmanı 'ingilizce' olan eğitmen, sadece language='ingilizce' olan öğrencileri görebilir.
        """
        instructors = CustomUser.objects.filter(user_type='INSTRUCTOR').select_related('instructor_profile')
        data = []
        for instructor in instructors:
            try:
                profile = instructor.instructor_profile
                data.append({
                    'id': instructor.id,
                    'first_name': instructor.first_name,
                    'last_name': instructor.last_name,
                    'full_name': f"{instructor.first_name} {instructor.last_name}",
                    'email': instructor.email,
                    'sicil_no': profile.sicil_no,
                    'department': profile.department,
                    'department_display': dict(InstructorProfile.DEPARTMENT_CHOICES).get(profile.department, profile.department),
                    'is_active': instructor.is_active,
                })
            except InstructorProfile.DoesNotExist:
                continue

        return Response(data, status=status.HTTP_200_OK)


class ForcePasswordChangeView(APIView):
    permission_classes = [IsAuthenticated] # İstek atan hocanın token'ı doğrulanmış olmalı

    def post(self, request, *args, **kwargs):
        user = request.user
        new_password = request.data.get('new_password') or request.data.get('password')

        if not new_password:
            return Response({'error': 'Yeni şifre alanı boş bırakılamaz.'}, status=status.HTTP_400_BAD_REQUEST)

        # 1. Şifreyi Django Standartlarına Uygun Hash'le (pbkdf2_sha256)
        user.set_password(new_password)

        # 2. İlk Giriş Bayrağını Kapat
        user.is_first_login = False

        # 3. Veritabanına Kesin Kayıt At
        user.save()

        return Response({
            'success': True,
            'message': 'Şifreniz başarıyla kriptolanarak güncellendi. Artık yeni şifrenizle giriş yapabilirsiniz.'
        }, status=status.HTTP_200_OK)
