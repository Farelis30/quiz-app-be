const router = require("express").Router();
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

// Secret key for JWT, you should store this securely and not hardcode it
const JWT_SECRET = process.env.JWT_SECRET;

// auth token
function authenticateToken(req, res, next) {
  const token = req.header("Authorization");

  if (!token) {
    return res.status(401).json({ error: "Unauthorized - Token not provided" });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: "Forbidden - Invalid token" });
    }
    req.user = user;
    next();
  });
}

router.get("/users", async (req, res) => {
  const response = await prisma.user.findMany({});
  res.json({ response });
});

// Registrasi User
router.post("/register", async (req, res) => {
  const { username, password } = req.body;

  // Hash password sebelum disimpan
  const hashedPassword = await bcrypt.hash(password, 10);

  try {
    const existingUser = await prisma.user.findUnique({
      where: { username },
    });

    if (existingUser) {
      return res.status(400).json({ error: "Nama pengguna sudah digunakan" });
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

    res.status(200).json(response);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error selama registrasi" });
  }
});

// Login User
router.post("/login", async (req, res) => {
  const { username, password } = req.body;

  try {
    const user = await prisma.user.findUnique({
      where: { username },
    });

    if (!user) {
      return res.status(404).json({ error: "User tidak ditemukan" });
    }

    const passwordMatch = await bcrypt.compare(password, user.password);

    if (!passwordMatch) {
      return res.status(401).json({ error: "Username atau password salah" });
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

    res.json(response);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error selama login" });
  }
});

// Update User
router.put("/update", authenticateToken, async (req, res) => {
  const userId = req.user.userId;
  const { newScore, newLives, newHint, newCompletedLevel } = req.body;

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

    res.status(200).json({ response, message: "User Berhasil Diupdate" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error selama update user" });
  }
});

// Delete User
router.delete("/delete", authenticateToken, async (req, res) => {
  const userId = req.user.userId;

  try {
    const deletedUser = await prisma.user.delete({
      where: { id: userId },
    });

    const response = {
      username: deletedUser.username,
      message: "User Successfully Deleted",
    };

    res.status(200).json(response);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error selama delete user" });
  }
});

// Function to generate JWT token
function generateToken(userId) {
  return jwt.sign({ userId }, JWT_SECRET, { expiresIn: "1h" });
}

module.exports = router;
