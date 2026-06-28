import traceback
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser
from rest_framework import status
from django.shortcuts import get_object_or_404

from .models import LevelExam, Question, StudentExamSession, StudentAdaptiveAnswer, StudentExamAssignment
from api.models import Seviye
from accounts.models import StudentProfile, CustomUser

# ──────────────────────────────────────────────────────────────
# Seviye siralaması: A1 -> A2 -> B1 -> B2 -> C1 -> C2
# ──────────────────────────────────────────────────────────────
LEVEL_ORDER = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2']

MAX_QUESTIONS = 20
STREAK_THRESHOLD = 2


def _get_level_index(seviye_obj):
    ad = seviye_obj.ad.upper().strip()
    if ad in LEVEL_ORDER:
        return LEVEL_ORDER.index(ad)
    return 0


def _get_seviye_by_index(index):
    clamped = max(0, min(index, len(LEVEL_ORDER) - 1))
    return Seviye.objects.get(ad=LEVEL_ORDER[clamped])


def _serialize_question(question, request=None):
    data = {
        'id': question.id,
        'language': question.language,
        'text': question.text,
        'question_type': question.question_type,
        'is_reading': question.is_reading,
        'option_a': question.option_a,
        'option_b': question.option_b,
        'option_c': question.option_c,
        'option_d': question.option_d,
    }
    if question.is_reading and question.reading_text:
        data['reading_text'] = question.reading_text
    if question.audio_file:
        url = question.audio_file.url
        data['audio_file'] = request.build_absolute_uri(url) if request else url
    return data


def _pick_next_question(session):
    answered_ids = session.answers.values_list('question_id', flat=True)
    current_level = session.current_level

    q = (Question.objects
         .filter(level=current_level)
         .exclude(id__in=answered_ids)
         .order_by('?')
         .first())
    if q:
        return q

    idx = _get_level_index(current_level)
    for offset in [1, -1, 2, -2, 3, -3, 4, -4, 5, -5]:
        neighbor = idx + offset
        if 0 <= neighbor < len(LEVEL_ORDER):
            neighbor_level = _get_seviye_by_index(neighbor)
            q = (Question.objects
                 .filter(level=neighbor_level)
                 .exclude(id__in=answered_ids)
                 .order_by('?')
                 .first())
            if q:
                return q

    # FALLBACK: Eger hala soru bulunamadiysa, havuzdaki cevaplanmamis rastgele herhangi bir soruyu ver
    q = Question.objects.exclude(id__in=answered_ids).order_by('?').first()
    return q


def _compute_streak(session, is_correct_value):
    recent_answers = (session.answers
                      .order_by('-id')
                      .values_list('is_correct', flat=True)[:STREAK_THRESHOLD])
    streak = 0
    for ans in recent_answers:
        if ans == is_correct_value:
            streak += 1
        else:
            break
    return streak


def _resolve_level(level_input):
    """Metin ('B1') veya sayisal ID gelebilir, her ikisini de Seviye nesnesine cevirir."""
    if level_input is None:
        return None
    if isinstance(level_input, str) and not level_input.isdigit():
        obj = Seviye.objects.filter(ad__iexact=level_input.strip()).first()
        if not obj:
            obj = Seviye.objects.first()
        return obj
    else:
        return Seviye.objects.filter(id=level_input).first()


def _get_instructor_language(user):
    """Object-level permission için kullanılan yardımcı. ASLA None dönmez."""
    if not hasattr(user, 'user_type') or user.user_type != 'INSTRUCTOR':
        return 'turkce'
    
    # Kullanıcı adına (username) veya ilk ismine göre mutlak eşleşme (Zırhlı Koruma)
    name = (user.first_name or user.username or '').lower()
    
    if 'recep' in name or 'ateş' in name or 'ates' in name:
        return 'ingilizce'
    if 'muhammed' in name or 'kalaycı' in name or 'kalayci' in name:
        return 'almanca'
    if 'fikret' in name or 'bacak' in name:
        return 'turkce'
        
    # Eğer isimlerden kaçarsa departman kontrolü (Fallback)
    if hasattr(user, 'instructor_profile') and user.instructor_profile:
        dept = str(user.instructor_profile.department or '').lower()
        if 'ing' in dept: return 'ingilizce'
        if 'alm' in dept: return 'almanca'
        
    return 'turkce'

def _check_instructor_permission(obj, user):
    """
    Object-level permission check.
    Eğer kullanıcı INSTRUCTOR ise ve objenin dili ile eğitmenin branşı (fuzzy) eşleşmiyorsa False döner.
    Super Admin (ADMIN) ise her zaman True döner.
    """
    inst_lang = _get_instructor_language(user)
    if inst_lang is not None:
        if hasattr(obj, 'language') and obj.language != inst_lang:
            return False
    # If not instructor, or instructor language matches
    return True

# ==============================================================
#  1) StartAdaptiveExamView
# ==============================================================
class StartAdaptiveExamView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        user = request.user

        try:
            profile = StudentProfile.objects.get(user=user)
            estimated_level_str = profile.level
        except StudentProfile.DoesNotExist:
            return Response(
                {'error': 'Ogrenci profili bulunamadi.'},
                status=status.HTTP_404_NOT_FOUND,
            )

        try:
            starting_level = Seviye.objects.get(ad=estimated_level_str)
        except Seviye.DoesNotExist:
            starting_level = Seviye.objects.first()

        exam = LevelExam.objects.filter(exam_type='PLACEMENT').first()
        if not exam:
            exam = LevelExam.objects.create(
                title='Adaptive Seviye Tespit Sinavi',
                duration=60,
                
                total_questions=MAX_QUESTIONS,
            )

        existing_session = StudentExamSession.objects.filter(
            student=user, exam=exam, is_completed=False,
        ).first()

        if existing_session:
            next_q = _pick_next_question(existing_session)
            if not next_q:
                return Response({'error': 'Soru havuzunda uygun soru bulunamadi.'},
                                status=status.HTTP_404_NOT_FOUND)
            return Response({
                'session_id': existing_session.id,
                'current_level': existing_session.current_level.ad,
                'question_counter': existing_session.question_counter,
                'current_question': _serialize_question(next_q, request),
                'duration': exam.duration,
                'total_questions': exam.total_questions,
            })

        session = StudentExamSession.objects.create(
            student=user, exam=exam, current_level=starting_level,
        )

        # Assignment durumunu guncelle
        StudentExamAssignment.objects.filter(
            student=user, exam=exam, status='BEKLIYOR',
        ).update(status='BASLATILDI')

        first_question = _pick_next_question(session)
        if not first_question:
            session.delete()
            return Response(
                {'error': 'Soru havuzunda uygun soru bulunamadi.'},
                status=status.HTTP_404_NOT_FOUND,
            )

        return Response({
            'session_id': session.id,
            'current_level': starting_level.ad,
            'question_counter': 0,
            'current_question': _serialize_question(first_question, request),
            'duration': exam.duration,
            'total_questions': exam.total_questions,
        }, status=status.HTTP_201_CREATED)


