import {
  ClassMemberStatus,
  ClassStatus,
  ClassType,
  TransactionStatus,
} from "@prisma/client";

export type ClassTransactionLite = {
  user_id: string;
  amount: unknown;
  status: TransactionStatus;
};

export type ClassEntityLite = {
  id: string;
  teacher_id: string;
  subject_id: string;
  title: string;
  description: string | null;
  price: unknown;
  cover_image: string | null;
  class_code: string;
  invitation_token: string | null;
  max_students: number;
  type: ClassType;
  status: ClassStatus;
  created_at: Date;
  deleted_at: Date | null;
  subject?: {
    id: string;
    name: string;
  } | null;
  transactions?: ClassTransactionLite[];
  classMembers?: Array<{
    student_id: string;
    status: ClassMemberStatus;
    joined_at: Date;
  }>;
};

export function mapClassEntity(classItem: ClassEntityLite) {
  const successTransactions = (classItem.transactions || []).filter(
    (item) => item.status === TransactionStatus.SUCCESS,
  );

  const activeMembers = (classItem.classMembers || []).filter(
    (item) => item.status === ClassMemberStatus.ACTIVE,
  );

  const studentIds = activeMembers.length
    ? new Set(activeMembers.map((item) => item.student_id))
    : new Set(successTransactions.map((item) => item.user_id));
  const totalRevenue = successTransactions.reduce(
    (sum, item) => sum + Number(item.amount || 0),
    0,
  );

  return {
    id: classItem.id,
    teacherId: classItem.teacher_id,
    subjectId: classItem.subject_id,
    title: classItem.title,
    description: classItem.description,
    price: Number(classItem.price || 0),
    coverImage: classItem.cover_image,
    classCode: classItem.class_code,
    invitationToken: classItem.invitation_token,
    maxStudents: classItem.max_students,
    type: classItem.type,
    status: classItem.status,
    createdAt: classItem.created_at,
    deletedAt: classItem.deleted_at,
    subject: classItem.subject || null,
    studentCount: studentIds.size,
    totalRevenue,
  };
}
