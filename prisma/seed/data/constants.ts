export const DEFAULT_ADMIN = {
  email: "admin@flyingclass.com",
  password: "password123",
};

export const SEED_ACCOUNTS = {
  admin: {
    email: "admin@flyingclass.com",
    password: "password123",
  },
  lecturerApproved: {
    email: "lecturer.approved@flyingclass.com",
    password: "password123",
  },
  lecturerPending: {
    email: "lecturer.pending@flyingclass.com",
    password: "password123",
  },
  lecturerRejected: {
    email: "lecturer.rejected@flyingclass.com",
    password: "password123",
  },
  studentA: {
    email: "student.a@flyingclass.com",
    password: "password123",
  },
  studentB: {
    email: "student.b@flyingclass.com",
    password: "password123",
  },
  studentBanned: {
    email: "student.banned@flyingclass.com",
    password: "password123",
  },
  studentUnverified: {
    email: "student.unverified@flyingclass.com",
    password: "password123",
  },
} as const;

export const SEED_TOKENS = {
  verifyEmail: "seed-verify-email-token-student-unverified",
  resetPassword: "seed-reset-password-token-student-a",
} as const;
