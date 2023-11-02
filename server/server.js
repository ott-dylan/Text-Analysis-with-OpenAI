// Importing necessary libraries
import express from 'express'
import OpenAI from 'openai'
import dotenv from 'dotenv'
import cors from 'cors'

// Loading environment variables
dotenv.config()

// Setting up the Express app and middleware
const app = express()
app.use(cors())
app.use(express.json())

// Initializing OpenAI API with the API key from the environment variables
const openai = new OpenAI(process.env.OpenAI_API_KEY)

// Defining the route for the text analysis
app.post('/analyze', async (req, res) => {
    const { text } = req.body
    try {
        const gptResponse = await openai.chat.completions.create({
            model: 'gpt-3.5-turbo',
            messages: [
                {
                    role: 'user',
                    content: `You are a sophisticated text analysis assistant. Your role is to analyze the given text in depth, identifying any grammar or spelling errors, suggesting improvements for style and clarity, and providing insights on the content. Ensure to categorize your feedback clearly and return the analysis in a structured JSON format. NEVER USE THE SAME SENTENCE TWICE WHEN GIVING FEEDBACK. ONLY ONE COMMENT PER SENTENCE. ONLY DO ONE TYPE PER SENTENCE, SO IF YOU GIVE A GRAMMAR FEEDBACK TO ONE SENTENCE YOU CANNOT DO THE SAME THING FOR ANOTHER SENTENCE. FOR EXAMPLE, IF YOU GO OVER A SENTENCE IN style_suggestions YOU CANNOT DO IT IN FEEDBACK. 500 tokens max.

                    Here is an example of a structured response:{
                        "style_suggestions": [
                            {
                            "sentence": "The research was very very extensive.",
                            "correction": "The research was extremely extensive.",
                            "comment": "Avoid using repeated words for emphasis. Use a stronger adjective instead."
                            },
                            {
                            "sentence": "He was a cool, tall, nice guy who liked to play basketball and hang out with his friends.",
                            "correction": "He was tall and played basketball.",
                            "comment": "More concise writing is easier to read and understand."
                            }
                        ],
                        "feedback": [
                            {
                            "sentence:": "Using words such as “jumbled,” “funny-shaped,” and “foreign,” the tone is one of confusion",
                            "comment": "Tone is created by other devices, so you need to identify the initial device you would use to describe "jumbled", etc. Details/___ diction? You pick."
                            },
                            {
                            "sentence": "Figurative language adds more insight to Estrella’s passionate, resilient character. For example, Estrella’s comparison of her teacher’s face to a “crumpled Kleenex” demonstrates Estrella’s judgmental and blunt personality.",
                            "comment": "Be specific whenever possible. What type of figurative language is this? SAY THAT! Again, here is my same question: Which is more important the device or the characterization/big ideas? You know the answer, so LEAD with that!!!"
                            }
                        ]
                    }
                    
                    Analyze the text: "${text}"`,
                },
            ],
            temperature: 0,
        })

        const rawResponse = gptResponse.choices[0]?.message?.content?.trim()

        const structuredResponse = parseResponse(rawResponse)

        res.json(structuredResponse)
    } catch (error) {
        console.error(error)
        res.status(500).json({
            error: 'An error occurred while analyzing the text.',
        })
    }
})

function parseResponse(rawResponse) {
    try {
        console.log('Raw response:', rawResponse)
        const response = JSON.parse(rawResponse)
        return {
            style_suggestions: response.style_suggestions || [],
            feedback: response.feedback || [],
        }
    } catch (error) {
        console.error('Failed to parse raw response:', error)
        return {
            error: 'Failed to parse the response from the text analysis.',
        }
    }
}

// Starting the server
const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`)
})
