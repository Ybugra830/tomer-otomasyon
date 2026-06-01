from django.db import models
from accounts.models import CustomUser

class MaterialCategory(models.Model): # Gramer, Dinleme, Okuma vb.
    name = models.CharField(max_length=100)
    icon_type = models.CharField(max_length=50, choices=[('pdf', 'PDF'), ('audio', 'Audio'), ('video', 'Video')])
    
    def __str__(self):
        return self.name

class CourseMaterial(models.Model):
    title = models.CharField(max_length=255)
    category = models.ForeignKey(MaterialCategory, on_delete=models.CASCADE, related_name='materials')
    language = models.CharField(max_length=50, choices=[('turkce', 'Türkçe'), ('ingilizce', 'İngilizce'), ('almanca', 'Almanca')])
    level = models.CharField(max_length=10, choices=[('A1', 'A1'), ('A2', 'A2'), ('B1', 'B1'), ('B2', 'B2'), ('C1', 'C1')], blank=True, default='A1')
    file = models.FileField(upload_to='materials/')
    file_size = models.CharField(max_length=20, help_text="Örn: 2.4 MB", blank=True, default='')
    supplementary_file = models.FileField(upload_to='materials/extras/', null=True, blank=True)
    uploaded_by = models.ForeignKey(CustomUser, on_delete=models.SET_NULL, null=True, blank=True, related_name='uploaded_materials')
    created_at = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return f"[{self.language.upper()} - {self.level}] {self.title}"

class StudentNote(models.Model):
    student = models.ForeignKey(CustomUser, on_delete=models.CASCADE, related_name='material_notes', limit_choices_to={'user_type': 'STUDENT'})
    material = models.ForeignKey(CourseMaterial, on_delete=models.CASCADE, related_name='student_notes')
    note_text = models.TextField()
    updated_at = models.DateTimeField(auto_now=True)

class InstructorTask(models.Model):
    instructor = models.ForeignKey(CustomUser, on_delete=models.CASCADE, related_name='assigned_tasks', limit_choices_to={'user_type': 'INSTRUCTOR'})
    student = models.ForeignKey(CustomUser, on_delete=models.CASCADE, related_name='my_tasks', limit_choices_to={'user_type': 'STUDENT'})
    title = models.CharField(max_length=255, blank=True, default='')
    task_type = models.CharField(max_length=100) # Dinleme Egzersizi, Gramer Testi vb.
    message = models.TextField(blank=True, default='')
    file = models.FileField(upload_to='instructor_tasks/', null=True, blank=True)
    supplementary_file = models.FileField(upload_to='materials/extras/', null=True, blank=True)
    is_completed = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
