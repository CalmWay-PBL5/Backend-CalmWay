-- Fix permissions for all schemas after migrations
-- Run this when app_user gets "permission denied for schema" errors

-- Ensure USAGE permission for app_user on all schemas
GRANT USAGE ON SCHEMA auth, course, lesson, payment, system TO app_user;
GRANT USAGE ON SCHEMA auth, course, lesson, payment, system TO readonly_user;

-- Grant permissions on all EXISTING tables
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA auth, course, lesson, payment TO app_user;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA auth, course, lesson, payment TO app_user;
GRANT SELECT ON ALL TABLES IN SCHEMA auth, course, lesson, payment TO readonly_user;

-- Grant permissions on system schema (for Prisma)
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA system TO prisma_user;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA system TO prisma_user;

-- Set default permissions for FUTURE tables created by prisma_user
ALTER DEFAULT PRIVILEGES FOR ROLE prisma_user IN SCHEMA auth, course, lesson, payment, system
GRANT ALL ON TABLES TO prisma_user;
ALTER DEFAULT PRIVILEGES FOR ROLE prisma_user IN SCHEMA auth, course, lesson, payment, system
GRANT ALL ON SEQUENCES TO prisma_user;
ALTER DEFAULT PRIVILEGES FOR ROLE prisma_user IN SCHEMA auth, course, lesson, payment, system
GRANT EXECUTE ON FUNCTIONS TO prisma_user;

-- Set default permissions for FUTURE tables - app_user
ALTER DEFAULT PRIVILEGES FOR ROLE prisma_user IN SCHEMA auth, course, lesson, payment
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO app_user;
ALTER DEFAULT PRIVILEGES FOR ROLE prisma_user IN SCHEMA auth, course, lesson, payment
GRANT USAGE, SELECT ON SEQUENCES TO app_user;
ALTER DEFAULT PRIVILEGES FOR ROLE prisma_user IN SCHEMA auth, course, lesson, payment
GRANT SELECT ON TABLES TO readonly_user;

-- If that doesn't work, grant on schemas themselves
ALTER SCHEMA auth OWNER TO prisma_user;
ALTER SCHEMA course OWNER TO prisma_user;
ALTER SCHEMA lesson OWNER TO prisma_user;
ALTER SCHEMA payment OWNER TO prisma_user;
ALTER SCHEMA system OWNER TO prisma_user;
