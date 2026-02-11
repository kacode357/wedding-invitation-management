import React, { useState, useRef, useEffect } from 'react'
import { PlayCircleOutlined, PauseCircleOutlined, BackwardOutlined } from '@ant-design/icons'

// Custom Audio Player Component - Fully Responsive
export default function CustomAudioPlayer({ src, audioId }) {
  const audioRef = useRef(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [isMobile, setIsMobile] = useState(false)
  const saveTimeoutRef = useRef(null)

  // Get storage key for this audio
  const getStorageKey = () => `audio_progress_${audioId || src}`

  // Detect mobile on mount and resize
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768)
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  // Load saved position on mount
  useEffect(() => {
    if (audioRef.current && audioId) {
      try {
        const savedTime = localStorage.getItem(getStorageKey())
        if (savedTime) {
          audioRef.current.currentTime = parseFloat(savedTime)
          setCurrentTime(parseFloat(savedTime))
        }
      } catch (error) {
        console.error('Error loading audio position:', error)
      }
    }
  }, [audioId, src])

  // Save position periodically while playing
  useEffect(() => {
    if (isPlaying && audioId) {
      saveTimeoutRef.current = setInterval(() => {
        if (audioRef.current) {
          const time = audioRef.current.currentTime
          try {
            localStorage.setItem(getStorageKey(), time.toString())
          } catch (error) {
            console.error('Error saving audio position:', error)
          }
        }
      }, 1000) // Save every second
    }

    return () => {
      if (saveTimeoutRef.current) {
        clearInterval(saveTimeoutRef.current)
      }
    }
  }, [isPlaying, audioId])

  // Save position when pausing or user interacts
  const saveCurrentPosition = () => {
    if (audioRef.current && audioId) {
      try {
        localStorage.setItem(getStorageKey(), audioRef.current.currentTime.toString())
      } catch (error) {
        console.error('Error saving audio position:', error)
      }
    }
  }

  const togglePlay = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause()
        saveCurrentPosition()
      } else {
        audioRef.current.play()
      }
      setIsPlaying(!isPlaying)
    }
  }

  const rewind5s = () => {
    if (audioRef.current) {
      audioRef.current.currentTime = Math.max(0, audioRef.current.currentTime - 5)
      setCurrentTime(audioRef.current.currentTime)
      saveCurrentPosition()
    }
  }

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime)
    }
  }

  const handleLoadedMetadata = () => {
    if (audioRef.current) {
      setDuration(audioRef.current.duration)
    }
  }

  const handleEnded = () => {
    setIsPlaying(false)
    setCurrentTime(0)
    if (audioId) {
      try {
        localStorage.removeItem(getStorageKey())
      } catch (error) {
        console.error('Error clearing audio position:', error)
      }
    }
  }

  // Save position on unmount
  useEffect(() => {
    return () => {
      saveCurrentPosition()
      if (saveTimeoutRef.current) {
        clearInterval(saveTimeoutRef.current)
      }
    }
  }, [])

  const formatTime = (time) => {
    if (isNaN(time)) return '0:00'
    const minutes = Math.floor(time / 60)
    const seconds = Math.floor(time % 60)
    return `${minutes}:${seconds.toString().padStart(2, '0')}`
  }

  // Mobile layout - compact
  if (isMobile) {
    return (
      <div style={{
        background: '#f5f5f5',
        borderRadius: 8,
        padding: '10px 12px',
        width: '100%'
      }}>
        <audio
          ref={audioRef}
          src={src}
          onTimeUpdate={handleTimeUpdate}
          onLoadedMetadata={handleLoadedMetadata}
          onEnded={handleEnded}
        />

        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 12,
          marginBottom: 8
        }}>
          <button
            onClick={rewind5s}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              fontSize: 14,
              color: '#4A90E2',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 36,
              height: 36,
              borderRadius: '50%'
            }}
          >
            <BackwardOutlined style={{ fontSize: 14 }} />
            <span style={{ fontSize: 9, marginLeft: 1, fontWeight: 'bold' }}>5</span>
          </button>

          <button
            onClick={togglePlay}
            style={{
              background: 'linear-gradient(135deg, #4A90E2 0%, #357ABD 100%)',
              border: 'none',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 48,
              height: 48,
              borderRadius: '50%',
              boxShadow: '0 2px 8px rgba(74, 144, 226, 0.4)'
            }}
          >
            {isPlaying ? (
              <PauseCircleOutlined style={{ fontSize: 24, color: '#fff' }} />
            ) : (
              <PlayCircleOutlined style={{ fontSize: 24, color: '#fff', marginLeft: 3 }} />
            )}
          </button>

          <div style={{ width: 36, height: 36 }} />
        </div>

        <div style={{ width: '100%' }}>
          <input
            type="range"
            min={0}
            max={duration || 100}
            value={currentTime || 0}
            onChange={(e) => {
              const newTime = parseFloat(e.target.value)
              if (audioRef.current) {
                audioRef.current.currentTime = newTime
                setCurrentTime(newTime)
              }
            }}
            style={{
              width: '100%',
              appearance: 'none',
              WebkitAppearance: 'none',
              height: 6,
              background: `linear-gradient(to right, #4A90E2 ${duration ? (currentTime / duration) * 100 : 0}%, #e0e0e0 ${duration ? (currentTime / duration) * 100 : 0}%, #e0e0e0 100%)`,
              borderRadius: 3,
              cursor: 'pointer',
              outline: 'none'
            }}
          />
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            marginTop: 4
          }}>
            <span style={{ fontSize: 11, color: '#666', fontFamily: 'monospace' }}>
              {formatTime(currentTime)}
            </span>
            <span style={{ fontSize: 11, color: '#666', fontFamily: 'monospace' }}>
              {formatTime(duration)}
            </span>
          </div>
        </div>
      </div>
    )
  }

  // Desktop layout - full width
  return (
    <div style={{
      background: '#f5f5f5',
      borderRadius: 6,
      padding: '8px 12px',
      display: 'flex',
      alignItems: 'center',
      gap: 10,
      width: '100%'
    }}>
      <audio
        ref={audioRef}
        src={src}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onEnded={handleEnded}
      />

      <button
        onClick={rewind5s}
        style={{
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          fontSize: 16,
          color: '#4A90E2',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: 32,
          height: 32,
          borderRadius: '50%'
        }}
        title="Rewind 5 seconds"
      >
        <BackwardOutlined />
        <span style={{ fontSize: 9, marginLeft: 1, fontWeight: 'bold' }}>5</span>
      </button>

      <button
        onClick={togglePlay}
        style={{
          background: '#4A90E2',
          border: 'none',
          cursor: 'pointer',
          fontSize: 28,
          color: '#fff',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: 36,
          height: 36,
          borderRadius: '50%'
        }}
        title={isPlaying ? 'Pause' : 'Play'}
      >
        {isPlaying ? <PauseCircleOutlined /> : <PlayCircleOutlined />}
      </button>

      <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 8 }}>
        <span style={{ fontSize: 11, color: '#666', minWidth: 32, fontFamily: 'monospace', fontWeight: 500 }}>
          {formatTime(currentTime)}
        </span>

        <input
          type="range"
          min={0}
          max={duration || 100}
          value={currentTime || 0}
          onChange={(e) => {
            const newTime = parseFloat(e.target.value)
            if (audioRef.current) {
              audioRef.current.currentTime = newTime
              setCurrentTime(newTime)
            }
          }}
          style={{
            flex: 1,
            appearance: 'none',
            WebkitAppearance: 'none',
            height: 4,
            background: `linear-gradient(to right, #4A90E2 ${duration ? (currentTime / duration) * 100 : 0}%, #e0e0e0 ${duration ? (currentTime / duration) * 100 : 0}%, #e0e0e0 100%)`,
            borderRadius: 2,
            cursor: 'pointer',
            outline: 'none'
          }}
        />

        <span style={{ fontSize: 11, color: '#666', minWidth: 32, fontFamily: 'monospace', fontWeight: 500 }}>
          {formatTime(duration)}
        </span>
      </div>
    </div>
  )
}
