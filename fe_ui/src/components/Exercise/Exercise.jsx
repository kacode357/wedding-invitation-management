import React, { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Layout, Typography, Button, Modal, Tag, Card, message } from 'antd'
import { DownloadOutlined, ExclamationCircleOutlined, LeftOutlined } from '@ant-design/icons'
import html2canvas from 'html2canvas'

import audio1Questions from '../../data/audio1/audio_1_questions.json'
import audio1Answers from '../../data/audio1/audio_1_answers.json'
import audio2Questions from '../../data/audio2/audio_2_questions.json'
import audio2Answers from '../../data/audio2/audio_2_answers.json'
import audio3Questions from '../../data/audio3/audio_3_questions.json'
import audio3Answers from '../../data/audio3/audio_3_answers.json'
import audio4Questions from '../../data/audio4/audio_4_questions.json'
import audio4Answers from '../../data/audio4/audio_4_answers.json'
import audio5Questions from '../../data/audio5/audio_5_questions.json'
import audio5Answers from '../../data/audio5/audio_5_answers.json'
import audio9Questions from '../../data/audio9/audio_9_questions.json'
import audio9Answers from '../../data/audio9/audio_9_answers.json'
import audio13Questions from '../../data/audio13/audio_13_questions.json'
import audio13Answers from '../../data/audio13/audio_13_answers.json'

import ExerciseHeaderDesktop from './ExerciseHeaderDesktop'
import ExerciseHeaderMobile from './ExerciseHeaderMobile'
import ExerciseContent from './ExerciseContent'
import SmartInput from './SmartInput'

const { Content } = Layout
const { Text } = Typography

// Audio data mapping
const audioData = {
  audio1: { questions: audio1Questions, answers: audio1Answers, file: '/Audio 1.mp3', title: 'Audio 1' },
  audio2: { questions: audio2Questions, answers: audio2Answers, file: '/Audio 2.mp3', title: 'Audio 2' },
  audio3: { questions: audio3Questions, answers: audio3Answers, file: '/Audio 3.mp3', title: 'Audio 3' },
  audio4: { questions: audio4Questions, answers: audio4Answers, file: '/Audio 4.mp3', title: 'Audio 4' },
  audio5: { questions: audio5Questions, answers: audio5Answers, file: '/Audio 5.mp3', title: 'Audio 5' },
  audio9: { questions: audio9Questions, answers: audio9Answers, file: '/Audio 9.mp3', title: 'Audio 9' },
  audio13: { questions: audio13Questions, answers: audio13Answers, file: '/Audio 13.mp3', title: 'Audio 13' }
}

// Submit Button Component
function SubmitButton({ onClick, isMobile }) {
  if (isMobile) {
    return (
      <Button
        type="primary"
        size="large"
        onClick={onClick}
        style={{
          background: 'linear-gradient(135deg, #4A90E2 0%, #357ABD 100%)',
          border: 'none',
          boxShadow: '0 4px 12px rgba(74, 144, 226, 0.5)',
          width: '100%',
          height: 48,
          fontSize: 16,
          fontWeight: 500,
          borderRadius: 10,
          marginTop: 16
        }}
        icon={<DownloadOutlined />}
      >
        Submit
      </Button>
    )
  }

  return (
    <div style={{
      position: 'fixed',
      bottom: 24,
      right: 24,
      zIndex: 99
    }}>
      <Button
        type="primary"
        size="large"
        onClick={onClick}
        style={{
          background: 'linear-gradient(135deg, #4A90E2 0%, #357ABD 100%)',
          border: 'none',
          boxShadow: '0 4px 12px rgba(74, 144, 226, 0.5)'
        }}
        icon={<DownloadOutlined />}
      >
        Submit
      </Button>
    </div>
  )
}

// Confirmation Modal Component
function ConfirmModal({ open, onOk, onCancel, remaining }) {
  return (
    <Modal
      title={<span style={{ display: 'flex', alignItems: 'center', gap: 8 }}><ExclamationCircleOutlined style={{ color: '#faad14' }} /> Confirm</span>}
      open={open}
      onOk={onOk}
      onCancel={onCancel}
      okText="Yes, submit"
      cancelText="Cancel"
      okButtonProps={{ danger: true }}
    >
      <p>You have not answered {remaining} questions yet.</p>
      <p>Do you still want to submit?</p>
    </Modal>
  )
}

