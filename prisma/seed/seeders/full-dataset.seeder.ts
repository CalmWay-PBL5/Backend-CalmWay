import {
  AIFeatureType,
  ClassMemberStatus,
  ClassStatus,
  ClassType,
  ContentType,
  CourseStatus,
  DataType,
  KycStatus,
  NotificationType,
  PayoutStatus,
  Prisma,
  PrismaClient,
  QuestionType,
  Role,
  TransactionStatus,
  UserStatus,
} from "@prisma/client";
import * as argon2 from "argon2";
import { SEED_ACCOUNTS, SEED_TOKENS } from "../data/constants";

type SeedUsers = {
  admin: { id: string; email: string };
  lecturerApproved: { id: string; email: string };
  lecturerPending: { id: string; email: string };
  lecturerRejected: { id: string; email: string };
  studentA: { id: string; email: string };
  studentB: { id: string; email: string };
  studentBanned: { id: string; email: string };
  studentUnverified: { id: string; email: string };
};

type SeedSubjects = {
  mathematics: { id: string; name: string };
  physics: { id: string; name: string };
  english: { id: string; name: string };
};

type SeedClasses = {
  activePublic: { id: string; title: string };
  activePrivate: { id: string; title: string };
  trashClass: { id: string; title: string };
  secondTeacherClass: { id: string; title: string };
};

type SeedCourses = {
  approved: { id: string; title: string };
  pendingReview: { id: string; title: string };
  rejected: { id: string; title: string };
  draft: { id: string; title: string };
};

export class FullDatasetSeeder {
  constructor(private readonly prisma: PrismaClient) {}

  async run() {
    console.log("⏳ Đang làm sạch dữ liệu cũ...");
    await this.cleanDatabase();

    console.log("⏳ Đang seed users + profiles...");
    const users = await this.seedUsersAndProfiles();

    console.log("⏳ Đang seed system settings...");
    await this.seedSystemSettings(users.admin.id);

    console.log("⏳ Đang seed auth artifacts...");
    await this.seedAuthArtifacts(users);

    console.log("⏳ Đang seed subjects/classes/members/transactions...");
    const subjects = await this.seedSubjects();
    const classes = await this.seedClasses(users, subjects);
    await this.seedClassMembers(classes, users);
    await this.seedTransactions(classes, users);

    console.log("⏳ Đang seed lessons/chat/reviews...");
    await this.seedLessons(classes);
    await this.seedClassReviews(classes, users);
    await this.seedChatMessages(classes, users);

    console.log("⏳ Đang seed KYC...");
    await this.seedKycApplications(users);

    console.log("⏳ Đang seed courses + finance...");
    const courses = await this.seedCourses(users);
    await this.seedCourseTransactions(courses, users);
    await this.seedWallets(users);
    await this.seedPayoutRequests(users);

    console.log("⏳ Đang seed exams/questions/submissions...");
    await this.seedExams(classes, users);

    console.log("⏳ Đang seed notifications + AI logs...");
    await this.seedNotifications(users);
    await this.seedAiUsageLogs(users);

    console.log("✅ Seed dataset đầy đủ thành công.");
    this.printSeedSummary(users, classes, courses);
  }

  private async cleanDatabase() {
    await this.prisma.submission.deleteMany();
    await this.prisma.question.deleteMany();
    await this.prisma.exam.deleteMany();

    await this.prisma.chatMessage.deleteMany();
    await this.prisma.classReview.deleteMany();
    await this.prisma.lesson.deleteMany();
    await this.prisma.classMember.deleteMany();
    await this.prisma.transaction.deleteMany();

    await this.prisma.courseTransaction.deleteMany();
    await this.prisma.payoutRequest.deleteMany();
    await this.prisma.wallet.deleteMany();

    await this.prisma.notification.deleteMany();
    await this.prisma.aI_Usage_Log.deleteMany();

    await this.prisma.kycApplication.deleteMany();
    await this.prisma.passwordReset.deleteMany();
    await this.prisma.emailVerification.deleteMany();

    await this.prisma.course.deleteMany();
    await this.prisma.class.deleteMany();
    await this.prisma.subject.deleteMany();

    await this.prisma.profile.deleteMany();
    await this.prisma.systemSetting.deleteMany();
    await this.prisma.user.deleteMany();
  }

