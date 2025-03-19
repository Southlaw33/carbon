import { serve } from "@hono/node-server";
import { PrismaClient } from "./prisma";
import { Hono } from "hono";

const app = new Hono();

const prisma = new PrismaClient();

//Retrieving all the students in the college
app.get("/students", async (c) => {
  try {
    const students = await prisma.student.findMany();
    return c.json(students);
  } catch (e) {
    console.log(e);
  }
});

//Retrieving all the professors in the college
app.get("/professors", async (c) => {
  try {
    const professors = await prisma.professor.findMany();
    return c.json(professors, 200);
  } catch (e) {
    console.log(e);
  }
});

//Getting enriched student records (has proctor details along with student)
app.get("/students/enriched", async (c) => {
  try {
    const studentsEnriched = await prisma.student.findMany({
      include: {
        proctor: true,
      },
    });
    return c.json(studentsEnriched, 200);
  } catch (e) {
    console.log(e);
  }
});

//Adding new student record
app.post("/students", async (c) => {
  const { name, dateOfBirth, aadharNumber } = await c.req.json();
  try {
    const studentAadhar = await prisma.student.findUnique({
      where: {
        aadharNumber,
      },
    });
    if (studentAadhar) {
      return c.json({ message: "Bad Request!" }, 400);
    }

    const student = await prisma.student.create({
      data: {
        name,
        dateOfBirth,
        aadharNumber,
      },
    });
    return c.json(student, 201);
  } catch (e) {
    console.log(e);
  }
});

//Adding a professor
app.post("/professors", async (c) => {
  const { name, seniority, aadharNumber } = await c.req.json();
  try {
    const existingProfessor = await prisma.professor.findUnique({
      where: { aadharNumber },
    });

    if (existingProfessor) {
      return c.json({ message: "bad request" }, 400);
    }
    const professor = await prisma.professor.create({
      data: {
        name,
        seniority,
        aadharNumber,
      },
    });
    return c.json(professor, 201);
  } catch (e) {
    console.log(e);
  }
});

//Retrieving all students under proctorship of a given professor
app.get("/professors/:professorId/proctorships", async (c) => {
  try {
    const { professorId } = c.req.param();
    const validProfId = prisma.professor.findUnique({
      where: {
        id: professorId,
      },
    });
    if (!validProfId) {
      return c.json({ message: "Bad Request" }, 400);
    }
    const proctorships = await prisma.student.findMany({
      where: {
        proctorId: professorId,
      },
    });
    return c.json(proctorships, 200);
  } catch (e) {
    console.log(e);
  }
});

//Update student details based on studentId
app.patch("/students/:studentId", async (c) => {
  const { studentId } = c.req.param();
  try {
    const sId = await prisma.student.findUnique({
      where: {
        id: studentId,
      },
    });
    if (!sId) {
      return c.json({ message: "Bad Request" }, 400);
    }
    const { name, aadharNumber, dateOfBirth, proctorId } = await c.req.json();
    const student = await prisma.student.update({
      where: {
        id: studentId,
      },
      data: {
        name,
        aadharNumber,
        dateOfBirth,
        proctorId,
      },
    });
    return c.json(student, 201);
  } catch (e) {
    console.log(e);
  }
});

//Update professor details based on professorId
app.patch("/professors/:professorId", async (c) => {
  const { professorId } = c.req.param();
  try {
    const profId = await prisma.professor.findUnique({
      where: {
        id: professorId,
      },
    });
    if (!profId) {
      return c.json({ message: "Bad Request" }, 400);
    }
    const { name, seniority, aadharNumber } = await c.req.json();
    const professor = await prisma.professor.update({
      where: {
        id: professorId,
      },
      data: {
        name,
        seniority,
        aadharNumber,
      },
    });
    return c.json(professor, 201);
  } catch (e) {
    console.log(e);
  }
});

//Delete student by his studentId
app.delete("/students/:studentId", async (c) => {
  const { studentId } = c.req.param();
  try {
    const sId = await prisma.student.findUnique({
      where: {
        id: studentId,
      },
    });
    if (!sId) {
      return c.json({ message: "Bad Request" }, 400);
    }
    const student = await prisma.student.delete({
      where: {
        id: studentId,
      },
    });
    return c.json(student, 200);
  } catch (e) {
    console.log(e);
  }
});

//Delete professor by his professorId
app.delete("/professors/:professorId", async (c) => {
  const { professorId } = c.req.param();
  try {
    const profId = await prisma.professor.findUnique({
      where: {
        id: professorId,
      },
    });
    if (!profId) {
      return c.json({ message: "Bad Request" }, 400);
    }
    const professor = await prisma.professor.delete({
      where: {
        id: professorId,
      },
    });
    return c.json({ message: "Professor details deleted" }, 200);
  } catch (e) {
    console.log(e);
  }
});

//Assigning student under the proctorship of a professor
app.post("/professors/:professorId", async (c) => {
  const { professorId } = c.req.param();
  const { studentId } = await c.req.json();
  try {
    const profId = await prisma.professor.findUnique({
      where: {
        id: professorId,
      },
    });
    if (!profId) {
      return c.json({ message: "Bad Request" }, 400);
    }
    const stuId = await prisma.student.findUnique({
      where: {
        id: studentId,
      },
    });
    if (!stuId) {
      return c.json({ message: "Bad Request" }, 400);
    }
    const prof = await prisma.student.update({
      where: {
        id: studentId,
      },
      data: {
        proctorId: professorId,
      },
    });
    return c.json({ message: "Student added to proctorship" }, 200);
  } catch (e) {
    console.log(e);
  }
});

//Entering LibraryMembership details of a student
app.post("/students/:studentId/library-membership", async (c) => {
  const { studentId } = c.req.param();

  try {
    const { issueDate, expiryDate } = await c.req.json();

    // Check if student exists
    const student = await prisma.student.findUnique({
      where: { id: studentId },
    });

    if (!student) {
      return c.json({ message: "Student not found!" }, 404);
    }

    // Check if the student already has a library membership
    const existingMembership = await prisma.libraryMembership.findUnique({
      where: { studentId },
    });

    if (existingMembership) {
      return c.json(
        { message: "Library membership already exists for this student" },
        409
      );
    }

    // Create new library membership
    const membership = await prisma.libraryMembership.create({
      data: {
        studentId,
        issueDate,
        expiryDate,
      },
    });

    return c.json(membership, 201);
  } catch (e) {
    console.error("Error creating library membership:", e);
    return c.json({ message: "Internal Server Error" }, 500);
  }
});

//Retrieving the library-membership deatails of a particular studemt
app.get("/students/:studentId/library-membership", async (c) => {
  const { studentId } = c.req.param();
  try {
    const sId = await prisma.student.findUnique({
      where: {
        id: studentId,
      },
    });
    if (!sId) {
      return c.json({ message: "Bad Request!" }, 400);
    }
    const membership = await prisma.libraryMembership.findMany({
      where: {
        studentId: studentId,
      },
    });
    return c.json(membership, 200);
  } catch (e) {
    console.log(e);
  }
});

serve(app);
console.log("Server ON!");
