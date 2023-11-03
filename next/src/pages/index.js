'use client'

import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { Textarea } from '@/components/ui/textarea'
import { Progress } from '@/components/ui/progress'

import React, { useState } from 'react'

import { CircularProgressbar, buildStyles } from 'react-circular-progressbar'
import 'react-circular-progressbar/dist/styles.css'
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from '@/components/ui/card'
import {
    HoverCard,
    HoverCardContent,
    HoverCardTrigger,
} from '@/components/ui/hover-card'

import { Loader2 } from 'lucide-react'

import { InfoCircledIcon } from '@radix-ui/react-icons'

export const metadata = {
    title: 'Text analysis with OpenAI',
    description: 'Analyze text with OpenAI',
}

export default function Home() {
    const [userInput, setUserInput] = useState(
        `However, a simple walk on a hiking trail behind my house made me open my own eyes to the truth. Over the years, everything--even honoring my grandmother--had become second to school and grades. As my shoes humbly tapped against the Earth, the towering trees blackened by the forest fire a few years ago, the faintly colorful pebbles embedded in the sidewalk, and the wispy white clouds hanging in the sky reminded me of my small though nonetheless significant part in a larger whole that is humankind and this Earth. Before I could resolve my guilt, I had to broaden my perspective of the world as well as my responsibilities to my fellow humans.`
    )
    const [suggestions, setSuggestions] = useState([])
    const [grade, setGrade] = useState('')
    const [rubric, setRubric] = useState('')
    const [loading, setLoading] = useState(false)
    const [percentage, setPercentage] = useState(0)
    const [progress, setProgress] = useState(0)
    const [output, setOutput] = useState('')
    const [showInput, setShowInput] = useState(true)

    const feedbackBackgroundColors = [
        'decoration-blue-500', // Replace these with your preferred color classes
        'decoration-green-500',
        'decoration-yellow-500',
        'decoration-red-500',
    ]

    const handleClickFeedback = async (e) => {
        setLoading(true) // Set loading to true while processing
        setShowInput(true)
        setProgress(0) // Reset progress to 0
        let res = await fetch('/api/analyzeText', {
            method: 'POST',
            //send user input and rubric to the api
            body: JSON.stringify({ userInput, rubric }),
        })

        e.preventDefault()

        if (!res.ok) {
            throw new Error(res.statusText)
        }

        // This data is a ReadableStream
        const data = res.body
        if (!data) {
            return
        }

        const reader = data.getReader()
        const decoder = new TextDecoder()
        let done = false
        let response = ''
        // Initialize a counter outside of the while loop
        let bytesRead = 0

        while (!done) {
            const { value, done: doneReading } = await reader.read()
            done = doneReading
            bytesRead += value ? value.length : 0
            const chunkValue = decoder.decode(value, { stream: !done }) // Pass 'stream: true' if there might be more coming
            response += chunkValue

            // Calculate the progress percentage based on bytes read
            let progressPercent = Math.round((bytesRead / 500) * 5)
            setProgress(progressPercent) // Update the percentage state to re-render the progress bar
            console.log(progressPercent)
        }

        let responseParsed = ''

        console.log('JSON String before parsing:', response)

        //add a { to the beginning of the response
        response = '{' + response

        // Now parse it
        const jsonData = JSON.parse(response)
        console.log('JSON Object:', jsonData)

        try {
            responseParsed = JSON.parse(response)
        } catch (e) {
            console.log(e)
            setOutput('Error: Please try again.')
            setLoading(false)
            return
        }
        const feedback = responseParsed

        // Assuming the feedback is correctly formatted and the sentences are unique.
        // Instead of setting innerHTML, we create an array of elements
        const elements = generateFeedbackElements(userInput, feedback.feedback)
        setOutput(elements) // Set output to be the array of elements

        //turn the grade from 99/100 to just 99
        const gradeString = feedback.grade
        const gradeNumber = gradeString.substring(0, gradeString.indexOf('/'))
        setGrade(gradeNumber)
        setSuggestions(feedback.overall_comment)
        setPercentage(gradeNumber) // or calculate based on some logic

        setShowInput(false) // Hide the input

        setLoading(false) // Set loading to false after processing
    }

    // Create a function to generate the feedback elements
    const generateFeedbackElements = (text, feedback) => {
        const feedbackElements = []
        let currentPosition = 0
        let colorIndex = 0

        // Use this CSS class to preserve whitespace and line breaks in your output
        const preformattedTextClass = {
            whiteSpace: 'pre-wrap', // Preserves white space and wraps text
            fontFamily: 'inherit', // Ensures the font stays consistent with the rest of the design
        }

        feedback.forEach((item) => {
            const sentenceStart = text.indexOf(item.sentence, currentPosition)
            const sentenceEnd = sentenceStart + item.sentence.length

            // Add text before the sentence as a preformatted text element
            if (sentenceStart > currentPosition) {
                feedbackElements.push(
                    <span
                        key={`text-${currentPosition}`}
                        style={preformattedTextClass}
                    >
                        {text.substring(currentPosition, sentenceStart)}
                    </span>
                )
            }

            const backgroundColorClass =
                feedbackBackgroundColors[
                    colorIndex % feedbackBackgroundColors.length
                ]

            // Add the sentence with the HoverCard component
            feedbackElements.push(
                <HoverCard key={`feedback-${sentenceStart}`}>
                    <HoverCardTrigger asChild>
                        <span
                            className={`underline cursor-pointer ${backgroundColorClass} hover:bg-muted rounded-lg`}
                        >
                            {item.sentence}
                        </span>
                    </HoverCardTrigger>
                    <HoverCardContent className="bg-white w-[350px] text-sm rounded shadow-md">
                        <p>{item.comment}</p>
                        <br></br>
                        <div className="flex">
                            <div className="flex-shrink-0 mt-1 mr-2">
                                <InfoCircledIcon className="text-current" />
                            </div>
                            <p className="flex-grow">{item.suggestion}</p>
                        </div>
                    </HoverCardContent>
                </HoverCard>
            )

            currentPosition = sentenceEnd
            colorIndex++
        })

        // Add any remaining text after the last sentence as a preformatted text element
        if (currentPosition < text.length) {
            feedbackElements.push(
                <span
                    key={`text-${currentPosition}`}
                    style={preformattedTextClass}
                >
                    {text.substring(currentPosition)}
                </span>
            )
        }

        return feedbackElements
    }

    return (
        <>
            <div className="hidden h-full flex-col md:flex">
                <div className="container flex flex-col items-start justify-between space-y-2 py-4 sm:flex-row sm:items-center sm:space-y-0 md:h-16">
                    <h2 className="text-lg font-semibold">
                        Text Analysis with OpenAI
                    </h2>
                </div>
                <Separator />
                <div className="container h-full py-6">
                    <div className="grid h-full items-stretch gap-6 md:grid-cols-[1fr_400px]">
                        <div className="hidden flex-col h-full space-y-4 sm:flex md:order-2">
                            <div className="h-full grid gap-2">
                                <Label htmlFor="instructions">Grading</Label>
                                <div className="h-full">
                                    {showInput && (
                                        <Card className="min-h-full w-full">
                                            <CardHeader>
                                                <CardTitle>Rubric</CardTitle>
                                                <CardDescription>
                                                    Input rubric to be used for
                                                    grading.
                                                </CardDescription>
                                            </CardHeader>
                                            <CardContent>
                                                <form>
                                                    <div className="grid h-full w-full items-center gap-4">
                                                        <div className="flex flex-col h-full space-y-1.5">
                                                            <Textarea
                                                                id="name"
                                                                className="resize-none h-[390px]"
                                                                placeholder="A+ is when the student has done everything correctly and has gone above and beyond the requirements. The requirements are..."
                                                                onChange={(e) =>
                                                                    setRubric(
                                                                        e.target
                                                                            .value
                                                                    )
                                                                }
                                                                disabled={
                                                                    !showInput ||
                                                                    loading
                                                                }
                                                            />
                                                        </div>
                                                    </div>
                                                </form>
                                            </CardContent>
                                            <CardFooter className="flex justify-between">
                                                <div className="flex flex-col space-y-5 w-full">
                                                    {!loading && showInput && (
                                                        <Button
                                                            onClick={
                                                                handleClickFeedback
                                                            }
                                                        >
                                                            Submit
                                                        </Button>
                                                    )}

                                                    {loading && (
                                                        <Button disabled>
                                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                            Please wait
                                                        </Button>
                                                    )}
                                                    {loading && (
                                                        <Progress
                                                            value={progress}
                                                            className="mt-5"
                                                        />
                                                    )}
                                                </div>
                                            </CardFooter>
                                        </Card>
                                    )}
                                    {!showInput && (
                                        <Card className="min-h-full w-full">
                                            <CardHeader>
                                                <CardTitle>Grade</CardTitle>
                                            </CardHeader>
                                            <CardContent className="h-full">
                                                <div className="flex w-full justify-center">
                                                    <div
                                                        style={{
                                                            width: '100px',
                                                            height: '100px',
                                                        }}
                                                    >
                                                        {' '}
                                                        {/* Set the width and height to 100px */}
                                                        <CircularProgressbar
                                                            value={percentage}
                                                            text={`${percentage}%`}
                                                            styles={buildStyles(
                                                                {
                                                                    textColor:
                                                                        'red',
                                                                    pathColor:
                                                                        'red',
                                                                    trailColor:
                                                                        '#d6d6d6',
                                                                    textSize:
                                                                        '16px', // Adjust text size as necessary
                                                                }
                                                            )}
                                                        />
                                                    </div>
                                                </div>
                                                <div className="mt-5 h-[460px] ">
                                                    <CardDescription>
                                                        {suggestions}
                                                    </CardDescription>
                                                </div>
                                                <Button
                                                    onClick={() =>
                                                        setShowInput(true)
                                                    }
                                                >
                                                    Start Again
                                                </Button>
                                            </CardContent>
                                        </Card>
                                    )}
                                </div>
                            </div>
                        </div>
                        <div className="md:order-1 mt-0 border-0 p-0">
                            <div className="flex flex-col space-y-4">
                                <div className="grid h-full gap-6 lg:grid-cols-1">
                                    {showInput && (
                                        <div className="flex flex-col space-y-4">
                                            <div className="flex flex-1 flex-col space-y-2">
                                                <Label htmlFor="input">
                                                    Input
                                                </Label>
                                                <Textarea
                                                    id="input"
                                                    placeholder="We is going to the market."
                                                    className="flex-1 lg:min-h-[580px]"
                                                    onChange={(e) =>
                                                        setUserInput(
                                                            e.target.value
                                                        )
                                                    }
                                                />
                                            </div>
                                        </div>
                                    )}
                                    {!showInput && (
                                        <div className="flex flex-col space-y-2">
                                            <Label htmlFor="input">
                                                Feedback
                                            </Label>
                                            <div className=" min-h-[400px] h-full rounded-md border lg:min-h-[700px]">
                                                <div className="mt-3 mx-3">
                                                    {output}{' '}
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}
