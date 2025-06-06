const express = require("express");
const crypto = require("crypto");
const prisma = require("./prismaClient");

const router = express.Router();

router.post("/", async (req, res) => {
  const { email, role } = req.body;

  const institution = await prisma.institution.findFirst({
    where: { email },
  });

  if (!institution) return res.status(404).send("Invalid Email");

  const token = crypto.randomBytes(32).toString("hex");
  const Insititutionemail = institution.email;
  const name = institution.name;
  const expiresAt = new Date(Date.now() + 30 * 60 * 1000); // 30 min

  await prisma.PasswordReset.create({
    data: {
      token,
      userId: institution.id,
      expiresAt,
    },
  });
  const summary = {
    token: token,
    email: Insititutionemail,
    name: name,
  };

  // TODO: Send token in email

  return res.status(200).send(summary);
  //   } catch (err) {
  //     console.error(err);
  //     res.status(500).send("Internal Server Error");
  //   }
});

module.exports = router;
