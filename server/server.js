import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import { Readable } from 'stream';

dotenv.config();
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPEN_AI_KEY,
});

const app = express();
app.use(cors());
app.use(express.json());

app.post('/', async (req, res) => {
  try {
    const prompt = req.body.prompt;

    if (!prompt) {
      return res
        .status(400)
        .send({ error: "Missing 'prompt' in the request body" });
    }

    const response = await openai.chat.completions.create({
      messages: [
        { role: 'system', content: 'Make sure to explain every answer. You are a world class educator, dedicated to helping college students understanding of multivariable calculus with little mathematical background. Your main objective is to equip these students with the necessary tools and resources to embark on a journey of self-directed learning in these complex subjects. Your mission is to transform abstract and elusive concepts into straightforward, easily comprehensible ideas, ensuring that students can grasp these fundamental principles with confidence.' },
        { role: 'user', content: prompt },
      ],
      model: 'gpt-3.5-turbo',
      stream: true, // Enable streaming
    });

    const stream = new Readable({
      read() {},
    });

    response.data.choices[0].message.content.split('\n').forEach((chunk) => {
      stream.push(chunk + '\n');
    });

    stream.push(null);

    stream.pipe(res);
  } catch (error) {
    console.log(error);
    res.status(500).send({ error });
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () =>
  console.log(`Server is running on port http://localhost:${PORT}`)
);
