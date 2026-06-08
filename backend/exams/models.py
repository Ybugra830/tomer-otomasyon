from django.db import models
from django.conf import settings


class LevelExam(models.Model):
    """Sinav Tanimlama Tablosu - Adaptive veya klasik sinav kurallari"""
    EXAM_TYPE_CHOICES = [
        ('PLACEMENT', 'Seviye Tespit Sinavi'),
        ('GRAMMAR', 'Ana Test (Gramer)'),
        ('LISTENING', 'Dinleme Sinavi'),
        ('READING', 'Okuma Sinavi'),
        ('WRITING', 'Yazma Sinavi'),
    ]

    title = models.CharField(max_length=200, verbose_name='Sinav Basligi')
    exam_type = models.CharField(
        max_length=50,
        choices=EXAM_TYPE_CHOICES,
        default='PLACEMENT',
        verbose_name='Sinav Turu',
    )
    duration = models.IntegerField(default=60, verbose_name='Sure (dakika)')
    # is_adaptive silindi (statik yapiya zorunlu gecis)
    language = models.CharField(
        max_length=50,
        choices=[('turkce', 'Türkçe'), ('ingilizce', 'İngilizce'), ('almanca', 'Almanca')],
        default='turkce',
        verbose_name='Dil'
    )

    # Eski alanlar korunuyor (geriye uyumluluk)
    level = models.ForeignKey(
        'api.Seviye',
        on_delete=models.CASCADE,
        related_name='exams',
        verbose_name='Seviye',
        blank=True,
        null=True,
    )
    passing_score = models.IntegerField(default=70, verbose_name='Gecme Baraji (%)')
    is_published = models.BooleanField(default=False, verbose_name='Yayında mı?')
    total_questions = models.IntegerField(default=20, verbose_name='Toplam Soru Sayisi')

    # Statik sinavlar icin M2M soru iliskisi
    questions = models.ManyToManyField(
        'Question',
        blank=True,
        related_name='exams',
        verbose_name='Sinav Sorulari',
    )

    class Meta:
        verbose_name = 'Seviye Tespit Sinavi'
        verbose_name_plural = 'Seviye Tespit Sinavlari'

    def __str__(self):
        return self.title


class Question(models.Model):
    """Soru Havuzu - Tum sinav turleri icin sorular"""
    ANSWER_CHOICES = [
        ('A', 'A'),
        ('B', 'B'),
        ('C', 'C'),
        ('D', 'D'),
    ]

    QUESTION_TYPE_CHOICES = [
        ('GRAMMAR', 'Gramer'),
        ('READING', 'Okuma'),
        ('LISTENING', 'Dinleme'),
        ('WRITING', 'Yazma'),
    ]

    level = models.ForeignKey(
        'api.Seviye',
        on_delete=models.CASCADE,
        related_name='sorular',
        verbose_name='Seviye'
    )
    text = models.TextField(verbose_name='Soru Metni')

    question_type = models.CharField(
        max_length=20,
        choices=QUESTION_TYPE_CHOICES,
        default='GRAMMAR',
        verbose_name='Soru Tipi',
    )
    language = models.CharField(
        max_length=50,
        choices=[('turkce', 'Türkçe'), ('ingilizce', 'İngilizce'), ('almanca', 'Almanca')],
        default='turkce',
        verbose_name='Dil'
    )

    # Reading parcasi destegi
    is_reading = models.BooleanField(default=False, verbose_name='Reading sorusu mu?')
    reading_text = models.TextField(
        blank=True,
        null=True,
        verbose_name='Reading Paragraf Metni',
    )

    # Dinleme sinavi icin ses dosyasi
    audio_file = models.FileField(
        upload_to='listening_audios/',
        null=True,
        blank=True,
        verbose_name='Ses Dosyasi (MP3)',
    )

    # Siklar - Yazma/Konusma sinavlarinda bos olabilir
    option_a = models.CharField(max_length=500, verbose_name='A Sikki', null=True, blank=True)
    option_b = models.CharField(max_length=500, verbose_name='B Sikki', null=True, blank=True)
    option_c = models.CharField(max_length=500, verbose_name='C Sikki', null=True, blank=True)
    option_d = models.CharField(max_length=500, verbose_name='D Sikki', null=True, blank=True)
    correct_answer = models.CharField(
        max_length=1,
        choices=ANSWER_CHOICES,
        verbose_name='Dogru Cevap',
        null=True,
        blank=True,
    )

    class Meta:
        verbose_name = 'Soru'
        verbose_name_plural = 'Sorular'

    def __str__(self):
        tag = "[{}] ".format(self.get_question_type_display())
        return "{}[{}] {}".format(tag, self.level, self.text[:80])


