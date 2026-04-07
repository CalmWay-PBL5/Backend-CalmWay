#!/bin/bash
set -euo pipefail

# ==========================================
# PART 1: Create Roles
# ==========================================
psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "$POSTGRES_DB" <<SQL
DO
\$\$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'db_owner') THEN
    CREATE ROLE db_owner LOGIN PASSWORD '${DB_OWNER_PASSWORD}';
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'prisma_user') THEN
    CREATE ROLE prisma_user LOGIN PASSWORD '${PRISMA_PASSWORD}';
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'app_user') THEN
    CREATE ROLE app_user LOGIN PASSWORD '${APP_PASSWORD}';
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'readonly_user') THEN
    CREATE ROLE readonly_user LOGIN PASSWORD '${READONLY_PASSWORD}';
  END IF;
END
\$\$;
SQL

# ==========================================
# PART 2: Create Prisma Shadow Database
# ==========================================
echo "Creating Prisma Shadow Database..."
psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" <<SQL
CREATE DATABASE flyingclass_shadow_db OWNER prisma_user;
SQL

# ==========================================
# PART 3: Schemas and Permissions
# ==========================================
psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "$POSTGRES_DB" <<SQL
REVOKE ALL ON DATABASE ${POSTGRES_DB} FROM PUBLIC;
REVOKE ALL ON SCHEMA public FROM PUBLIC;

GRANT CONNECT ON DATABASE ${POSTGRES_DB} TO db_owner, prisma_user, app_user, readonly_user;

GRANT CREATE ON DATABASE ${POSTGRES_DB} TO db_owner, prisma_user;

CREATE SCHEMA IF NOT EXISTS auth AUTHORIZATION prisma_user;
CREATE SCHEMA IF NOT EXISTS course AUTHORIZATION prisma_user;
CREATE SCHEMA IF NOT EXISTS lesson AUTHORIZATION prisma_user;
CREATE SCHEMA IF NOT EXISTS payment AUTHORIZATION prisma_user;
CREATE SCHEMA IF NOT EXISTS system AUTHORIZATION prisma_user;

-- Cấp quyền cho prisma_user
GRANT USAGE, CREATE ON SCHEMA auth, course, lesson, payment, system TO prisma_user;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA auth, course, lesson, payment, system TO prisma_user;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA auth, course, lesson, payment, system TO prisma_user;
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA auth, course, lesson, payment, system TO prisma_user;

-- 🔥 FIX 1: Thêm schema "system" cho app_user và readonly_user
GRANT USAGE ON SCHEMA auth, course, lesson, payment, system TO app_user;
GRANT USAGE ON SCHEMA auth, course, lesson, payment, system TO readonly_user;

GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA auth, course, lesson, payment, system TO app_user;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA auth, course, lesson, payment, system TO app_user;
GRANT CREATE ON SCHEMA auth, course, lesson, payment, system TO app_user;

GRANT SELECT ON ALL TABLES IN SCHEMA auth, course, lesson, payment, system TO readonly_user;

-- 🔥 FIX 2: Bắt buộc cấp quyền tự động cho cả bảng do 'postgres' tạo ra (vì file .env dùng postgres)
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA auth, course, lesson, payment, system
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO app_user;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA auth, course, lesson, payment, system
GRANT USAGE, SELECT ON SEQUENCES TO app_user;

ALTER DEFAULT PRIVILEGES FOR ROLE prisma_user IN SCHEMA auth, course, lesson, payment, system
GRANT ALL ON TABLES TO prisma_user;
ALTER DEFAULT PRIVILEGES FOR ROLE prisma_user IN SCHEMA auth, course, lesson, payment, system
GRANT ALL ON SEQUENCES TO prisma_user;

ALTER DEFAULT PRIVILEGES FOR ROLE prisma_user IN SCHEMA auth, course, lesson, payment, system
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO app_user;
ALTER DEFAULT PRIVILEGES FOR ROLE prisma_user IN SCHEMA auth, course, lesson, payment, system
GRANT USAGE, SELECT ON SEQUENCES TO app_user;
SQL