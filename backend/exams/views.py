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

    def get(self, request):
        level = request.query_params.get('level')
        is_reading = request.query_params.get('is_reading')
        question_type = request.query_params.get('question_type')

        queryset = Question.objects.all()
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

            question = Question.objects.create(
                level=level_obj,
                language=data.get('language', 'turkce'),
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
#  5) AdminExamListView  -- Sinav CRUD
# ==============================================================
class AdminExamListView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        exams = LevelExam.objects.all().order_by('-id')
        data = []
        for e in exams:
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

            exam = LevelExam.objects.create(
                title=data.get('title', 'Isimsiz Sinav'),
                exam_type=exam_type,
                language=data.get('language', 'turkce'),
                level=level_obj,
                passing_score=passing_score,
                duration=duration,
                total_questions=total_q,
                
            )

            # M2M soru atamasi (sadece adaptif degilse ve soru ID'leri varsa)
            if questions_data:
                existing_questions = Question.objects.filter(id__in=questions_data)
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
#  9) StudentAvailableExamsView  -- Öğrencinin Dili + Seviyesiyle Eşleşen Sınavlar
# ==============================================================
class StudentAvailableExamsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        if not user.user_type or str(user.user_type).strip().upper() != 'STUDENT':
            return Response({'error': 'Yetkiniz yok.'}, status=status.HTTP_403_FORBIDDEN)

        # OVERRIDE: Tüm katı dil/seviye filtreleri iptal edildi
        # Direkt olarak veritabanındaki yayında olan tüm sınavları getir (is_published=True)
        exams = LevelExam.objects.filter(is_published=True).order_by('-id')

        data = []
        for e in exams:
            data.append({
                'id': e.id,
                'title': e.title,
                'exam_type': e.exam_type,
                'exam_type_display': e.get_exam_type_display(),
                'duration': e.duration,
                'total_questions': e.total_questions,
                'level': e.level.ad if e.level else None,
                'passing_score': e.passing_score,
            })

        return Response(data, status=status.HTTP_200_OK)


# ==============================================================
#  10) GetStaticExamQuestionsView  -- Statik Sınav Soruları
# ==============================================================
class GetStaticExamQuestionsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, exam_id):
        exam = get_object_or_404(LevelExam, id=exam_id)

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

    def post(self, request):
        user = request.user
        exam_id = request.data.get('exam_id')
        # answers formati hem Liste hem Sozluk(dict) desteklesin
        answers_data = request.data.get('answers', [])
        if isinstance(answers_data, dict):
            answers_list = [{'question_id': k, 'selected_option': v} for k, v in answers_data.items()]
        else:
            answers_list = answers_data

        if not exam_id:
            return Response({'error': 'exam_id zorunludur.'}, status=status.HTTP_400_BAD_REQUEST)

        exam = get_object_or_404(LevelExam, id=exam_id)
        questions_qs = exam.questions.all()

        correct_count = 0
        wrong_count = 0
        from .models import StudentWritingSubmission

        for ans in answers_list:
            q_id_str = str(ans.get('question_id'))
            selected = ans.get('selected_option', '')

            q_obj = [q for q in questions_qs if str(q.id) == q_id_str]
            if not q_obj:
                continue
            question = q_obj[0]

            # ── 1. KONTROL: WRITING İSE PUANLAMADAN MUAF TUT & KAYDET ──
            if question.question_type == 'WRITING' or not any([question.option_a, question.option_b, question.option_c, question.option_d]):
                StudentWritingSubmission.objects.create(
                    exam=exam,
                    student=user,
                    question=question,
                    user_text=selected
                )
                continue

            # ── 2. NORMAL TEST PUANLAMASI ──
            real_answer = question.correct_answer
            if real_answer is None:
                continue
            if str(selected).upper().strip() == str(real_answer).upper().strip():
                correct_count += 1
            else:
                wrong_count += 1

        total = correct_count + wrong_count
        score_percent = round((correct_count / total) * 100, 1) if total > 0 else 0

        from .models import StudentExamResult, StudentExamAssignment
        StudentExamResult.objects.create(
            user=user,
            exam=exam,
            score=score_percent,
            is_passed=(score_percent >= exam.passing_score),
        )

        StudentExamAssignment.objects.filter(
            student=user, exam=exam,
        ).exclude(status='TAMAMLANDI').update(status='TAMAMLANDI')

        # ── AKILLI SEVİYE ATLATMA: Sadece PLACEMENT (Seviye Tespit) sınavları için ──
        new_level = None
        if exam.exam_type == 'PLACEMENT':
            if score_percent <= 30:
                new_level = 'A1'
            elif score_percent <= 50:
                new_level = 'A2'
            elif score_percent <= 75:
                new_level = 'B1'
            else:
                new_level = 'B2'

            # Öğrenci profilindeki seviyeyi güncelle
            try:
                profile = user.student_profile
                profile.level = new_level
                profile.save(update_fields=['level'])
                print(f"[PLACEMENT] Öğrenci {user.username} seviyesi {new_level} olarak güncellendi (skor: {score_percent}%)")
            except Exception as e:
                print(f"[PLACEMENT] Seviye güncellenirken hata: {e}")

        response_data = {
            'status': 'success',
            'score': score_percent,
            'correct': correct_count,
            'wrong': wrong_count,
            'total': total,
            'is_passed': score_percent >= exam.passing_score,
            'passing_score': exam.passing_score,
        }

        if new_level:
            response_data['new_level'] = new_level

        return Response(response_data)
