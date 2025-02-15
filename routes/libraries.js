const express = require("express");
const Joi = require("joi");
const router = express.Router();

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
        orderBy
    });

    const nextCursor = libraries.length === limit ? libraries[libraries.length - 1].id : null;
    res.status(200).send({ nextCursor, libraries });
});

module.exports = router;