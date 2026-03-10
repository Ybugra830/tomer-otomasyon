from django.db import models

class Uyruk(models.Model):
    ad = models.CharField(max_length=100)
    
    def __str__(self):
        return self.ad

class Dil(models.Model):
    ad = models.CharField(max_length=50)
    
    def __str__(self):
        return self.ad

class Seviye(models.Model):
    ad = models.CharField(max_length=20)
    
    def __str__(self):
        return self.ad

class SinavTuru(models.Model):
    ad = models.CharField(max_length=100)
    
    def __str__(self):
        return self.ad

class IndirimTuru(models.Model):
    ad = models.CharField(max_length=150)
    
    def __str__(self):
        return self.ad

class Sube(models.Model):
    EGITIM_SEKLI_CHOICES = [
        ('YUZYUZE', 'Yüz Yüze'),
        ('CEVRIMICI', 'Çevrim İçi'),
    ]
    ad = models.CharField(max_length=150)
    egitim_sekli = models.CharField(max_length=20, choices=EGITIM_SEKLI_CHOICES)
    
    def __str__(self):
        return f"{self.ad} ({self.get_egitim_sekli_display()})"


class Aday(models.Model):
    KIMLIK_TIPI_CHOICES = [
        ('TC', 'T.C. Kimlik Kartı'),
        ('YABANCI', 'Yab. Kimlik Kartı'),
        ('PASAPORT', 'Pasaport'),
        ('ID_KART', 'ID Kart'),
    ]
    tc_pasaport_no = models.CharField(max_length=50, unique=True)
    kimlik_tipi = models.CharField(max_length=20, choices=KIMLIK_TIPI_CHOICES)
    uyruk = models.ForeignKey(Uyruk, on_delete=models.SET_NULL, null=True)
    ad = models.CharField(max_length=100)
    soyad = models.CharField(max_length=100)
    baba_adi = models.CharField(max_length=100, blank=True, null=True)
    anne_adi = models.CharField(max_length=100, blank=True, null=True)
    dogum_yeri = models.CharField(max_length=100, blank=True, null=True)
    dogum_tarihi = models.DateField(blank=True, null=True)
    telefon1 = models.CharField(max_length=20)
    telefon2 = models.CharField(max_length=20, blank=True, null=True)
    eposta = models.EmailField()
    turkiye_adresi = models.TextField(blank=True, null=True)
    ulke_adresi = models.TextField(blank=True, null=True)
    ulke_telefonu = models.CharField(max_length=20, blank=True, null=True)

    def __str__(self):
        return f"{self.ad} {self.soyad} - {self.tc_pasaport_no}"


class Basvuru(models.Model):
    DURUM_CHOICES = [
        ('BEKLIYOR', 'Bekliyor'),
        ('ONAYLANDI', 'Onaylandı'),
        ('REDDEDILDI', 'Reddedildi'),
    ]
    EGITIM_SEKLI_CHOICES = [
        ('YUZYUZE', 'Yüz Yüze'),
        ('CEVRIMICI', 'Çevrim İçi'),
    ]

    aday = models.ForeignKey(Aday, on_delete=models.CASCADE, related_name='basvurular')
    dil = models.ForeignKey(Dil, on_delete=models.SET_NULL, null=True)
    sube = models.ForeignKey(Sube, on_delete=models.SET_NULL, null=True)
    egitim_sekli = models.CharField(max_length=20, choices=EGITIM_SEKLI_CHOICES)
    indirim = models.ForeignKey(IndirimTuru, on_delete=models.SET_NULL, null=True, blank=True)
    indirim_kodu = models.CharField(max_length=50, blank=True, null=True)
    indirim_belgesi = models.FileField(upload_to='indirim_belgeleri/', blank=True, null=True)
    kimlik_dosyasi = models.FileField(upload_to='kimlik_dosyalari/', blank=True, null=True)
    kayit_bilgi_notu = models.TextField(blank=True, null=True)
    vize_turu = models.CharField(max_length=100, blank=True, null=True)
    vize_baslangic = models.DateField(blank=True, null=True)
    vize_bitis = models.DateField(blank=True, null=True)
    basvuru_tarihi = models.DateTimeField(auto_now_add=True)
    durum = models.CharField(max_length=20, choices=DURUM_CHOICES, default='BEKLIYOR')

    def __str__(self):
        return f"{self.aday} - {self.get_durum_display()}"


class KursBasvurusu(Basvuru):
    seviye = models.ForeignKey(Seviye, on_delete=models.SET_NULL, null=True)

class SinavBasvurusu(Basvuru):
    sinav_turu = models.ForeignKey(SinavTuru, on_delete=models.SET_NULL, null=True)