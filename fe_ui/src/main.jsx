import React from 'react'
import { createRoot } from 'react-dom/client'
import { ConfigProvider, Layout } from 'antd'
import { RouterProvider, createBrowserRouter, Outlet } from 'react-router-dom'
import Header from './components/Header/Header'
import Home from './pages/Home'
import Listening from './pages/Listening'
import Exercise from './components/Exercise/Exercise'
import './style.css'

const { Content } = Layout

function RootLayout() {
  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Header />
      <Content>
        <Outlet />
      </Content>
    </Layout>
  )
}

const router = createBrowserRouter([
  {
    element: <RootLayout />,
    children: [
      {
        path: '/',
        element: <Home />
      },
      {
        path: '/listening',
        element: <Listening />
      },
      {
        path: '/listening/:audioId',
        element: <Exercise />
      }
    ]
  }
])

createRoot(document.getElementById('app')).render(
  <ConfigProvider theme={{ token: { colorPrimary: '#1677ff', borderRadius: 4 } }}>
    <RouterProvider router={router} />
  </ConfigProvider>
)
