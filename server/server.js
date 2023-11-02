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
        console.log('Loading...')
        const gptResponse = await openai.chat.completions.create({
            model: 'gpt-3.5-turbo',
            messages: [
                {
                    role: 'user',
                    content: `You are a sophisticated text analysis assistant. Analyze the provided text to identify errors, suggest style and clarity improvements, and give content insights. Categorize your feedback clearly in JSON. Use unique sentences for each feedback type and limit one comment per sentence. No sentence should appear in more than one feedback category. Keep the analysis under 500 tokens.

    Example response format (ALWAYS USE ONLY STYLE_SUGGESTIONS AND FEEDBACK AND GRADE):
    {
      "style_suggestions": [
        {
          "sentence": "The research was very very extensive.",
          "correction": "The research was extremely extensive.",
          "comment": "Use stronger adjectives rather than repetition for emphasis."
        },
        {
          "sentence": "He was a cool, tall, nice guy who liked to play basketball and hang out with his friends.",
          "correction": "He was a tall basketball enthusiast.",
          "comment": "Concise descriptions are clearer and more engaging."
        }
      ],
      "feedback": [
        {
          "sentence": "Using words such as "jumbled," "funny-shaped," and "foreign," the tone suggests confusion.",
          "comment": "Specify the literary device initially used for 'jumbled' and others. Consider diction or another device."
        },
        {
          "sentence": "The metaphor of a teacher’s face to a 'crumpled Kleenex' characterizes Estrella as judgmental and blunt.",
          "comment": "Identify the type of figurative language used and lead with the most impactful aspect, whether it's the literary device or the characterization."
        }
      ],
      "grade": "99/100", "comment": "Great job! I like the way you used the literary devices to characterize Estrella."
    }
    
    Analyze text: "${text}`,
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
            grade: response.grade || '',
            comment: response.comment || '',
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
