import { randomUUID } from 'node:crypto';
import argon2 from 'argon2';
import { Client } from 'pg';

const BASE_URL = process.env.NEW_API_TEST_BASE_URL ?? 'http://127.0.0.1:3000/api/v1';
const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  throw new Error('DATABASE_URL is required.');
}

const results = [];

function addResult({ name, ok, status, expected, detail = '', severity = 'fail' }) {
  results.push({ name, ok, status, expected, detail, severity });
  const tag = ok ? 'PASS' : severity === 'warn' ? 'WARN' : 'FAIL';
  const expectedText = Array.isArray(expected) ? expected.join('|') : String(expected);
  console.log(`[${tag}] ${name} -> status=${status}, expected=${expectedText}${detail ? ` | ${detail}` : ''}`);
}

async function req(name, method, path, options = {}) {
  const {
    token,
    headers = {},
    body,
    expected = [200],
    failSeverity = 'fail',
  } = options;

  const finalHeaders = { ...headers };
  if (token) finalHeaders.authorization = `Bearer ${token}`;

  let finalBody = body;
  if (body && typeof body === 'object' && !(body instanceof FormData) && !(body instanceof Blob) && !finalHeaders['content-type']) {
    finalHeaders['content-type'] = 'application/json';
    finalBody = JSON.stringify(body);
  }

  const response = await fetch(`${BASE_URL}${path}`, {
    method,
    headers: finalHeaders,
    body: finalBody,
    redirect: 'manual',
  });

  const text = await response.text();
  let json = null;
  try {
    json = text ? JSON.parse(text) : null;
  } catch {
    json = null;
  }

  const ok = expected.includes(response.status);
  addResult({
    name,
    ok,
    status: response.status,
    expected,
    detail: ok ? '' : text.slice(0, 300),
    severity: failSeverity,
  });

  return { ok, status: response.status, text, json, headers: response.headers };
}

async function login(email, password) {
  const res = await req(`POST /auth/login (${email})`, 'POST', '/auth/login', {
    body: { email, password },
    expected: [200],
  });

  return res.json?.access_token;
}

