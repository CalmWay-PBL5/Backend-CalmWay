/*
  Warnings:

  - You are about to drop the column `teacherId` on the `classes` table. All the data in the column will be lost.
  - The `status` column on the `classes` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - A unique constraint covering the columns `[invitationToken]` on the table `classes` will be added. If there are existing duplicate values, this will fail.
  - Made the column `subjectId` on table `classes` required. This step will fail if there are existing NULL values in that column.
  - Changed the type of `type` on the `classes` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- CreateEnum
CREATE TYPE "course"."ClassType" AS ENUM ('public', 'private');

-- CreateEnum
CREATE TYPE "course"."ClassStatus" AS ENUM ('active', 'pending_delete', 'deleted');

-- DropForeignKey
ALTER TABLE "course"."classes" DROP CONSTRAINT "classes_subjectId_fkey";

-- DropForeignKey
ALTER TABLE "course"."classes" DROP CONSTRAINT "classes_teacherId_fkey";

-- AlterTable
ALTER TABLE "course"."classes" DROP COLUMN "teacherId",
ADD COLUMN     "coverImage" TEXT,
ADD COLUMN     "deletedAt" TIMESTAMP(3),
ADD COLUMN     "invitationToken" TEXT,
ALTER COLUMN "subjectId" SET NOT NULL,
DROP COLUMN "type",
ADD COLUMN     "type" "course"."ClassType" NOT NULL,
DROP COLUMN "status",
ADD COLUMN     "status" "course"."ClassStatus" NOT NULL DEFAULT 'active';

-- CreateTable
CREATE TABLE "course"."enrollments" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "classId" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'student',
    "status" TEXT NOT NULL DEFAULT 'active',
    "joinedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "enrollments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "course"."class_teachers" (
    "id" TEXT NOT NULL,
    "classId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "role" TEXT NOT NULL,

    CONSTRAINT "class_teachers_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "enrollments_userId_classId_key" ON "course"."enrollments"("userId", "classId");

-- CreateIndex
CREATE UNIQUE INDEX "class_teachers_classId_userId_key" ON "course"."class_teachers"("classId", "userId");

-- CreateIndex
CREATE UNIQUE INDEX "classes_invitationToken_key" ON "course"."classes"("invitationToken");

-- CreateIndex
CREATE INDEX "classes_title_idx" ON "course"."classes"("title");

-- AddForeignKey
ALTER TABLE "course"."classes" ADD CONSTRAINT "classes_subjectId_fkey" FOREIGN KEY ("subjectId") REFERENCES "course"."subjects"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "course"."enrollments" ADD CONSTRAINT "enrollments_userId_fkey" FOREIGN KEY ("userId") REFERENCES "auth"."users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "course"."enrollments" ADD CONSTRAINT "enrollments_classId_fkey" FOREIGN KEY ("classId") REFERENCES "course"."classes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "course"."class_teachers" ADD CONSTRAINT "class_teachers_classId_fkey" FOREIGN KEY ("classId") REFERENCES "course"."classes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "course"."class_teachers" ADD CONSTRAINT "class_teachers_userId_fkey" FOREIGN KEY ("userId") REFERENCES "auth"."users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
