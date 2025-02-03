const express = require("express");
const Joi = require("joi");
const _ = require("lodash");
const { PrismaClient } = require("@prisma/client");

const router = express.Router();
const prisma = new PrismaClient();

router.get('/', async (req, res) => {
    const reservations = await prisma.reservation.findMany();
    res.status(200).send(reservations);
});

router.get('/:id', async (req, res) => {
    let reservation = await prisma.reservation.findUnique({where: {id: req.params.id}, include: {bookCopy: true, member: true}});
    if (!reservation) return res.status(404).send(`The reservation with ID ${req.params.id} was not found.`);
    reservation = _.omit(reservation, ["member.password"]);
    res.status(200).send(reservation);
});

router.post('/', async (req, res) => {
    const {error} = validate(req.body);
    if (error) return res.status(404).send(error.details[0].message);

    let isAvailable = await prisma.bookCopy.findUnique({where: {id: req.body.copyId}});
    if (!isAvailable) return res.status(404).send('Book not found!');

    isAvailable = await prisma.bookCopy.findFirst({where: {
        id: req.body.copyId,
        status: 'AVAILABLE'
    }});
    if (!isAvailable) return res.status(400).send('This book is not available or maybe reserved!');

    const member = await prisma.member.findUnique({where: {id: req.body.memberId}});
    if (!member) return res.status(404).send('Member not found!');

    // Institution checking
    // Limit the number of reservations
    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + 7);

    const [updatedCopy, createdReservation] = await prisma.$transaction([
        prisma.bookCopy.update({where: {id: req.body.copyId}, data: {status: 'ONHOLD'}}),
        prisma.reservation.create({data: {
            memberId: req.body.memberId,
            copyId: req.body.copyId,
            dueDate: dueDate
        }})
    ]);

    res.status(201).send(createdReservation);
});

function validate(reservation) {
    const schema = Joi.object({
        memberId: Joi.string().required().uuid(),
        copyId: Joi.string().required().uuid()
    });
    return schema.validate(reservation);
}

module.exports = router;