from django.contrib import admin
from .models import MaterialCategory, CourseMaterial, StudentNote, InstructorTask, LiveClass

@admin.register(MaterialCategory)
class MaterialCategoryAdmin(admin.ModelAdmin):
    list_display = ('name', 'icon_type')

@admin.register(CourseMaterial)
class CourseMaterialAdmin(admin.ModelAdmin):
    list_display = ('title', 'language', 'level', 'category')
    list_filter = ('language', 'level', 'category')
    search_fields = ('title',)

@admin.register(StudentNote)
class StudentNoteAdmin(admin.ModelAdmin):
    list_display = ('student', 'material', 'updated_at')
    list_filter = ('updated_at',)
    search_fields = ('student__username', 'student__first_name', 'student__last_name', 'material__title')

@admin.register(InstructorTask)
class InstructorTaskAdmin(admin.ModelAdmin):
    list_display = ('instructor', 'student', 'task_type', 'is_completed', 'created_at')
    list_filter = ('is_completed', 'task_type', 'created_at')
    search_fields = ('instructor__username', 'student__username', 'task_type')

@admin.register(LiveClass)
class LiveClassAdmin(admin.ModelAdmin):
    list_display = ('instructor', 'meet_link', 'is_active', 'created_at')
    list_filter = ('is_active', 'created_at')
    search_fields = ('instructor__username', 'instructor__first_name', 'instructor__last_name')
