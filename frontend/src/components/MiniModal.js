// react_frontend/src/components/MiniModal.js
import React from 'react'

const MiniModal = ({ content, position, visible }) => {
    if (!visible || !content) return null

    return (
        <div
            className="absolute p-2 bg-white border border-gray-300 rounded shadow-lg z-10"
            style={{
                top: `${position.top}px`,
                left: `${position.left}px`,
                maxWidth: '50%',
            }}
        >
            {content.oldText && (
                <div className="mb-2">
                    <strong>Original:</strong> <span>{content.oldText}</span>
                </div>
            )}
            {content.comments &&
                content.comments.map((comment, index) => (
                    <div key={`comment-${index}`} className="mb-2">
                        <strong>Comment:</strong> <span>{comment}</span>
                    </div>
                ))}
            {content.corrections &&
                content.corrections.map((correction, index) => (
                    <div key={`correction-${index}`} className="mb-2">
                        <strong>Suggestion:</strong> <span>{correction}</span>
                    </div>
                ))}
        </div>
    )
}

export default MiniModal
