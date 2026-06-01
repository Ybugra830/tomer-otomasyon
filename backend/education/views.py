from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.parsers import JSONParser, MultiPartParser, FormParser
from .models import CourseMaterial, StudentNote, MaterialCategory, InstructorTask
from accounts.models import StudentProfile, CustomUser


# ==============================================================================
# YARDIMCI: Dil eşleştirme fonksiyonu (Tüm view'larda tutarlılık sağlar)
# InstructorProfile.department 'turkce','ingilizce','almanca' gibi
# StudentProfile.language 'Türkçe','İngilizce','Almanca' gibi
# CourseMaterial.language 'turkce','ingilizce','almanca' gibi
# ==============================================================================

# department key → olası tüm varyasyonlar (büyük/küçük harf, Türkçe karakter farkı)
LANGUAGE_ALIASES = {
    'turkce':    ['turkce', 'türkçe', 'turkish', 'tömer', 'tomer'],
    'ingilizce': ['ingilizce', 'İngilizce', 'english', 'eng', 'ingilizce hazırlık koordinatörlüğü'],
    'almanca':   ['almanca', 'german', 'deutsch', 'almanca hazırlık koordinatörlüğü'],
}


def _normalize_language(raw_value):
    """
    Herhangi bir formattaki dil değerini, veritabanı standart key'ine çevirir.
    Örn: 'Türkçe' → 'turkce', 'İngilizce Hazırlık' → 'ingilizce', 'almanca' → 'almanca'
    Eşleşme bulunamazsa orijinal değeri küçük harfle döndürür.
    """
    if not raw_value:
        return ''
    val = raw_value.strip().lower()
    for canonical_key, aliases in LANGUAGE_ALIASES.items():
        for alias in aliases:
            if alias.lower() in val or val in alias.lower():
                return canonical_key
    return val


def _get_display_language(canonical_key):
    """
    Veritabanı key'inden insanca okunabilir Türkçe dil ismi döndürür.
    Örn: 'turkce' → 'Türkçe', 'ingilizce' → 'İngilizce'
    """
    display_map = {
        'turkce': 'Türkçe',
        'ingilizce': 'İngilizce',
        'almanca': 'Almanca',
        'diger': 'Diğer',
    }
    return display_map.get(canonical_key, canonical_key)


def _get_instructor_language(user):
    """Eğitmenin department değerini normalize edilmiş canonical key olarak döndürür."""
    try:
        dept = user.instructor_profile.department
        return _normalize_language(dept)
    except Exception:
        return ''


def _get_student_language(user):
    """Öğrencinin language değerini normalize edilmiş canonical key olarak döndürür."""
    try:
        lang = user.student_profile.language
        return _normalize_language(lang)
    except Exception:
        return ''


def _filter_students_by_language(instructor_canonical_lang):
    """
    Eğitmenin canonical dil key'ine göre StudentProfile filtresi.
    Hem 'turkce' hem 'Türkçe' gibi varyasyonları yakalayabilmek için
    LANGUAGE_ALIASES üzerinden tüm olası varyasyonları OR ile sorgular.
    """
    from django.db.models import Q

    aliases = LANGUAGE_ALIASES.get(instructor_canonical_lang, [instructor_canonical_lang])
    q = Q()
    for alias in aliases:
        q |= Q(language__icontains=alias)
    
    return StudentProfile.objects.filter(q).select_related('user')


# ==============================================================================
# 1) ÖĞRENCİ DERS MATERYALLERİ LİSTESİ (Madde 6 Backend)
# ==============================================================================
class CourseMaterialListView(APIView):
    """
    Öğrenci paneli: Sadece öğrencinin diline ait materyalleri getirir.
    Kategoriye göre gruplar (Gramer, Dinleme, Okuma vb.)
    Her materyal objesinde 'material_type' alanı frontend'de PDF/Ses/Video
    ayırımını yapabilmesi için icon_type olarak döner.
    """
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user

        if str(user.user_type).upper() != 'STUDENT':
            return Response({'error': 'Bu sayfayı sadece öğrenciler görebilir.'}, status=status.HTTP_403_FORBIDDEN)

        try:
            profile = user.student_profile
        except Exception:
            return Response({'error': 'Öğrenci profili bulunamadı.'}, status=status.HTTP_404_NOT_FOUND)

        # Normalize edip canonical key olarak al (Örn: 'Türkçe' → 'turkce')
        student_lang = _normalize_language(profile.language)

        # ÖNEMLİ: icontains ile esnek eşleşme – 'turkce' keyword'ü 'turkce' alanıyla eşleşir
        if student_lang:
            materials = CourseMaterial.objects.filter(
                language__icontains=student_lang
            ).select_related('category')
        else:
            materials = CourseMaterial.objects.none()

        grouped_materials = {}
        for cat in MaterialCategory.objects.all():
            grouped_materials[cat.name] = []

        for mat in materials:
            cat_name = mat.category.name if mat.category else 'Genel'
            if cat_name not in grouped_materials:
                grouped_materials[cat_name] = []

            grouped_materials[cat_name].append({
                'id': mat.id,
                'title': mat.title,
                'file_url': request.build_absolute_uri(mat.file.url) if mat.file else None,
                'file_size': mat.file_size,
                'material_type': mat.category.icon_type if mat.category else 'pdf',
                'icon_type': mat.category.icon_type if mat.category else 'pdf',
                'language': mat.language,
                'level': mat.level,
                'created_at': mat.created_at.strftime("%d.%m.%Y"),
            })

        return Response(grouped_materials, status=status.HTTP_200_OK)


