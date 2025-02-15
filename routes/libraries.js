const express = require("express");
const Joi = require("joi");
const router = express.Router();

const isDirector = require("../middleware/auth/director");

const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

router.get('/', async (req, res) => {
    let { cursor, limit, q, sort } = req.query;
    limit = parseInt(limit) || 10;

    if (limit > 50) limit = 50;
    const orderBy = sort === 'asc' ? { createdAt: 'asc' } : { createdAt: 'desc' };

    const where = {
        ...(q && {
            OR: [
                { name: { contains: q, mode: "insensitive" } }
            ]
        })
    }

    const libraries = await prisma.library.findMany({
        where,
        take: limit,
        skip: cursor ? 1 : 0,
        cursor: cursor ? { id: cursor } : undefined,
        orderBy,
        include: {
            librarian: true
        }
    });

    const nextCursor = libraries.length === limit ? libraries[libraries.length - 1].id : null;
    res.status(200).send({ nextCursor, libraries });
});

router.get('/:id', async (req, res) => {
    let library = await prisma.library.findUnique({where: {id: req.params.id}, include: {librarian: true}});
    if (!library) return res.status(404).send(`This library is not found`);
    res.status(200).send(library);
});

router.post('/', isDirector, async (req, res) => {
    const { error } = validate(req.body);
    if (error) return res.status(400).send(error.details[0].message);

    const exists = await prisma.library.findFirst({
        where: {
            AND: [
                { name: req.body.name },
                { institutionId: req.user.institutionId }
            ]
        }
    });
    if (exists) return res.status(400).send(`Library with name: ${exists.name} already exists, try again!`);

    const librarian = await prisma.librarian.findUnique({ where: { librarianId: req.body.directorId } });
    if (!librarian) return res.status(404).send(`The director you assigned to the library doesn't exist, create one!`);

    req.body.institutionId = req.user.id;
    await prisma.library.create({
        data: {
            name: req.body.name,
            shelvesNo: req.body.shelvesNo,
            type: req.body.type,
            institution: {
                connect: {
                    id: req.user.id
                }
            },
            librarian: {
                connect: {
                    librarianId: req.body.directorId
                }
            }
        }
    });

    res.status(200).send(`${req.body.name} added successfully`);
});

router.put('/:id', async (req, res) => {
    const { error } = validate(req.body);
    if (error) return res.status(400).send(error.details[0].message);

    const library = await prisma.library.findUnique({ where: { id: req.params.id } });
    if (!library) return res.status(404).send(`Library with ID: ${req.params.id} doesn't exist`);

    await prisma.library.update({where: {id: req.params.id}, data: req.body});
    res.status(200).send(`${req.body.name} updated successfully!`);
});

router.delete('/:id', async (req, res) => {
    let library = await prisma.library.findUnique({where: {id: req.params.id}, include: {librarian: true}});
    if (!library) return res.status(404).send(`This library is not found`);
    await prisma.library.delete({where: {id: req.params.id}});
    res.status(200).send(`${library.name} is deleted successfully!`);
});

function validate(library) {
    let schema = Joi.object({
        name: Joi.string().required().min(3).max(50),
        directorId: Joi.string().uuid(),
        shelvesNo: Joi.number().required(),
        type: Joi.string().required()
    });
    return schema.validate(library);
}

module.exports = router;