class StudentExamSession(models.Model):
    """Öğrencinin aktif Adaptive sınav oturumu"""
    student = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='exam_sessions',
        verbose_name='Öğrenci'
    )
    exam = models.ForeignKey(
        LevelExam,
        on_delete=models.CASCADE,
        related_name='sessions',
        verbose_name='Sınav'
    )
    current_level = models.ForeignKey(
        'api.Seviye',
        on_delete=models.SET_NULL,
        null=True,
        related_name='active_sessions',
        verbose_name='Anlık Seviye'
    )
    question_counter = models.IntegerField(default=0, verbose_name='Sorulan Soru Sayısı')
    correct_counter = models.IntegerField(default=0, verbose_name='Doğru Cevap Sayısı')
    is_completed = models.BooleanField(default=False, verbose_name='Tamamlandı mı?')
    started_at = models.DateTimeField(auto_now_add=True, verbose_name='Başlangıç Zamanı')

    class Meta:
        verbose_name = 'Sınav Oturumu'
        verbose_name_plural = 'Sınav Oturumları'
        ordering = ['-started_at']

    def __str__(self):
        durum = "✅ Tamamlandı" if self.is_completed else "⏳ Devam Ediyor"
        return f"{self.student} - {self.exam.title} ({durum})"


class StudentAdaptiveAnswer(models.Model):
    """Öğrencinin sınavda verdiği anlık cevaplar"""
    session = models.ForeignKey(
        StudentExamSession,
        on_delete=models.CASCADE,
        related_name='answers',
        verbose_name='Oturum'
    )
    question = models.ForeignKey(
        Question,
        on_delete=models.CASCADE,
        related_name='adaptive_answers',
        verbose_name='Soru'
    )
    selected_option = models.CharField(max_length=1, verbose_name='Seçilen Şık')
    is_correct = models.BooleanField(verbose_name='Doğru mu?')

    class Meta:
        verbose_name = 'Adaptive Cevap'
        verbose_name_plural = 'Adaptive Cevaplar'

    def __str__(self):
        sonuc = "✅" if self.is_correct else "❌"
        return f"{self.session.student} → Q{self.question.id} → {self.selected_option} {sonuc}"


class StudentExamResult(models.Model):
    """Öğrenci Sınav Sonuçları (Geriye uyumlu - eski klasik sınav sonuçları)"""
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='sinav_sonuclari',
        verbose_name='Öğrenci'
    )
    exam = models.ForeignKey(
        LevelExam,
        on_delete=models.CASCADE,
        related_name='sonuclar',
        verbose_name='Sınav'
    )
    score = models.FloatField(verbose_name='Alınan Puan')
    is_passed = models.BooleanField(default=False, verbose_name='Geçti mi?')
    exam_date = models.DateTimeField(auto_now_add=True, verbose_name='Sınav Tarihi')

    class Meta:
        verbose_name = 'Sınav Sonucu'
        verbose_name_plural = 'Sınav Sonuçları'
        ordering = ['-exam_date']

    def __str__(self):
        durum = "GEÇTİ ✅" if self.is_passed else "KALDI ❌"
        return f"{self.user.first_name} {self.user.last_name} - {self.exam.title} - {self.score}% ({durum})"


class StudentExamAssignment(models.Model):
    """Admin tarafından öğrenciye atanan sınavlar"""
    STATUS_CHOICES = [
        ('BEKLIYOR', 'Bekliyor'),
        ('BASLATILDI', 'Başlatıldı'),
        ('TAMAMLANDI', 'Tamamlandı'),
    ]

    student = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='exam_assignments',
        verbose_name='Öğrenci'
    )
    exam = models.ForeignKey(
        LevelExam,
        on_delete=models.CASCADE,
        related_name='assignments',
        verbose_name='Sınav'
    )
    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default='BEKLIYOR',
        verbose_name='Durum'
    )
    assigned_at = models.DateTimeField(auto_now_add=True, verbose_name='Atanma Tarihi')

    class Meta:
        verbose_name = 'Sınav Ataması'
        verbose_name_plural = 'Sınav Atamaları'
        unique_together = ('student', 'exam')
        ordering = ['-assigned_at']

    def __str__(self):
        return f"{self.student} → {self.exam.title} ({self.get_status_display()})"


class StudentWritingSubmission(models.Model):
    """Yazma Sinavi Icin Metin Kayitlari"""
    exam = models.ForeignKey(LevelExam, on_delete=models.CASCADE, related_name='writing_submissions')
    student = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='writing_submissions')
    question = models.ForeignKey(Question, on_delete=models.CASCADE, related_name='writing_submissions')
    user_text = models.TextField(verbose_name='Öğrenci Metni')
    submitted_at = models.DateTimeField(auto_now_add=True)
    score = models.IntegerField(null=True, blank=True, verbose_name='Eğitmen Puanı')

    class Meta:
        verbose_name = 'Yazma Sınavı Gönderimi'
        verbose_name_plural = 'Yazma Sınav Gönderimleri'

    def __str__(self):
        return f"{self.student} - Question {self.question.id} Writing"