# ==============================================================================
# 2) ÖĞRENCİ NOT SİSTEMİ (Madde 6 Backend - GET/POST)
# ==============================================================================
class StudentNoteView(APIView):
    """
    GET ?material_id=X → Öğrencinin o materyale ait varsa notunu getirir.
    POST {material_id, note_text} → Notu kaydeder (varsa günceller, yoksa oluşturur).
    """
    permission_classes = [IsAuthenticated]

    def get(self, request):
        material_id = request.query_params.get('material_id')
        if not material_id:
            return Response({'error': 'material_id gerekli.'}, status=status.HTTP_400_BAD_REQUEST)

        note = StudentNote.objects.filter(student=request.user, material_id=material_id).first()
        if note:
            return Response({
                'note_text': note.note_text,
                'updated_at': note.updated_at.strftime("%d.%m.%Y %H:%M") if note.updated_at else None
            }, status=status.HTTP_200_OK)
        return Response({'note_text': ''}, status=status.HTTP_200_OK)

    def post(self, request):
        material_id = request.data.get('material_id')
        note_text = request.data.get('note_text', '')

        if not material_id:
            return Response({'error': 'material_id gerekli.'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            material = CourseMaterial.objects.get(id=material_id)
        except CourseMaterial.DoesNotExist:
            return Response({'error': 'Materyal bulunamadı.'}, status=status.HTTP_404_NOT_FOUND)

        note, created = StudentNote.objects.update_or_create(
            student=request.user,
            material=material,
            defaults={'note_text': note_text}
        )

        return Response({
            'message': 'Not başarıyla kaydedildi!',
            'note_text': note.note_text,
            'updated_at': note.updated_at.strftime("%d.%m.%Y %H:%M") if note.updated_at else None
        }, status=status.HTTP_200_OK)


# ==============================================================================
# 3) EĞİTMEN MATERYAL YÜKLEME (Madde 3 - uploaded_by fix + Madde 2 uyumu)
# ==============================================================================
class InstructorMaterialUploadView(APIView):
    """
    Eğitmen materyal yükleme:
    - target='all_class' veya 'Tüm Sınıfa Gönder' → CourseMaterial oluştur (uploaded_by=user KESİNLİKLE SET EDİLİR)
    - target='individual' veya 'Bireysel Öğrenciye Gönder' → InstructorTask oluştur
    """
    permission_classes = [IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser]

    def post(self, request):
        user = request.user
        if str(user.user_type).upper() != 'INSTRUCTOR':
            return Response({'error': 'Sadece eğitmenler materyal yükleyebilir.'}, status=403)

        try:
            title = request.data.get('title')
            # Frontend'den gelen farklı key isimlerini tolere et
            target = request.data.get('target') or request.data.get('targetType') or ''
            material_type_name = request.data.get('type') or request.data.get('materialType') or 'Genel'
            file = request.FILES.get('file')

            if not file or not title:
                return Response({'error': 'Başlık ve dosya zorunludur!'}, status=400)

            # Kategori metin olarak geliyorsa veritabanında bul veya oluştur
            # icon_type otomatik belirle: dosya uzantısına göre
            file_ext = file.name.rsplit('.', 1)[-1].lower() if '.' in file.name else ''
            if file_ext in ('mp3', 'wav', 'ogg', 'm4a'):
                auto_icon = 'audio'
            elif file_ext in ('mp4', 'avi', 'mkv', 'mov', 'webm'):
                auto_icon = 'video'
            else:
                auto_icon = 'pdf'

            category, _ = MaterialCategory.objects.get_or_create(
                name=material_type_name,
                defaults={'icon_type': auto_icon}
            )

            # Eğitmenin branşını canonical key olarak al
            instructor_lang = _get_instructor_language(user)

            # Frontend'den gelen target değerini normalize et
            target_normalized = target.strip().lower()

            # ----- TÜM SINIFA GÖNDER -----
            if target_normalized in ['all_class', 'tüm sınıfa gönder', 'all', 'tum_sinifa']:
                material = CourseMaterial.objects.create(
                    title=title,
                    category=category,
                    language=instructor_lang,  # canonical key: 'turkce', 'ingilizce' vb.
                    level=request.data.get('level', 'B1'),
                    file=file,
                    file_size=f"{file.size / (1024*1024):.1f} MB",
                    uploaded_by=user,  # ★ KRİTİK FIX (Madde 3): Arşive düşmesi için ZORUNLU
                )
                return Response({'message': 'Materyal tüm sınıfa başarıyla eklendi!'}, status=200)

            # ----- BİREYSEL ÖĞRENCİYE GÖNDER -----
            elif target_normalized in ['individual', 'bireysel öğrenciye gönder', 'bireysel', 'individual_student']:
                student_id = request.data.get('student_id')
                if not student_id:
                    return Response({'error': 'Lütfen bir öğrenci seçin!'}, status=400)

                try:
                    student = CustomUser.objects.get(id=student_id)
                except CustomUser.DoesNotExist:
                    return Response({'error': 'Seçilen öğrenci bulunamadı!'}, status=404)

                task = InstructorTask.objects.create(
                    instructor=user,
                    student=student,
                    title=title,
                    task_type=material_type_name,
                    message=title,
                    file=file
                )
                return Response({'message': f'Görev {student.first_name} adlı öğrenciye atandı!'}, status=200)

            else:
                return Response({'error': f'Geçersiz hedef türü: {target}'}, status=400)

        except Exception as e:
            import traceback
            traceback.print_exc()
            return Response({'error': f'SUNUCU HATASI: {str(e)}'}, status=500)


# ==============================================================================
# 4) EĞİTMEN ARŞİV GÖRÜNÜMÜ (Madde 5 - Öğrenci dil bilgisi eklendi)
# ==============================================================================
class InstructorArchiveView(APIView):
    """
    Eğitmenin gönderdiği tüm materyalleri (CourseMaterial + InstructorTask) listeler.
    ★ Madde 5 Fix: Her InstructorTask kaydında öğrencinin öğrendiği dil de döndürülür.
    """
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        if str(user.user_type).upper() != 'INSTRUCTOR':
            return Response({'error': 'Yetkiniz yok.'}, status=status.HTTP_403_FORBIDDEN)

        archive = []

        # 1) Hocanın yüklediği CourseMaterial'ler (Tüm Sınıf)
        for mat in CourseMaterial.objects.filter(uploaded_by=user).order_by('-created_at'):
            archive.append({
                'id': f'mat_{mat.id}',
                'title': mat.title,
                'type': mat.category.icon_type if mat.category else 'pdf',
                'target': 'Tüm Sınıf',
                'target_language': _get_display_language(mat.language),  # ★ Madde 5: Dil bilgisi
                'file_url': request.build_absolute_uri(mat.file.url) if mat.file else None,
                'date': mat.created_at.strftime("%d %B %Y"),
                'timestamp': mat.created_at.timestamp(),
            })

        # 2) Hocanın gönderdiği InstructorTask'ler (Bireysel)
        for task in InstructorTask.objects.filter(instructor=user).select_related('student').order_by('-created_at'):
            # ★ Madde 5: Öğrencinin öğrendiği dili profil üzerinden al
            student_lang_display = ''
            try:
                sp = task.student.student_profile
                student_lang_display = _get_display_language(_normalize_language(sp.language))
            except Exception:
                student_lang_display = ''

            student_full = f'{task.student.first_name} {task.student.last_name}'
            if student_lang_display:
                student_full += f' - {student_lang_display}'

            archive.append({
                'id': f'task_{task.id}',
                'title': task.title or task.task_type,
                'type': task.task_type,
                'target': student_full,  # ★ Madde 5: "Berat Taha - İngilizce" formatı
                'target_language': student_lang_display,
                'file_url': request.build_absolute_uri(task.file.url) if task.file else None,
                'date': task.created_at.strftime("%d %B %Y"),
                'timestamp': task.created_at.timestamp(),
            })

        # Tarih sırasına göre sırala (en yeni önce)
        archive.sort(key=lambda x: x['timestamp'], reverse=True)

        return Response(archive, status=status.HTTP_200_OK)


# ==============================================================================
# 5) EĞİTMEN ÖĞRENCİ LİSTESİ (Madde 4 - Esnek dil eşleşmesi)
# ==============================================================================
class InstructorStudentListView(APIView):
    """
    Eğitmenin branşındaki öğrencileri dropdown için döndürür.
    ★ Madde 4 Fix: __iexact yerine LANGUAGE_ALIASES üzerinden icontains OR sorgusu.
    ★ Madde 5 Fix: Her öğrenciye language alanı da eklendi.
    """
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        if str(user.user_type).upper() != 'INSTRUCTOR':
            return Response({'error': 'Yetkiniz yok.'}, status=status.HTTP_403_FORBIDDEN)

        instructor_lang = _get_instructor_language(user)

        # ★ Madde 4: Esnek filtreleme – tüm dil varyasyonlarını yakala
        students = _filter_students_by_language(instructor_lang)

        data = []
        for sp in students:
            u = sp.user
            lang_display = _get_display_language(_normalize_language(sp.language))
            data.append({
                'id': u.id,
                'full_name': f'{u.first_name} {u.last_name}',
                'language': lang_display,  # ★ Madde 5: Dropdown'da ve arşivde dil bilgisi
                'level': sp.level,
            })
        return Response(data, status=status.HTTP_200_OK)