// Main Exercise Component
function Exercise() {
  const { audioId } = useParams()
  const navigate = useNavigate()
  const [userAnswers, setUserAnswers] = useState({})
  const [checkResults, setCheckResults] = useState({})
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [isExporting, setIsExporting] = useState(false)
  const [confirmModalOpen, setConfirmModalOpen] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const exerciseRef = useRef(null)
  const blankRefs = useRef({})

  // Detect mobile viewport
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }

    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  const audioInfo = audioData[audioId]
  if (!audioInfo) {
    return (
      <div style={{ padding: 24, textAlign: 'center' }}>
        <Button type="primary" icon={<LeftOutlined />} onClick={() => navigate('/listening')}>
          Back to Listening
        </Button>
        <div style={{ marginTop: 24 }}>
          <Text>Audio not found</Text>
        </div>
      </div>
    )
  }

  const data = audioInfo.questions
  const answers = audioInfo.answers

  // Expose answers to console via kaka_check
  useEffect(() => {
    window.kaka_check = () => {
      console.log(`%c 🎯 Filling answers for ${audioId}...`, 'color: #1677ff; font-weight: bold; font-size: 14px;')
      setUserAnswers(answers)
      const results = {}
      Object.keys(answers).forEach(id => {
        results[id] = 'correct'
      })
      setCheckResults(results)
      console.table(answers)
      return answers
    }
    return () => {
      delete window.kaka_check
    }
  }, [audioId, answers])

  // Get all blanks
  const allBlanks = data.dialogue.flatMap(item =>
    (item.text || item.content || []).filter(p => p.type === 'blank')
  )

  const filled = allBlanks.filter(q => userAnswers[q.id]?.trim()).length
  const remaining = allBlanks.length - filled

  const getStorageKey = () => `exercise_${audioId}`
  const EXPIRY_MS = 24 * 60 * 60 * 1000

  // Load saved answers and check results
  useEffect(() => {
    try {
      const storageKey = getStorageKey()
      const savedData = localStorage.getItem(storageKey)

      if (savedData) {
        const parsed = JSON.parse(savedData)
        if (parsed && parsed.timestamp) {
          const age = Date.now() - parsed.timestamp
          if (age < EXPIRY_MS) {
            if (parsed.answers) {
              setUserAnswers(parsed.answers)
            }
            if (parsed.checkResults) {
              setCheckResults(parsed.checkResults)
            }
            if (parsed.isSubmitted) {
              setIsSubmitted(true)
            }
            message.info({ content: 'Previous progress restored', key: 'restore', duration: 2 })
          } else {
            localStorage.removeItem(storageKey)
          }
        }
      }
    } catch (error) {
      console.error('Error loading saved data:', error)
    }
  }, [audioId])

  const handleInput = (id, value) => {
    setUserAnswers(prev => ({ ...prev, [id]: value }))
    if (checkResults[id]) {
      setCheckResults(prev => ({ ...prev, [id]: null }))
    }

    if (!isSubmitted) {
      try {
        const newAnswers = { ...userAnswers, [id]: value }
        const storageKey = getStorageKey()
        localStorage.setItem(storageKey, JSON.stringify({
          answers: newAnswers,
          checkResults: { ...checkResults, [id]: null },
          isSubmitted: false,
          timestamp: Date.now()
        }))
      } catch (error) {
        console.error('Error saving to localStorage:', error)
      }
    }
  }

  // Helper to normalize text by ignoring punctuation
  const normalizeText = (text) => {
    if (!text) return '';
    return text.toString().toLowerCase()
      .replace(/[-/]/g, ' ')
      .replace(/[.,!?;:()[\]{}"]/g, '')
      .replace(/\s+/g, ' ')
      .trim();
  }

  const handleCheck = (id) => {
    const val = normalizeText(userAnswers[id])
    const ans = normalizeText(answers[id])
    const newResult = val === ans ? 'correct' : 'wrong'

    setCheckResults(prev => {
      const updated = { ...prev, [id]: newResult }
      if (!isSubmitted) {
        try {
          const storageKey = getStorageKey()
          localStorage.setItem(storageKey, JSON.stringify({
            answers: userAnswers,
            checkResults: updated,
            isSubmitted: false,
            timestamp: Date.now()
          }))
        } catch (error) {
          console.error('Error saving to localStorage:', error)
        }
      }
      return updated
    })
  }

  const handleSubmitClick = () => {
    if (remaining > 0) {
      setConfirmModalOpen(true)
    } else {
      handleSubmit()
    }
  }

  const handleSubmit = () => {
    setIsSubmitted(true)
    setConfirmModalOpen(false)
    allBlanks.forEach(q => {
      const val = normalizeText(userAnswers[q.id])
      const ans = normalizeText(answers[q.id])
      if (val === ans) {
        setCheckResults(prev => ({ ...prev, [q.id]: 'correct' }))
      } else {
        setCheckResults(prev => ({ ...prev, [q.id]: 'wrong' }))
      }
    })

    // Save submitted state and check results
    try {
      const storageKey = getStorageKey()
      localStorage.setItem(storageKey, JSON.stringify({
        answers: userAnswers,
        checkResults: checkResults,
        isSubmitted: true,
        timestamp: Date.now()
      }))
    } catch (error) {
      console.error('Error saving to localStorage:', error)
    }

    message.success({ content: 'Exercise submitted!', key: 'submit' })
  }

  const scrollToFirstUnanswered = () => {
    const unanswered = allBlanks.find(q => !userAnswers[q.id]?.trim())
    if (unanswered && blankRefs.current[unanswered.id]) {
      blankRefs.current[unanswered.id].scrollIntoView({
        behavior: 'smooth',
        block: 'center'
      })
      setTimeout(() => {
        const element = blankRefs.current[unanswered.id]
        const input = element?.tagName === 'INPUT' ? element : element?.querySelector('input')
        if (input) {
          input.focus()
        }
      }, 500)
    }
  }

  const handleExportImage = async () => {
    if (!exerciseRef.current) return

    setIsExporting(true)
    message.loading({ content: 'Creating image...', key: 'export' })

    try {
      const container = exerciseRef.current
      const cloneContainer = document.createElement('div')
      cloneContainer.style.cssText = 'position: absolute; left: 0; top: 0; background: white;'
      document.body.appendChild(cloneContainer)

      const clone = container.cloneNode(true)

      const originalInputs = container.querySelectorAll('input, textarea, select')
      const clonedInputs = clone.querySelectorAll('input, textarea, select')
      originalInputs.forEach((input, idx) => {
        if (clonedInputs[idx]) {
          if (input.type === 'checkbox' || input.type === 'radio') {
            clonedInputs[idx].checked = input.checked
          } else {
            clonedInputs[idx].value = input.value
          }
        }
      })

      cloneContainer.appendChild(clone)

      await new Promise(resolve => setTimeout(resolve, 50))

      const allElements = clone.querySelectorAll('*')

      clone.style.cssText = 'position: relative; width: max-content; min-width: 100%; max-width: none; height: auto; overflow: visible; padding: 16px; background: white;'

      allElements.forEach(el => {
        el.style.width = 'auto'
        el.style.maxWidth = 'none'
        el.style.minWidth = '0'
        el.style.flex = '0 1 auto'
        el.style.position = 'static'
        el.style.maxHeight = 'none'
        el.style.overflow = 'visible'

        if (el.classList && el.classList.contains('ant-card')) {
          el.style.width = 'auto'
          el.style.maxWidth = '800px'
        }

        if (el.classList && el.classList.contains('ant-layout-content')) {
          el.style.cssText = 'padding: 0; max-height: none; overflow: visible;'
        }
      })

      await new Promise(resolve => setTimeout(resolve, 300))

      const captureWidth = clone.scrollWidth
      const captureHeight = clone.scrollHeight

      cloneContainer.style.width = captureWidth + 'px'
      cloneContainer.style.height = captureHeight + 'px'

      const canvas = await html2canvas(cloneContainer, {
        scale: 2,
        backgroundColor: '#ffffff',
        logging: false,
        useCORS: true,
        width: captureWidth,
        height: captureHeight,
        scrollX: 0,
        scrollY: 0
      })

      document.body.removeChild(cloneContainer)

      const link = document.createElement('a')
      link.download = `${audioId}_${new Date().toISOString().slice(0, 10)}.png`
      link.href = canvas.toDataURL('image/png')
      link.click()

      message.success({ content: 'Image saved successfully!', key: 'export' })
    } catch (error) {
      console.error('Export error:', error)
      message.error({ content: 'Error saving image!', key: 'export' })
    } finally {
      setIsExporting(false)
    }
  }

  const handleClearSaved = () => {
    try {
      const storageKey = getStorageKey()
      localStorage.removeItem(storageKey)
      setUserAnswers({})
      setCheckResults({})
      setIsSubmitted(false)
      message.success({ content: 'Saved exercise deleted!', key: 'clear' })
    } catch (error) {
      console.error('Error clearing localStorage:', error)
    }
  }

  // Desktop layout
  if (!isMobile) {
    return (
      <div className="audio-exercise exercise-page" ref={exerciseRef} style={{ padding: '0 24px', overflow: 'visible' }}>
        <ExerciseHeaderDesktop
          audioInfo={audioInfo}
          navigate={navigate}
          allBlanks={allBlanks}
          filled={filled}
          remaining={remaining}
          isSubmitted={isSubmitted}
          userAnswers={userAnswers}
          handleClearSaved={handleClearSaved}
          handleExportImage={handleExportImage}
          isExporting={isExporting}
          scrollToFirstUnanswered={scrollToFirstUnanswered}
        />

        <Content style={{ padding: 0 }}>
          <div style={{ marginTop: 16 }}>
            <Card size="small" style={{ marginBottom: 12, border: 'none' }}>
              {data.dialogue.map((item, idx) => (
                <div key={idx} style={{ marginBottom: 12 }}>
                  {item.speaker && (
                    <Tag color={item.speaker === 'Agent' || item.speaker === 'Advisor' || item.speaker === 'Speaker' ? 'blue' : 'purple'}>
                      {item.speaker}
                    </Tag>
                  )}
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px 6px', marginTop: 8, alignItems: 'baseline', lineHeight: '2.2' }}>
                    {(item.text || item.content || []).map((part, i) => {
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
                            onChange={v => handleInput(part.id, v)}
                            onCheck={() => handleCheck(part.id)}
                            disabled={isCorrect}
                            isCorrect={isCorrect}
                            isWrong={isWrong}
                            blankRef={(el) => blankRefs.current[part.id] = el}
                            isMobile={false}
                          />
                        )
                      }
                      return null
                    })}
                  </div>
                </div>
              ))}
            </Card>
          </div>
        </Content>

        {!isSubmitted && <SubmitButton onClick={handleSubmitClick} isMobile={false} />}

        <ConfirmModal
          open={confirmModalOpen}
          onOk={handleSubmit}
          onCancel={() => setConfirmModalOpen(false)}
          remaining={remaining}
        />
      </div>
    )
  }

  // Mobile layout
  return (
    <div className="audio-exercise exercise-page" ref={exerciseRef} style={{ padding: '0 12px', overflow: 'visible' }}>
      <ExerciseHeaderMobile
        audioInfo={audioInfo}
        navigate={navigate}
        allBlanks={allBlanks}
        filled={filled}
        remaining={remaining}
        isSubmitted={isSubmitted}
        userAnswers={userAnswers}
        handleClearSaved={handleClearSaved}
        handleExportImage={handleExportImage}
        isExporting={isExporting}
        scrollToFirstUnanswered={scrollToFirstUnanswered}
      />

      <Content style={{ padding: 0 }}>
        <Card
          size="small"
          style={{ marginBottom: 8, border: 'none', borderRadius: 8 }}
          bodyStyle={{ padding: 12 }}
        >
          {data.dialogue.map((item, idx) => (
            <div key={idx} style={{ marginBottom: 12 }}>
              {item.speaker && (
                <Tag
                  color={item.speaker === 'Agent' || item.speaker === 'Advisor' || item.speaker === 'Speaker' ? 'blue' : 'purple'}
                  style={{ fontSize: 12 }}
                >
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
                {(item.text || item.content || []).map((part, i) => {
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
                        onChange={v => handleInput(part.id, v)}
                        onCheck={() => handleCheck(part.id)}
                        disabled={isCorrect}
                        isCorrect={isCorrect}
                        isWrong={isWrong}
                        blankRef={(el) => blankRefs.current[part.id] = el}
                        isMobile={true}
                      />
                    )
                  }
                  return null
                })}
              </div>
            </div>
          ))}

          {/* Submit button at the end of content */}
          {!isSubmitted && (
            <div style={{ marginTop: 16 }}>
              <SubmitButton onClick={handleSubmitClick} isMobile={true} />
            </div>
          )}
        </Card>
      </Content>

      <ConfirmModal
        open={confirmModalOpen}
        onOk={handleSubmit}
        onCancel={() => setConfirmModalOpen(false)}
        remaining={remaining}
      />
    </div>
  )
}

export default Exercise