  private async seedUsersAndProfiles(): Promise<SeedUsers> {
    const passwordHash = await argon2.hash("password123");

    const admin = await this.prisma.user.create({
      data: {
        email: SEED_ACCOUNTS.admin.email,
        password: passwordHash,
        role: Role.ADMIN,
        is_verified: true,
        isActive: true,
        status: UserStatus.ACTIVE,
      },
      select: { id: true, email: true },
    });

    const lecturerApproved = await this.prisma.user.create({
      data: {
        email: SEED_ACCOUNTS.lecturerApproved.email,
        password: passwordHash,
        role: Role.LECTURER,
        is_verified: true,
        isActive: true,
        status: UserStatus.ACTIVE,
      },
      select: { id: true, email: true },
    });

    const lecturerPending = await this.prisma.user.create({
      data: {
        email: SEED_ACCOUNTS.lecturerPending.email,
        password: passwordHash,
        role: Role.LECTURER,
        is_verified: true,
        isActive: true,
        status: UserStatus.ACTIVE,
      },
      select: { id: true, email: true },
    });

    const lecturerRejected = await this.prisma.user.create({
      data: {
        email: SEED_ACCOUNTS.lecturerRejected.email,
        password: passwordHash,
        role: Role.LECTURER,
        is_verified: true,
        isActive: true,
        status: UserStatus.ACTIVE,
      },
      select: { id: true, email: true },
    });

    const studentA = await this.prisma.user.create({
      data: {
        email: SEED_ACCOUNTS.studentA.email,
        password: passwordHash,
        role: Role.STUDENT,
        is_verified: true,
        isActive: true,
        status: UserStatus.ACTIVE,
      },
      select: { id: true, email: true },
    });

    const studentB = await this.prisma.user.create({
      data: {
        email: SEED_ACCOUNTS.studentB.email,
        password: passwordHash,
        role: Role.STUDENT,
        is_verified: true,
        isActive: true,
        status: UserStatus.ACTIVE,
      },
      select: { id: true, email: true },
    });

    const studentBanned = await this.prisma.user.create({
      data: {
        email: SEED_ACCOUNTS.studentBanned.email,
        password: passwordHash,
        role: Role.STUDENT,
        is_verified: true,
        isActive: false,
        status: UserStatus.BANNED,
        banReason: "Seeded banned account for admin toggle-status tests",
      },
      select: { id: true, email: true },
    });

    const studentUnverified = await this.prisma.user.create({
      data: {
        email: SEED_ACCOUNTS.studentUnverified.email,
        password: passwordHash,
        role: Role.STUDENT,
        is_verified: false,
        isActive: true,
        status: UserStatus.ACTIVE,
      },
      select: { id: true, email: true },
    });

    const allUsers = [
      admin,
      lecturerApproved,
      lecturerPending,
      lecturerRejected,
      studentA,
      studentB,
      studentBanned,
      studentUnverified,
    ];

    await this.prisma.profile.createMany({
      data: [
        {
          user_id: admin.id,
          full_name: "System Admin",
          phone: "0900000001",
          bio: "Admin seeded profile",
        },
        {
          user_id: lecturerApproved.id,
          full_name: "Lecturer Approved",
          phone: "0900000002",
          bio: "Approved lecturer for end-to-end API testing",
          identify_card_url: "https://cdn.flyingclass.test/kyc/approved-id.jpg",
        },
        {
          user_id: lecturerPending.id,
          full_name: "Lecturer Pending",
          phone: "0900000003",
          bio: "Pending lecturer for KYC review flow",
          identify_card_url: "https://cdn.flyingclass.test/kyc/pending-id.jpg",
        },
        {
          user_id: lecturerRejected.id,
          full_name: "Lecturer Rejected",
          phone: "0900000004",
          bio: "Rejected lecturer for KYC resubmission flow",
          identify_card_url: "https://cdn.flyingclass.test/kyc/rejected-id.jpg",
        },
        {
          user_id: studentA.id,
          full_name: "Student A",
          phone: "0900000011",
          parent_email: "parent-a@example.com",
          bio: "Student A profile for test data",
        },
        {
          user_id: studentB.id,
          full_name: "Student B",
          phone: "0900000012",
          parent_email: "parent-b@example.com",
          bio: "Student B profile for test data",
        },
        {
          user_id: studentBanned.id,
          full_name: "Student Banned",
          phone: "0900000013",
          parent_email: "parent-banned@example.com",
          bio: "Banned student for account status tests",
        },
        {
          user_id: studentUnverified.id,
          full_name: "Student Unverified",
          phone: "0900000014",
          parent_email: "parent-unverified@example.com",
          bio: "Unverified student for verify email tests",
        },
      ],
    });

    return {
      admin,
      lecturerApproved,
      lecturerPending,
      lecturerRejected,
      studentA,
      studentB,
      studentBanned,
      studentUnverified,
    };
  }

