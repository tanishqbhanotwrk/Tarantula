import express from "express";

const PORT = process.env.PORT || 8080;

const app = express();

app.use(express.json());

app.get("/", (req, res) => {
    return res.json("Hello from the server pookie.....!");
});

app.listen(PORT, () => {
    console.log("Server is running....");
})