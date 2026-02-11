import React, { useState, useEffect } from 'react'
import { Layout, Typography, Button, Drawer } from 'antd'
import { SoundOutlined, BookOutlined, MenuOutlined, HomeOutlined, ArrowLeftOutlined } from '@ant-design/icons'
import { Link, useLocation, useNavigate } from 'react-router-dom'

const { Header: AntHeader } = Layout
const { Title } = Typography

function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const location = useLocation()
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

  const getPageTitle = () => {
    const path = location.pathname
    if (path === '/') return 'English Practice'
    if (path === '/listening') return 'Listening'
    if (path.startsWith('/listening/')) {
      return 'Exercise'
    }
    return 'English Practice'
  }

  const getSubtitle = () => {
    const path = location.pathname
    if (path === '/') return null
    if (path === '/listening') return 'Choose an audio'
    if (path.startsWith('/listening/')) {
      const audioId = path.split('/').pop()
      return `Audio ${audioId.replace('audio', '')}`
    }
    return null
  }

  const handleBack = () => {
    const path = location.pathname
    if (path.startsWith('/listening/')) {
      navigate('/listening')
    } else {
      navigate('/')
    }
  }

  const menuItems = [
    {
      key: '/',
      icon: <HomeOutlined />,
      label: 'Home',
      onClick: () => {
        navigate('/')
        setMobileMenuOpen(false)
      }
    },
    {
      key: '/listening',
      icon: <SoundOutlined />,
      label: 'Listening',
      onClick: () => {
        navigate('/listening')
        setMobileMenuOpen(false)
      }
    }
  ]

  // Desktop Header
  if (!isMobile) {
    return (
      <AntHeader
        className="site-header"
        style={{
          background: '#fff',
          padding: '0 24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
          position: 'sticky',
          top: 0,
          zIndex: 100
        }}
      >
        <Link to="/" style={{ textDecoration: 'none', color: 'inherit', display: 'flex', alignItems: 'center', gap: 8 }}>
          <SoundOutlined style={{ fontSize: 24, color: '#1677ff' }} />
          <Title level={4} style={{ margin: 0, color: '#1677ff' }}>English Practice</Title>
        </Link>

        <div style={{ display: 'flex', gap: 8, alignItems: 'center', height: '100%' }}>
          <Link
            to="/listening"
            style={{
              color: location.pathname.startsWith('/listening') ? '#1677ff' : '#666',
              textDecoration: 'none',
              display: 'flex',
              alignItems: 'center',
              gap: 4,
              padding: '6px 12px',
              borderRadius: 6,
              background: location.pathname.startsWith('/listening') ? '#e6f4ff' : 'transparent',
              transition: 'all 0.2s',
              fontSize: 14,
              height: 36,
              lineHeight: '24px'
            }}
          >
            <BookOutlined style={{ fontSize: 14 }} />
            Listening
          </Link>
        </div>
      </AntHeader>
    )
  }

  // Mobile Header with Back Button
  return (
    <>
      <div
        className="mobile-main-header"
        style={{
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          padding: '0 12px',
          height: 48,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'flex-start',
          gap: 8,
          boxShadow: '0 2px 8px rgba(102, 126, 234, 0.3)',
          position: 'sticky',
          top: 0,
          zIndex: 100
        }}
      >
        {/* Back Button - Styled nicely */}
        <button
          onClick={handleBack}
          className="mobile-back-btn"
          style={{
            background: 'rgba(255, 255, 255, 0.2)',
            border: 'none',
            borderRadius: 6,
            width: 36,
            height: 36,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            transition: 'all 0.2s',
            flexShrink: 0
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'rgba(255, 255, 255, 0.3)'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'rgba(255, 255, 255, 0.2)'
          }}
        >
          <ArrowLeftOutlined style={{ color: '#fff', fontSize: 14 }} />
        </button>

        {/* Title Area */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <span
            style={{
              margin: 0,
              color: '#fff',
              fontSize: 14,
              fontWeight: 600,
              lineHeight: 1.2,
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              display: 'block'
            }}
          >
            {getPageTitle()}
          </span>
          {getSubtitle() && (
            <span
              style={{
                color: 'rgba(255, 255, 255, 0.8)',
                fontSize: 10,
                display: 'block'
              }}
            >
              {getSubtitle()}
            </span>
          )}
        </div>

        {/* Menu Button */}
        <button
          onClick={() => setMobileMenuOpen(true)}
          className="mobile-menu-btn-header"
          style={{
            background: 'rgba(255, 255, 255, 0.2)',
            border: 'none',
            borderRadius: 6,
            width: 36,
            height: 36,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            transition: 'all 0.2s',
            flexShrink: 0
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'rgba(255, 255, 255, 0.3)'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'rgba(255, 255, 255, 0.2)'
          }}
        >
          <MenuOutlined style={{ color: '#fff', fontSize: 14 }} />
        </button>
      </div>

      {/* Mobile Navigation Drawer */}
      <Drawer
        title={
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <SoundOutlined style={{ color: '#667eea', fontSize: 20 }} />
            <span style={{ fontWeight: 600 }}>Menu</span>
          </div>
        }
        placement="right"
        onClose={() => setMobileMenuOpen(false)}
        open={mobileMenuOpen}
        width={280}
        styles={{
          header: {
            background: '#fff',
            borderBottom: '1px solid #f0f0f0'
          },
          body: {
            background: '#fff',
            padding: '16px'
          }
        }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {menuItems.map(item => (
            <Button
              key={item.key}
              type={location.pathname === item.key || 
                (item.key === '/listening' && location.pathname.startsWith('/listening')) 
                ? 'primary' : 'default'}
              icon={item.icon}
              onClick={item.onClick}
              style={{
                width: '100%',
                textAlign: 'left',
                justifyContent: 'flex-start',
                height: 52,
                fontSize: 15,
                borderRadius: 10
              }}
            >
              {item.label}
            </Button>
          ))}
        </div>
      </Drawer>
    </>
  )
}

export default Header
