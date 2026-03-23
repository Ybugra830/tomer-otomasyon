from django.contrib import admin
from .models import (
    Aday, 
    KursYuzYuze, 
    KursCevrimIci, 
    SinavYuzYuze, 
    SinavCevrimIci,
    Uyruk, 
    Dil, 
    Seviye, 
    Sube, 
    IndirimTuru, 
    SinavTuru
)

# 1. Yardımcı/Referans Modeller (Basit Kayıt)
admin.site.register(Uyruk)
admin.site.register(Dil)
admin.site.register(Seviye)
admin.site.register(Sube)
admin.site.register(IndirimTuru)
admin.site.register(SinavTuru)

# 2. Aday Modeli (@admin.register)
@admin.register(Aday)
class AdayAdmin(admin.ModelAdmin):
    list_display = ('tc_pasaport_no', 'ad', 'soyad', 'telefon1', 'eposta')
    search_fields = ('tc_pasaport_no', 'ad', 'soyad')

# 3. Ana Başvuru Modelleri (@admin.register)
@admin.register(KursYuzYuze)
class KursYuzYuzeAdmin(admin.ModelAdmin):
    list_display = ('id', 'aday', 'basvuru_tarihi', 'durum')
    list_filter = ('durum', 'basvuru_tarihi')
    list_editable = ('durum',)
    search_fields = ('aday__tc_pasaport_no', 'aday__ad', 'aday__soyad')

@admin.register(KursCevrimIci)
class KursCevrimIciAdmin(admin.ModelAdmin):
    list_display = ('id', 'aday', 'basvuru_tarihi', 'durum')
    list_filter = ('durum', 'basvuru_tarihi')
    list_editable = ('durum',)
    search_fields = ('aday__tc_pasaport_no', 'aday__ad', 'aday__soyad')

@admin.register(SinavYuzYuze)
class SinavYuzYuzeAdmin(admin.ModelAdmin):
    list_display = ('id', 'aday', 'basvuru_tarihi', 'durum')
    list_filter = ('durum', 'basvuru_tarihi')
    list_editable = ('durum',)
    search_fields = ('aday__tc_pasaport_no', 'aday__ad', 'aday__soyad')

@admin.register(SinavCevrimIci)
class SinavCevrimIciAdmin(admin.ModelAdmin):
    list_display = ('id', 'aday', 'basvuru_tarihi', 'durum')
    list_filter = ('durum', 'basvuru_tarihi')
    list_editable = ('durum',)
    search_fields = ('aday__tc_pasaport_no', 'aday__ad', 'aday__soyad')