from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
from django.db import transaction
from .models import (
    Uyruk, Dil, Seviye, Sube, IndirimTuru, SinavTuru,
    Aday, KursYuzYuze, KursCevrimIci, SinavYuzYuze, SinavCevrimIci
)
from django.utils import timezone

# 1. REFERANS VERİLERİ (SADECE OKUMA - GET)

@api_view(['GET'])
def getUyruklar(request):
    return Response(list(Uyruk.objects.values('id', 'ad')))

@api_view(['GET'])
def getDiller(request):
    return Response(list(Dil.objects.values('id', 'ad')))

@api_view(['GET'])
def getSeviyeler(request):
    return Response(list(Seviye.objects.values('id', 'ad')))

@api_view(['GET'])
def getSubeler(request):
    return Response(list(Sube.objects.values('id', 'ad', 'egitim_sekli')))

@api_view(['GET'])
def getIndirimler(request):
    return Response(list(IndirimTuru.objects.values('id', 'ad')))

@api_view(['GET'])
def getSinavTurleri(request):
    return Response(list(SinavTuru.objects.values('id', 'ad')))

# 2. KAYIT İŞLEMLERİ (YAZMA - POST)

@api_view(['POST'])
@transaction.atomic
def process_application(request):
    try:
        data = request.data
        files = request.FILES

        # Adım A: TC / Pasaport üzerinden Aday tablosunda get_or_create mantığı
        tc_pasaport_no = data.get('tc_pasaport_no', '')
        if not tc_pasaport_no:
            return Response({"error": "tc_pasaport_no zorunludur!"}, status=status.HTTP_400_BAD_REQUEST)

        def parse_date(date_str):
            if not date_str or date_str.lower() in ['undefined', 'null']:
                return None
            return date_str

        aday, created = Aday.objects.get_or_create(
            tc_pasaport_no=tc_pasaport_no,
            defaults={
                'kimlik_tipi': data.get('kimlik_tipi', ''),
                'ad': data.get('ad', ''),
                'soyad': data.get('soyad', ''),
                'telefon1': data.get('telefon1', ''),
                'telefon2': data.get('telefon2', ''),
                'eposta': data.get('eposta', ''),
                'baba_adi': data.get('baba_adi', ''),
                'anne_adi': data.get('anne_adi', ''),
                'dogum_yeri': data.get('dogum_yeri', ''),
                'dogum_tarihi': parse_date(data.get('dogum_tarihi')),
            }
        )

        if not created:
            # Var olan adayın bilgilerini üstüne yaz (Güncelle)
            aday.kimlik_tipi = data.get('kimlik_tipi', aday.kimlik_tipi)
            aday.ad = data.get('ad', aday.ad)
            aday.soyad = data.get('soyad', aday.soyad)
            aday.telefon1 = data.get('telefon1', aday.telefon1)
            aday.telefon2 = data.get('telefon2', aday.telefon2)
            aday.eposta = data.get('eposta', aday.eposta)
            aday.baba_adi = data.get('baba_adi', aday.baba_adi)
            aday.anne_adi = data.get('anne_adi', aday.anne_adi)
            aday.dogum_yeri = data.get('dogum_yeri', aday.dogum_yeri)
            
            dt = parse_date(data.get('dogum_tarihi'))
            if dt:
                aday.dogum_tarihi = dt
            aday.save()

        # Uyruk guncellemesi (ForeginKey oldugu icin extra islem)
        uyruk_id = data.get('uyruk')
        if uyruk_id and uyruk_id.isdigit():
            try:
                aday.uyruk = Uyruk.objects.get(id=int(uyruk_id))
                aday.save()
            except Uyruk.DoesNotExist:
                pass

        # Adım B: basvuru_tipi ve egitim_sekli ayristirma
        basvuru_tipi = data.get('basvuru_tipi', '')
        egitim_sekli = data.get('egitim_sekli', '')

        if not basvuru_tipi or not egitim_sekli:
            return Response({"error": "basvuru_tipi ve egitim_sekli zorunludur!"}, status=status.HTTP_400_BAD_REQUEST)

        # Ortak BaseBasvuru Alanlari
        sube_id = data.get('sube')
        dil_id = data.get('dil')
        
        # Onayları string türünden gerçek Boolean türüne çevirme
        onay_bilgiler_dogru = str(data.get('onay_bilgiler_dogru', '')).lower() == 'true'
        onay_sorumluluk = str(data.get('onay_sorumluluk', '')).lower() == 'true'
        onay_fatura = str(data.get('onay_fatura', '')).lower() == 'true'
        onay_kursiyerlik = str(data.get('onay_kursiyerlik', '')).lower() == 'true'

        base_basvuru_data = {
            'aday': aday,
            'sube': Sube.objects.get(id=int(sube_id)) if sube_id and sube_id.isdigit() else None,
            'dil': Dil.objects.get(id=int(dil_id)) if dil_id and dil_id.isdigit() else None,
            'kimlik_dosyasi': files.get('kimlik_dosyasi'),
            'kayit_bilgi_notu': data.get('kayit_bilgi_notu', ''),
            'onay_bilgiler_dogru': onay_bilgiler_dogru,
            'onay_sorumluluk': onay_sorumluluk,
            'onay_fatura': onay_fatura,
            'onay_kursiyerlik': onay_kursiyerlik,
        }

        # Adım C: if/elif senaryo tablosu belirleme ve insert etme
        if basvuru_tipi == 'Kurs Ön Kayıt' and egitim_sekli == 'Yüz Yüze':
            seviye_id = data.get('seviye')
            indirim_id = data.get('indirim')
            basvuru = KursYuzYuze.objects.create(
                **base_basvuru_data,
                seviye=Seviye.objects.get(id=int(seviye_id)) if seviye_id and seviye_id.isdigit() else None,
                indirim=IndirimTuru.objects.get(id=int(indirim_id)) if indirim_id and indirim_id.isdigit() else None,
                indirim_kodu=data.get('indirim_kodu', ''),
                indirim_belgesi=files.get('indirim_belgesi'),
            )

        elif basvuru_tipi == 'Kurs Ön Kayıt' and egitim_sekli == 'Çevrim İçi':
            seviye_id = data.get('seviye')
            indirim_id = data.get('indirim')
            basvuru = KursCevrimIci.objects.create(
                **base_basvuru_data,
                seviye=Seviye.objects.get(id=int(seviye_id)) if seviye_id and seviye_id.isdigit() else None,
                indirim=IndirimTuru.objects.get(id=int(indirim_id)) if indirim_id and indirim_id.isdigit() else None,
                indirim_kodu=data.get('indirim_kodu', ''),
                indirim_belgesi=files.get('indirim_belgesi'),
                vize_turu=data.get('vize_turu', ''),
                kayit_turu=data.get('kayit_turu', ''),
                vize_baslangic=parse_date(data.get('vize_baslangic')),
                vize_bitis=parse_date(data.get('vize_bitis')),
                turkiye_adresi=data.get('turkiye_adresi', ''),
                ulke_adresi=data.get('ulke_adresi', ''),
                ulke_telefonu=data.get('ulke_telefonu', '')
            )

        elif basvuru_tipi == 'Sınav Ön Kayıt' and egitim_sekli == 'Yüz Yüze':
            basvuru = SinavYuzYuze.objects.create(
                **base_basvuru_data,
                sinav_turu=data.get('sinav_turu', '')
            )

        elif basvuru_tipi == 'Sınav Ön Kayıt' and egitim_sekli == 'Çevrim İçi':
            basvuru = SinavCevrimIci.objects.create(
                **base_basvuru_data,
                sinav_turu=data.get('sinav_turu', ''),
                vize_turu=data.get('vize_turu', ''),
                vize_baslangic=parse_date(data.get('vize_baslangic')),
                vize_bitis=parse_date(data.get('vize_bitis')),
                turkiye_adresi=data.get('turkiye_adresi', ''),
                ulke_adresi=data.get('ulke_adresi', ''),
                ulke_telefonu=data.get('ulke_telefonu', '')
            )
            
        else:
            return Response({"error": f"Bilinmeyen başvuru kombinasyonu: {basvuru_tipi} / {egitim_sekli}"}, status=status.HTTP_400_BAD_REQUEST)

        # Adım D: Eşzamanlı CustomUser oluşturma (accounts altyapısı için)
        try:
            from accounts.models import CustomUser
            if not CustomUser.objects.filter(username=tc_pasaport_no).exists():
                user = CustomUser(
                    username=tc_pasaport_no,
                    last_name=data.get('soyad', ''),
                    first_name=data.get('ad', ''),
                    user_type='STUDENT',
                    is_active=False  # Süper admin onaylayana kadar pasif kalacak
                )
                user.set_password(data.get('password'))  # Frontend'den gelen şifreyi kriptolayarak kaydet
                user.save()
        except Exception as e:
            print(f"CustomUser oluşturulurken hata: {e}")

        # Adım E: İşlem bitimi ve 201 dönüşü
        return Response({"message": "Başvuru başarıyla alındı", "basvuru_id": basvuru.id}, status=status.HTTP_201_CREATED)

    except Exception as e:
        import traceback
        traceback.print_exc()
        return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
