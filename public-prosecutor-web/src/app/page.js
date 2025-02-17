'use client'

import { useEffect } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { Button } from "@/components/ui/button"

export default function LandingPage() {
  useEffect(() => {
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [])


  return (
    <div className="relative">
      {/* Background image div with opacity */}
      <div 
        className="fixed inset-0 opacity-10 bg-cover bg-center bg-[url('/img/ppoimage.jpg?height=1080&width=1920')]"
        style={{ zIndex: 1 }}
      ></div>

      {/* Gradient and Overlay */}
      <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/70 to-black/50"></div>
      <div className="absolute inset-0 bg-black/60"></div>
      
      <div className="relative h-screen w-full overflow-hidden">
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
            Public Prosecutor Office
          </motion.h1>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-4xl md:text-6xl font-bold text-center mb-4"
          >
           Case Tracking System
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
            <Button asChild variant="secondary">
            <Link href="/login">Login</Link>
            </Button>
          </motion.div>

          <motion.footer
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 1 }}
            className="absolute bottom-4 text-center text-sm text-gray-300"
          >
            © 2025 Public Prosecutor Office Case Tracking System. All rights reserved.
          </motion.footer>
        </motion.div>
      </div>
    </div>
  )
}

