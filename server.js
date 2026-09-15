const express = require("express");
require("dotenv").config();
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const rateLimit = require("express-rate-limit");

const app = express();

app.use(express.json());
app.use(cors());
app.use(helmet());
app.use(morgan("combined"));

const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, 
    max: 100 
});

app.use("/books", apiLimiter);

const PORT = process.env.PORT || 3000;
 
let books = [ 
  { id: 1, title: "The Harry Potter & The Philosopher's Stone", author: "J.K. Rowling" }, 
  { id: 2, title: "Diary of a Wimpy Kid", author: "Jeff Kinney" } 
]; 
 
app.get("/", (req, res) => { 
  res.send("Welcome to Book API"); 
}); 
 
app.get("/books", (req, res) => { 
  res.json(books); 
}); 
 
app.get("/books/:id", (req, res) => { 
  const id = parseInt(req.params.id); 
  const book = books.find(book => book.id === id); 
  if (!book) { 
    return res.status(404).json({ message: "Book not found" }); 
  } 
  res.json(book); 
}); 
 
app.post("/books", (req, res) => { 
  const newBook = { 
    id: books.length === 0 ? 1 : Math.max(...books.map(book => book.id)) + 1, 
    title: req.body.title, 
    author: req.body.author 
  }; 
  books.push(newBook); 
  res.status(201).json(newBook); 
}); 
 
app.patch("/books/:id", (req, res) => { 
  const id = parseInt(req.params.id); 
  const book = books.find(book => book.id === id); 
  if (!book) { 
    return res.status(404).json({ message: "Book not found" }); 
  } 
  if (req.body.title) book.title = req.body.title; 
  if (req.body.author) book.author = req.body.author; 
  res.json(book); 
}); 
 
app.delete("/books/:id", (req, res) => { 
  const id = parseInt(req.params.id); 
  const index = books.findIndex(book => book.id === id); 
  if (index === -1) { 
    return res.status(404).json({ message: "Book not found" }); 
  }

  const deletedBook = books.splice(index, 1); 
res.json({ message: "Book deleted", book: deletedBook[0] }); 
}); 

app.get('/', (req, res) => {
    res.send("Welcome to Book API");
});

    res.json({
        status: "OK",
        message: "API is running"
    });

app.listen(PORT, () => { 
console.log(`Server running on http://localhost:${PORT}`); 
}); 