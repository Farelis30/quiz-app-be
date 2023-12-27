import { generateToken } from "@/libs/generateToken";
import { prisma } from "@/libs/prisma";
import bcrypt from "bcrypt";

export const POST = async (req) => {
  const body = await req.json();
  const { username, password } = body;

  try {
    const user = await prisma.user.findUnique({
      where: { username },
    });

    if (!user) {
      return Response.json({ error: "User tidak ditemukan" }, { status: 404 });
    }

    const passwordMatch = await bcrypt.compare(password, user.password);

    if (!passwordMatch) {
      return Response.json(
        { error: "Username atau password salah" },
        { status: 401 }
      );
    }

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
    return Response.json({ error: "Error selama login" }, { status: 500 });
  }
};
