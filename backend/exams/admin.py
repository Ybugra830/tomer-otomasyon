from django.contrib import admin
from .models import Question, LevelExam, StudentExamResult, StudentExamSession, StudentAdaptiveAnswer, StudentExamAssignment


@admin.register(Question)
class QuestionAdmin(admin.ModelAdmin):
    list_display = ('level', 'short_text', 'is_reading', 'correct_answer')
    list_filter = ('level', 'correct_answer', 'is_reading')
    search_fields = ('text', 'reading_text')
    ordering = ('level', 'id')
    fieldsets = (
        ('Soru Bilgileri', {
            'fields': ('level', 'text', 'is_reading', 'reading_text')
        }),
        ('Şıklar ve Cevap', {
            'fields': ('option_a', 'option_b', 'option_c', 'option_d', 'correct_answer')
        }),
    )

    def short_text(self, obj):
        return obj.text[:100] + "..." if len(obj.text) > 100 else obj.text
    short_text.short_description = 'Soru Metni'


@admin.register(LevelExam)
class LevelExamAdmin(admin.ModelAdmin):
    list_display = ('title', 'level', 'duration', 'is_adaptive', 'passing_score', 'total_questions')
    list_filter = ('is_adaptive', 'level')


@admin.register(StudentExamSession)
class StudentExamSessionAdmin(admin.ModelAdmin):
    list_display = ('student', 'exam', 'current_level', 'question_counter', 'correct_counter', 'is_completed', 'started_at')
    list_filter = ('is_completed', 'current_level')
    search_fields = ('student__username', 'student__first_name', 'student__last_name')
    readonly_fields = ('started_at',)
    ordering = ('-started_at',)


@admin.register(StudentAdaptiveAnswer)
class StudentAdaptiveAnswerAdmin(admin.ModelAdmin):
    list_display = ('session', 'question', 'selected_option', 'is_correct')
    list_filter = ('is_correct',)
    search_fields = ('session__student__username',)


@admin.register(StudentExamResult)
class StudentExamResultAdmin(admin.ModelAdmin):
    list_display = ('user', 'exam', 'score', 'is_passed', 'exam_date')
    list_filter = ('is_passed', 'exam')
    search_fields = ('user__username', 'user__first_name', 'user__last_name')
    readonly_fields = ('exam_date',)
    ordering = ('-exam_date',)


@admin.register(StudentExamAssignment)
class StudentExamAssignmentAdmin(admin.ModelAdmin):
    list_display = ('student', 'exam', 'status', 'assigned_at')
    list_filter = ('status', 'exam')
    search_fields = ('student__username', 'student__first_name', 'student__last_name')
    readonly_fields = ('assigned_at',)
    ordering = ('-assigned_at',)
