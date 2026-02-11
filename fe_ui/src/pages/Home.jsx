import React, { useState, useEffect } from 'react'
import { Layout, Typography, Card, Row, Col, Modal } from 'antd'
import { SoundOutlined, FileTextOutlined } from '@ant-design/icons'
import { Link } from 'react-router-dom'

const { Content } = Layout
const { Title, Text } = Typography

function Home() {
  const [isMobile, setIsMobile] = useState(false)

  // Detect mobile viewport
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }
    
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  const features = [
    {
      title: 'Listening',
      icon: <SoundOutlined style={{ fontSize: 48, color: '#fff' }} />,
      description: 'Practice listening comprehension with audio exercises',
      link: '/listening',
      gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      color: '#667eea'
    },
    {
      title: 'Reading',
      icon: <FileTextOutlined style={{ fontSize: 48, color: '#52c41a' }} />,
      description: 'Coming soon...',
      link: '#',
      gradient: 'linear-gradient(135deg, #f6ffed 0%, #b7eb8f 100%)',
      color: '#52c41a',
      disabled: true,
      onClick: () => {
        Modal.info({
          title: 'Coming Soon',
          content: 'Reading exercises will be available soon!'
        })
      }
    }
  ]

  return (
    <Content 
      className="home-page"
      style={{ 
        padding: isMobile ? '16px' : '48px 24px', 
        minHeight: 'calc(100vh - 64px)' 
      }}
    >
      <div style={{ maxWidth: 1200, margin: '0 auto' }}>
        <Title 
          level={2} 
          style={{ 
            textAlign: 'center', 
            marginBottom: 8,
            fontSize: isMobile ? 24 : 32
          }}
        >
          Welcome to English Practice
        </Title>
        <Text 
          type="secondary" 
          style={{ 
            display: 'block', 
            textAlign: 'center', 
            marginBottom: isMobile ? 24 : 48,
            fontSize: isMobile ? 13 : 14
          }}
        >
          Choose a category to start practicing
        </Text>

        <Row gutter={[isMobile ? 12 : 24, isMobile ? 12 : 24]} justify="center">
          {features.map((feature, index) => (
            <Col xs={24} sm={12} md={8} key={index}>
              {feature.disabled ? (
                <div
                  onClick={feature.onClick}
                  style={{
                    cursor: 'not-allowed',
                    opacity: 0.7
                  }}
                >
                  <Card
                    hoverable={false}
                    style={{
                      height: '100%',
                      textAlign: 'center',
                      borderRadius: 12,
                      background: feature.gradient,
                      border: 'none',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                    }}
                    bodyStyle={{ 
                      padding: isMobile ? 20 : 32,
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center'
                    }}
                  >
                    <div style={{
                      marginBottom: 16,
                      background: feature.gradient,
                      width: isMobile ? 64 : 80,
                      height: isMobile ? 64 : 80,
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      boxShadow: 'none',
                      margin: '0 auto 16px'
                    }}>
                      {feature.icon}
                    </div>
                    <Title 
                      level={4} 
                      style={{ 
                        marginBottom: 8,
                        fontSize: isMobile ? 16 : 18
                      }}
                    >
                      {feature.title}
                    </Title>
                    <Text 
                      type="secondary"
                      style={{
                        fontSize: isMobile ? 12 : 14
                      }}
                    >
                      {feature.description}
                    </Text>
                  </Card>
                </div>
              ) : (
                <Link to={feature.link} style={{ textDecoration: 'none' }}>
                  <Card
                    hoverable={!feature.disabled}
                    style={{
                      height: '100%',
                      textAlign: 'center',
                      borderRadius: 12,
                      border: 'none',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                      transition: 'all 0.3s ease'
                    }}
                    bodyStyle={{ 
                      padding: isMobile ? 20 : 32,
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center'
                    }}
                  >
                    <div style={{
                      marginBottom: 16,
                      background: feature.gradient,
                      width: isMobile ? 64 : 80,
                      height: isMobile ? 64 : 80,
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      margin: '0 auto 16px',
                      boxShadow: '0 4px 12px rgba(102, 126, 234, 0.4)'
                    }}>
                      {feature.icon}
                    </div>
                    <Title 
                      level={4} 
                      style={{ 
                        marginBottom: 8,
                        fontSize: isMobile ? 16 : 18
                      }}
                    >
                      {feature.title}
                    </Title>
                    <Text 
                      type="secondary"
                      style={{
                        fontSize: isMobile ? 12 : 14
                      }}
                    >
                      {feature.description}
                    </Text>
                  </Card>
                </Link>
              )}
            </Col>
          ))}
        </Row>
      </div>
    </Content>
  )
}

export default Home