  private async seedSystemSettings(adminId: string) {
    await this.prisma.systemSetting.createMany({
      data: [
        {
          key: "PLATFORM_COMMISSION_RATE",
          value: "20",
          dataType: DataType.NUMBER,
          name: "Platform commission rate",
          description: "Commission percentage taken by platform",
          updatedBy: adminId,
        },
        {
          key: "REQUIRE_KYC_TO_TEACH",
          value: "true",
          dataType: DataType.BOOLEAN,
          name: "Require KYC",
          description: "Lecturer must complete KYC to access teaching features",
          updatedBy: adminId,
        },
        {
          key: "MAX_VIDEO_UPLOAD_SIZE_MB",
          value: "2048",
          dataType: DataType.NUMBER,
          name: "Max video upload size",
          description: "Maximum allowed video file size",
          updatedBy: adminId,
        },
        {
          key: "platform.fee.percent",
          value: "15",
          dataType: DataType.NUMBER,
          name: "Platform fee percent (legacy key)",
          description: "Legacy key kept for admin update-setting tests",
          updatedBy: adminId,
        },
      ],
    });
  }

  private async seedAuthArtifacts(users: SeedUsers) {
    await this.prisma.emailVerification.create({
      data: {
        email: users.studentUnverified.email,
        token: SEED_TOKENS.verifyEmail,
        expiresAt: this.daysFromNow(2),
      },
    });

    await this.prisma.passwordReset.create({
      data: {
        email: users.studentA.email,
        token: SEED_TOKENS.resetPassword,
        expiresAt: this.minutesFromNow(30),
      },
    });
  }

  private async seedSubjects(): Promise<SeedSubjects> {
    const mathematics = await this.prisma.subject.create({
      data: {
        name: "Mathematics",
        description: "Mathematics subject seeded for class/course tests",
      },
      select: { id: true, name: true },
    });

    const physics = await this.prisma.subject.create({
      data: {
        name: "Physics",
        description: "Physics subject seeded for class/course tests",
      },
      select: { id: true, name: true },
    });

    const english = await this.prisma.subject.create({
      data: {
        name: "English",
        description: "English subject seeded for class/course tests",
      },
      select: { id: true, name: true },
    });

    return { mathematics, physics, english };
  }

