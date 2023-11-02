// react_frontend/src/App.js
import React, { useState } from 'react'
import axios from 'axios'
import EnhancedTextEditor from './components/EnhancedTextEdtior'
import { Tooltip } from 'react-tooltip'
import 'react-tooltip/dist/react-tooltip.css'

function App() {
    const [userInput, setUserInput] = useState('')
    const [suggestions, setSuggestions] = useState([])

    const handleInputChange = (event) => {
        const { value } = event.target
        setUserInput(value)
    }

    const handleAnalyzeClick = async () => {
        try {
            const response = await axios.post('http://localhost:3001/analyze', {
                text: userInput,
            })

            setSuggestions({
                grammarErrors: response.data.grammar_errors,
                styleSuggestions: response.data.style_suggestions,
                contentInsights: response.data.content_insights,
            })
        } catch (error) {
            console.error('Error:', error)
            setSuggestions({
                grammarErrors: [],
                styleSuggestions: [],
                contentInsights: [],
                error: 'An error occurred while analyzing the text.',
            })
        }
    }

    return (
        <div className="App bg-gray-100 h-screen p-8">
            <h1 className="text-4xl font-bold mb-6">
                Text Analysis with OpenAI
            </h1>
            <textarea
                className="w-full p-4 border rounded mb-4"
                value={userInput}
                onChange={handleInputChange}
                placeholder="Type your text here..."
            ></textarea>

            {/* Fix: Changed text to userInput */}
            <EnhancedTextEditor
                userInput={userInput}
                suggestions={suggestions}
            />

            <button
                className="bg-blue-500 text-white p-2 rounded"
                onClick={handleAnalyzeClick}
            >
                Analyze
            </button>
        </div>
    )
}

export default App