async function setupData() {
  const client = new Client({ connectionString: DATABASE_URL });
  await client.connect();

  const suffix = Date.now().toString(36);
  const password = 'Test@123456';
  const passwordHash = await argon2.hash(password);

  const lecturerId = randomUUID();
  const student1Id = randomUUID();
  const student2Id = randomUUID();
  const lecturerProfileId = randomUUID();
  const student1ProfileId = randomUUID();
  const student2ProfileId = randomUUID();
  const subjectId = randomUUID();
  const classId = randomUUID();
  const classMember1Id = randomUUID();
  const classMember2Id = randomUUID();
  const transactionId = randomUUID();
  const reviewId = randomUUID();
  const courseId = randomUUID();
  const courseTxId = randomUUID();

  const lecturerEmail = `newapi-lecturer-${suffix}@example.com`;
  const student1Email = `newapi-student1-${suffix}@example.com`;
  const student2Email = `newapi-student2-${suffix}@example.com`;

  try {
    await client.query('BEGIN');

    await client.query(
      `insert into users (id, email, password, role, is_verified, "isActive", status, updated_at)
       values ($1, $2, $3, $4, true, true, 'ACTIVE', now())`,
      [lecturerId, lecturerEmail, passwordHash, 'LECTURER'],
    );

    await client.query(
      `insert into users (id, email, password, role, is_verified, "isActive", status, updated_at)
       values ($1, $2, $3, $4, true, true, 'ACTIVE', now())`,
      [student1Id, student1Email, passwordHash, 'STUDENT'],
    );

    await client.query(
      `insert into users (id, email, password, role, is_verified, "isActive", status, updated_at)
       values ($1, $2, $3, $4, true, true, 'ACTIVE', now())`,
      [student2Id, student2Email, passwordHash, 'STUDENT'],
    );

    await client.query(
      `insert into profiles (id, user_id, full_name, phone, updated_at) values ($1, $2, $3, $4, now())`,
      [lecturerProfileId, lecturerId, `Lecturer ${suffix}`, '0900000001'],
    );

    await client.query(
      `insert into profiles (id, user_id, full_name, phone, updated_at) values ($1, $2, $3, $4, now())`,
      [student1ProfileId, student1Id, `Student 1 ${suffix}`, '0900000002'],
    );

    await client.query(
      `insert into profiles (id, user_id, full_name, phone, updated_at) values ($1, $2, $3, $4, now())`,
      [student2ProfileId, student2Id, `Student 2 ${suffix}`, '0900000003'],
    );

    await client.query(
      `insert into subjects (id, name, description) values ($1, $2, $3)`,
      [subjectId, `Subject ${suffix}`, 'Subject for new API tests'],
    );

    await client.query(
      `insert into classes (
         id, teacher_id, subject_id, title, description, price,
         class_code, max_students, type, status
       ) values ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
      [
        classId,
        lecturerId,
        subjectId,
        `Seed Class ${suffix}`,
        'Seed class for chat + lesson + class-member tests',
        100,
        `SEED-${suffix}`,
        100,
        'PUBLIC',
        'ACTIVE',
      ],
    );

    await client.query(
      `insert into class_members (id, class_id, student_id, status, updated_at)
       values ($1, $2, $3, $4, now())`,
      [classMember1Id, classId, student1Id, 'ACTIVE'],
    );

    await client.query(
      `insert into class_members (id, class_id, student_id, status, dropped_at, updated_at)
       values ($1, $2, $3, $4, now(), now())`,
      [classMember2Id, classId, student2Id, 'DROPPED'],
    );

    await client.query(
      `insert into transactions (id, user_id, class_id, amount, status)
       values ($1, $2, $3, $4, $5)`,
      [transactionId, student1Id, classId, 100, 'SUCCESS'],
    );

    await client.query(
      `insert into class_reviews (id, class_id, student_id, rating, content, updated_at)
       values ($1, $2, $3, $4, $5, now())`,
      [reviewId, classId, student1Id, 5, 'Great class'],
    );

    await client.query(
      `insert into courses (id, title, description, "instructorId", status, "updatedAt")
       values ($1, $2, $3, $4, $5, now())`,
      [courseId, `Course ${suffix}`, 'Course for teacher revenue/students tests', lecturerId, 'APPROVED'],
    );

    await client.query(
      `insert into course_transactions (
         id, "courseId", "studentId", amount, "platformFee", "instructorRevenue", status,
         "paymentMethod", "transactionRef", "updatedAt"
       ) values ($1, $2, $3, $4, $5, $6, $7, $8, $9, now())`,
      [courseTxId, courseId, student1Id, 200, 20, 180, 'SUCCESS', 'TEST', `tx-${suffix}`],
    );

    await client.query('COMMIT');
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    await client.end();
  }

  return {
    password,
    lecturer: { id: lecturerId, email: lecturerEmail },
    student1: { id: student1Id, email: student1Email },
    student2: { id: student2Id, email: student2Email },
    subject: { id: subjectId },
    seedClass: { id: classId },
    course: { id: courseId },
  };
}

async function run() {
  console.log(`BASE_URL=${BASE_URL}`);

  const seeded = await setupData();

  const lecturerToken = await login(seeded.lecturer.email, seeded.password);
  const studentToken = await login(seeded.student1.email, seeded.password);

  if (!lecturerToken || !studentToken) {
    throw new Error('Unable to get access token for seeded users.');
  }

  await req('GET /teachers/me/profile', 'GET', '/teachers/me/profile', {
    token: lecturerToken,
    expected: [200],
  });

  await req('PUT /teachers/me/profile (json)', 'PUT', '/teachers/me/profile', {
    token: lecturerToken,
    body: {
      fullName: `Lecturer Updated ${Date.now()}`,
      phone: '0900111222',
      bio: 'Updated bio from automated tests',
    },
    expected: [200],
  });

  await req('GET /teachers/me/revenue/summary', 'GET', '/teachers/me/revenue/summary', {
    token: lecturerToken,
    expected: [200],
  });

  await req('GET /teachers/me/revenue/monthly', 'GET', '/teachers/me/revenue/monthly?year=2026', {
    token: lecturerToken,
    expected: [200],
  });

  await req('GET /teachers/me/students', 'GET', '/teachers/me/students?skip=0&take=20', {
    token: lecturerToken,
    expected: [200],
  });

  await req('GET /teachers/me/students/search/query', 'GET', `/teachers/me/students/search/query?q=${encodeURIComponent('student1')}&skip=0&take=20`, {
    token: lecturerToken,
    expected: [200],
  });

  await req('GET /teachers/me/students/stats/overview', 'GET', '/teachers/me/students/stats/overview', {
    token: lecturerToken,
    expected: [200],
  });

  await req('GET /teachers/me/students/:studentId', 'GET', `/teachers/me/students/${seeded.student1.id}`, {
    token: lecturerToken,
    expected: [200],
  });

  await req('GET /teachers/me/students/export/all', 'GET', '/teachers/me/students/export/all', {
    token: lecturerToken,
    expected: [200],
  });

  await req('GET /teachers/me/students/export/course/:courseId', 'GET', `/teachers/me/students/export/course/${seeded.course.id}`, {
    token: lecturerToken,
    expected: [200],
  });

  await req('GET /teachers/me/classes/subjects', 'GET', '/teachers/me/classes/subjects', {
    token: lecturerToken,
    expected: [200],
  });

  await req('GET /teachers/me/classes/reviews/detailed', 'GET', '/teachers/me/classes/reviews/detailed', {
    token: lecturerToken,
    expected: [200],
  });

  const createdClass = await req('POST /teachers/me/classes', 'POST', '/teachers/me/classes', {
    token: lecturerToken,
    body: {
      title: `Created Class ${Date.now()}`,
      description: 'Created from automated tests',
      price: 150,
      type: 'PUBLIC',
      maxStudents: 120,
      subjectId: seeded.subject.id,
    },
    expected: [201],
  });

  const createdClassId = createdClass.json?.id;
  if (!createdClassId) {
    throw new Error('POST /teachers/me/classes did not return class id.');
  }

  await req('GET /teachers/me/classes', 'GET', '/teachers/me/classes', {
    token: lecturerToken,
    expected: [200],
  });

  await req('GET /teachers/me/classes/dashboard/stats', 'GET', '/teachers/me/classes/dashboard/stats', {
    token: lecturerToken,
    expected: [200],
  });

  await req('GET /teachers/me/classes/trash', 'GET', '/teachers/me/classes/trash', {
    token: lecturerToken,
    expected: [200],
  });

  await req('GET /teachers/me/classes/export/all', 'GET', '/teachers/me/classes/export/all', {
    token: lecturerToken,
    expected: [200],
  });

  await req('GET /teachers/me/classes/export/:id/members', 'GET', `/teachers/me/classes/export/${seeded.seedClass.id}/members`, {
    token: lecturerToken,
    expected: [200],
  });

  await req('GET /teachers/me/classes/:id', 'GET', `/teachers/me/classes/${seeded.seedClass.id}`, {
    token: lecturerToken,
    expected: [200],
  });

  await req('PATCH /teachers/me/classes/:id', 'PATCH', `/teachers/me/classes/${seeded.seedClass.id}`, {
    token: lecturerToken,
    body: {
      title: `Patched Class ${Date.now()}`,
      maxStudents: 90,
    },
    expected: [200],
  });

  await req('PUT /teachers/me/classes/:id', 'PUT', `/teachers/me/classes/${seeded.seedClass.id}`, {
    token: lecturerToken,
    body: {
      description: 'Updated by PUT route in test',
      price: 180,
    },
    expected: [200],
  });

  await req('DELETE /teachers/me/classes/:id', 'DELETE', `/teachers/me/classes/${seeded.seedClass.id}`, {
    token: lecturerToken,
    expected: [200],
  });

  await req('PATCH /teachers/me/classes/:id/restore', 'PATCH', `/teachers/me/classes/${seeded.seedClass.id}/restore`, {
    token: lecturerToken,
    expected: [200],
  });

  await req('POST /teachers/me/classes/trash/cleanup', 'POST', '/teachers/me/classes/trash/cleanup', {
    token: lecturerToken,
    expected: [201],
  });

  await req('POST /teachers/me/class-members', 'POST', '/teachers/me/class-members', {
    token: lecturerToken,
    body: {
      classId: createdClassId,
      studentId: seeded.student2.id,
    },
    expected: [201],
  });

  await req('GET /teachers/me/class-members/class/:classId', 'GET', `/teachers/me/class-members/class/${createdClassId}?status=ACTIVE`, {
    token: lecturerToken,
    expected: [200],
  });

  await req('GET /class-members/class/:classId (alias)', 'GET', `/class-members/class/${createdClassId}`, {
    token: lecturerToken,
    expected: [200],
  });

  await req('DELETE /teachers/me/class-members/class/:classId/student/:studentId', 'DELETE', `/teachers/me/class-members/class/${createdClassId}/student/${seeded.student2.id}`, {
    token: lecturerToken,
    expected: [200],
  });

  const lessonCreated = await req('POST /lessons/cloud-doc', 'POST', '/lessons/cloud-doc', {
    token: lecturerToken,
    body: {
      classId: createdClassId,
      title: 'Cloud doc test',
      url: 'https://docs.google.com/document/d/abc123/edit',
    },
    expected: [201],
  });

  const lessonId = lessonCreated.json?.id;
  if (!lessonId) {
    throw new Error('POST /lessons/cloud-doc did not return lesson id.');
  }

  await req('GET /lessons/class/:classId/cloud-docs', 'GET', `/lessons/class/${createdClassId}/cloud-docs`, {
    token: lecturerToken,
    expected: [200],
  });

  await req('PATCH /lessons/:id/title', 'PATCH', `/lessons/${lessonId}/title`, {
    token: lecturerToken,
    body: {
      title: 'Cloud doc updated title',
    },
    expected: [200],
  });

  await req('DELETE /lessons/:id', 'DELETE', `/lessons/${lessonId}`, {
    token: lecturerToken,
    expected: [204],
  });

  await req('GET /classes/:classId/chat-history', 'GET', `/classes/${seeded.seedClass.id}/chat-history?take=20`, {
    token: lecturerToken,
    expected: [200],
  });

  const teacherMessage = await req('POST /classes/:classId/chat/messages (teacher)', 'POST', `/classes/${seeded.seedClass.id}/chat/messages`, {
    token: lecturerToken,
    body: {
      content: 'Teacher test message',
    },
    expected: [201],
  });

  const teacherMessageId = teacherMessage.json?.id;
  if (!teacherMessageId) {
    throw new Error('Teacher message did not return id.');
  }

  await req('DELETE /classes/:classId/chat/messages/:messageId (teacher own)', 'DELETE', `/classes/${seeded.seedClass.id}/chat/messages/${teacherMessageId}`, {
    token: lecturerToken,
    expected: [200],
  });

  const studentMessage = await req('POST /classes/:classId/chat/messages (student)', 'POST', `/classes/${seeded.seedClass.id}/chat/messages`, {
    token: studentToken,
    body: {
      content: 'Student test message',
    },
    expected: [201],
  });

  const studentMessageId = studentMessage.json?.id;
  if (!studentMessageId) {
    throw new Error('Student message did not return id.');
  }

  await req('DELETE /classes/:classId/chat/messages/:messageId (teacher delete student msg)', 'DELETE', `/classes/${seeded.seedClass.id}/chat/messages/${studentMessageId}`, {
    token: lecturerToken,
    expected: [403],
  });

  await req('DELETE /classes/:classId/chat/messages/:messageId (student own)', 'DELETE', `/classes/${seeded.seedClass.id}/chat/messages/${studentMessageId}`, {
    token: studentToken,
    expected: [200],
  });

  await req('GET /chat/classes/:classId/chat-history (alias)', 'GET', `/chat/classes/${seeded.seedClass.id}/chat-history?take=10`, {
    token: studentToken,
    expected: [200],
  });

  await req('GET /teachers/me/revenue/summary (as student forbidden)', 'GET', '/teachers/me/revenue/summary', {
    token: studentToken,
    expected: [403],
  });

  await req('GET /ai-assistant/models', 'GET', '/ai-assistant/models', {
    token: lecturerToken,
    expected: [200],
    failSeverity: 'warn',
  });

  await req('POST /ai-assistant/chat (message)', 'POST', '/ai-assistant/chat', {
    token: lecturerToken,
    body: {
      message: 'Xin chao, tra loi ngan gon',
    },
    expected: [200],
    failSeverity: 'warn',
  });

  await req('POST /ai-assistant/chat (empty message)', 'POST', '/ai-assistant/chat', {
    token: lecturerToken,
    body: {
      message: '   ',
    },
    expected: [400],
  });

  const fd = new FormData();
  fd.set('message', 'Mo ta nhanh noi dung anh');
  const onePixelPng = Buffer.from(
    'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+/aX8AAAAASUVORK5CYII=',
    'base64',
  );
  fd.set('file', new Blob([onePixelPng], { type: 'image/png' }), 'pixel.png');

  await req('POST /ai-assistant/chat (multipart)', 'POST', '/ai-assistant/chat', {
    token: lecturerToken,
    body: fd,
    expected: [200],
    failSeverity: 'warn',
  });

  const total = results.length;
  const failCount = results.filter((r) => !r.ok && r.severity !== 'warn').length;
  const warnCount = results.filter((r) => !r.ok && r.severity === 'warn').length;
  const passCount = total - failCount - warnCount;

  console.log('\n=== NEW API TEST SUMMARY ===');
  console.log(`BASE_URL: ${BASE_URL}`);
  console.log(`TOTAL: ${total}, PASS: ${passCount}, WARN: ${warnCount}, FAIL: ${failCount}`);

  if (failCount > 0) {
    process.exitCode = 1;
  }
}

run().catch((error) => {
  console.error('Test runner crashed:', error);
  process.exitCode = 1;
});