  private async seedClasses(users: SeedUsers, subjects: SeedSubjects): Promise<SeedClasses> {
    const activePublic = await this.prisma.class.create({
      data: {
        teacher_id: users.lecturerApproved.id,
        subject_id: subjects.mathematics.id,
        title: "Algebra Foundation - Active Public",
        description: "Primary active class for class/member/lesson/chat tests",
        price: new Prisma.Decimal("199000"),
        class_code: "SEED-CLASS-ALGB-001",
        max_students: 100,
        type: ClassType.PUBLIC,
        status: ClassStatus.ACTIVE,
      },
      select: { id: true, title: true },
    });

    const activePrivate = await this.prisma.class.create({
      data: {
        teacher_id: users.lecturerApproved.id,
        subject_id: subjects.physics.id,
        title: "Physics Intensive - Active Private",
        description: "Private class for invitation token and export tests",
        price: new Prisma.Decimal("299000"),
        class_code: "SEED-CLASS-PHYS-001",
        invitation_token: "seed-invite-phys-001",
        max_students: 60,
        type: ClassType.PRIVATE,
        status: ClassStatus.ACTIVE,
      },
      select: { id: true, title: true },
    });

    const trashClass = await this.prisma.class.create({
      data: {
        teacher_id: users.lecturerApproved.id,
        subject_id: subjects.english.id,
        title: "English Speaking - In Trash",
        description: "Class in trash for restore/cleanup tests",
        price: new Prisma.Decimal("99000"),
        class_code: "SEED-CLASS-ENGL-TRASH",
        max_students: 40,
        type: ClassType.PUBLIC,
        status: ClassStatus.PENDING_DELETE,
        deleted_at: this.daysAgo(1),
      },
      select: { id: true, title: true },
    });

    const secondTeacherClass = await this.prisma.class.create({
      data: {
        teacher_id: users.lecturerPending.id,
        subject_id: subjects.physics.id,
        title: "Physics By Pending Lecturer",
        description: "Class by another lecturer for authorization tests",
        price: new Prisma.Decimal("159000"),
        class_code: "SEED-CLASS-OTHER-001",
        max_students: 45,
        type: ClassType.PUBLIC,
        status: ClassStatus.ACTIVE,
      },
      select: { id: true, title: true },
    });

    return { activePublic, activePrivate, trashClass, secondTeacherClass };
  }

  private async seedClassMembers(classes: SeedClasses, users: SeedUsers) {
    await this.prisma.classMember.createMany({
      data: [
        {
          class_id: classes.activePublic.id,
          student_id: users.studentA.id,
          status: ClassMemberStatus.ACTIVE,
          joined_at: this.daysAgo(30),
        },
        {
          class_id: classes.activePublic.id,
          student_id: users.studentB.id,
          status: ClassMemberStatus.ACTIVE,
          joined_at: this.daysAgo(20),
        },
        {
          class_id: classes.activePublic.id,
          student_id: users.studentBanned.id,
          status: ClassMemberStatus.DROPPED,
          joined_at: this.daysAgo(18),
          dropped_at: this.daysAgo(10),
        },
        {
          class_id: classes.activePrivate.id,
          student_id: users.studentA.id,
          status: ClassMemberStatus.ACTIVE,
          joined_at: this.daysAgo(12),
        },
      ],
    });
  }

  private async seedTransactions(classes: SeedClasses, users: SeedUsers) {
    await this.prisma.transaction.createMany({
      data: [
        {
          user_id: users.studentA.id,
          class_id: classes.activePublic.id,
          amount: new Prisma.Decimal("199000"),
          momo_order_id: "SEED-MOMO-ORDER-0001",
          status: TransactionStatus.SUCCESS,
          created_at: this.daysAgo(30),
        },
        {
          user_id: users.studentB.id,
          class_id: classes.activePublic.id,
          amount: new Prisma.Decimal("199000"),
          momo_order_id: "SEED-MOMO-ORDER-0002",
          status: TransactionStatus.SUCCESS,
          created_at: this.daysAgo(20),
        },
        {
          user_id: users.studentB.id,
          class_id: classes.activePrivate.id,
          amount: new Prisma.Decimal("299000"),
          momo_order_id: "SEED-MOMO-ORDER-0003",
          status: TransactionStatus.PENDING,
          created_at: this.daysAgo(7),
        },
        {
          user_id: users.studentUnverified.id,
          class_id: classes.activePublic.id,
          amount: new Prisma.Decimal("199000"),
          momo_order_id: "SEED-MOMO-ORDER-0004",
          status: TransactionStatus.FAILED,
          created_at: this.daysAgo(2),
        },
      ],
    });
  }

