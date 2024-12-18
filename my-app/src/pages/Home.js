'use client'

import { useEffect } from 'react'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom';


export default function LandingPage() {
  useEffect(() => {
    // Add a class to the body to prevent scrolling when the landing page is shown
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [])

  return (
    <div className="relative h-screen w-full overflow-hidden">
      {/* Background Image with Dark Overlay and Motion Effect (Zoom-In + Fade-In) */}
      <motion.div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: 'url("/images/ppoimage.webp")',
          filter: 'brightness(0.4)'
        }}
        initial={{ opacity: 1, scale: 1.1 }}  // Initial state (invisible and zoomed in)
        animate={{ opacity: 1, scale: 1 }}   // Final state (visible and zoomed out)
        transition={{ duration: 1.5 }} // Duration for both the fade-in and zoom-in
      />

      {/* Content Container */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="relative z-10 flex flex-col items-center justify-center h-full text-white px-4"
      >
        <motion.h1 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="text-4xl md:text-6xl font-bold text-center mb-4"
        >
          Welcome to PPO case Tracking System
        </motion.h1>

        <motion.p 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="text-xl md:text-2xl text-center mb-8 text-gray-200"
        >
          Manage and track the case and generate notification.
        </motion.p>

        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="flex gap-4"
        >
          <Link
            href="/get-started"
            className="px-6 py-3 bg-gray-600 hover:bg-blue-700 rounded-lg font-medium transition-colors"
          >
            Get Started
          </Link>
          <Link
            to="/login"
            className="px-6 py-3 bg-blue-700 hover:bg-blue-700 rounded-lg font-medium transition-colors"
          >
            Login
          </Link>
        </motion.div>

        <motion.footer
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 1 }}
          className="absolute bottom-4 text-center text-sm text-gray-300"
        >
          © 2024 PPO case track System. All rights reserved.
        </motion.footer>
      </motion.div>
    </div>
  )
}
