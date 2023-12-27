import { generateToken } from "@/libs/generateToken";
import { prisma } from "@/libs/prisma";
import bcrypt from "bcrypt";

export const POST = async (req) => {
  const body = await req.json();
  const { username, password } = body;

  // Hash password sebelum disimpan
  const hashedPassword = await bcrypt.hash(password, 10);

  try {
    const existingUser = await prisma.user.findUnique({
      where: { username },
    });

    if (existingUser) {
      return Response.json(
        {
          error: "Nama pengguna sudah digunakan",
        },
        { status: 400 }
      );
    }

    const user = await prisma.user.create({
      data: {
        username,
        password: hashedPassword,
        score: 0,
        lives: 3,
        hint: 5,
        completedLevel: [],
      },
    });

    const token = generateToken(user.id);

    const response = {
      username: user.username,
      score: user.score,
      lives: user.lives,
      hint: user.hint,
      completedLevel: user.completedLevel,
      token,
    };

    return Response.json(response, { status: 200 });
  } catch (error) {
    console.error(error);
    return Response.json({ error: "Error selama registrasi" }, { status: 500 });
  }
};
