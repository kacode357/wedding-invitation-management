import React from 'react'
import { Button, Typography, Progress } from 'antd'
import { LeftOutlined, CameraOutlined, ExclamationCircleOutlined } from '@ant-design/icons'
import CustomAudioPlayer from './CustomAudioPlayer'

const { Title, Text } = Typography

// Exercise Header Component for Desktop
export default function ExerciseHeaderDesktop({
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
      margin: '0 -24px',
      padding: '8px 16px',
      borderBottom: '1px solid #f0f0f0',
      boxShadow: '0 2px 8px rgba(0,0,0,0.06)'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, flexWrap: 'nowrap' }}>
        {/* Left: Back & Title */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
          <Button
            type="text"
            icon={<LeftOutlined />}
            onClick={() => navigate('/listening')}
            style={{ color: '#666', fontSize: 14 }}
          />
          <Title level={5} style={{ margin: 0, color: '#4A90E2', whiteSpace: 'nowrap' }}>
            {audioInfo.title}
          </Title>
        </div>

        {/* Center: Audio Player */}
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', minWidth: 0, maxWidth: 500 }}>
          <CustomAudioPlayer src={audioInfo.file} audioId={audioInfo.file} />
        </div>

        {/* Right: Progress & Actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <Progress
              type="circle"
              percent={Math.round((filled / allBlanks.length) * 100)}
              strokeColor={{
                '0%': '#4A90E2',
                '100%': '#357ABD'
              }}
              size={40}
              format={(percent) => (
                <span style={{
                  fontSize: 10,
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
            <Text style={{ fontSize: 12, color: '#666', whiteSpace: 'nowrap' }}>
              {remaining} remain
            </Text>
          </div>

          {!isSubmitted && remaining > 0 && allBlanks.length > 0 && (
            <Button
              size="small"
              type="primary"
              onClick={scrollToFirstUnanswered}
              style={{ background: '#F0AD4E', borderColor: '#F0AD4E', fontSize: 12 }}
            >
              Go
            </Button>
          )}

          {!isSubmitted && Object.keys(userAnswers).length > 0 && (
            <Button
              size="small"
              onClick={handleClearSaved}
              icon={<ExclamationCircleOutlined />}
              style={{ borderColor: '#ffccc7', color: '#ff4d4f', fontSize: 12 }}
            >
              Clear
            </Button>
          )}

          {isSubmitted && (
            <Button
              type="primary"
              danger
              onClick={handleExportImage}
              loading={isExporting}
              icon={<CameraOutlined />}
              size="small"
            >
              Save
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}
