const express = require('express');
const router = express.Router();
const Joi = require('joi');

const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();
 
router.get('/', async (req, res) => {
  const suppliers = await prisma.supplier.findMany();
   if(!suppliers) return res.status(500).send("Internal Server error");
  res.send(suppliers);
});

router.post('/', async (req, res) => {
    const { error } = validate(req.body);
    if (error) return res.status(400).send(error.details[0].message);

    const existingSupplier = await prisma.supplier.findUnique({
        where: { email: req.body.email },
      });
      
      if (existingSupplier) return res.status(400).send(`${req.body.email} already exists`);
      

    const suppliers = await prisma.supplier.create({
       data: req.body 
    });

    if(!suppliers) return res.status(500).send("Internal Server error");

    res.send(suppliers);
});
function validate(supplier){
    const schema = Joi.object({
        name:Joi.string().required(),  
        email:Joi.required(),      
        phone: Joi.string().min(10).required(),     
        website:Joi.optional(),   
        address: Joi.object().required(),   
        status:Joi.optional(),     
        aquisition:Joi.optional(), 
    });

    return schema.validate(supplier);
}

module.exports = router;