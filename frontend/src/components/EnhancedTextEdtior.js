// react_frontend/src/components/EnhancedTextEditor.js

import React, { useState } from 'react'
import { useRef } from 'react'
import MiniModal from './MiniModal'

const findMatches = (userInput, suggestions) => {
    const matches = []
    const suggestionTypes = [
        'grammarErrors',
        'styleSuggestions',
        'contentInsights',
    ]

    suggestionTypes.forEach((type) => {
        ;(suggestions[type] || []).forEach((suggestion) => {
            const { sentence, comment, correction, topic, insight } = suggestion
            if (!sentence) return
            let startIndex = userInput.indexOf(sentence)
            let endIndex = startIndex + sentence.length

            if (startIndex !== -1) {
                matches.push({
                    start: startIndex,
                    end: endIndex,
                    comment,
                    correction,
                    topic,
                    insight,
                    type, // inferred type
                })
            }
        })
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

        const content = {
            oldText: userInput.slice(match.start, match.end),
            correction: match.correction,
            comment: match.comment,
            topic: match.topic,
            insight: match.insight,
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

        matches.forEach((match, index) => {
            const hoverText = `${match.comment || ''} ${
                match.correction || ''
            } ${match.topic || ''} ${match.insight || ''}`.trim()

            const underlineClass =
                match.type === 'grammarErrors'
                    ? 'text-red-600 underline'
                    : match.type === 'styleSuggestions'
                    ? 'text-yellow-600 underline'
                    : 'text-green-600 underline'

            // Add normal text before the match
            if (match.start > lastIndex) {
                elements.push(
                    <span key={`normal-${index}`}>
                        {userInput.slice(lastIndex, match.start)}
                    </span>
                )
            }

            // For grammar errors, show the correction. For everything else, show the original text.
            elements.push(
                <span
                    key={index}
                    className={`${underlineClass} hover:cursor-pointer`}
                    onMouseEnter={(e) => handleMouseEnter(e, match)}
                    onMouseLeave={handleMouseLeave}
                >
                    {match.type === 'grammarErrors' ||
                    match.type === 'styleSuggestions'
                        ? match.correction
                        : userInput.slice(match.start, match.end)}
                </span>
            )

            lastIndex = match.end
        })

        // Add remaining normal text after all matches
        if (lastIndex < userInput.length) {
            elements.push(
                <span key="remaining">{userInput.slice(lastIndex)}</span>
            )
        }

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
