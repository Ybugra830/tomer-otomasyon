from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
from .models import Uyruk, Dil, Seviye, Sube, Aday, KursBasvurusu
from .serializers import (
    UyrukSerializer, DilSerializer, SeviyeSerializer,
    SubeSerializer, AdaySerializer, KursBasvurusuSerializer
)

# ==========================================
# 1. REFERANS VERİLERİ (SADECE OKUMA - GET)
# ==========================================
# React'teki dropdown (açılır liste) menülerini doldurmak için kullanılacaklar.

@api_view(['GET'])
def getUyruklar(request):
    uyruklar = Uyruk.objects.all()
    serializer = UyrukSerializer(uyruklar, many=True)
    return Response(serializer.data)

@api_view(['GET'])
def getDiller(request):
    diller = Dil.objects.all()
    serializer = DilSerializer(diller, many=True)
    return Response(serializer.data)

@api_view(['GET'])
def getSeviyeler(request):
    seviyeler = Seviye.objects.all()
    serializer = SeviyeSerializer(seviyeler, many=True)
    return Response(serializer.data)

@api_view(['GET'])
def getSubeler(request):
    subeler = Sube.objects.all()
    serializer = SubeSerializer(subeler, many=True)
    return Response(serializer.data)


# ==========================================
# 2. KAYIT İŞLEMLERİ (YAZMA - POST)
# ==========================================
# React formundan gelen verileri veritabanına kaydetmek için kullanılacaklar.

@api_view(['POST'])
def createAday(request):
    data = request.data
    serializer = AdaySerializer(data=data)
    
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['POST'])
def createKursBasvurusu(request):
    data = request.data
    serializer = KursBasvurusuSerializer(data=data)
    
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)