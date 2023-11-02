
// react_frontend/src/App.js
import React, { useState } from 'react';
import axios from 'axios';
import './App.css';  // Assuming you have an App.css for styling

// Entry point for our React app
function App() {
    // State to hold the user input
    const [userInput, setUserInput] = useState('');
    // State to hold analysis and suggestions
    const [suggestions, setSuggestions] = useState([]);

    // Function to handle text box changes
    const handleInputChange = (event) => {
        const { value } = event.target;
        setUserInput(value);
    };

    // Function to handle text analysis
    const handleAnalyzeClick = async () => {
        try {
            const response = await axios.post('http://localhost:3001/analyze', {
                text: userInput,
            });
            setSuggestions(response.data.structuredSuggestions);
        } catch (error) {
            setSuggestions([{ sentence: 'An error occurred while analyzing the text.' }]);
        }
    };

    // Render the text box, a button to submit, and a section for feedback
    return (
        <div className="App">
            <h1>Text Analysis with OpenAI</h1>
            <textarea
                className="text-box"
                value={userInput}
                onChange={handleInputChange}
                placeholder="Type your text here..."
            ></textarea>
            <button className="submit-button" onClick={handleAnalyzeClick}>
                Analyze
            </button>
            <div className="suggestions">
                <h2>Suggestions:</h2>
                <ul>
                    {suggestions.map((suggestion, index) => (
                        <li key={index}>
                            <strong>Sentence:</strong> {suggestion.sentence}<br/>
                            <strong>Correction:</strong> {suggestion.correction}
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
}

export default App;