  private async seedLessons(classes: SeedClasses) {
    await this.prisma.lesson.createMany({
      data: [
        {
          class_id: classes.activePublic.id,
          title: "Algebra Intro - Cloud Doc",
          content_type: ContentType.CLOUD_DOC,
          url: "https://docs.google.com/document/d/seed-algebra-doc/preview",
          body_text: JSON.stringify({
            displayMode: "EMBED",
            fileType: "GOOGLE_OFFICE",
            originalUrl: "https://docs.google.com/document/d/seed-algebra-doc/edit",
          }),
          order_index: 1,
          ai_summary_text: "Cloud doc introducing algebra basics",
          ai_keywords: ["algebra", "equation", "variable"],
        },
        {
          class_id: classes.activePublic.id,
          title: "Algebra Lesson Video",
          content_type: ContentType.VIDEO,
          url: "https://cdn.flyingclass.test/videos/algebra-lesson-1.mp4",
          body_text: "Video content metadata",
          order_index: 2,
          ai_summary_text: "Video summary",
          ai_keywords: ["video", "lesson"],
        },
        {
          class_id: classes.activePrivate.id,
          title: "Physics Concepts - Cloud Doc",
          content_type: ContentType.CLOUD_DOC,
          url: "https://drive.google.com/file/d/seed-physics-file/preview",
          body_text: JSON.stringify({
            displayMode: "EMBED",
            fileType: "DRIVE_FILE",
            originalUrl: "https://drive.google.com/file/d/seed-physics-file/view",
          }),
          order_index: 1,
          ai_summary_text: "Cloud doc about force and energy",
          ai_keywords: ["force", "energy", "physics"],
        },
      ],
    });
  }

  private async seedClassReviews(classes: SeedClasses, users: SeedUsers) {
    await this.prisma.classReview.createMany({
      data: [
        {
          class_id: classes.activePublic.id,
          student_id: users.studentA.id,
          rating: 5,
          content: "Very clear explanation and useful exercises.",
          created_at: this.daysAgo(6),
        },
        {
          class_id: classes.activePublic.id,
          student_id: users.studentB.id,
          rating: 4,
          content: "Good class overall, pacing can be a bit faster.",
          created_at: this.daysAgo(4),
        },
      ],
    });
  }

  private async seedChatMessages(classes: SeedClasses, users: SeedUsers) {
    await this.prisma.chatMessage.createMany({
      data: [
        {
          class_id: classes.activePublic.id,
          sender_id: users.lecturerApproved.id,
          content: "Welcome to Algebra Foundation class!",
          created_at: this.daysAgo(5),
        },
        {
          class_id: classes.activePublic.id,
          sender_id: users.studentA.id,
          content: "Thanks teacher, looking forward to the lessons.",
          created_at: this.daysAgo(4),
        },
        {
          class_id: classes.activePublic.id,
          sender_id: users.studentB.id,
          content: "Could we have extra exercises for chapter 1?",
          created_at: this.daysAgo(3),
        },
      ],
    });
  }

