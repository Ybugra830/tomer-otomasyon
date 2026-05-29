import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'tomer_core.settings')
django.setup()

from django.db import connection

print("Veritabanı sıfırlanıyor (public şeması silinip yeniden oluşturuluyor)...")
with connection.cursor() as cursor:
    cursor.execute("DROP SCHEMA public CASCADE;")
    cursor.execute("CREATE SCHEMA public;")
    cursor.execute("GRANT ALL ON SCHEMA public TO postgres;")
    cursor.execute("GRANT ALL ON SCHEMA public TO public;")
print("Veritabanı şeması başarıyla sıfırlandı. Yeni migrations için hazır.")
