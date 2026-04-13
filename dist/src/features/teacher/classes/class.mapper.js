"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "mapClassEntity", {
    enumerable: true,
    get: function() {
        return mapClassEntity;
    }
});
const _client = require("@prisma/client");
function mapClassEntity(classItem) {
    const successTransactions = (classItem.transactions || []).filter((item)=>item.status === _client.TransactionStatus.SUCCESS);
    const activeMembers = (classItem.classMembers || []).filter((item)=>item.status === _client.ClassMemberStatus.ACTIVE);
    const studentIds = activeMembers.length ? new Set(activeMembers.map((item)=>item.student_id)) : new Set(successTransactions.map((item)=>item.user_id));
    const totalRevenue = successTransactions.reduce((sum, item)=>sum + Number(item.amount || 0), 0);
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
        totalRevenue
    };
}

//# sourceMappingURL=class.mapper.js.map