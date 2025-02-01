const express = require("express");
const Joi = require("joi");
const {PrismaClient} = require("@prisma/client");

const router = express.Router();

const prisma = new PrismaClient();

router.get("/", async (req,res) => {
  
  const borrowing = await prisma.circulation.findMany({
    include: {
        bookCopy: true,  // Include details about the related BookCopy
        member: true,    // Include details about the related Member
        librarian: true, // Include details about the related Librarian
      },
  });

  if(!borrowing || borrowing.length<1) return res.status(404).send("Data Not Found");
  res.status(200).send(borrowing);

});


router.get("/:id", async (req,res) => {
  
  const borrowing = await prisma.circulation.findFirst({
    where: {copyId: req.params.id},

       include: {
          bookCopy: true,  // Include details about the related BookCopy
           member: true,    // Include details about the related Member
           librarian: true, // Include details about the related Librarian
         },
  });

  if(!borrowing) return res.status(404).send("Data Not Found");
  res.status(200).send(borrowing);

});

router.post("/", async (req, res) =>{
  const {error} = validate(req.body);

  if(error) return res.status(404).send(error.details[0].message);

  let bookcopies = await prisma.bookCopy.findUnique({where:{id:req.body.bookCopy}});
  if(!bookcopies) return res.status(404).send(`Book ${req.body.bookCopy} is not found, you can add to your library`);

  const userId = await prisma.member.findUnique({where:{id:req.body.userId}});
  if(!userId) return res.status(500).send(`User ${req.body.userId} not found`);

  const librarian = await prisma.librarian.findUnique({where:{librarianId:req.body.librarianId}});
  if(!librarian) return res.status(404).send(`Librarian ${req.body.librarianId} not found`);
   
  if (bookcopies.status !== 'AVAILABLE') {
    res.status(404).send(`Book is ${bookcopies.status} and not accessible`);
    return; // Stop execution of this request but keep Node.js running
  }
  
   

let lending = await prisma.circulation.create({
    data: {
        copyId: req.body.bookCopy,
        userId: req.body.userId,
        librarianIdNo:req.body.librarianId,
        returnDate: req.body.returnDate,
      }
  })
  
  if(!lending) res.status(500).send(`lending operation failed`);
  
  bookcopies = await prisma.bookCopy.update({
    where: {id: req.body.bookCopy},
    data:{
        status:'CHECKEDOUT'
    }
  });

  if(!bookcopies) return res.status(500).send(`lending operations failed`);

  const booksdata = await prisma.book.findFirst({
    where:{id:bookcopies.bookId},

    select:{
        title:true,
        author:true,
        publisher:true,
        callNo:true

    },
  });

  if(!booksdata) return res.status(500).send(`cannot find book`);
 
  res.status(200).send(`Book ${booksdata.title} , Author ${booksdata.author} , published ${booksdata.published} is borrowed to ${userId.firstName} ${userId.lastName} `);
})

function validate(borrow){
    const schema = Joi.object({
        bookCopy:Joi.required(), 
        userId: Joi.required(),       
        insitutionId:Joi.optional(), 
        librarianId:Joi.required(),  
        returnDate:Joi.date().iso().required(),   
        lendDate:Joi.optional(),  
        isActive:Joi.optional(),   
    })

    return schema.validate(borrow);
}

module.exports = router;