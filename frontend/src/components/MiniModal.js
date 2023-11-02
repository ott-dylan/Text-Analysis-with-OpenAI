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
                maxWidth: '1000px',
            }}
        >
            {content.oldText && (
                <div className="mb-2">
                    <strong>Original:</strong> <span>{content.oldText}</span>
                </div>
            )}
            {content.correction && (
                <div className="mb-2">
                    <strong>Correction:</strong>{' '}
                    <span>{content.correction}</span>
                </div>
            )}
            {content.comment && (
                <div className="mb-2">
                    <strong>Comment:</strong> <span>{content.comment}</span>
                </div>
            )}
            {content.topic && (
                <div className="mb-2">
                    <strong>Topic:</strong> <span>{content.topic}</span>
                </div>
            )}
            {content.insight && (
                <div>
                    <strong>Insight:</strong> <span>{content.insight}</span>
                </div>
            )}
        </div>
    )
}

export default MiniModal
