from django.urls import path
from .views import (
    StartAdaptiveExamView,
    SubmitAnswerAndGetNextView,
    GetExamResultView,
    AdminQuestionPoolView,
    AdminExamListView,
    AdminExamDetailView,
    AdminAssignExamView,
    StudentPendingExamsView,
    StudentAvailableExamsView,
    GetStaticExamQuestionsView,
    SubmitStaticExamView,
    ToggleExamStatusView,
)

urlpatterns = [
    # Ogrenci Sinav Uc Noktalari
    path('start/', StartAdaptiveExamView.as_view(), name='start-exam'),
    path('submit-answer/', SubmitAnswerAndGetNextView.as_view(), name='submit-answer'),
    path('result/<int:session_id>/', GetExamResultView.as_view(), name='get-result'),
    path('my-assignments/', StudentPendingExamsView.as_view(), name='my-assignments'),
    path('student/available-exams/', StudentAvailableExamsView.as_view(), name='student-available-exams'),

    # Statik Sinav Motoru (Exam Player)
    path('student/get-exam-questions/<int:exam_id>/', GetStaticExamQuestionsView.as_view(), name='get-exam-questions'),
    path('student/submit-static-exam/', SubmitStaticExamView.as_view(), name='submit-static-exam'),

    # Super Admin Uc Noktalari
    path('admin/questions/', AdminQuestionPoolView.as_view(), name='admin-questions'),
    path('admin/list/', AdminExamListView.as_view(), name='admin-exams'),
    path('admin/detail/<int:exam_id>/', AdminExamDetailView.as_view(), name='admin-exam-detail'),
    path('admin/assign/', AdminAssignExamView.as_view(), name='admin-assign-exam'),
    path('admin/toggle-status/<int:exam_id>/', ToggleExamStatusView.as_view(), name='admin-toggle-status'),
]
