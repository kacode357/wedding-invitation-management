import React, { useState, useEffect, useLayoutEffect, useRef } from 'react'

// Helper function to check if user word is a "prefix match" of answer word
// Returns { isMatch: boolean, missingPart: string, matchedPart: string }
// Examples:
//   "year" vs "years" -> { isMatch: true, missingPart: "s", matchedPart: "year" }
//   "75" vs "75-year-old" -> { isMatch: true, missingPart: "-year-old", matchedPart: "75" }
//   "old" vs "75-year-old" -> { isMatch: true, missingPart: "75-year-", matchedPart: "old" }
//   "car" vs "bus" -> { isMatch: false, missingPart: "", matchedPart: "" }
function isPrefixMatch(userWord, answerWord) {
  const userLower = userWord.toLowerCase()
  const answerLower = answerWord.toLowerCase()

  // Direct match
  if (userLower === answerLower) {
    return { isMatch: true, missingPart: '', matchedPart: userWord, extraPart: '', exact: true }
  }

  // Check if user word is a prefix of answer word (case-insensitive)
  if (answerLower.startsWith(userLower)) {
    const missingPart = answerWord.slice(userWord.length)
    if (missingPart.length <= 2 || userLower.length >= 3) {
      return { isMatch: true, missingPart, matchedPart: userWord, extraPart: '', exact: false }
    }
  }

  // Check if answer word is a prefix of user word (user typed extra characters)
  if (userLower.startsWith(answerLower)) {
    const extraPart = userWord.slice(answerWord.length)
    if (extraPart.length <= 2 || answerLower.length >= 4) {
      return { isMatch: true, missingPart: '', matchedPart: answerWord, extraPart, exact: false }
    }
  }

  return { isMatch: false, missingPart: '', matchedPart: '', extraPart: '', exact: false }
}

