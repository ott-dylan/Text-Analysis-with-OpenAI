// react_frontend/src/components/MiniModal.js
import React from 'react'

const MiniModal = ({ content, position, visible }) => {
    if (!visible || !content) return null

    console.log(content)

    // Additional styling for different sections
    const sectionStyle = 'mb-4 p-2 border-b'
    const titleStyle = 'font-semibold'
    const textStyle = 'ml-2'

    return (
        <div
            className="absolute bg-white border border-gray-300 rounded shadow-lg z-10"
            style={{
                top: `${position.top}px`,
                left: `${position.left}px`,
                maxWidth: '50%',
                padding: '1rem',
            }}
        >
            <div className={sectionStyle}>
                <span className={titleStyle}>Original Text:</span>
                <p className={textStyle}>{content.oldText}</p>
            </div>
            {content.comments && content.comments.length > 0 && (
                <div className={sectionStyle}>
                    <span className={titleStyle}>Comments:</span>
                    {content.comments.map((comment, index) => (
                        <p key={`comment-${index}`} className={textStyle}>
                            {comment}
                        </p>
                    ))}
                </div>
            )}
            {content.corrections && content.corrections.length > 0 && (
                <div className={sectionStyle}>
                    <span className={titleStyle}>Suggestions:</span>
                    {content.corrections.map((correction, index) => (
                        <p key={`correction-${index}`} className={textStyle}>
                            {correction}
                        </p>
                    ))}
                </div>
            )}
        </div>
    )
}

export default MiniModal