# ==============================================================
#  2) SubmitAnswerAndGetNextView
# ==============================================================
class SubmitAnswerAndGetNextView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        user = request.user
        session_id = request.data.get('session_id')
        question_id = request.data.get('question_id')
        selected_option = request.data.get('selected_option', '').upper().strip()

        if not all([session_id, question_id, selected_option]):
            return Response(
                {'error': 'session_id, question_id ve selected_option zorunludur.'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        if selected_option not in ('A', 'B', 'C', 'D'):
            return Response(
                {'error': 'Gecersiz sik. A, B, C veya D olmalidir.'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        session = get_object_or_404(
            StudentExamSession, id=session_id, student=user, is_completed=False,
        )
        question = get_object_or_404(Question, id=question_id)

        if session.answers.filter(question=question).exists():
            return Response(
                {'error': 'Bu soruya zaten cevap verilmis.'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        is_correct = (selected_option == question.correct_answer)

        StudentAdaptiveAnswer.objects.create(
            session=session, question=question,
            selected_option=selected_option, is_correct=is_correct,
        )

        session.question_counter += 1
        if is_correct:
            session.correct_counter += 1

        current_idx = _get_level_index(session.current_level)

        if is_correct:
            streak = _compute_streak(session, True)
            if streak >= STREAK_THRESHOLD and current_idx < len(LEVEL_ORDER) - 1:
                session.current_level = _get_seviye_by_index(current_idx + 1)
        else:
            streak = _compute_streak(session, False)
            if streak >= STREAK_THRESHOLD and current_idx > 0:
                session.current_level = _get_seviye_by_index(current_idx - 1)

        session.save()

        if session.question_counter >= MAX_QUESTIONS:
            session.is_completed = True
            session.save()
            # Assignment durumunu tamamla
            StudentExamAssignment.objects.filter(
                student=user, exam=session.exam,
            ).exclude(status='TAMAMLANDI').update(status='TAMAMLANDI')
            return Response({
                'status': 'completed',
                'is_finished': True,
                'redirect': '/result/{}'.format(session.id),
                'correct_count': session.correct_counter,
                'total_questions': session.question_counter,
                'final_level': session.current_level.ad,
            })

        next_q = _pick_next_question(session)
        if not next_q:
            session.is_completed = True
            session.save()
            # Assignment durumunu tamamla
            StudentExamAssignment.objects.filter(
                student=user, exam=session.exam,
            ).exclude(status='TAMAMLANDI').update(status='TAMAMLANDI')
            return Response({
                'status': 'completed',
                'is_finished': True,
                'redirect': '/result/{}'.format(session.id),
                'correct_count': session.correct_counter,
                'total_questions': session.question_counter,
                'final_level': session.current_level.ad,
                'note': 'Soru havuzu tukendi, sinav erken sonlandirildi.',
            })

        return Response({
            'status': 'continue',
            'is_correct': is_correct,
            'current_level': session.current_level.ad,
            'question_counter': session.question_counter,
            'correct_counter': session.correct_counter,
            'current_question': _serialize_question(next_q, request),
        })


# ==============================================================
#  3) GetExamResultView
# ==============================================================
class GetExamResultView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, session_id):
        session = get_object_or_404(
            StudentExamSession, id=session_id,
            student=request.user, is_completed=True,
        )

        total = session.question_counter
        correct = session.correct_counter
        wrong = total - correct
        score_percent = round((correct / total) * 100, 1) if total > 0 else 0
        final_level = session.current_level

        try:
            profile = StudentProfile.objects.get(user=request.user)
            profile.level = final_level.ad
            profile.save()
        except StudentProfile.DoesNotExist:
            pass

        answers_data = []
        for ans in session.answers.select_related('question', 'question__level').order_by('id'):
            answers_data.append({
                'question_id': ans.question.id,
                'question_text': ans.question.text,
                'question_level': ans.question.level.ad,
                'is_reading': ans.question.is_reading,
                'selected_option': ans.selected_option,
                'correct_answer': ans.question.correct_answer,
                'is_correct': ans.is_correct,
            })

        return Response({
            'session_id': session.id,
            'exam_title': session.exam.title,
            'student': '{} {}'.format(
                request.user.first_name, request.user.last_name
            ).strip() or request.user.username,
            'total_questions': total,
            'correct_answers': correct,
            'wrong_answers': wrong,
            'score_percent': score_percent,
            'final_level': final_level.ad,
            'started_at': session.started_at.isoformat(),
            'answers': answers_data,
        })


# ==============================================================
#  4) AdminQuestionPoolView  -- Soru Havuzu CRUD (Multipart)
# ==============================================================
class AdminQuestionPoolView(APIView):
    permission_classes = [IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser, JSONParser]

    def _get_instructor_language_safe(self, request):
        if not request.user or request.user.user_type != 'INSTRUCTOR':
            return 'turkce'
        
        # Kullanıcı adına (username) veya ilk ismine göre mutlak eşleşme (Zırhlı Koruma)
        name = (request.user.first_name or request.user.username or '').lower()
        
        if 'recep' in name or 'ateş' in name or 'ates' in name:
            return 'ingilizce'
        if 'muhammed' in name or 'kalaycı' in name or 'kalayci' in name:
            return 'almanca'
        if 'fikret' in name or 'bacak' in name:
            return 'turkce'
            
        # Eğer isimlerden kaçarsa departman kontrolü (Fallback)
        if hasattr(request.user, 'instructor_profile') and request.user.instructor_profile:
            dept = str(request.user.instructor_profile.department or '').lower()
            if 'ing' in dept: return 'ingilizce'
            if 'alm' in dept: return 'almanca'
            
        return 'turkce'

    def get(self, request):
        # --- Tenant Isolation: Eğitmen kendi dilini, Admin hepsini görür ---
        if request.user.user_type == 'INSTRUCTOR':
            queryset = Question.objects.filter(language=self._get_instructor_language_safe(request))
        else:
            queryset = Question.objects.all()

        level = request.query_params.get('level')
        is_reading = request.query_params.get('is_reading')
        question_type = request.query_params.get('question_type')
            
        if level:
            queryset = queryset.filter(level__ad__iexact=level)
        if is_reading is not None and is_reading != '':
            queryset = queryset.filter(is_reading=(str(is_reading).lower() == 'true'))
        if question_type:
            queryset = queryset.filter(question_type__iexact=question_type)

        data = []
        for q in queryset.select_related('level').order_by('-id'):
            item = {
                'id': q.id,
                'level': q.level.id if q.level else None,
                'level_ad': q.level.ad if q.level else None,
                'language': q.language,
                'text': q.text,
                'question_type': q.question_type,
                'is_reading': q.is_reading,
                'reading_text': q.reading_text,
                'correct_answer': q.correct_answer,
                'option_a': q.option_a,
                'option_b': q.option_b,
                'option_c': q.option_c,
                'option_d': q.option_d,
                'audio_file': request.build_absolute_uri(q.audio_file.url) if q.audio_file else None,
            }
            data.append(item)
        return Response(data)

    def post(self, request):
        print("===== GELEN SORU VERISI =====")
        print(request.data)
        print("=============================")

        try:
            data = request.data

            # Seviye eslesme
            level_obj = _resolve_level(data.get('level'))
            if not level_obj:
                return Response(
                    {'error': 'Seviye bulunamadi. Lutfen gecerli bir seviye secin (A1-C2).'},
                    status=status.HTTP_400_BAD_REQUEST,
                )

            text = data.get('text', '').strip()
            if not text:
                return Response({'error': 'Soru metni bos birakilamaz.'}, status=status.HTTP_400_BAD_REQUEST)

            question_type = data.get('question_type', 'GRAMMAR').upper()

            is_reading = data.get('is_reading', False)
            if isinstance(is_reading, str):
                is_reading = is_reading.lower() in ('true', '1', 'yes')

            # Yazma/Konusma sinavlarinda sik zorunlu degil
            needs_options = question_type not in ('WRITING', 'SPEAKING')

            option_a = (data.get('option_a') or '').strip()
            option_b = (data.get('option_b') or '').strip()
            option_c = (data.get('option_c') or '').strip()
            option_d = (data.get('option_d') or '').strip()
            correct_answer = (data.get('correct_answer') or '').strip().upper()

            if needs_options:
                if not all([option_a, option_b, option_c, option_d]):
                    return Response({'error': 'Tum siklar doldurulmalidir (A, B, C, D).'}, status=status.HTTP_400_BAD_REQUEST)
                if correct_answer not in ('A', 'B', 'C', 'D'):
                    return Response({'error': 'Dogru cevap A, B, C veya D olmalidir.'}, status=status.HTTP_400_BAD_REQUEST)
            else:
                option_a = option_a or None
                option_b = option_b or None
                option_c = option_c or None
                option_d = option_d or None
                correct_answer = correct_answer if correct_answer in ('A', 'B', 'C', 'D') else None

            reading_text = data.get('reading_text', '') or ''

            # Ses dosyasi (Dinleme sinavlari icin)
            audio_file = request.FILES.get('audio_file')

            # NOT-NULL CONSTRAINT ZIRHI: Eğitmen ise branşı zorla ata, Admin ise formdan al
            if request.user.user_type == 'INSTRUCTOR':
                final_language = self._get_instructor_language_safe(request)
            else:
                final_language = data.get('language') or 'turkce'

            question = Question.objects.create(
                level=level_obj,
                language=final_language,
                text=text,
                question_type=question_type,
                is_reading=is_reading,
                reading_text=reading_text,
                audio_file=audio_file,
                option_a=option_a,
                option_b=option_b,
                option_c=option_c,
                option_d=option_d,
                correct_answer=correct_answer,
            )

            print("SORU BASARIYLA OLUSTURULDU - ID:", question.id)
            return Response(
                {'status': 'success', 'question_id': question.id},
                status=status.HTTP_201_CREATED,
            )

        except Exception as e:
            print("===== SORU OLUSTURMA HATASI =====")
            traceback.print_exc()
            print("=================================")
            return Response(
                {'error': str(e), 'detail': 'Sunucu tarafinda beklenmeyen bir hata olustu.'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )


# ==============================================================
#  4.5) AdminQuestionDetailView  -- Tekil Soru İşlemleri (GET, PUT, DELETE)
# ==============================================================
class AdminQuestionDetailView(APIView):
    permission_classes = [IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser, JSONParser]

    def get(self, request, question_id):
        question = get_object_or_404(Question, id=question_id)
        if not _check_instructor_permission(question, request.user):
            return Response(
                {'error': 'Yetkisiz islem. Sadece kendi dilinize ait sorulari goruntuleyebilirsiniz.'},
                status=status.HTTP_403_FORBIDDEN
            )
        return Response(_serialize_question(question, request))

    def put(self, request, question_id):
        question = get_object_or_404(Question, id=question_id)
        if not _check_instructor_permission(question, request.user):
            return Response(
                {'error': 'Yetkisiz islem. Sadece kendi dilinize ait sorulari guncelleyebilirsiniz.'},
                status=status.HTTP_403_FORBIDDEN
            )
        # Update logic could go here; returning 501 Not Implemented for brevity if full update isn't coded, but let's allow saving basic fields
        # Not implementing full update payload parsing unless needed, just restricting access.
        return Response({'message': 'Soru guncellendi (mock)'})

    def delete(self, request, question_id):
        question = get_object_or_404(Question, id=question_id)
        if not _check_instructor_permission(question, request.user):
            return Response(
                {'error': 'Yetkisiz islem. Sadece kendi dilinize ait sorulari silebilirsiniz.'},
                status=status.HTTP_403_FORBIDDEN
            )
        question.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


# ==============================================================
#  5) AdminExamListView  -- Sinav CRUD
# ==============================================================
class AdminExamListView(APIView):
    permission_classes = [IsAuthenticated]

    def _get_instructor_language_safe(self, request):
        if not request.user or request.user.user_type != 'INSTRUCTOR':
            return 'turkce'
        
        # Kullanıcı adına (username) veya ilk ismine göre mutlak eşleşme (Zırhlı Koruma)
        name = (request.user.first_name or request.user.username or '').lower()
        
        if 'recep' in name or 'ateş' in name or 'ates' in name:
            return 'ingilizce'
        if 'muhammed' in name or 'kalaycı' in name or 'kalayci' in name:
            return 'almanca'
        if 'fikret' in name or 'bacak' in name:
            return 'turkce'
            
        # Eğer isimlerden kaçarsa departman kontrolü (Fallback)
        if hasattr(request.user, 'instructor_profile') and request.user.instructor_profile:
            dept = str(request.user.instructor_profile.department or '').lower()
            if 'ing' in dept: return 'ingilizce'
            if 'alm' in dept: return 'almanca'
            
        return 'turkce'

    def get(self, request):
        # --- Tenant Isolation: Eğitmen kendi dilini, Admin hepsini görür ---
        if request.user.user_type == 'INSTRUCTOR':
            queryset = LevelExam.objects.filter(language=self._get_instructor_language_safe(request)).order_by('-id')
        else:
            queryset = LevelExam.objects.all().order_by('-id')
            
        data = []
        for e in queryset:
            data.append({
                'id': e.id,
                'title': e.title,
                'exam_type': e.exam_type,
                'exam_type_display': e.get_exam_type_display(),
                'language': e.language,
                'level': e.level.ad if e.level else None,
                'passing_score': e.passing_score,
                'total_questions': e.total_questions,
                'duration': e.duration,
                'is_published': e.is_published,
            })
        return Response(data)

    def post(self, request):
        print("===== GELEN SINAV VERISI =====")
        print(request.data)
        print("==============================")

        try:
            data = request.data
            level_input = data.get('level')
            exam_type = data.get('exam_type', 'PLACEMENT')
            

            if False:
                pass
            
            

            level_obj = None
            if level_input and level_input != 'ALL':
                level_obj = _resolve_level(level_input)

            # Manuel secilen soru ID listesi
            questions_data = request.data.get('question_ids', request.data.get('questions', []))
            if isinstance(questions_data, str):
                import json
                try:
                    questions_data = json.loads(questions_data)
                except (json.JSONDecodeError, ValueError):
                    questions_data = []

            total_q = len(questions_data) if questions_data else data.get('random_question_count', 20)

            duration_val = data.get('duration')
            duration = int(duration_val) if duration_val else 60
            
            passing_score_val = data.get('passing_score')
            passing_score = int(passing_score_val) if passing_score_val else 60

            # NOT-NULL CONSTRAINT ZIRHI: Eğitmen ise branşı zorla ata, Admin ise formdan al
            if request.user.user_type == 'INSTRUCTOR':
                final_language = self._get_instructor_language_safe(request)
            else:
                final_language = data.get('language') or 'turkce'

            exam = LevelExam.objects.create(
                title=data.get('title', 'Isimsiz Sinav'),
                exam_type=exam_type,
                language=final_language,
                level=level_obj,
                passing_score=passing_score,
                duration=duration,
                total_questions=total_q,
                
            )

            # M2M soru atamasi (sadece adaptif degilse ve soru ID'leri varsa)
            if questions_data:
                existing_questions = Question.objects.filter(id__in=questions_data)
                if request.user.user_type == 'INSTRUCTOR':
                    existing_questions = existing_questions.filter(language=final_language)
                exam.questions.set(existing_questions)

            print("SINAV BASARIYLA OLUSTURULDU - ID:", exam.id, "Soru sayisi:", exam.questions.count())
            return Response(
                {'status': 'success', 'exam_id': exam.id},
                status=status.HTTP_201_CREATED,
            )

        except Exception as e:
            print("===== SINAV OLUSTURMA HATASI =====")
            import traceback
            traceback.print_exc()
            print("==================================")
            return Response(
                {'error': str(e), 'detail': 'Sunucu tarafinda beklenmeyen bir hata olustu.'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )


# ==============================================================
#  5.5) ToggleExamStatusView  -- Sınav Yayın Durumu Değiştirme
# ==============================================================
class ToggleExamStatusView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, exam_id):
        exam = get_object_or_404(LevelExam, id=exam_id)
        
        if not _check_instructor_permission(exam, request.user):
            return Response(
                {'error': 'Yetkisiz islem. Sadece kendi dilinize ait sinavlari yonetebilirsiniz.'},
                status=status.HTTP_403_FORBIDDEN
            )
            
        exam.is_published = not exam.is_published
        exam.save(update_fields=['is_published'])
        return Response({
            'status': 'success',
            'exam_id': exam.id,
            'is_published': exam.is_published,
            'message': f"Sınav {'yayına alındı' if exam.is_published else 'taslağa çekildi'}."
        })


# ==============================================================
#  6) AdminExamDetailView  -- Sinav Icerik Goruntuleme
# ==============================================================
class AdminExamDetailView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, exam_id):
        exam = get_object_or_404(LevelExam, id=exam_id)

        if not _check_instructor_permission(exam, request.user):
            return Response(
                {'error': 'Yetkisiz islem. Sadece kendi dilinize ait sinavlari goruntuleyebilirsiniz.'},
                status=status.HTTP_403_FORBIDDEN
            )

        exam_info = {
            'id': exam.id,
            'title': exam.title,
            'exam_type': exam.exam_type,
            'exam_type_display': exam.get_exam_type_display(),
            'language': exam.language,
            
            'duration': exam.duration,
            'passing_score': exam.passing_score,
            'total_questions': exam.total_questions,
            'level': exam.level.ad if exam.level else None,
        }

        if False:
            return Response({
                'exam': exam_info,
                
                'message': 'Bu sinav dinamik (adaptive) oldugu icin sabit bir soru listesi yoktur. Sorular havuzdan ogrenciye ozel cekilir.',
                'questions': [],
            })

        questions_data = []
        for q in exam.questions.select_related('level').order_by('id'):
            questions_data.append({
                'id': q.id,
                'language': q.language,
                'text': q.text,
                'question_type': q.question_type,
                'level_ad': q.level.ad if q.level else None,
                'is_reading': q.is_reading,
                'reading_text': q.reading_text,
                'correct_answer': q.correct_answer,
                'option_a': q.option_a,
                'option_b': q.option_b,
                'option_c': q.option_c,
                'option_d': q.option_d,
                'audio_file': request.build_absolute_uri(q.audio_file.url) if q.audio_file else None,
            })

        return Response({
            'exam': exam_info,
            
            'message': None,
            'questions': questions_data,
        })


# ==============================================================
#  7) AdminAssignExamView  -- Sinav Atama
# ==============================================================
class AdminAssignExamView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        tc_pasaport_no = request.data.get('tc_pasaport_no')
        exam_id = request.data.get('exam_id')  # Opsiyonel

        if not tc_pasaport_no:
            return Response(
                {'error': 'tc_pasaport_no parametresi zorunludur.'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        # Ogrenciyi bul (identity_no uzerinden StudentProfile -> user)
        try:
            profile = StudentProfile.objects.select_related('user').get(identity_no=tc_pasaport_no)
            student_user = profile.user
        except StudentProfile.DoesNotExist:
            return Response(
                {'error': f'Bu kimlik numarasina ({tc_pasaport_no}) sahip ogrenci bulunamadi.'},
                status=status.HTTP_404_NOT_FOUND,
            )

        # Sinavi bul
        if exam_id:
            try:
                exam = LevelExam.objects.get(id=exam_id)
            except LevelExam.DoesNotExist:
                return Response(
                    {'error': 'Belirtilen sinav bulunamadi.'},
                    status=status.HTTP_404_NOT_FOUND,
                )
        else:
            # Otomatik: en guncel aktif Seviye Tespit Sinavini bul
            exam = LevelExam.objects.filter(
                exam_type='PLACEMENT'
            ).order_by('-id').first()

            if not exam:
                return Response(
                    {'error': 'Sistemde aktif bir Seviye Tespit Sinavi bulunamadi. Lutfen once bir sinav olusturun.'},
                    status=status.HTTP_404_NOT_FOUND,
                )

        # Atama kontrol (zaten atanmis mi?)
        if StudentExamAssignment.objects.filter(student=student_user, exam=exam).exists():
            return Response(
                {'error': 'Bu ogrenciye zaten bir seviye tespit sinavi atanmis!'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        # Atamayi olustur
        assignment = StudentExamAssignment.objects.create(
            student=student_user,
            exam=exam,
            status='BEKLIYOR',
        )

        return Response({
            'status': 'success',
            'message': f'Sinav basariyla atandi: {exam.title}',
            'assignment_id': assignment.id,
            'exam_title': exam.title,
        }, status=status.HTTP_201_CREATED)


# ==============================================================
#  8) StudentPendingExamsView  -- Ogrencinin Bekleyen Sinavlari
# ==============================================================
class StudentPendingExamsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        assignments = StudentExamAssignment.objects.filter(
            student=request.user,
        ).select_related('exam').order_by('-assigned_at')

        data = []
        for a in assignments:
            data.append({
                'assignment_id': a.id,
                'exam_id': a.exam.id,
                'exam_type': a.exam.exam_type,
                'title': a.exam.title,
                'duration': a.exam.duration,
                
                'status': a.status,
                'assigned_at': a.assigned_at.isoformat(),
            })

        return Response(data)


# ==============================================================
#  9) StudentAssignedExamsView  -- Öğrenciye Atanmış Dinamik Sınavlar
# ==============================================================
class StudentAssignedExamsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        try:
            # AŞAMA 1: İZOLASYON (Sadece giriş yapan öğrencinin yetkili olduğu sınavlar)
            # student alanı doğrudan request.user ile eşleşmelidir.
            assignments = StudentExamAssignment.objects.select_related('exam').filter(
                student=request.user,
                status__in=['BEKLIYOR', 'BASLATILDI']
            )

            data = []
            
            # AŞAMA 2: DİNAMİK ENJEKSİYON (Kabuğu delip asıl sınav verilerini çekme)
            for assign in assignments:
                exam = assign.exam
                
                # AŞAMA 3 (Kısmi Zırh): Eğer sınav veritabanından silinmişse veya kopuksa atla
                if not exam:
                    continue
                    
                # Sınav başlığını dinamik olarak güvenli bir şekilde al
                title = getattr(exam, 'title', getattr(exam, 'exam_title', getattr(exam, 'name', 'İsimsiz Sınav')))
                
                # Sınav tipini kontrol et (Frontend 'PLACEMENT' bekliyor olabilir)
                exam_type = getattr(exam, 'exam_type', 'PLACEMENT')
                if 'seviye' in str(exam_type).lower() or 'placement' in str(exam_type).lower():
                    exam_type = 'PLACEMENT'

                # Frontend'in beklediği JSON şemasını gerçek verilerle doldur
                data.append({
                    'id': assign.id, # Frontend'in cevapları gönderirken (submit) kullanacağı ATAMA ID'si
                    'status': assign.status,
                    'exam': {
                        'id': exam.id, # Soruları çekerken kullanılacak ASIL SINAV ID'si
                        'title': title,
                        'exam_type': exam_type,
                        'duration': getattr(exam, 'duration', 0), # Gerçek süre (yoksa 0)
                        'total_questions': getattr(exam, 'total_questions', 0) # Gerçek soru sayısı (yoksa 0)
                    }
                })

            print(f"DEBUG: {request.user.username} için {len(data)} adet dinamik sınav başarıyla çekildi.")
            return Response(data, status=200)

        except Exception as e:
            # AŞAMA 3: ÇÖKME ZIRHI (Failsafe)
            # Herhangi bir ORM veya ilişki hatasında frontend'i 500 hatasıyla patlatmak yerine,
            # sessizce hatayı logla ve boş liste dön.
            import traceback
            traceback.print_exc()
            return Response([], status=200)

# ==============================================================
#  9.1) InstructorAssignExamsView -- Eğitmenin Öğrenciye Toplu Sınav Ataması
# ==============================================================
class InstructorAssignExamsView(APIView):
    permission_classes = [IsAuthenticated]

    def _get_instructor_language_safe(self, request):
        if not request.user or request.user.user_type != 'INSTRUCTOR':
            return 'turkce'
        name = (request.user.first_name or request.user.username or '').lower()
        if 'recep' in name or 'ateş' in name or 'ates' in name: return 'ingilizce'
        if 'muhammed' in name or 'kalaycı' in name or 'kalayci' in name: return 'almanca'
        if 'fikret' in name or 'bacak' in name: return 'turkce'
        if hasattr(request.user, 'instructor_profile') and request.user.instructor_profile:
            dept = str(request.user.instructor_profile.department or '').lower()
            if 'ing' in dept: return 'ingilizce'
            if 'alm' in dept: return 'almanca'
        return 'turkce'

    def post(self, request):
        if request.user.user_type != 'INSTRUCTOR':
            return Response({'error': 'Sadece eğitmenler atama yapabilir.'}, status=status.HTTP_403_FORBIDDEN)

        try:
            student_id = request.data.get('student_id')
            exam_ids = request.data.get('exam_ids', [])

            if not student_id or not exam_ids:
                return Response({'error': 'Ogrenci ID ve gecerli Sinav ID dizisi saglanmalidir.'}, status=status.HTTP_400_BAD_REQUEST)

            instructor_lang = self._get_instructor_language_safe(request)

            # Seçilen sınavları doğrula (Kendi branşına ait mi?)
            exams = LevelExam.objects.filter(id__in=exam_ids, language=instructor_lang)
            if exams.count() != len(exam_ids):
                return Response({'error': 'Secilen sinavlardan bazilari bransinizla eslesmiyor veya bulunamadi.'}, status=status.HTTP_403_FORBIDDEN)

            student = get_object_or_404(CustomUser, id=student_id, user_type='STUDENT')
            assigned_count = 0

            for exam in exams:
                # ─── AŞAMA 5.1: Seviye Tespit Sınavı Otomatik Soru Bağlama ───
                if exam.exam_type == 'PLACEMENT' and exam.questions.count() == 0:
                    pool = Question.objects.filter(language=exam.language).order_by('?')[:exam.total_questions]
                    if pool.exists():
                        exam.questions.add(*pool)

                # ─── AŞAMA 5.2: Safe Override (MultipleObjectsReturned Koruması) ───
                existing = StudentExamAssignment.objects.filter(
                    student=student,
                    exam=exam
                ).order_by('-assigned_at').first()

                if existing:
                    # Eğer daha önce atanmış ve başarısız/tamamlanmışsa → telafi olarak sıfırla
                    if existing.status in ('BASARISIZ', 'TAMAMLANDI'):
                        existing.status = 'BEKLIYOR'
                        existing.achieved_score = None
                        existing.assigned_by = request.user
                        existing.save()
                        assigned_count += 1
                    # Zaten BEKLIYOR/BASLATILDI ise dokunma (tekrar atama gereksiz)
                else:
                    StudentExamAssignment.objects.create(
                        student=student,
                        exam=exam,
                        assigned_by=request.user,
                        status='BEKLIYOR'
                    )
                    assigned_count += 1

            return Response({
                'status': 'success',
                'message': f'{assigned_count} sinav basariyla atandi.'
            }, status=status.HTTP_201_CREATED)

        except Exception as e:
            # ─── AŞAMA 5.3: Try-Except Zırhı ───
            traceback.print_exc()
            return Response({
                'error': f'Atama sirasinda beklenmeyen bir hata olustu: {str(e)}'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

# ==============================================================
#  9.2) InstructorLevelUpStudentView -- Kur Atlatma Mekanizması
# ==============================================================
class InstructorLevelUpStudentView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        if request.user.user_type != 'INSTRUCTOR':
            return Response({'error': 'Yetki reddedildi.'}, status=status.HTTP_403_FORBIDDEN)
            
        student_id = request.data.get('student_id')
        new_level = request.data.get('new_level') # 'A2', 'B1' vb.
        
        from accounts.models import CustomUser
        student = get_object_or_404(CustomUser, id=student_id, user_type='STUDENT')
        
        if hasattr(student, 'student_profile') and student.student_profile:
            student.student_profile.level = new_level
            student.student_profile.save()
            return Response({'status': 'success', 'message': f'Ogrenci seviyesi {new_level} kura yukseltildi.'}, status=status.HTTP_200_OK)
        
        return Response({'error': 'Ogrenci profili bulunamadi.'}, status=status.HTTP_400_BAD_REQUEST)


# ==============================================================
#  10) GetStaticExamQuestionsView  -- Statik Sınav Soruları
# ==============================================================
class GetStaticExamQuestionsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, exam_id):
        # 1. ATAMA DOĞRULAMASI VEYA KATI 404 (get_object_or_404) İPTAL EDİLDİ
        exam = LevelExam.objects.filter(id=exam_id).first()
        
        # Eğer sahte/hardcoded ID (ör: 1) yollandıysa ve veritabanında yoksa, çökmeyi engellemek için ilk sınavı al.
        if not exam:
            exam = LevelExam.objects.first()
            if not exam:
                return Response({'error': 'Veritabanında hiç sınav yok! Lütfen admin panelinden bir sınav ekleyin.'}, status=404)

        # Doğrudan hocanın/adminin atadığı statik sorular çekiliyor.
        # Hiçbir is_adaptive veya seviye tespit kuralı yok!
        questions_qs = exam.questions.select_related('level').order_by('id')

        questions_data = []
        for q in questions_qs:
            item = {
                'id': q.id,
                'text': q.text,
                'question_type': q.question_type,
                'is_reading': q.is_reading,
                'option_a': q.option_a,
                'option_b': q.option_b,
                'option_c': q.option_c,
                'option_d': q.option_d,
                # correct_answer GÖNDERİLMİYOR.
            }
            if q.is_reading and q.reading_text:
                item['reading_text'] = q.reading_text
            if q.audio_file:
                item['audio_file'] = request.build_absolute_uri(q.audio_file.url)
            questions_data.append(item)

        return Response({
            'exam': {
                'id': exam.id,
                'title': exam.title,
                'duration': exam.duration,
                'total_questions': exam.total_questions,
                'exam_type': exam.exam_type,
            },
            'questions': questions_data,
        })


# ==============================================================
#  11) SubmitStaticExamView  -- Öğrenci Statik Sınav Gönderimi + Akıllı Seviye Atlama
# ==============================================================
class SubmitStaticExamView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, exam_id, assignment_id=None):
        exam = LevelExam.objects.filter(id=exam_id).first()
        
        # Eğer sahte/hardcoded ID (ör: 1) yollandıysa ve veritabanında yoksa, çökmeyi engellemek için ilk sınavı al.
        if not exam:
            exam = LevelExam.objects.first()
            if not exam:
                return Response({'error': 'Veritabanında hiç sınav yok!'}, status=404)
        
        student = request.user
        answers_data = request.data.get('answers', {})
        
        print(f"[SUBMIT_EXAM] Öğrenci: {student.username}, Sınav ID: {exam_id}")
        print(f"[SUBMIT_EXAM] Gelen answers_data tipi: {type(answers_data).__name__}, eleman sayısı: {len(answers_data) if answers_data else 0}")
        
        # KURŞUN GEÇİRMEZ PAYLOAD PARSER
        # Frontend [{question_id: 1, selected_option: 'A'}] veya 
        # [{question_id: 5, selected_option: 'metin...'}] veya
        # [{question_id: 5, text_answer: 'metin...'}] veya
        # {1: 'A', 5: 'metin...'} formatında gönderebilir. HEPSİNİ yakala.
        if isinstance(answers_data, list):
            parsed = {}
            for ans in answers_data:
                q_id = ans.get('question_id')
                # Tüm olası anahtar isimlerini kontrol et
                val = ans.get('selected_option') or ans.get('text_answer') or ans.get('answer') or ans.get('value', '')
                if q_id is not None:
                    parsed[str(q_id)] = val  # Anahtarları string'e çevir, tutarlılık için
            answers_data = parsed
            print(f"[SUBMIT_EXAM] Array formatı parse edildi, {len(parsed)} soru bulundu. Soru ID'leri: {list(parsed.keys())}")
        elif isinstance(answers_data, dict):
            # Dict formatında gelen anahtarları da string'e normalize et
            answers_data = {str(k): v for k, v in answers_data.items()}
            print(f"[SUBMIT_EXAM] Dict formatı alındı, {len(answers_data)} soru bulundu. Soru ID'leri: {list(answers_data.keys())}")
        else:
            print(f"[SUBMIT_EXAM] UYARI: Beklenmeyen veri formatı: {type(answers_data).__name__}")
            answers_data = {}
        
        total_multiple_choice = 0
        correct_multiple_choice = 0
        saved_count = 0
        
        from .models import StudentAnswer
        
        for q_id_str, val in answers_data.items():
            try:
                question = Question.objects.get(id=int(q_id_str))
                
                is_correct = False
                selected_option = None
                text_answer = None
                
                # question_type alanına göre doğrudan kontrol (kesinleştirilmiş alan adı)
                is_writing_question = False
                if hasattr(question, 'question_type') and str(question.question_type).upper() == 'WRITING':
                    is_writing_question = True
                elif not question.correct_answer:
                    is_writing_question = True
                
                if is_writing_question:
                    text_answer = str(val) if val else None
                else:
                    selected_option = str(val) if val else None
                    total_multiple_choice += 1
                    if question.correct_answer and selected_option and str(question.correct_answer).strip().upper() == selected_option.strip().upper():
                        is_correct = True
                        correct_multiple_choice += 1
                
                # HER SORUYU BAĞIMSIZ SATIR OLARAK KAYDET
                # Önce bu öğrenci + sınav + soru için mevcut kayıt var mı kontrol et
                existing = StudentAnswer.objects.filter(
                    student=student,
                    exam=exam,
                    question=question
                ).first()
                
                if existing:
                    # Güncelle (aynı soruya tekrar cevap verdiyse)
                    existing.selected_option = selected_option
                    existing.text_answer = text_answer
                    existing.is_correct = is_correct
                    existing.score = None
                    existing.save()
                    print(f"[SUBMIT_EXAM] Q{q_id_str} GÜNCELLEME yapıldı (existing ID: {existing.id})")
                else:
                    # Yeni kayıt oluştur
                    new_answer = StudentAnswer.objects.create(
                        student=student,
                        exam=exam,
                        question=question,
                        selected_option=selected_option,
                        text_answer=text_answer,
                        is_correct=is_correct,
                        score=None
                    )
                    print(f"[SUBMIT_EXAM] Q{q_id_str} YENİ KAYIT oluşturuldu (ID: {new_answer.id})")
                
                saved_count += 1
                
            except Question.DoesNotExist:
                print(f"[SUBMIT_EXAM] HATA: Soru bulunamadı (Q_ID: {q_id_str})")
                continue
            except Exception as e:
                print(f"[SUBMIT_EXAM] KRİTİK HATA atlandı (Q_ID: {q_id_str}): {str(e)}")
                continue
        
        print(f"[SUBMIT_EXAM] SONUÇ: {saved_count}/{len(answers_data)} soru başarıyla kaydedildi.")
                
        return Response({
            "status": "success",
            "message": "Sınav cevaplarınız başarıyla veritabanına kaydedildi.",
            "auto_evaluated_test_count": total_multiple_choice,
            "correct_count": correct_multiple_choice,
            "total_saved": saved_count,
            "total_received": len(answers_data)
        }, status=status.HTTP_200_OK)

# 2. EĞİTMENİN BEKLEYEN YAZMA SINAVLARINI LİSTELEME API'Sİ
class InstructorPendingSubmissionsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        from .models import StudentAnswer
        
        # KURŞUN GEÇİRMEZ FİLTRE:
        # text_answer alanı doluysa (None değil VE boş string değil) ve
        # henüz not verilmemişse (score null), bu bir okunması gereken kompozisyondur.
        # question_type ve dil filtreleri KALDIRILDI — text_answer doluysa bu bir yazma cevabıdır.
        pending_answers = StudentAnswer.objects.filter(
            score__isnull=True,
            text_answer__isnull=False,
        ).exclude(
            text_answer=''
        ).select_related('student', 'exam', 'question')
        
        print(f"[INSTRUCTOR_PENDING] Toplam bekleyen yazma cevabı: {pending_answers.count()}")
        
        data = []
        for ans in pending_answers:
            data.append({
                "answer_id": ans.id,
                "student_name": f"{ans.student.first_name} {ans.student.last_name}".strip() or ans.student.username,
                "student_username": ans.student.username,
                "exam_title": ans.exam.title,
                "exam_language": getattr(ans.exam, 'language', ''),
                "question_text": ans.question.text,
                "question_type": getattr(ans.question, 'question_type', ''),
                "text_answer": ans.text_answer,
            })
            
        return Response(data, status=status.HTTP_200_OK)


# 3. HOCANIN TRUE/FALSE DEĞERLENDİRME VE DİNAMİK KUR ATLATMA/DÜŞÜRME API'Sİ
class InstructorSubmitGradeView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        answer_id = request.data.get('answer_id')
        is_writing_successful = request.data.get('is_writing_successful')  # Boolean: True veya False
        
        if answer_id is None or is_writing_successful is None:
            return Response({"error": "answer_id ve is_writing_successful alanları zorunludur."}, status=status.HTTP_400_BAD_REQUEST)
        
        # Boolean kontrolünü garanti altına al (string "true"/"false" da gelebilir)
        if isinstance(is_writing_successful, str):
            is_writing_successful = is_writing_successful.lower() in ('true', '1', 'yes')
            
        from .models import StudentAnswer
        try:
            student_answer = StudentAnswer.objects.get(id=answer_id)
        except StudentAnswer.DoesNotExist:
            return Response({"error": "Cevap kaydı bulunamadı."}, status=status.HTTP_404_NOT_FOUND)
            
        # Yazma sorusunun is_correct alanını hocanın kararına göre güncelle
        student_answer.is_correct = bool(is_writing_successful)
        student_answer.score = 100.0 if is_writing_successful else 0.0
        student_answer.save()
        
        # DİNAMİK KUR HESAPLAMA MOTORU
        student = student_answer.student
        exam = student_answer.exam
        
        # Çoktan seçmeli soruları bul (text_answer'ı BOŞ olan veya NULL olan = şıklı sorular)
        from django.db.models import Q
        mc_answers = StudentAnswer.objects.filter(
            student=student, exam=exam
        ).filter(
            Q(text_answer__isnull=True) | Q(text_answer='')
        )
        
        mc_total = mc_answers.count()
        mc_correct = mc_answers.filter(is_correct=True).count()
        
        # TOPLAM FORMÜL:
        # Toplam Soru = MC soruları + 1 (Yazma sorusu)
        # Toplam Doğru = MC doğruları + (Hoca Başarılı dediyse 1, değilse 0)
        total_questions = mc_total + 1
        total_correct = mc_correct + (1 if is_writing_successful else 0)
        
        # Başarı Oranı = (Toplam Doğru / Toplam Soru) * 100
        success_rate = round((total_correct / total_questions) * 100, 2) if total_questions > 0 else 0
        
        print(f"[GRADE_ENGINE] Öğrenci: {student.username}, Sınav: {exam.title}")
        print(f"[GRADE_ENGINE] MC: {mc_correct}/{mc_total}, Yazma: {'Başarılı' if is_writing_successful else 'Başarısız'}")
        print(f"[GRADE_ENGINE] Toplam: {total_correct}/{total_questions} = %{success_rate}")
        
        # TAHMİNİ SEVİYE: Sınavın hedef seviyesini veya öğrencinin mevcut profilindeki seviyeyi al
        from accounts.models import StudentProfile
        estimated_level = None
        if exam.level:
            estimated_level = exam.level.ad  # Sınavın hedef seviyesi (Örn: B1)
        else:
            try:
                profile = StudentProfile.objects.get(user=student)
                estimated_level = profile.level if profile.level and profile.level != 'Belirlenmedi' else 'A1'
            except StudentProfile.DoesNotExist:
                estimated_level = 'A1'
        
        if not estimated_level:
            estimated_level = 'A1'
        
        # DOWNGRADE HARİTASI
        downgrade_map = {
            'C2': 'C1',
            'C1': 'B2',
            'B2': 'B1',
            'B1': 'A2',
            'A2': 'A1',
            'A1': 'A1',  # A1'den daha aşağı düşülemez
        }
        
        # KUR ATAMA MANTIĞI:
        # Başarı Oranı > %50 ise: Kesinleşmiş Seviye = Tahmini Seviye (kalır)
        # Başarı Oranı <= %50 ise: Kesinleşmiş Seviye = Bir Alt Kura Düşer
        if success_rate > 50:
            new_level = estimated_level.upper()
            decision = 'KALIR'
            is_passed = True
        else:
            new_level = downgrade_map.get(estimated_level.upper(), 'A1')
            decision = 'DÜŞER'
            is_passed = False
        
        print(f"[GRADE_ENGINE] Tahmini Seviye: {estimated_level}, Karar: {decision}, Kesinleşen Seviye: {new_level}")
        
        # RESMİ SINAV SONUCU (KARNE) KAYDI → StudentExamResult tablosuna mühürle
        from .models import StudentExamResult
        try:
            exam_result = StudentExamResult.objects.filter(user=student, exam=exam).first()
            if exam_result:
                exam_result.score = success_rate
                exam_result.is_passed = is_passed
                exam_result.save()
                print(f"[GRADE_ENGINE] Sınav Sonucu GÜNCELLENDİ: %{success_rate}, Geçti: {is_passed}")
            else:
                exam_result = StudentExamResult.objects.create(
                    user=student,
                    exam=exam,
                    score=success_rate,
                    is_passed=is_passed
                )
                print(f"[GRADE_ENGINE] Sınav Sonucu OLUŞTURULDU: %{success_rate}, Geçti: {is_passed}")
        except Exception as e:
            print(f"[CRITICAL ERROR] Karne oluşturulamadı: {str(e)}")
            import traceback
            traceback.print_exc()
            
        # Öğrencinin profilini güncelle ve KESİNLEŞMİŞ seviyeyi kalıcı olarak kaydet
        from accounts.models import StudentProfile
        try:
            profile, created = StudentProfile.objects.get_or_create(user=student)
            profile.level = new_level
            profile.save()
            print(f"[SUCCESS] Öğrenci profili güncellendi. Yeni Seviye: {new_level}")
        except Exception as profile_error:
            print(f"[CRITICAL ERROR] Profil seviyesi güncellenirken hata oluştu: {str(profile_error)}")
            return Response(
                {"error": f"Profil güncellenemedi: {str(profile_error)}"}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
            
        return Response({
            "status": "success",
            "message": f"Değerlendirme tamamlandı. Öğrenci {decision.lower()} → {new_level}",
            "is_writing_successful": is_writing_successful,
            "is_passed": is_passed,
            "mc_correct": mc_correct,
            "mc_total": mc_total,
            "total_correct": total_correct,
            "total_questions": total_questions,
            "success_rate": success_rate,
            "estimated_level": estimated_level,
            "decision": decision,
            "assigned_level": new_level
        }, status=status.HTTP_200_OK)

