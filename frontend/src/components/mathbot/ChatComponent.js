import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import { ZodError } from 'zod'; // Import ZodError if you haven't already

dotenv.config();
import OpenAI from 'openai';

const openai = new OpenAI({
    apiKey: process.env.OPEN_AI_KEY,
});

const app = express();
app.use(cors());
app.use(express.json());

// Define a custom error handling middleware
const errorHandler = (err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send({ error: 'Something went wrong!' });
};

app.use(errorHandler);

app.get('/', async (req, res) => {
    res.status(200).send({
        message: 'Hello from Cyber',
    });
});

app.post('/', async (req, res) => {
    try {
        const prompt = req.body.prompt;

        if (!prompt) {
            // If prompt is missing in the request, return a bad request response
            return res
                .status(400)
                .send({ error: "Missing 'prompt' in the request body" });
        }

        const response = await openai.chat.completions.create({
            messages: [
                { role: 'system', content: 'Make sure to explain every answer...' },
                { role: 'user', content: prompt },
            ],
            model: 'gpt-3.5-turbo',
        });

        // Check if the response is valid and has the expected properties
        if (!response || !response.choices || !Array.isArray(response.choices) || response.choices.length === 0 || !response.choices[0].message || typeof response.choices[0].message.content !== 'string') {
            console.error('Invalid or unexpected response from OpenAI:', response);
            return res.status(500).send({ error: 'Invalid or unexpected response from OpenAI' });
        }

        // Send the bot's response back to the client
        res.status(200).send({
            bot: response.choices[0].message.content.trim(),
        });

    } catch (error) {
        if (error instanceof ZodError) {
            // Handle ZodError (or other specific errors) with a 400 Bad Request response
            return res.status(400).send({ error: 'Invalid request body' });
        } else {
            // Log the error for debugging purposes
            console.error(error);

            // Return a generic internal server error response
            return res.status(500).send({ error: 'Internal server error' });
        }
    }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () =>
    console.log(`Server is running on port http://localhost:${PORT}`)
);