  private async seedKycApplications(users: SeedUsers) {
    await this.prisma.kycApplication.createMany({
      data: [
        {
          userId: users.lecturerApproved.id,
          identityCardUrl: "https://cdn.flyingclass.test/kyc/lecturer-approved-id.jpg",
          supportingDocumentUrls: [
            "https://cdn.flyingclass.test/kyc/lecturer-approved-cert-1.pdf",
            "https://cdn.flyingclass.test/kyc/lecturer-approved-cert-2.pdf",
          ],
          status: KycStatus.APPROVED,
          reviewedBy: users.admin.id,
          reviewedAt: this.daysAgo(20),
          createdAt: this.daysAgo(25),
        },
        {
          userId: users.lecturerPending.id,
          identityCardUrl: "https://cdn.flyingclass.test/kyc/lecturer-pending-id.jpg",
          supportingDocumentUrls: [
            "https://cdn.flyingclass.test/kyc/lecturer-pending-cert-1.pdf",
          ],
          status: KycStatus.PENDING,
          createdAt: this.daysAgo(2),
        },
        {
          userId: users.lecturerRejected.id,
          identityCardUrl: "https://cdn.flyingclass.test/kyc/lecturer-rejected-id.jpg",
          supportingDocumentUrls: [
            "https://cdn.flyingclass.test/kyc/lecturer-rejected-cert-1.pdf",
          ],
          status: KycStatus.REJECTED,
          rejectionReason: "Image quality is too blurry",
          reviewedBy: users.admin.id,
          reviewedAt: this.daysAgo(15),
          createdAt: this.daysAgo(19),
        },
      ],
    });
  }

  private async seedCourses(users: SeedUsers): Promise<SeedCourses> {
    const approved = await this.prisma.course.create({
      data: {
        title: "Complete Algebra for Beginners",
        description: "Approved course for teacher revenue and student analytics",
        thumbnailUrl: "https://cdn.flyingclass.test/courses/algebra-thumbnail.jpg",
        instructorId: users.lecturerApproved.id,
        status: CourseStatus.APPROVED,
        reviewedBy: users.admin.id,
        reviewedAt: this.daysAgo(35),
        createdAt: this.daysAgo(40),
      },
      select: { id: true, title: true },
    });

    const pendingReview = await this.prisma.course.create({
      data: {
        title: "Physics Crash Course",
        description: "Pending review course for admin moderation API",
        thumbnailUrl: "https://cdn.flyingclass.test/courses/physics-thumbnail.jpg",
        instructorId: users.lecturerApproved.id,
        status: CourseStatus.PENDING_REVIEW,
        createdAt: this.daysAgo(5),
      },
      select: { id: true, title: true },
    });

    const rejected = await this.prisma.course.create({
      data: {
        title: "Old Draft with Rejection",
        description: "Rejected course sample",
        instructorId: users.lecturerApproved.id,
        status: CourseStatus.REJECTED,
        rejectionReason: "Course outline is too short",
        reviewedBy: users.admin.id,
        reviewedAt: this.daysAgo(12),
        createdAt: this.daysAgo(14),
      },
      select: { id: true, title: true },
    });

    const draft = await this.prisma.course.create({
      data: {
        title: "English Pronunciation Draft",
        description: "Draft course sample",
        instructorId: users.lecturerPending.id,
        status: CourseStatus.DRAFT,
        createdAt: this.daysAgo(3),
      },
      select: { id: true, title: true },
    });

    return { approved, pendingReview, rejected, draft };
  }

  private async seedCourseTransactions(courses: SeedCourses, users: SeedUsers) {
    const currentYear = new Date().getUTCFullYear();

    await this.prisma.courseTransaction.createMany({
      data: [
        {
          courseId: courses.approved.id,
          studentId: users.studentA.id,
          amount: 500000,
          platformFee: 100000,
          instructorRevenue: 400000,
          status: TransactionStatus.SUCCESS,
          paymentMethod: "momo",
          transactionRef: "SEED-COURSE-TX-0001",
          createdAt: new Date(Date.UTC(currentYear, 0, 10, 10, 0, 0)),
        },
        {
          courseId: courses.approved.id,
          studentId: users.studentB.id,
          amount: 700000,
          platformFee: 140000,
          instructorRevenue: 560000,
          status: TransactionStatus.SUCCESS,
          paymentMethod: "bank_transfer",
          transactionRef: "SEED-COURSE-TX-0002",
          createdAt: new Date(Date.UTC(currentYear, 2, 12, 9, 0, 0)),
        },
        {
          courseId: courses.pendingReview.id,
          studentId: users.studentA.id,
          amount: 450000,
          platformFee: 90000,
          instructorRevenue: 360000,
          status: TransactionStatus.PENDING,
          paymentMethod: "momo",
          transactionRef: "SEED-COURSE-TX-0003",
          createdAt: this.daysAgo(3),
        },
        {
          courseId: courses.rejected.id,
          studentId: users.studentB.id,
          amount: 300000,
          platformFee: 60000,
          instructorRevenue: 240000,
          status: TransactionStatus.FAILED,
          paymentMethod: "momo",
          transactionRef: "SEED-COURSE-TX-0004",
          createdAt: this.daysAgo(8),
        },
      ],
    });
  }

