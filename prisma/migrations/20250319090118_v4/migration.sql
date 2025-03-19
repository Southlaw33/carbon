-- DropForeignKey
ALTER TABLE "Student" DROP CONSTRAINT "Student_proctorId_fkey";

-- AddForeignKey
ALTER TABLE "Student" ADD CONSTRAINT "Student_proctorId_fkey" FOREIGN KEY ("proctorId") REFERENCES "Professor"("id") ON DELETE CASCADE ON UPDATE CASCADE;