def ogrenci_login(request):
    tc_no = request.data.get('tc_pasaport_no')
    soyad = request.data.get('soyad')

    if not tc_no or not soyad:
        return Response({'error': 'Kimlik No ve Soyad zorunludur.'}, status=status.HTTP_400_BAD_REQUEST)

    try:
        aday = Aday.objects.get(tc_pasaport_no=tc_no)
        
        if aday.soyad.strip().lower() == soyad.strip().lower():
            
            # 1. Adaya ait tüm başvuru tiplerini DB'den çek
            k_yy = list(aday.kursyuzyuze_basvurulari.all())
            k_ci = list(aday.kurscevrimici_basvurulari.all())
            s_yy = list(aday.sinavyuzyuze_basvurulari.all())
            s_ci = list(aday.sinavcevrimici_basvurulari.all())
            
            tum_basvurular = k_yy + k_ci + s_yy + s_ci
            
            # 2. Eğer en az 1 başvuru varsa VE hepsinin statüsü REDDEDILDI ise girişi engelle:
            if tum_basvurular and all(b.durum == 'REDDEDILDI' for b in tum_basvurular):
                return Response(
                    {'error': 'Başvurunuz reddedildiği için sisteme girişiniz engellenmiştir. Lütfen kurumla iletişime geçin.'}, 
                    status=status.HTTP_403_FORBIDDEN
                )

            # 3. Herhangi bir normal durumda (onaylanan, bekleyen veya henüz hiç başvurusu olmayan)
            return Response({
                'message': 'Giriş başarılı',
                'aday_id': aday.id,
                'ad': aday.ad,
                'soyad': aday.soyad
            }, status=status.HTTP_200_OK)
        else:
            return Response({'error': 'Kimlik No veya Soyadı hatalı.'}, status=status.HTTP_401_UNAUTHORIZED)
            
    except Aday.DoesNotExist:
        return Response({'error': 'Kimlik No veya Soyadı hatalı.'}, status=status.HTTP_401_UNAUTHORIZED)


