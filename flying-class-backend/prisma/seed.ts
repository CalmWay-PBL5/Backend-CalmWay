// @ts-nocheck
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';

const connectionString = process.env.PRISMA_DATABASE_URL || process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error('DATABASE_URL is not defined in the environment variables.');
}

const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('🌱 Bắt đầu gieo hạt (Seeding) dữ liệu mẫu toàn diện...');

  // ==========================================
  // 1. TẠO ADMIN
  // ==========================================
  const adminEmail = 'admin@flyingclass.com';
  const adminUser = await prisma.user.upsert({
    where: { email: adminEmail },
    update: {},
    create: {
      email: adminEmail,
      passwordHash: 'hashed_password_placeholder',
      role: 'ADMIN',
      isVerified: true,
      profile: { create: { fullName: 'System Administrator' } },
    },
  });
  console.log(`✅ Admin tạo thành công: ${adminUser.email}`);

  // ==========================================
  // 2. TẠO MÔN HỌC
  // ==========================================
  const subjects = ['Mathematics', 'Physics', 'Chemistry', 'English', 'Information Technology', 'Japanese'];
  for (const name of subjects) {
    await prisma.subject.upsert({
      where: { name },
      update: {},
      create: { name, description: `Chương trình chuẩn môn ${name}` },
    });
  }
  console.log('✅ Đã nạp danh sách Môn học.');

  const mathSubject = await prisma.subject.findUnique({ where: { name: 'Mathematics' } });
  const itSubject = await prisma.subject.findUnique({ where: { name: 'Information Technology' } });
  const jpSubject = await prisma.subject.findUnique({ where: { name: 'Japanese' } });

  // ==========================================
  // 3. TẠO GIÁO VIÊN (3 người)
  // ==========================================
  const teacher1 = await prisma.user.upsert({
    where: { email: 'teacher.hoa@flyingclass.com' },
    update: {},
    create: {
      email: 'teacher.hoa@flyingclass.com',
      passwordHash: 'hashed_password_placeholder',
      role: 'TEACHER',
      isVerified: true,
      profile: { create: { fullName: 'Cô giáo Hoa', experienceYears: 5 } },
    },
  });

  const teacher2 = await prisma.user.upsert({
    where: { email: 'teacher.tuan@flyingclass.com' },
    update: {},
    create: {
      email: 'teacher.tuan@flyingclass.com',
      passwordHash: 'hashed_password_placeholder',
      role: 'TEACHER',
      isVerified: true,
      profile: { create: { fullName: 'Thầy Tuấn IT', experienceYears: 8 } },
    },
  });

  const teacher3 = await prisma.user.upsert({
    where: { email: 'teacher.mai@flyingclass.com' },
    update: {},
    create: {
      email: 'teacher.mai@flyingclass.com',
      passwordHash: 'hashed_password_placeholder',
      role: 'TEACHER',
      isVerified: true,
      profile: { create: { fullName: 'Cô Mai Ngoại Ngữ', experienceYears: 6 } },
    },
  });
  console.log('✅ Đã nạp dữ liệu Giáo viên.');

  // ==========================================
  // 4. TẠO HỌC SINH (7 người)
  // ==========================================
  const students = [];
  for (let i = 1; i <= 7; i++) {
    const student = await prisma.user.upsert({
      where: { email: `student${i}@flyingclass.com` },
      update: {},
      create: {
        email: `student${i}@flyingclass.com`,
        passwordHash: 'hashed_password_placeholder',
        role: 'STUDENT',
        isVerified: true,
        profile: { create: { fullName: `Học sinh số ${i}` } },
      },
    });
    students.push(student);
  }
  console.log(`✅ Đã nạp dữ liệu ${students.length} Học sinh.`);

  // ==========================================
  // 5. TẠO LỚP HỌC (3 Lớp)
  // ==========================================
  const class1 = await prisma.class.upsert({
    where: { classCode: 'MATH101' },
    update: {},
    create: {
      classCode: 'MATH101',
      title: 'Luyện thi Toán tư duy',
      description: 'Lớp học toán tương tác cao, giúp nắm vững nền tảng logic.',
      price: 500000,
      type: 'PUBLIC',
      maxStudents: 50,
      teacherId: teacher1.id,
      subjectId: mathSubject?.id,
    },
  });

  const class2 = await prisma.class.upsert({
    where: { classCode: 'IT202' },
    update: {},
    create: {
      classCode: 'IT202',
      title: 'Nhập môn Lập trình Web',
      description: 'Học xây dựng website từ con số 0 với React và Node.js.',
      price: 850000,
      type: 'PUBLIC',
      maxStudents: 40,
      teacherId: teacher2.id,
      subjectId: itSubject?.id,
    },
  });

  const class3 = await prisma.class.upsert({
    where: { classCode: 'JPN-N2-01' },
    update: {},
    create: {
      classCode: 'JPN-N2-01',
      title: 'Chinh phục JLPT N2 - Đọc hiểu & Ngữ pháp',
      description: 'Khóa học thiết kế chuyên sâu giúp nắm chắc toàn bộ ngữ pháp N2 và kỹ năng dịch tự nhiên.',
      price: 1500000,
      type: 'PUBLIC',
      maxStudents: 25,
      teacherId: teacher3.id,
      subjectId: jpSubject?.id,
    },
  });
  console.log('✅ Đã nạp dữ liệu Lớp học.');

  // ==========================================
  // 6. THÊM HỌC SINH VÀO LỚP (ENROLLMENTS)
  // ==========================================
  const enrollmentsData = [
    // Lớp Toán
    { studentId: students[0].id, classId: class1.id },
    { studentId: students[1].id, classId: class1.id },
    // Lớp IT
    { studentId: students[1].id, classId: class2.id },
    { studentId: students[2].id, classId: class2.id },
    // Lớp Ngoại ngữ
    { studentId: students[4].id, classId: class3.id }, // Học sinh 5
    { studentId: students[5].id, classId: class3.id }, // Học sinh 6
    { studentId: students[6].id, classId: class3.id }, // Học sinh 7
  ];

  let newEnrollmentsCount = 0;
  for (const enroll of enrollmentsData) {
    const existing = await prisma.enrollment.findUnique({
      where: { studentId_classId: { studentId: enroll.studentId, classId: enroll.classId } },
    });
    
    if (!existing) {
      await prisma.enrollment.create({ data: enroll });
      newEnrollmentsCount++;
    }
  }
  console.log(`✅ Đã thêm ${newEnrollmentsCount} bản ghi Ghi danh (Enrollments) mới.`);

  // ==========================================
  // 7. TẠO ĐÁNH GIÁ (REVIEWS)
  // ==========================================
  // (Xóa hết review cũ để tránh bị nhân bản khi chạy seed nhiều lần)
  await prisma.review.deleteMany();

  const math101Reviews = [
    { studentId: students[0].id, classId: class1.id, rating: 5, content: 'Lớp toán rất hay, giáo viên giảng dạy tuyệt vời!' },
    { studentId: students[0].id, classId: class1.id, rating: 5, content: 'Cô giáo Hoa giải thích rất rõ ràng, dễ hiểu!' },
    { studentId: students[1].id, classId: class1.id, rating: 4, content: 'Nghe được nhiều kỹ năng mới, nội dung khá sâu.' },
  ];

  const it202Reviews = [
    { studentId: students[1].id, classId: class2.id, rating: 4, content: 'Học được từ cơ bản đến nâng cao, thầy Tuấn giảng rất tận tâm.' },
    { studentId: students[2].id, classId: class2.id, rating: 5, content: 'Thầy tư duy bài giảng rất logic và dễ làm theo.' },
    { studentId: students[2].id, classId: class2.id, rating: 5, content: 'P Tuấn giải thích concept rất clear, đề cập nhiều best practices.' },
  ];

  const jpnReviews = [
    { studentId: students[4].id, classId: class3.id, rating: 5, content: 'Lớp học vô cùng chất lượng. Phần đọc hiểu trước đây mình rất sợ nhưng giờ đã tự tin hơn hẳn.' },
    { studentId: students[5].id, classId: class3.id, rating: 5, content: 'Cô giảng ngữ pháp rất logic, có nhiều ví dụ thực tế chuẩn văn phong.' },
    { studentId: students[6].id, classId: class3.id, rating: 4, content: 'Bài tập phong phú, sát với đề thi thực tế. Rất đáng học!' },
  ];

  const allReviews = [...math101Reviews, ...it202Reviews, ...jpnReviews];
  for (const review of allReviews) {
    await prisma.review.create({ data: review });
  }
  console.log(`✅ Đã nạp (hoặc làm mới) ${allReviews.length} Đánh giá (Reviews).`);

  console.log('🎉 Hoàn tất quá trình Seeding toàn diện!');
}

main()
  .catch((e) => {
    console.error('❌ Lỗi Seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });