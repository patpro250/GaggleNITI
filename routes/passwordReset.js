const express = require("express");
const crypto = require("crypto");
const prisma = require("./prismaClient");
const bcrypt = require("bcrypt");

const router = express.Router();

router.post("/", async (req, res) => {
  const { email, role } = req.body;

  if (!["Institution", "Librarian", "Member", "SystemAdmin"].includes(role)) {
    return res.status(400).send("Invalid role");
  }
  const institution = await prisma[role].findFirst({
    where: { email },
  });

  if (!institution)
    return res
      .status(404)
      .send("Please enter a valid email address or user type");

  const token = crypto.randomBytes(32).toString("hex");
  const Insititutionemail = institution.email;
  // const name = institution.name;
  const expiresAt = new Date(Date.now() + 50 * 60 * 1000); // 50 min

  const userId =
    role === "Librarian"
      ? institution.librarianId ?? institution.id
      : institution.id;

  await prisma.PasswordReset.create({
    data: {
      token,
      userId: userId,
      role: role,
      expiresAt,
    },
  });

  const summary = {
    token: token,
    email: Insititutionemail,
    // name: name,
  };

  // TODO: Send token in email

  return res.status(200).send(summary);
});

router.get("/token/:token", async (req, res) => {
  const token = req.params.token;

  if (!token) return res.status(404).send("invalid Token");

  const TokenDeatail = await prisma.passwordReset.findUnique({
    where: {
      token: token,
    },
  });

  if (!TokenDeatail)
    return res.status(404).send("invalid token related to this request");
  const tokenres = {
    token: TokenDeatail.token,
    role: TokenDeatail.role,
    userid: TokenDeatail.userId,
    expired: TokenDeatail.expiresAt,
  };
  res.send(tokenres);
});

router.post("/reset", async (req, res) => {
  const { token, newPassword } = req.body;

  const restdata = await prisma.passwordReset.findUnique({
    where: {
      token: token,
    },
  });

  if (!restdata)
    return res.status(404).send(" your token is not found try again later");

  const { role, expiresAt, userId } = restdata;

  if (new Date(expiresAt) < new Date())
    return res.status(400).send("Your Token is Expired re-try to reset again ");

  const salt = await bcrypt.genSalt(10);
  const newP = await bcrypt.hash(newPassword, salt);

  if (!["Institution", "Librarian", "Member", "SystemAdmin"].includes(role)) {
    return res.status(400).send("Invalid role");
  }

  const idField = role === "Librarian" ? "librarianId" : "id";

  const result = await prisma.$transaction([
    prisma[role].update({
      where: { [idField]: userId },
      data: { password: newP },
    }),
    prisma.passwordReset.delete({
      where: { token: token },
    }),
  ]);

  if (!result)
    return res.status(500).send("internal server error on transaction");
  res.status(200).send("password reset success");
});

module.exports = router;