  private async seedWallets(users: SeedUsers) {
    await this.prisma.wallet.createMany({
      data: [
        {
          userId: users.lecturerApproved.id,
          balance: 1200000,
          lockedBalance: 400000,
        },
        {
          userId: users.lecturerPending.id,
          balance: 600000,
          lockedBalance: 50000,
        },
        {
          userId: users.lecturerRejected.id,
          balance: 450000,
          lockedBalance: 0,
        },
      ],
    });
  }

  private async seedPayoutRequests(users: SeedUsers) {
    await this.prisma.payoutRequest.createMany({
      data: [
        {
          instructorId: users.lecturerApproved.id,
          amount: 250000,
          status: PayoutStatus.PENDING,
          bankCode: "VCB",
          bankAccountNumber: "0123456789",
          bankAccountName: "LECTURER APPROVED",
          createdAt: this.daysAgo(2),
        },
        {
          instructorId: users.lecturerApproved.id,
          amount: 150000,
          status: PayoutStatus.COMPLETED,
          bankCode: "VCB",
          bankAccountNumber: "0123456789",
          bankAccountName: "LECTURER APPROVED",
          transactionRef: "SEED-PAYOUT-COMPLETED-0001",
          reviewedBy: users.admin.id,
          reviewedAt: this.daysAgo(10),
          createdAt: this.daysAgo(12),
          updatedAt: this.daysAgo(10),
        },
        {
          instructorId: users.lecturerPending.id,
          amount: 50000,
          status: PayoutStatus.REJECTED,
          bankCode: "ACB",
          bankAccountNumber: "9988776655",
          bankAccountName: "LECTURER PENDING",
          rejectionReason: "Thông tin tài khoản ngân hàng chưa khớp.",
          reviewedBy: users.admin.id,
          reviewedAt: this.daysAgo(4),
          createdAt: this.daysAgo(5),
          updatedAt: this.daysAgo(4),
        },
      ],
    });
  }

  private async seedExams(classes: SeedClasses, users: SeedUsers) {
    const exam = await this.prisma.exam.create({
      data: {
        class_id: classes.activePublic.id,
        title: "Algebra Midterm",
        duration_minutes: 60,
        start_date: this.daysAgo(3),
        end_date: this.daysFromNow(3),
        max_attempts: 2,
        created_at: this.daysAgo(5),
      },
      select: { id: true },
    });

    const questions = await this.prisma.question.createManyAndReturn({
      data: [
        {
          exam_id: exam.id,
          question_text: "2x + 3 = 7, find x",
          type: QuestionType.MULTIPLE_CHOICE,
          options: ["1", "2", "3", "4"],
          correct_answer: "2",
          created_at: this.daysAgo(5),
        },
        {
          exam_id: exam.id,
          question_text: "Explain why linear equations are useful in real life.",
          type: QuestionType.ESSAY,
          correct_answer: null,
          created_at: this.daysAgo(5),
        },
      ],
      select: { id: true },
    });

    await this.prisma.submission.createMany({
      data: [
        {
          exam_id: exam.id,
          student_id: users.studentA.id,
          answers: {
            [questions[0].id]: "2",
            [questions[1].id]: "Used for budgeting and planning.",
          },
          score: 9,
          teacher_comment: "Good work",
          submitted_at: this.daysAgo(2),
        },
        {
          exam_id: exam.id,
          student_id: users.studentB.id,
          answers: {
            [questions[0].id]: "3",
            [questions[1].id]: "Used in market prediction.",
          },
          score: 7,
          teacher_comment: "Need to review basic formula",
          submitted_at: this.daysAgo(1),
        },
      ],
    });
  }

