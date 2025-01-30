const express = require("express");
const Joi = require("joi");
const router = express.Router();
const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

router.get("/", async (req, res) => {
  const aquisition = await prisma.aquisition.findMany();
    if (!aquisition) return res.status(500).json({ message: 'Hello, this is books route!' });
    res.send(aquisition);
});

router.post('/', (req,res) => {



    function validate(){
        const schema = Joi.object({
            
        });
        return schema.validate(req.body);
    }

});

module.exports = router;