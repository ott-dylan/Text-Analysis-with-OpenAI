// react_frontend/src/components/EnhancedTextEditor.js

import React, { useState, useRef } from 'react'
import MiniModal from './MiniModal'

const findMatches = (userInput, suggestions) => {
    console.log(suggestions)
    const matches = []
    const suggestionTypes = ['styleSuggestions', 'feedback']

    // Create a map to track sentences and their suggestions
    const sentenceMap = new Map()

    suggestionTypes.forEach((type) => {
        ;(suggestions[type] || []).forEach((suggestion) => {
            const { sentence, comment, correction } = suggestion
            if (!sentence) return

            // Use the sentence as a key to accumulate suggestions
            if (!sentenceMap.has(sentence)) {
                sentenceMap.set(sentence, {
                    sentence,
                    comments: [],
                    corrections: [],
                    types: [],
                })
            }
            const sentenceData = sentenceMap.get(sentence)
            sentenceData.comments.push(comment)
            if (correction) {
                sentenceData.corrections.push(correction)
            }
            if (!sentenceData.types.includes(type)) {
                sentenceData.types.push(type)
            }
        })
    })

    // Convert the map back to an array structure
    sentenceMap.forEach((data, sentence) => {
        let startIndex = userInput.indexOf(sentence)
        let endIndex = startIndex + sentence.length
        if (startIndex !== -1) {
            matches.push({
                start: startIndex,
                end: endIndex,
                ...data,
            })
        }
    })

    return matches
}

const EnhancedTextEditor = ({ userInput, suggestions }) => {
    const [modalContent, setModalContent] = useState(null)
    const [modalPosition, setModalPosition] = useState({ top: 0, left: 0 })
    const [isModalVisible, setIsModalVisible] = useState(false)
    const editorRef = useRef(null)

    const handleMouseEnter = (event, match) => {
        if (!editorRef.current) return

        const editorRect = editorRef.current.getBoundingClientRect()
        const rect = event.target.getBoundingClientRect()
        const modalWidth = Math.min(1000, window.innerWidth - rect.left - 20) // Ensure the modal fits within the window width

        const leftPosition = rect.left - modalWidth / 2 + rect.width / 2

        const content = {
            oldText: match.sentence,
            corrections: match.corrections,
            comments: match.comments,
        }

        setModalContent(content)
        setModalPosition({
            top: rect.bottom - editorRect.top + 5,
            left: Math.max(leftPosition, 10), // Ensure the modal does not go off-screen on the left
        })
        setIsModalVisible(true)
    }

    const handleMouseLeave = () => {
        setIsModalVisible(false)
    }

    const markedText = () => {
        const matches = findMatches(userInput, suggestions)
        let lastIndex = 0
        return matches.reduce((elements, match, matchIndex) => {
            // Add unmarked text before the match
            if (match.start > lastIndex) {
                elements.push(
                    <span key={`text-before-${matchIndex}`}>
                        {userInput.slice(lastIndex, match.start)}
                    </span>
                )
            }

            // Determine the class based on the types of suggestions
            let underlineClass =
                match.types.includes('styleSuggestions') &&
                match.types.includes('feedback')
                    ? 'text-purple-600 underline' // Both feedback and style suggestions
                    : match.types.includes('styleSuggestions')
                    ? 'text-yellow-600 underline' // Only style suggestions
                    : 'text-blue-600 underline' // Only feedback

            // Add the marked text
            elements.push(
                <span
                    key={`match-${matchIndex}`}
                    className={`${underlineClass} hover:cursor-pointer`}
                    onMouseEnter={(e) => handleMouseEnter(e, match)}
                    onMouseLeave={handleMouseLeave}
                >
                    {userInput.slice(match.start, match.end)}
                </span>
            )

            lastIndex = match.end

            // Add the remainder of the text after the last match
            if (
                matchIndex === matches.length - 1 &&
                lastIndex < userInput.length
            ) {
                elements.push(
                    <span key={`text-after-${matchIndex}`}>
                        {userInput.slice(lastIndex)}
                    </span>
                )
            }

            return elements
        }, [])
    }

    return (
        <div
            ref={editorRef}
            className="w-full p-4 border rounded mb-4 relative"
            style={{ whiteSpace: 'pre-wrap' }}
        >
            {markedText()}
            {isModalVisible && (
                <MiniModal
                    content={modalContent}
                    position={modalPosition}
                    visible={isModalVisible}
                />
            )}
        </div>
    )
}

export default EnhancedTextEditor
