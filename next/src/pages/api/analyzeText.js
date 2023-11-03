// path/filename: pages/api/analyze.js

import OpenAI from 'openai'

export const runtime = 'edge'

// Initializing the OpenAI API
const openai = new OpenAI(process.env.OpenAI_API_KEY)

// Helper method to initialize CORS

// Helper method to run middleware
export function middleware(req, ev) {
    const { res } = ev

    res.setHeader('Access-Control-Allow-Origin', '*')
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type')

    if (req.method === 'OPTIONS') {
        res.status(200).end()
        return
    }

    // Continue with the normal execution if it's not an OPTIONS request
}

// The API route function
export default async function handler(req, res) {
    // Run the middleware
    await runMiddleware(req, res)

    // Only allow POST requests
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' })
    }

    console.log('Request body:', req.body)

    //turn req.body into json
    const json = JSON.parse(req.body)

    //get text and rubric from json
    const text = json.userInput
    const rubric = json.rubric

    console.log('text: ', text)
    console.log('rubric: ', rubric)

    try {
        console.log('Loading...')
        const gptResponse = await openai.chat.completions.create({
            model: 'gpt-3.5-turbo',
            messages: [
                {
                    role: 'user',
                    content: `You are a sophisticated text analysis assistant. Your task is to analyze the text I provide and offer constructive suggestions for improvement along with highlighting sentences. Provide a "sentence" json part, followed by a detailed comment and suggestion for each sentence. Ensure one pair of feedback and suggestion per sentence and that each "sentence" is present in the text.`,
                },
                {
                    role: 'user',
                    content: `Please analyze this text and provide feedback with suggestions in the example JSON format: In the heart of the city, the once vibrant park now lay barren. The swings squeaked mournfully with the wind, as if lamenting the absence of laughter. A solitary oak, once a proud sentinel, stood stripped of its leaves, a silent witness to the passage of time.`,
                },
                {
                    role: 'assistant',
                    content: `{
        "feedback": [
          {
            "sentence": "In the heart of the city, the once vibrant park now lay barren.",
            "comment": "The contrast between 'once vibrant' and 'now barren' effectively conveys a sense of loss and decay. However, adding more sensory details could enhance the visual imagery.",
            "suggestion": "Consider describing specific elements within the park that have changed to intensify the contrast."
          },
          {
            "sentence": "The swings squeaked mournfully with the wind, as if lamenting the absence of laughter.",
            "comment": "Personification is used skillfully here. The phrase 'squeaked mournfully' effectively conveys sadness.",
            "suggestion": "To add depth, you might explore the cause of this absence, perhaps hinting at a backstory or broader context."
          },
          {
            "sentence": "A solitary oak, once a proud sentinel, stood stripped of its leaves, a silent witness to the passage of time.",
            "comment": "The oak tree metaphor is powerful, but the sentence may benefit from varied sentence structure to add rhythm.",
            "suggestion": "Consider breaking the sentence into two to create a pause that emphasizes the oak's solitude."
          }
        ],
        "overall_comment": "The text is rich with imagery and emotion, but there are opportunities to deepen the narrative and vary the sentence flow for greater impact. Grading each category : Storytelling - 8/10, Imagery - 7/10, Clarity - 7/10, Emotional Impact - 7/10, Overall Cohesiveness - 8.5/10. This results in a final grade of 75/100 on a strict scale.",
        "grade": "75/100"
      }`,
                },
                {
                    role: 'user',
                    content:
                        `Now please analyze this text. GIVE ME FEEDBACK THAT FOCUSES ON QUALITY, NOT QUANITY!: ` +
                        text +
                        ` USE THIS RUBRIC: I WANT YOU TO GRADE THIS HARSHLY BUT FAIRLY (IF IT DESERVES A 100 THEN GIVE IT)! IF NO RUBRIC IS GIVEN THEN I WANT YOU TO MAEK ONE UP!  ` +
                        rubric,
                },
            ],
            stream: true,
            temperature: 0,
        })
        for await (const chunk of gptResponse) {
            //if defined then send
            if (chunk.choices[0].delta.content) {
                res.write(chunk.choices[0].delta.content)
                console.log(chunk.choices[0].delta.content)
            }

            //if data: [DONE] then end
            if (chunk.choices[0].finish_reason === 'stop') {
                res.end()
                return
            }
        }

        // Cleanup function
        req.on('close', () => {
            res.end()
        })
    } catch (error) {
        console.error(error)
        res.status(500).json({
            error: 'An error occurred while analyzing the text.',
        })
    }
}