@api_view(['GET'])
def get_dashboard_stats(request):
    if not request.user.is_authenticated or not request.user.is_staff:
        return Response({"error": "Bu işlem için yetkiniz yok."}, status=status.HTTP_403_FORBIDDEN)
        
    try:
        from accounts.models import CustomUser
        from exams.models import StudentExamSession
        
        total_students = CustomUser.objects.filter(user_type='STUDENT').count()
        active_instructors = CustomUser.objects.filter(user_type='INSTRUCTOR').count()
        
        pending_approvals = sum([
            KursYuzYuze.objects.filter(durum='BEKLIYOR').count(),
            KursCevrimIci.objects.filter(durum='BEKLIYOR').count(),
            SinavYuzYuze.objects.filter(durum='BEKLIYOR').count(),
            SinavCevrimIci.objects.filter(durum='BEKLIYOR').count(),
        ])
        
        today = timezone.now().date()
        exams_solved_today = StudentExamSession.objects.filter(
            is_completed=True,
            started_at__date=today
        ).count()
        
        all_apps = []
        for model in [KursYuzYuze, KursCevrimIci, SinavYuzYuze, SinavCevrimIci]:
            for b in model.objects.select_related('aday').order_by('-basvuru_tarihi')[:5]:
                all_apps.append({
                    'id': f"APP-{b.id:03d}",
                    'ad_soyad': f"{b.aday.ad} {b.aday.soyad}",
                    'basvuru_tarihi': b.basvuru_tarihi.strftime("%d.%m.%Y %H:%M"),
                    'durum': dict(b.DURUM_CHOICES).get(b.durum, b.durum) if hasattr(b, 'DURUM_CHOICES') else b.durum,
                    'real_date': b.basvuru_tarihi
                })
        
        all_apps.sort(key=lambda x: x['real_date'], reverse=True)
        recent_applications = [{k: v for k, v in app.items() if k != 'real_date'} for app in all_apps[:5]]
        
        return Response({
            "total_students": total_students,
            "active_instructors": active_instructors,
            "pending_approvals": pending_approvals,
            "exams_solved_today": exams_solved_today,
            "recent_applications": recent_applications
        }, status=status.HTTP_200_OK)
    except Exception as e:
        import traceback
        traceback.print_exc()
        return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['GET'])
