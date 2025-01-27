const express = require('express');
const app = express();

const books = require("./routes/books");
const bookcopies = require("./routes/bookcopies");
const institutions = require("./routes/institutions");

app.use(express.json());
app.use('/books', books);
app.use('/institutions', institutions);
app.use('/bookcopies', bookcopies);

const PORT = process.env.PORT || 4000;
app.listen(PORT , () => {
    console.log(`App is running on http://localhost:${PORT}`);
})