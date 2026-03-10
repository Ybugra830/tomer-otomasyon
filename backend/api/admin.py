from django.contrib import admin
from .models import (
    Uyruk, Dil, Seviye, SinavTuru, IndirimTuru, Sube,
    Aday, Basvuru, KursBasvurusu, SinavBasvurusu
)

admin.site.register(Uyruk)
admin.site.register(Dil)
admin.site.register(Seviye)
admin.site.register(SinavTuru)
admin.site.register(IndirimTuru)
admin.site.register(Sube)
admin.site.register(Aday)
admin.site.register(Basvuru)
admin.site.register(KursBasvurusu)
admin.site.register(SinavBasvurusu)