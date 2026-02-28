#!/usr/bin/env bash
set -o errexit

pip install -r requirements.txt
python manage.py collectstatic --no-input
python manage.py migrate
python manage.py shell <<'PY'
import os
from django.contrib.auth import get_user_model

username = os.environ.get("DJANGO_SUPERUSER_USERNAME", "").strip()
email = os.environ.get("DJANGO_SUPERUSER_EMAIL", "thureya@example.com").strip()
password = os.environ.get("DJANGO_SUPERUSER_PASSWORD", "").strip()

if username and password:
    User = get_user_model()
    user, created = User.objects.get_or_create(
        username=username,
        defaults={"email": email, "is_staff": True, "is_superuser": True},
    )
    user.email = email
    user.is_staff = True
    user.is_superuser = True
    user.set_password(password)
    user.save()
    print("Superuser ready:", username, "(created)" if created else "(updated)")
else:
    print("Skipping superuser setup: missing DJANGO_SUPERUSER_USERNAME or DJANGO_SUPERUSER_PASSWORD.")
PY