def get_admin_dashboard_data(request):
    if not request.user.is_authenticated or not request.user.is_staff:
        return Response({"error": "Bu işlem için yetkiniz yok."}, status=status.HTTP_403_FORBIDDEN)
        
    data = []
    
    try:
        from accounts.models import CustomUser, StudentProfile
        
        # Sistemdeki TÜM öğrencileri Admin panelinde listelesin
        pending_users = CustomUser.objects.filter(user_type='STUDENT').order_by('-date_joined')
        
        for user in pending_users:
            profile = StudentProfile.objects.filter(user=user).first()
            
            # Application tipleri için display formatları
            basvuru_turu = 'Belirtilmiyor'
            kimlik_url = None
            
            if profile:
                basvuru_turu = profile.get_application_type_display() if profile.application_type else 'Genel Başvuru'
                if profile.identity_document and profile.identity_document.name:
                    kimlik_url = request.build_absolute_uri(profile.identity_document.url)
                    
            data.append({
                'ad_soyad': f"{user.first_name} {user.last_name}",
                'tc': user.username,
                'basvuru_turu': basvuru_turu,
                'kimlik_dosyasi_url': kimlik_url
            })
            
    except Exception as e:
        import traceback
        traceback.print_exc()
        return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    return Response(data, status=status.HTTP_200_OK)


@api_view(['GET'])
def get_application_detail(request, tc_no):
    """Süper Admin: Bir adayın tüm detay bilgilerini getirir (StudentProfile'dan)."""
    try:
        from accounts.models import CustomUser, StudentProfile
        user = CustomUser.objects.get(username=tc_no)
        profile = StudentProfile.objects.filter(user=user).first()
    except Exception:
        return Response({"error": "Aday bulunamadı."}, status=status.HTTP_404_NOT_FOUND)

    # Aday temel bilgileri (eski format ile uyumlu)
    aday_data = {
        'id': user.id,
        'tc_pasaport_no': user.username,
        'kimlik_tipi': profile.get_identity_type_display() if profile and profile.identity_type else '-',
        'ad': user.first_name,
        'soyad': user.last_name,
        'telefon1': profile.phone if profile and profile.phone else '-',
        'telefon2': profile.phone_secondary if profile and profile.phone_secondary else '-',
        'eposta': user.email,
        'baba_adi': profile.father_name if profile and profile.father_name else '-',
        'anne_adi': profile.mother_name if profile and profile.mother_name else '-',
        'dogum_yeri': profile.place_of_birth if profile and profile.place_of_birth else '-',
        'dogum_tarihi': str(profile.date_of_birth) if profile and profile.date_of_birth else '-',
        'uyruk': profile.nationality if profile and profile.nationality else '-',
    }

    # Tüm başvurularını topla
    basvurular = []

    def build_file_url(file_field):
        if file_field and hasattr(file_field, 'name') and file_field.name:
            return request.build_absolute_uri(file_field.url)
        return None

    # Tüm başvurularını topla (StudentProfile için tek bir sanal başvuru oluşturuyoruz 
    # çünkü artık Minimalist form + Profil Tamamlama var)
    basvurular = []
    
    if profile:
        entry = {
            'basvuru_id': profile.id, # Profil id'si basvuru db mantığını simüle etmek için
            'basvuru_turu': profile.get_application_type_display() if profile.application_type else 'Kurs / Sınav',
            'durum': 'BEKLIYOR' if not user.is_active else 'KESIN_KAYIT',
            'basvuru_tarihi': str(user.date_joined.date()),
            'sube': profile.branch or '-',
            'dil': profile.language or '-',
            'seviye': profile.level or '-',
            'kimlik_dosyasi_url': build_file_url(profile.identity_document),
            'indirim_belgesi_url': build_file_url(profile.discount_document),
            'kayit_bilgi_notu': profile.additional_notes or '',
        }
        basvurular.append(entry)

    return Response({'aday': aday_data, 'basvurular': basvurular}, status=status.HTTP_200_OK)


