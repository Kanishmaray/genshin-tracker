import React, { Suspense, lazy } from 'react'
import { Routes, Route } from 'react-router-dom'
import { GameDataProvider } from './lib/useGameData'
import Layout from './components/layout/Layout'

const Dashboard = lazy(() => import('./pages/Dashboard'))
const CharacterPage = lazy(() => import('./pages/CharacterPage'))
const TeamsPage = lazy(() => import('./pages/TeamsPage'))
const PrioritiesPage = lazy(() => import('./pages/PrioritiesPage'))

function LoadingFallback() {
  return (
    <div className="flex items-center justify-center h-full min-h-screen">
      <div className="flex flex-col items-center gap-4">
        <div
          className="w-12 h-12 rounded-full border-2 border-amber-400 border-t-transparent animate-spin"
          style={{ boxShadow: '0 0 20px #D4A01744' }}
        />
        <p className="text-gray-500 text-sm font-display tracking-widest">LOADING</p>
      </div>
    </div>
  )
}

export default function App() {
  return (
    <GameDataProvider>
      <Layout>
        <Suspense fallback={<LoadingFallback />}>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/character/:id" element={<CharacterPage />} />
            <Route path="/teams" element={<TeamsPage />} />
            <Route path="/priorities" element={<PrioritiesPage />} />
          </Routes>
        </Suspense>
      </Layout>
    </GameDataProvider>
  )
}
