const express = require("express");
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const router = express.Router();

router.post("/", async (req, res) => {
  const { name } = req.body;
  const name__exist = await prisma.institution.findFirst({
    where: {
      name: {
        equals: name,
        mode: "insensitive", // optional, for case-insensitive match
      },
    },
  });

  if (!name__exist)
    return res.status(200).json({ message: `✅  ${name} is available` });
  res.status(404).json({ message: `${name} is not available` });
});

module.exports = router;
