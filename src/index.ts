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
// app.delete("/students/:studentId", async (c) => {
//   const { studentId } = c.req.param();
//   try {
//     const sid = 



serve(app);
console.log("Server ON!");
