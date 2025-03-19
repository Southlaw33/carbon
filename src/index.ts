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

//

serve(app);
console.log("Server ON!");
