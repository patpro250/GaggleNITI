const express = require("express");
const Joi = require("joi");
const prisma = require("./prismaClient");
const bcrypt = require("bcrypt");

const router = express.Router();

router.post('/', async (req, res) => {
    const { error } = validateSystemAdmin(req.body);
    if (error) return res.status(400).send(error.details[0].message);

    const existingAdmin = await prisma.systemAdmin.findFirst({
        where: { email: req.body.email },
    });

    if (existingAdmin) return res.status(400).send("Admin with this email already exists");

    const hashed = await bcrypt.hash(req.body.password, 10);
    req.body.password = hashed;

    await prisma.systemAdmin.create({
        data: req.body
    });

    res.status(201).send("System Admin created successfully");

});

router.put('/:id', async (req, res) => {
    const { error } = validateUpdate(req.body);
    if (error) return res.status(400).send(error.details[0].message);

    const admin = await prisma.systemAdmin.findFirst({
        where: { id: req.params.id },
    });
    if (!admin) return res.status(404).send("Admin not found");

    await prisma.systemAdmin.update({
        where: { id: req.params.id },
        data: req.body
    });

    res.status(200).send("System Admin updated successfully");
});

router.patch('/change-password/:id', async (req, res) => {
    const { error } = validatePassword(req.body);
    if (error) return res.status(400).send(error.details[0].message);

    const admin = await prisma.systemAdmin.findFirst({ where: { id: req.params.id } });
    if (!admin) return res.status(404).send("Admin not found");

    const isValid = await bcrypt.compare(req.body.oldPassword, admin.password);
    if (!isValid) return res.status(400).send("The old password is incorrect");

    const hashed = await bcrypt.hash(req.body.newPassword, 10);
    req.body.newPassword = hashed;

    await prisma.systemAdmin.update({
        where: { id: req.params.id },
        data: { password: req.body.newPassword }
    });

    res.status(200).send("Password updated successfully");
});

function validateSystemAdmin(admin) {
    const schema = Joi.object({
        email: Joi.string().email().required(),
        password: Joi.string().min(8).required(),
        firstName: Joi.string().required(),
        lastName: Joi.string().required(),
        phone: Joi.string().required(),
    });
    return schema.validate(admin);
}

function validateUpdate(admin) {
    const schema = Joi.object({
        firstName: Joi.string(),
        lastName: Joi.string(),
        phone: Joi.string(),
    });
    return schema.validate(admin);
}

function validatePassword(admin) {
    const schema = Joi.object({
        oldPassword: Joi.string().required(),
        newPassword: Joi.string().min(8).required(),
    });
    return schema.validate(admin);
}

module.exports = router;