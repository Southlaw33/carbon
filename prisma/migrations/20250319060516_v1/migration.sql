-- CreateTable
CREATE TABLE "Student" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "dateOfBirth" TEXT NOT NULL,
    "aadharNumber" TEXT NOT NULL,

    CONSTRAINT "Student_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Student_aadharNumber_key" ON "Student"("aadharNumber");
