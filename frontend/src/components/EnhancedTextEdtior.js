import React, { useState } from 'react'
import { useRef } from 'react'
import MiniModal from './MiniModal'

const findMatches = (userInput, suggestions) => {
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
                    sentence: sentence,
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
            sentenceData.types.push(type)
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
                comments: data.comments,
                corrections: data.corrections,
                types: data.types,
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
        const modalWidth = 1000 // Assuming a fixed width for the modal
        const spaceRight = editorRect.right - rect.right
        const spaceLeft = rect.left - editorRect.left

        let leftPosition
        if (spaceRight > modalWidth) {
            leftPosition = rect.right - editorRect.left
        } else if (spaceLeft > modalWidth) {
            leftPosition = rect.left - editorRect.left - modalWidth
        } else {
            leftPosition =
                rect.left - editorRect.left - (modalWidth - rect.width) / 2
        }

        // Combine comments and corrections into the content
        const content = {
            oldText: userInput.slice(match.start, match.end),
            corrections: match.corrections,
            comments: match.comments,
        }

        setModalContent(content)
        setModalPosition({
            top: rect.bottom - editorRect.top + 5,
            left: leftPosition,
        })
        setIsModalVisible(true)
    }

    const handleMouseLeave = () => {
        setIsModalVisible(false)
    }

    const markedText = () => {
        const matches = findMatches(userInput, suggestions)
        const elements = []
        let lastIndex = 0
        const inputLines = userInput.split('\\n')

        inputLines.forEach((line, lineIndex) => {
            let lineStartIndex = lastIndex

            matches.forEach((match, matchIndex) => {
                if (
                    match.start >= lineStartIndex &&
                    match.start < lineStartIndex + line.length
                ) {
                    if (match.start > lastIndex) {
                        elements.push(
                            <span key={`normal-${matchIndex}`}>
                                {userInput.slice(lastIndex, match.start)}
                            </span>
                        )
                    }

                    // Determine the class based on the types of suggestions
                    let underlineClass = ''
                    if (
                        match.types.includes('styleSuggestions') &&
                        match.types.includes('feedback')
                    ) {
                        underlineClass = 'text-purple-600 underline' // Both feedback and style suggestions
                    } else if (match.types.includes('styleSuggestions')) {
                        underlineClass = 'text-yellow-600 underline' // Only style suggestions
                    } else if (match.types.includes('feedback')) {
                        underlineClass = 'text-blue-600 underline' // Only feedback
                    }

                    // Determine the text to show based on the available data
                    let textToShow = ''
                    if (
                        match.types.includes('feedback') &&
                        !match.corrections.length
                    ) {
                        // If it's feedback and no corrections, show the original text
                        textToShow = userInput.slice(match.start, match.end)
                    } else {
                        // If there are corrections, show them, otherwise show the original sentence
                        textToShow =
                            match.corrections.length > 0
                                ? match.corrections.join(' / ')
                                : userInput.slice(match.start, match.end)
                    }

                    elements.push(
                        <span
                            key={matchIndex}
                            className={`${underlineClass} hover:cursor-pointer`}
                            onMouseEnter={(e) => handleMouseEnter(e, match)}
                            onMouseLeave={handleMouseLeave}
                        >
                            {textToShow}
                        </span>
                    )

                    lastIndex = match.end
                }
            })

            if (lineStartIndex + line.length > lastIndex) {
                elements.push(
                    <span key={`line-end-${lineIndex}`}>
                        {userInput.slice(
                            lastIndex,
                            lineStartIndex + line.length
                        )}
                    </span>
                )
            }

            lastIndex = lineStartIndex + line.length + 1

            if (lineIndex < inputLines.length - 1) {
                elements.push(<br key={`br-${lineIndex}`} />)
            }
        })

        return elements
    }

    return (
        <div
            ref={editorRef}
            className="w-full p-4 border rounded mb-4 relative"
        >
            {markedText()}
            <MiniModal
                content={modalContent}
                position={modalPosition}
                visible={isModalVisible}
            />
        </div>
    )
}

export default EnhancedTextEditor
