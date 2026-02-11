import React from 'react'
import { Button, Typography, Progress } from 'antd'
import { ArrowLeftOutlined, CameraOutlined, ExclamationCircleOutlined } from '@ant-design/icons'
import CustomAudioPlayer from './CustomAudioPlayer'

const { Title, Text } = Typography

// Exercise Header Component for Mobile
export default function ExerciseHeaderMobile({
  audioInfo,
  navigate,
  allBlanks,
  filled,
  remaining,
  isSubmitted,
  userAnswers,
  handleClearSaved,
  handleExportImage,
  isExporting,
  scrollToFirstUnanswered
}) {
  return (
    <div className="exercise-header-sticky" style={{
      position: 'sticky',
      top: 0,
      zIndex: 100,
      background: '#fff',
      margin: '0 -12px',
      padding: '8px 12px',
      borderBottom: '1px solid #f0f0f0'
    }}>
      {/* Mobile Header Row 1: Back + Title | Progress */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 8,
        marginBottom: 8
      }}>
        {/* Left: Back + Title */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
          <button
            onClick={() => navigate('/listening')}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 32,
              height: 32,
              borderRadius: 6,
              border: '1px solid #e0e0e0',
              background: '#fff',
              cursor: 'pointer'
            }}
          >
            <ArrowLeftOutlined style={{ fontSize: 13, color: '#4A90E2' }} />
          </button>
          <span style={{ fontSize: 15, fontWeight: 600, color: '#4A90E2', whiteSpace: 'nowrap' }}>
            {audioInfo.title}
          </span>
        </div>

        {/* Right: Progress Circle + Remaining */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <Progress
            type="circle"
            percent={Math.round((filled / allBlanks.length) * 100)}
            strokeColor={{
              '0%': '#4A90E2',
              '100%': '#357ABD'
            }}
            size={32}
            format={(percent) => (
              <span style={{
                fontSize: 9,
                fontWeight: 600,
                color: '#4A90E2'
              }}>
                {percent}%
              </span>
            )}
            styles={{
              circle: {
                background: '#f5f5f5'
              }
            }}
          />
          <Text style={{ fontSize: 12, color: '#666' }}>
            {remaining}
          </Text>
        </div>
      </div>

      {/* Mobile Row 2: Audio Player */}
      <div style={{ marginBottom: 8 }}>
        <CustomAudioPlayer src={audioInfo.file} audioId={audioInfo.file} />
      </div>

      {/* Mobile Row 3: Action Buttons */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        {!isSubmitted && remaining > 0 && allBlanks.length > 0 && (
          <Button
            type="primary"
            size="small"
            onClick={scrollToFirstUnanswered}
            style={{
              background: '#F0AD4E',
              borderColor: '#F0AD4E',
              height: 36,
              borderRadius: 6,
              fontSize: 13
            }}
          >
            Go to Unanswered
          </Button>
        )}

        {!isSubmitted && Object.keys(userAnswers).length > 0 && (
          <Button
            size="small"
            onClick={handleClearSaved}
            icon={<ExclamationCircleOutlined />}
            style={{
              borderColor: '#ffccc7',
              color: '#ff4d4f',
              height: 32,
              borderRadius: 6
            }}
          >
            Clear Saved
          </Button>
        )}

        {isSubmitted && (
          <Button
            type="primary"
            danger
            size="small"
            onClick={handleExportImage}
            loading={isExporting}
            icon={<CameraOutlined />}
            style={{ height: 36, borderRadius: 6 }}
          >
            Save Image
          </Button>
        )}
      </div>
    </div>
  )
}
