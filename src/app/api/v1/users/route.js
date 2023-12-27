import { prisma } from "@/libs/prisma";
import { headers } from "next/headers";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET;

export const GET = async () => {
  const res = await prisma.user.findMany({});
  return Response.json(res);
};

export const PUT = async (req, res) => {
  const token = headers().get("Authorization");

  if (!token) {
    return Response.json(
      { error: "Unauthorized - Token not provided" },
      { status: 401 }
    );
  }

  const decodedUser = jwt.verify(token, JWT_SECRET);

  const userId = decodedUser.userId;
  const body = await req.json();
  const { newScore, newLives, newHint, newCompletedLevel } = body;

  try {
    const user = await prisma.user.update({
      where: { id: userId },
      data: {
        score: newScore,
        lives: newLives,
        hint: newHint,
        completedLevel: newCompletedLevel,
      },
    });

    const response = {
      username: user.username,
      score: user.score,
      lives: user.lives,
      hint: user.hint,
      completedLevel: user.completedLevel,
    };

    return Response.json(
      { response, message: "User Berhasil Diupdate" },
      { status: 200 }
    );
  } catch (error) {
    console.error(error);
    return Response.json(
      { error: "Error selama update user" },
      { status: 500 }
    );
  }
};

export const DELETE = async (req, res) => {
  const token = headers().get("Authorization");

  if (!token) {
    return Response.json(
      { error: "Unauthorized - Token not provided" },
      { status: 401 }
    );
  }

  const decodedUser = jwt.verify(token, JWT_SECRET);

  const userId = decodedUser.userId;

  try {
    const deletedUser = await prisma.user.delete({
      where: { id: userId },
    });

    const response = {
      username: deletedUser.username,
      message: "User Successfully Deleted",
    };

    return Response.json(response, { status: 200 });
  } catch (error) {
    console.error(error);
    return Response.json(
      { error: "Error selama delete user" },
      { status: 500 }
    );
  }
};
