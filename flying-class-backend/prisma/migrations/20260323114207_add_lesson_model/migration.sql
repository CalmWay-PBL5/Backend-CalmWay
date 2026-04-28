-- CreateTable
CREATE TABLE "lesson"."lessons" (
    "id" TEXT NOT NULL,
    "class_id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "content_type" TEXT NOT NULL,
    "url" TEXT,
    "body_text" TEXT,
    "order_index" INTEGER NOT NULL,
    "ai_summary_text" TEXT,
    "ai_keywords" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "lessons_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "lessons_class_id_idx" ON "lesson"."lessons"("class_id");

-- CreateIndex
CREATE INDEX "lessons_order_index_idx" ON "lesson"."lessons"("order_index");

-- AddForeignKey
ALTER TABLE "lesson"."lessons" ADD CONSTRAINT "lessons_class_id_fkey" FOREIGN KEY ("class_id") REFERENCES "course"."classes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
