from rest_framework import serializers
from .models import (
    Uyruk, Dil, Seviye, SinavTuru, IndirimTuru, Sube,
    Aday, Basvuru, KursBasvurusu, SinavBasvurusu
)

class UyrukSerializer(serializers.ModelSerializer):
    class Meta:
        model = Uyruk
        fields = '__all__'

class DilSerializer(serializers.ModelSerializer):
    class Meta:
        model = Dil
        fields = '__all__'

class SeviyeSerializer(serializers.ModelSerializer):
    class Meta:
        model = Seviye
        fields = '__all__'

class SubeSerializer(serializers.ModelSerializer):
    egitim_sekli_display = serializers.CharField(source='get_egitim_sekli_display', read_only=True)

    class Meta:
        model = Sube
        fields = ['id', 'ad', 'egitim_sekli', 'egitim_sekli_display']

# ... Diğer referans tabloları da aynı mantıkla eklenecek ...

class AdaySerializer(serializers.ModelSerializer):
    class Meta:
        model = Aday
        fields = '__all__'

class KursBasvurusuSerializer(serializers.ModelSerializer):
    class Meta:
        model = KursBasvurusu
        fields = '__all__'