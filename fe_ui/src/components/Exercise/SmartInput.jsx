import React, { useState, useEffect, useRef } from 'react'

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
    return { isMatch: true, missingPart: '', matchedPart: userWord, exact: true }
  }

  // Check if user word is a prefix of answer word (case-insensitive)
  if (answerLower.startsWith(userLower)) {
    const missingPart = answerWord.slice(userWord.length)
    return { isMatch: true, missingPart, matchedPart: userWord, exact: false }
  }

  // Check if answer word is a prefix of user word (user typed extra characters)
  if (userLower.startsWith(answerLower)) {
    return { isMatch: true, missingPart: '', matchedPart: answerWord, exact: false }
  }

  return { isMatch: false, missingPart: '', matchedPart: '', exact: false }
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

  useEffect(() => {
    if (inputRef.current && value && !hasChecked) {
      const input = inputRef.current
      const tempSpan = document.createElement('span')
      tempSpan.style.visibility = 'hidden'
      tempSpan.style.position = 'absolute'
      tempSpan.style.whiteSpace = 'pre'
      tempSpan.style.font = window.getComputedStyle(input).font
      tempSpan.style.letterSpacing = window.getComputedStyle(input).letterSpacing
      tempSpan.style.fontSize = window.getComputedStyle(input).fontSize
      tempSpan.style.fontFamily = window.getComputedStyle(input).fontFamily
      tempSpan.style.fontWeight = window.getComputedStyle(input).fontWeight
      tempSpan.textContent = value || ' '
      document.body.appendChild(tempSpan)

      const newWidth = tempSpan.offsetWidth + 30
      const maxWidth = isMobile ? window.innerWidth - 80 : 400
      input.style.width = Math.min(Math.max(newWidth, isMobile ? 120 : 300), maxWidth) + 'px'

      document.body.removeChild(tempSpan)
    } else if (!value && inputRef.current && !hasChecked) {
      inputRef.current.style.width = isMobile ? '120px' : '300px'
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
          padding: '4px 8px',
          background: '#f6ffed',
          borderRadius: 4,
          display: 'inline-block',
          fontSize: isMobile ? 13 : 14,
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
          // Found exact match - show correct word in green
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
            // Show user's matched part in green + missing suffix attached in red underline
            usedUserIndices.add(prefixMatchIdx)
            const userWord = wordsUser[prefixMatchIdx]

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
              </span>
            )
            elements.push(<span key={`space-${i}`}>&nbsp;</span>)
          } else {
            // No match at all - show the missing word in red underline (user forgot this word)
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

      // Show extra user words (not matched to any answer word) in red strikethrough
      const extraWords = []
      for (let i = 0; i < wordsUser.length; i++) {
        if (usedUserIndices.has(i)) continue
        const userWord = wordsUser[i]
        const userWordLower = userWord.toLowerCase()

        // Check if this word should be considered "extra" or part of a compound
        // Skip showing extra words that are very similar to answer words (just missing/extra chars)
        let isSimilarToAnswer = false
        for (const ansWord of wordsAnswer) {
          const match = isPrefixMatch(userWord, ansWord)
          if (match.isMatch && match.matchedPart.length >= 3) {
            isSimilarToAnswer = true
            break
          }
        }

        if (!isSimilarToAnswer) {
          extraWords.push(
            <span key={`extra-${i}`} style={{
              color: '#ff4d4f',
              fontWeight: 400,
              textDecoration: 'line-through',
              textDecorationColor: '#ff4d4f'
            }}>
              {userWord}{' '}
            </span>
          )
        }
      }

      return (
        <span ref={wrapperRef} style={{
          padding: '4px 8px',
          background: '#fff2f0',
          borderRadius: 4,
          fontSize: isMobile ? 13 : 14,
          display: 'inline-flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          gap: 2,
          border: '2px solid #ff4d4f'
        }}>
          {elements}
          {extraWords.length > 0 && extraWords}
        </span>
      )
    }
  }

  return (
    <span ref={wrapperRef} style={{ display: 'inline-flex', alignItems: 'center', width: '100%' }}>
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
          padding: isMobile ? '8px 12px' : '4px 12px',
          borderRadius: 4,
          fontSize: isMobile ? 15 : 14,
          outline: 'none',
          border: '1px solid #d9d9d9',
          width: isMobile ? 120 : 300,
          minWidth: isMobile ? 120 : 300,
          maxWidth: isMobile ? 'calc(100vw - 80px)' : 400,
          textAlign: 'left',
          background: 'white'
        }}
      />
      {value && !hasChecked && (
        <button
          onClick={() => {
            setHasChecked(true)
            onCheck()
          }}
          style={{
            marginLeft: 4,
            padding: isMobile ? '8px 16px' : '4px 12px',
            background: '#1677ff',
            color: 'white',
            border: 'none',
            borderRadius: 4,
            cursor: 'pointer',
            fontSize: isMobile ? 13 : 12,
            whiteSpace: 'nowrap'
          }}
        >
          Check
        </button>
      )}
    </span>
  )
}
