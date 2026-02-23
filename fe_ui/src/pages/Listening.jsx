import React, { useState, useEffect } from 'react'
import { Layout, Typography, Card, Row, Col, Button } from 'antd'
import { SoundOutlined, ArrowLeftOutlined } from '@ant-design/icons'
import { Link, useNavigate } from 'react-router-dom'

const { Content } = Layout
const { Title, Text } = Typography

const audioList = [
  { id: 'audio1', title: 'Audio 1', questions: 43 },
  { id: 'audio2', title: 'Audio 2', questions: 47 },
  { id: 'audio3', title: 'Audio 3', questions: 38 },
  { id: 'audio4', title: 'Audio 4', questions: 46 },
  { id: 'audio5', title: 'Audio 5', questions: 41 },
  { id: 'audio9', title: 'Audio 9', questions: 43 },
  { id: 'audio13', title: 'Audio 13', questions: 54 }
]

function Listening() {
  const [isMobile, setIsMobile] = useState(false)
  const navigate = useNavigate()

  // Detect mobile viewport
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }

    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  return (
    <Content
      className="listening-page"
      style={{
        padding: isMobile ? '16px' : '24px',
        minHeight: 'calc(100vh - 64px)'
      }}
    >
      <div style={{ maxWidth: 1000, margin: '0 auto' }}>
        {/* Back Button */}
        <button
          onClick={() => navigate('/')}
          className="page-back-btn"
          style={{
            display: isMobile ? 'inline-flex' : 'none',
            marginBottom: 16
          }}
        >
          <ArrowLeftOutlined />
        </button>

        <div style={{ marginBottom: isMobile ? 16 : 24 }}>
          <Title
            level={3}
            style={{
              marginBottom: 8,
              fontSize: isMobile ? 20 : 24
            }}
          >
            <SoundOutlined style={{ marginRight: isMobile ? 6 : 8 }} />
            Listening Exercises
          </Title>
          <Text type="secondary">
            Choose an audio to start practicing
          </Text>
        </div>

        <Row gutter={[isMobile ? 8 : 16, isMobile ? 8 : 16]}>
          {audioList.map((audio) => (
            <Col xs={12} sm={12} md={12} lg={6} key={audio.id}>
              <Link to={`/listening/${audio.id}`} style={{ textDecoration: 'none' }}>
                <Card
                  hoverable
                  style={{
                    height: '100%',
                    borderRadius: isMobile ? 8 : 12,
                    transition: 'all 0.3s',
                    border: 'none',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
                  }}
                  bodyStyle={{
                    padding: isMobile ? 12 : 20,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center'
                  }}
                >
                  <div style={{
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    width: isMobile ? 48 : 60,
                    height: isMobile ? 48 : 60,
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: isMobile ? 8 : 16,
                    boxShadow: '0 4px 12px rgba(102, 126, 234, 0.4)'
                  }}>
                    <SoundOutlined style={{ fontSize: isMobile ? 20 : 28, color: '#fff' }} />
                  </div>

                  <Title
                    level={5}
                    style={{
                      textAlign: 'center',
                      marginBottom: isMobile ? 4 : 8,
                      fontSize: isMobile ? 14 : 16
                    }}
                  >
                    {audio.title}
                  </Title>

                  <div style={{ textAlign: 'center' }}>
                    <Text
                      type="secondary"
                      style={{
                        fontSize: isMobile ? 11 : 12
                      }}
                    >
                      {audio.questions} questions
                    </Text>
                  </div>
                </Card>
              </Link>
            </Col>
          ))}
        </Row>
      </div>
    </Content>
  )
}

export default Listening
