import React from 'react'
import { Route, Routes } from 'react-router-dom'
import Home from './components/Home'
import About from './components/About'
import "./App.css"

const App = () => {
  return (
    <>
    <Routes>
      <Route element={<Home />} path='/' />
      <Route element={<About />} path='/about' />
    </Routes>
    </>
  )
}

export default App