@api_view(['POST'])
def review_student_application(request, user_id):
    """Süper Admin: Başvuruyu onayla veya reddet."""
    action = request.data.get('action') # 'approve' veya 'reject'

    try:
        from accounts.models import CustomUser, StudentProfile
        # Frontend tc_no gönderiyor. user_id string = tc_no
        user = CustomUser.objects.get(username=user_id)

        if action == 'approve':
            user.is_active = True
            user.save()
            
            prof = StudentProfile.objects.filter(user=user).first()
            if prof:
                prof.is_approved = True
                prof.save()
            return Response({"message": "Öğrenci kaydı başarıyla onaylandı."}, status=status.HTTP_200_OK)
            
        elif action == 'reject':
            user.delete() # CASCADE olduğu için profil de silinir.
            return Response({"message": "Öğrenci kaydı reddedildi ve sistemden silindi."}, status=status.HTTP_200_OK)
        
        else:
            return Response({"error": "Geçersiz işlem."}, status=status.HTTP_400_BAD_REQUEST)

    except CustomUser.DoesNotExist:
        return Response({"error": "Öğrenci bulunamadı."}, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        return Response({"error": f"İşlem başarısız: {str(e)}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated

class InstructorDashboardSummaryView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, *args, **kwargs):
        user = request.user
        
        if user.user_type != 'INSTRUCTOR':
            return Response({'error': 'Yetkiniz yok.'}, status=status.HTTP_403_FORBIDDEN)
            
        try:
            profile = user.instructor_profile
            instructor_lang = profile.department.lower()
        except Exception:
            instructor_lang = ''
            
        # Ön yüzden gelen Form dillerini backend department adlarına eşliyoruz
        lang_map = {
            'turkce': 'Türkçe',
            'ingilizce': 'İngilizce',
            'almanca': 'almanca', # Yeni eklenen language backend gönderimi 'almanca' 
        }
        
        target_lang = lang_map.get(instructor_lang, instructor_lang)
        
        from accounts.models import StudentProfile
        # 1. Branşa göre KESİN FİLTRELEME
        my_students_qs = StudentProfile.objects.filter(language=target_lang)
        
        # 2. Üst Kartlar Canlı Sayılar
        active_students_count = my_students_qs.filter(user__is_active=True).count()
        pending_assignments_count = 0  # Statik ama model hazır
        unread_messages_count = 0      # Statik ama model hazır
        
        stats = {
            'active_students': active_students_count,
            'pending_assignments': pending_assignments_count,
            'unread_messages': unread_messages_count,
        }
        
        # 3. Öğrenci Listesi Verisi
        student_list = []
        for st_profile in my_students_qs.select_related('user'):
            u = st_profile.user
            student_list.append({
                'id': u.id,
                'ad': u.first_name,
                'soyad': u.last_name,
                'language': st_profile.language,
                'level': st_profile.level,
                'is_active': u.is_active,
                'durum': 'Aktif' if u.is_active else 'Beklemede'
            })
            
        # Madde 1: Eğitmenin branş display adını döndür
        branch_display_map = {
            'turkce': 'Türkçe',
            'ingilizce': 'İngilizce',
            'almanca': 'Almanca',
            'diger': 'Diğer',
        }
        instructor_branch = branch_display_map.get(instructor_lang, instructor_lang)
        
        return Response({
            'stats': stats,
            'student_list': student_list,
            'instructor_branch': instructor_branch,
        }, status=status.HTTP_200_OK)