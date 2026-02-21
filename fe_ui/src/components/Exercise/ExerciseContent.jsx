import React from 'react'
import { Card, Tag } from 'antd'
import SmartInput from './SmartInput'

// Dialogue Item Component - Renders a single dialogue item
function DialogueItem({ item, userAnswers, checkResults, answers, blankRefs, isMobile }) {
  const parts = item.text || item.content || []

  return (
    <>
      {item.speaker && (
        <Tag color={item.speaker === 'Agent' || item.speaker === 'Advisor' || item.speaker === 'Speaker' ? 'blue' : 'purple'}>
          {item.speaker}
        </Tag>
      )}
      <div style={{
        display: 'flex',
        flexWrap: 'wrap',
        gap: '4px 6px',
        marginTop: 8,
        alignItems: 'baseline',
        lineHeight: '2.2'
      }}>
        {parts.map((part, i) => {
          if (part.type === 'text') return <span key={i} className="dialogue-text">{part.value}</span>
          if (part.type === 'blank') {
            const val = userAnswers[part.id] || ''
            const isCorrect = checkResults[part.id] === 'correct'
            const isWrong = checkResults[part.id] === 'wrong'

            return (
              <SmartInput
                key={part.id}
                value={val}
                answer={answers[part.id]}
                onChange={v => {
                  // This will be handled by parent
                }}
                onCheck={() => {
                  // This will be handled by parent
                }}
                disabled={isCorrect}
                isCorrect={isCorrect}
                isWrong={isWrong}
                blankRef={(el) => blankRefs.current[part.id] = el}
                isMobile={isMobile}
              />
            )
          }
          return null
        })}
      </div>
    </>
  )
}

// Exercise Content Component
export default function ExerciseContent({
  data,
  userAnswers,
  checkResults,
  answers,
  blankRefs,
  isMobile
}) {
  const cardStyle = isMobile
    ? { marginBottom: 8, border: 'none', borderRadius: 8 }
    : { marginBottom: 12, border: 'none' }

  const cardBodyStyle = isMobile ? { padding: 12 } : { padding: undefined }

  return (
    <div style={isMobile ? undefined : { marginTop: 24 }}>
      <Card
        size="small"
        style={cardStyle}
        bodyStyle={cardBodyStyle}
      >
        {data.dialogue.map((item, idx) => (
          <div key={idx} style={{ marginBottom: 12 }}>
            <DialogueItem
              item={item}
              userAnswers={userAnswers}
              checkResults={checkResults}
              answers={answers}
              blankRefs={blankRefs}
              isMobile={isMobile}
            />
          </div>
        ))}
      </Card>
    </div>
  )
}
