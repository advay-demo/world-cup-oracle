import os, django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()
from django.db import connection
with connection.cursor() as c:
    tables = connection.introspection.table_names()
    c.execute("PRAGMA foreign_keys=OFF")
    for t in tables:
        c.execute(f"DROP TABLE IF EXISTS [{t}]")
    c.execute("PRAGMA foreign_keys=ON")
print("All tables dropped.")
