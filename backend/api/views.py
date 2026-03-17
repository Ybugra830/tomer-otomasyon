from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
from django.db import transaction
from .models import (
    Uyruk, Dil, Seviye, Sube, IndirimTuru, SinavTuru,
    Aday, KursYuzYuze, KursCevrimIci, SinavYuzYuze, SinavCevrimIci
)

# 1. REFERANS VERİLERİ (SADECE OKUMA - GET)

@api_view(['GET'])
def getUyruklar(request):
    return Response(list(Uyruk.objects.values('id', 'ad')))

@api_view(['GET'])
def getDiller(request):
    return Response(list(Dil.objects.values('id', 'ad')))

@api_view(['GET'])
def getSeviyeler(request):
    return Response(list(Seviye.objects.values('id', 'ad')))

@api_view(['GET'])
def getSubeler(request):
    return Response(list(Sube.objects.values('id', 'ad', 'egitim_sekli')))

@api_view(['GET'])
def getIndirimler(request):
    return Response(list(IndirimTuru.objects.values('id', 'ad')))

@api_view(['GET'])
def getSinavTurleri(request):
    return Response(list(SinavTuru.objects.values('id', 'ad')))

# 2. KAYIT İŞLEMLERİ (YAZMA - POST)

@api_view(['POST'])
@transaction.atomic
def process_application(request):
    try:
        data = request.data
        files = request.FILES

        # Adım A: TC / Pasaport üzerinden Aday tablosunda get_or_create mantığı
        tc_pasaport_no = data.get('tc_pasaport_no', '')
        if not tc_pasaport_no:
            return Response({"error": "tc_pasaport_no zorunludur!"}, status=status.HTTP_400_BAD_REQUEST)

        def parse_date(date_str):
            if not date_str or date_str.lower() in ['undefined', 'null']:
                return None
            return date_str

        aday, created = Aday.objects.get_or_create(
            tc_pasaport_no=tc_pasaport_no,
            defaults={
                'kimlik_tipi': data.get('kimlik_tipi', ''),
                'ad': data.get('ad', ''),
                'soyad': data.get('soyad', ''),
                'telefon1': data.get('telefon1', ''),
                'telefon2': data.get('telefon2', ''),
                'eposta': data.get('eposta', ''),
                'baba_adi': data.get('baba_adi', ''),
                'anne_adi': data.get('anne_adi', ''),
                'dogum_yeri': data.get('dogum_yeri', ''),
                'dogum_tarihi': parse_date(data.get('dogum_tarihi')),
            }
        )

        if not created:
            # Var olan adayın bilgilerini üstüne yaz (Güncelle)
            aday.kimlik_tipi = data.get('kimlik_tipi', aday.kimlik_tipi)
            aday.ad = data.get('ad', aday.ad)
            aday.soyad = data.get('soyad', aday.soyad)
            aday.telefon1 = data.get('telefon1', aday.telefon1)
            aday.telefon2 = data.get('telefon2', aday.telefon2)
            aday.eposta = data.get('eposta', aday.eposta)
            aday.baba_adi = data.get('baba_adi', aday.baba_adi)
            aday.anne_adi = data.get('anne_adi', aday.anne_adi)
            aday.dogum_yeri = data.get('dogum_yeri', aday.dogum_yeri)
            
            dt = parse_date(data.get('dogum_tarihi'))
            if dt:
                aday.dogum_tarihi = dt
            aday.save()

        # Uyruk guncellemesi (ForeginKey oldugu icin extra islem)
        uyruk_id = data.get('uyruk')
        if uyruk_id and uyruk_id.isdigit():
            try:
                aday.uyruk = Uyruk.objects.get(id=int(uyruk_id))
                aday.save()
            except Uyruk.DoesNotExist:
                pass

        # Adım B: basvuru_tipi ve egitim_sekli ayristirma
        basvuru_tipi = data.get('basvuru_tipi', '')
        egitim_sekli = data.get('egitim_sekli', '')

        if not basvuru_tipi or not egitim_sekli:
            return Response({"error": "basvuru_tipi ve egitim_sekli zorunludur!"}, status=status.HTTP_400_BAD_REQUEST)

        # Ortak BaseBasvuru Alanlari
        sube_id = data.get('sube')
        dil_id = data.get('dil')
        
        base_basvuru_data = {
            'aday': aday,
            'sube': Sube.objects.get(id=int(sube_id)) if sube_id and sube_id.isdigit() else None,
            'dil': Dil.objects.get(id=int(dil_id)) if dil_id and dil_id.isdigit() else None,
            'kimlik_dosyasi': files.get('kimlik_dosyasi'),
            'kayit_bilgi_notu': data.get('kayit_bilgi_notu', ''),
        }

        # Adım C: if/elif senaryo tablosu belirleme ve insert etme
        if basvuru_tipi == 'Kurs Ön Kayıt' and egitim_sekli == 'Yüz Yüze':
            seviye_id = data.get('seviye')
            indirim_id = data.get('indirim')
            basvuru = KursYuzYuze.objects.create(
                **base_basvuru_data,
                seviye=Seviye.objects.get(id=int(seviye_id)) if seviye_id and seviye_id.isdigit() else None,
                indirim=IndirimTuru.objects.get(id=int(indirim_id)) if indirim_id and indirim_id.isdigit() else None,
                indirim_kodu=data.get('indirim_kodu', ''),
                indirim_belgesi=files.get('indirim_belgesi'),
            )

        elif basvuru_tipi == 'Kurs Ön Kayıt' and egitim_sekli == 'Çevrim İçi':
            seviye_id = data.get('seviye')
            indirim_id = data.get('indirim')
            basvuru = KursCevrimIci.objects.create(
                **base_basvuru_data,
                seviye=Seviye.objects.get(id=int(seviye_id)) if seviye_id and seviye_id.isdigit() else None,
                indirim=IndirimTuru.objects.get(id=int(indirim_id)) if indirim_id and indirim_id.isdigit() else None,
                indirim_kodu=data.get('indirim_kodu', ''),
                indirim_belgesi=files.get('indirim_belgesi'),
                vize_turu=data.get('vize_turu', ''),
                kayit_turu=data.get('kayit_turu', ''),
                vize_baslangic=parse_date(data.get('vize_baslangic')),
                vize_bitis=parse_date(data.get('vize_bitis')),
                turkiye_adresi=data.get('turkiye_adresi', ''),
                ulke_adresi=data.get('ulke_adresi', ''),
                ulke_telefonu=data.get('ulke_telefonu', '')
            )

        elif basvuru_tipi == 'Sınav Ön Kayıt' and egitim_sekli == 'Yüz Yüze':
            basvuru = SinavYuzYuze.objects.create(
                **base_basvuru_data,
                sinav_turu=data.get('sinav_turu', '')
            )

        elif basvuru_tipi == 'Sınav Ön Kayıt' and egitim_sekli == 'Çevrim İçi':
            basvuru = SinavCevrimIci.objects.create(
                **base_basvuru_data,
                sinav_turu=data.get('sinav_turu', ''),
                vize_turu=data.get('vize_turu', ''),
                vize_baslangic=parse_date(data.get('vize_baslangic')),
                vize_bitis=parse_date(data.get('vize_bitis')),
                turkiye_adresi=data.get('turkiye_adresi', ''),
                ulke_adresi=data.get('ulke_adresi', ''),
                ulke_telefonu=data.get('ulke_telefonu', '')
            )
            
        else:
            return Response({"error": f"Bilinmeyen başvuru kombinasyonu: {basvuru_tipi} / {egitim_sekli}"}, status=status.HTTP_400_BAD_REQUEST)

        # Adım D: İşlem bitimi ve 201 dönüşü
        return Response({"message": "Başvuru başarıyla alındı", "basvuru_id": basvuru.id}, status=status.HTTP_201_CREATED)

    except Exception as e:
        import traceback
        traceback.print_exc()
        return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)