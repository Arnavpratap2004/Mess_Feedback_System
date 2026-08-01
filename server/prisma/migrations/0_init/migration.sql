-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateTable
CREATE TABLE "admins" (
    "id" SERIAL NOT NULL,
    "admin_name" VARCHAR(100) NOT NULL,
    "employee_id" VARCHAR(20) NOT NULL,
    "admin_password" VARCHAR(255) NOT NULL,

    CONSTRAINT "admins_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "students" (
    "id" SERIAL NOT NULL,
    "student_name" VARCHAR(100) NOT NULL,
    "reg_no" VARCHAR(20) NOT NULL,
    "student_password" VARCHAR(255) NOT NULL,

    CONSTRAINT "students_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "feedback" (
    "id" SERIAL NOT NULL,
    "student_reg_no" VARCHAR(20) NOT NULL,
    "student_name" VARCHAR(100) NOT NULL,
    "block_name" VARCHAR(50) NOT NULL,
    "room_number" VARCHAR(20) NOT NULL,
    "mess_name" VARCHAR(100) NOT NULL,
    "mess_type" VARCHAR(20) NOT NULL,
    "category" VARCHAR(20) NOT NULL,
    "feedback" TEXT NOT NULL,
    "comments" TEXT,
    "proof_path" VARCHAR(255),
    "submitted_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "feedback_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "admins_employee_id_key" ON "admins"("employee_id");

-- CreateIndex
CREATE UNIQUE INDEX "students_reg_no_key" ON "students"("reg_no");

-- CreateIndex
CREATE INDEX "feedback_student_reg_no_idx" ON "feedback"("student_reg_no");

-- CreateIndex
CREATE INDEX "feedback_submitted_at_idx" ON "feedback"("submitted_at");

-- AddForeignKey
ALTER TABLE "feedback" ADD CONSTRAINT "feedback_student_reg_no_fkey" FOREIGN KEY ("student_reg_no") REFERENCES "students"("reg_no") ON DELETE RESTRICT ON UPDATE CASCADE;