  private async seedNotifications(users: SeedUsers) {
    await this.prisma.notification.createMany({
      data: [
        {
          user_id: users.studentA.id,
          content: "Your assignment has been graded.",
          type: NotificationType.COURSE_UPDATE,
          is_read: false,
          created_at: this.daysAgo(1),
        },
        {
          user_id: users.studentB.id,
          content: "Payment received successfully.",
          type: NotificationType.PAYMENT,
          is_read: true,
          created_at: this.daysAgo(2),
        },
        {
          user_id: users.lecturerApproved.id,
          content: "A new student enrolled in your class.",
          type: NotificationType.SYSTEM,
          is_read: false,
          created_at: this.daysAgo(1),
        },
        {
          user_id: users.admin.id,
          content: "There are pending KYC applications to review.",
          type: NotificationType.SYSTEM,
          is_read: false,
          created_at: this.hoursAgo(12),
        },
      ],
    });
  }

  private async seedAiUsageLogs(users: SeedUsers) {
    await this.prisma.aI_Usage_Log.createMany({
      data: [
        {
          user_id: users.studentA.id,
          feature_type: AIFeatureType.SUMMARY,
          input_tokens: 280,
          output_tokens: 110,
          model_used: "gpt-5.4-mini",
          created_at: this.daysAgo(2),
        },
        {
          user_id: users.lecturerApproved.id,
          feature_type: AIFeatureType.CHAT_BUDDY,
          input_tokens: 520,
          output_tokens: 300,
          model_used: "gpt-5.4",
          created_at: this.daysAgo(1),
        },
      ],
    });
  }

  private printSeedSummary(users: SeedUsers, classes: SeedClasses, courses: SeedCourses) {
    console.log("\n📌 Test credentials (password mặc định: password123)");
    console.log(`- Admin: ${users.admin.email}`);
    console.log(`- Lecturer approved: ${users.lecturerApproved.email}`);
    console.log(`- Lecturer pending: ${users.lecturerPending.email}`);
    console.log(`- Lecturer rejected: ${users.lecturerRejected.email}`);
    console.log(`- Student A: ${users.studentA.email}`);
    console.log(`- Student B: ${users.studentB.email}`);
    console.log(`- Student banned: ${users.studentBanned.email}`);
    console.log(`- Student unverified: ${users.studentUnverified.email}`);

    console.log("\n📌 Token test cố định:");
    console.log(`- verify token: ${SEED_TOKENS.verifyEmail}`);
    console.log(`- reset token: ${SEED_TOKENS.resetPassword}`);

    console.log("\n📌 IDs mẫu để test nhanh API:");
    console.log(`- active class: ${classes.activePublic.id}`);
    console.log(`- private class: ${classes.activePrivate.id}`);
    console.log(`- trash class: ${classes.trashClass.id}`);
    console.log(`- pending-review course: ${courses.pendingReview.id}`);
  }

  private daysAgo(days: number) {
    return new Date(Date.now() - days * 24 * 60 * 60 * 1000);
  }

  private daysFromNow(days: number) {
    return new Date(Date.now() + days * 24 * 60 * 60 * 1000);
  }

  private hoursAgo(hours: number) {
    return new Date(Date.now() - hours * 60 * 60 * 1000);
  }

  private minutesFromNow(minutes: number) {
    return new Date(Date.now() + minutes * 60 * 1000);
  }
}
