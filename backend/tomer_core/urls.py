from django.contrib import admin
from django.urls import path, include
from django.conf import settings              # YENİ EKLENEN
from django.conf.urls.static import static
from rest_framework_simplejwt.views import TokenObtainPairView

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include('api.urls')), # <--- BU SATIRIN OLDUĞUNDAN EMİN OL
    path('api/accounts/', include('accounts.urls')),
    path('api/exams/', include('exams.urls')),
    path('api/token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)