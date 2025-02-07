import express from "express";
import chalk from "chalk";


const app = express();

// Middleware to parse JSON bodies
app.use(express.json());

// POST route to echo the received message
app.post('/', (req, res) => {
    const message = req.body;
    res.send(message);
});


// Start the Express server
app.listen(5000, () => {
    console.log(chalk.redBright.bold(`Listening on port ${chalk.yellow(5000)}`));
});