// SmartInput component with mobile support
export default function SmartInput({ value, answer, onChange, onCheck, disabled, isCorrect, isWrong, blankRef, isMobile }) {
  const inputRef = useRef(null)
  const wrapperRef = useRef(null)
  const [hasChecked, setHasChecked] = useState(false)

  useEffect(() => {
    if (blankRef && typeof blankRef === 'function') {
      blankRef(wrapperRef.current)
    }
  }, [blankRef, value, hasChecked, isCorrect, isWrong])

  useLayoutEffect(() => {
    const input = inputRef.current
    if (!input || hasChecked) return

    if (value) {
      const tempSpan = document.createElement('span')
      tempSpan.style.cssText = 'visibility:hidden;position:absolute;white-space:pre;font-size:18px;font-family:inherit;letter-spacing:normal;'
      tempSpan.textContent = value
      document.body.appendChild(tempSpan)
      const measured = tempSpan.offsetWidth + 32
      document.body.removeChild(tempSpan)
      const minW = isMobile ? 120 : 300
      const maxW = isMobile ? window.innerWidth - 80 : 500
      input.style.width = Math.min(Math.max(measured, minW), maxW) + 'px'
    } else {
      input.style.width = (isMobile ? 120 : 300) + 'px'
    }
  }, [value, hasChecked, isMobile])

  useEffect(() => {
    if (isCorrect || isWrong) {
      setHasChecked(true)
    }
  }, [isCorrect, isWrong])

  if (hasChecked && value) {
    if (isCorrect) {
      return (
        <span ref={wrapperRef} style={{
          color: '#52c41a',
          fontWeight: 500,
          padding: '2px 8px',
          borderRadius: 4,
          display: 'inline-block',
          fontSize: 18,
          border: '2px solid #52c41a'
        }}>
          {answer}
        </span>
      )
    }

    if (isWrong) {
      const wordsUser = (value || '').split(/\s+/).filter(w => w)
      const wordsAnswer = (answer || '').split(/\s+/).filter(w => w)

      // Track which user words have been used
      const usedUserIndices = new Set()
      const elements = []
      let lastMatchedUserIdx = -1

      // Helper to render extra user words between matched indices
      const renderExtraWordsUpTo = (endIdx) => {
        for (let k = lastMatchedUserIdx + 1; k < endIdx; k++) {
          if (usedUserIndices.has(k)) continue

          const userWord = wordsUser[k]
          // Check if it's just a slight typo of some answer word
          let isSimilarToAnswer = false
          for (const ansWord of wordsAnswer) {
            const match = isPrefixMatch(userWord, ansWord)
            if (match.isMatch && match.matchedPart.length >= 3) {
              isSimilarToAnswer = true
              break
            }
          }

          if (!isSimilarToAnswer) {
            elements.push(
              <span key={`extra-${k}`} style={{
                color: '#ff4d4f',
                fontWeight: 400,
                textDecoration: 'line-through',
                textDecorationColor: '#ff4d4f'
              }}>
                {userWord}{' '}
              </span>
            )
          }
          usedUserIndices.add(k)
        }
        if (endIdx > lastMatchedUserIdx) {
          lastMatchedUserIdx = endIdx
        }
      }

      // For each answer word, find the best matching user word
      for (let i = 0; i < wordsAnswer.length; i++) {
        const ansWord = wordsAnswer[i]
        const ansWordLower = ansWord.toLowerCase()

        // First, look for exact case-insensitive match among unused user words
        let bestMatchIdx = -1
        for (let j = 0; j < wordsUser.length; j++) {
          if (usedUserIndices.has(j)) continue
          if (wordsUser[j].toLowerCase() === ansWordLower) {
            bestMatchIdx = j
            break
          }
        }

        if (bestMatchIdx !== -1) {
          // Found exact match
          renderExtraWordsUpTo(bestMatchIdx) // Render any extra words before this match
          usedUserIndices.add(bestMatchIdx)

          elements.push(
            <span key={`user-${bestMatchIdx}`} style={{
              color: '#52c41a',
              fontWeight: 500
            }}>
              {wordsUser[bestMatchIdx]}{' '}
            </span>
          )
        } else {
          // No exact match - look for prefix match
          let prefixMatchIdx = -1
          let prefixMatch = null

          for (let j = 0; j < wordsUser.length; j++) {
            if (usedUserIndices.has(j)) continue
            const match = isPrefixMatch(wordsUser[j], ansWord)
            if (match.isMatch && !match.exact) {
              // Found prefix match - prefer longer matches
              if (prefixMatch === null || match.matchedPart.length > prefixMatch.matchedPart.length) {
                prefixMatchIdx = j
                prefixMatch = match
              }
            }
          }

          if (prefixMatchIdx !== -1 && prefixMatch) {
            // Found prefix match
            renderExtraWordsUpTo(prefixMatchIdx) // Render any extra words before this match
            usedUserIndices.add(prefixMatchIdx)

            elements.push(
              <span key={`prefix-${prefixMatchIdx}`}>
                <span style={{ color: '#52c41a', fontWeight: 500 }}>
                  {prefixMatch.matchedPart}
                </span>
                {prefixMatch.missingPart && (
                  <span style={{
                    color: '#ff4d4f',
                    fontWeight: 400,
                    textDecoration: 'underline',
                    textDecorationColor: '#ff4d4f'
                  }}>
                    {prefixMatch.missingPart}
                  </span>
                )}
                {prefixMatch.extraPart && (
                  <span style={{
                    color: '#ff4d4f',
                    fontWeight: 400,
                    textDecoration: 'line-through',
                    textDecorationColor: '#ff4d4f'
                  }}>
                    {prefixMatch.extraPart}
                  </span>
                )}
              </span>
            )
            elements.push(<span key={`space-${i}`}>&nbsp;</span>)
          } else {
            // No match at all - user forgot this word
            elements.push(
              <span key={`missing-${i}`} style={{
                color: '#ff4d4f',
                fontWeight: 400,
                textDecoration: 'underline',
                textDecorationColor: '#ff4d4f'
              }}>
                {ansWord}{' '}
              </span>
            )
          }
        }
      }

      // Render any remaining extra user words at the very end
      renderExtraWordsUpTo(wordsUser.length)

      return (
        <span ref={wrapperRef} style={{
          padding: '2px 8px',
          borderRadius: 4,
          fontSize: 18,
          display: 'inline-flex',
          flexWrap: 'wrap',
          alignItems: 'baseline',
          gap: 2,
          border: '2px solid #ff4d4f'
        }}>
          {elements}
        </span>
      )
    }
  }

  return (
    <span ref={wrapperRef} style={{ display: 'inline-flex', alignItems: 'center' }}>
      <input
        ref={inputRef}
        type="text"
        value={value}
        onChange={e => {
          setHasChecked(false)
          onChange(e.target.value)
        }}
        onKeyDown={e => {
          if (e.key === 'Enter' && value && !hasChecked) {
            setHasChecked(true)
            onCheck()
          }
        }}
        disabled={disabled}
        placeholder="..."
        style={{
          padding: '4px 12px',
          borderRadius: 6,
          fontSize: 18,
          lineHeight: '1.5',
          outline: 'none',
          border: '1.5px solid #d9d9d9',
          width: isMobile ? 120 : 300,
          minWidth: isMobile ? 120 : 300,
          maxWidth: isMobile ? 'calc(100vw - 80px)' : 500,
          textAlign: 'left',
          background: 'white',
          verticalAlign: 'middle'
        }}
      />
      {value && !hasChecked && (
        <button
          onClick={() => {
            setHasChecked(true)
            onCheck()
          }}
          style={{
            marginLeft: 6,
            padding: '4px 14px',
            background: '#1677ff',
            color: 'white',
            border: 'none',
            borderRadius: 6,
            cursor: 'pointer',
            fontSize: 14,
            fontWeight: 500,
            whiteSpace: 'nowrap',
            verticalAlign: 'middle',
            lineHeight: '1.5'
          }}
        >
          Check
        </button>
      )}
    </span>
  )
}
