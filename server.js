const express = require("express");
require("dotenv").config();
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const rateLimit = require("express-rate-limit");
const fs = require("node:fs").promises;
const path = require("node:path");

const app = express();
const DB_FILE = path.join(__dirname, "database.json");

app.use(express.json());
app.use(cors());
app.use(helmet());
app.use(morgan("combined"));

const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100
});
app.use("/books", apiLimiter);

async function readLocalDB() {
    try {
        const data = await fs.readFile(DB_FILE, "utf8");
        return JSON.parse(data);
    } catch {
        return [
            { id: "1", title: "The Great Gatsby", author: "F. Scott Fitzgerald" },
            { id: "2", title: "To Kill a Mockingbird", author: "Harper Lee" }
        ];
    }
}

async function writeLocalDB(data) {
    await fs.writeFile(DB_FILE, JSON.stringify(data, null, 2), "utf8");
}

console.log("Connected to Local Persistent Database successfully!");

app.get("/", (req, res) => {
    res.send("Welcome to Book API with Local Persistent Database!");
});

app.get("/health", (req, res) => {
    res.json({ status: "OK", message: "API is running offline" });
});

app.get("/books", async (req, res) => {
    const books = await readLocalDB();
    res.json(books);
});

app.get("/books/:id", async (req, res) => {
    const books = await readLocalDB();
    const book = books.find(b => b.id === req.params.id);
    if (!book) return res.status(404).json({ message: "Book not found" });
    res.json(book);
});

app.post("/books", async (req, res) => {
    const { title, author } = req.body;
    if (!title || !author) {
        return res.status(400).json({ error: "Title and author properties are required fields" });
    }
    const books = await readLocalDB();
    const newBook = {
        id: String(books.length > 0 ? Math.max(...books.map(b => Number(b.id))) + 1 : 1),
        title,
        author
    };
    books.push(newBook);
    await writeLocalDB(books);
    res.status(201).json(newBook);
});

app.patch("/books/:id", async (req, res) => {
    const books = await readLocalDB();
    const index = books.findIndex(b => b.id === req.params.id);
    if (index === -1) return res.status(404).json({ message: "Book not found" });

    books[index] = { ...books[index], ...req.body };
    await writeLocalDB(books);
    res.json(books[index]);
});

app.delete("/books/:id", async (req, res) => {
    const books = await readLocalDB();
    const filteredBooks = books.filter(b => b.id !== req.params.id);
    if (books.length === filteredBooks.length) {
        return res.status(404).json({ message: "Book not found" });
    }
    await writeLocalDB(filteredBooks);
    res.json({ message: "Book deleted successfully" });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on port ${PORT}`);
});
