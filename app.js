const express = require('express');
const app = express();

const books = require("./routes/books");

app.use(express.json());
app.use('/books', books);

const PORT = process.env.PORT || 3000;
app.listen(PORT , () => {
    console.log(`App is running on http://localhost:${PORT}`);
})