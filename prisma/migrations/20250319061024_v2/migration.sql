/*
  Warnings:

  - Added the required column `proctorId` to the `Student` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "Seniority" AS ENUM ('JUNIOR', 'SENIOR', 'ASSOCIATE', 'HEAD');

-- AlterTable
ALTER TABLE "Student" ADD COLUMN     "proctorId" TEXT NOT NULL;

-- CreateTable
CREATE TABLE "Professor" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "seniority" "Seniority" NOT NULL,
    "aadharNumber" TEXT NOT NULL,

    CONSTRAINT "Professor_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Professor_aadharNumber_key" ON "Professor"("aadharNumber");

-- AddForeignKey
ALTER TABLE "Student" ADD CONSTRAINT "Student_proctorId_fkey" FOREIGN KEY ("proctorId") REFERENCES "Professor"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
