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
                    content: `You are a sophisticated text analysis assistant. Your role is to analyze the given text in depth, identifying any grammar or spelling errors, suggesting improvements for style and clarity, and providing insights on the content. Ensure to categorize your feedback clearly and return the analysis in a structured JSON format.

                    Here is an example of a structured response:{
                        "grammar_errors": [
                            {
                            "sentence": "The quick brown foxs jumps over the lazy dog.",
                            "correction": "The quick brown fox jumps over the lazy dog.",
                            "comment": "Changed 'foxs' to 'fox' and 'jumps' to 'jump' to correct the subject-verb agreement."
                            }
                        ],
                        "style_suggestions": [
                            {
                            "sentence": "The research was very very extensive.",
                            "correction": "The research was extremely extensive.",
                            "comment": "Avoid using repeated words for emphasis. Use a stronger adjective instead."
                            }
                        ],
                        "content_insights": [
                            {
                            "sentence:": "The quick brown fox jumps over the lazy dog.",
                            "topic": "Animal Behavior",
                            "insight": "The sentence seems to be a playful take on the well-known pangram 'The quick brown fox jumps over the lazy dog', which is used to display fonts and test keyboards."
                            }
                        ]
                    }
                    
                    Analyze the text: "${text}"`,
                },
            ],
            temperature: 0,
            max_tokens: 3000,
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
            grammar_errors: response.grammar_errors || [],
            style_suggestions: response.style_suggestions || [],
            content_insights: response.content_insights || [],
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
