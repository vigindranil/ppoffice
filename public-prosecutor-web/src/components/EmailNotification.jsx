import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Bell, CheckCheck, ChevronRight, Star } from 'lucide-react'

const EmailNotification = ({ email, onRead }) => {
  const [isHovered, setIsHovered] = useState(false)

  const truncateEmail = (email) => {
    const [username, domain] = email.split('@')
    return `${username.slice(0, 3)}...@${domain}`
  }

  return (
    <motion.div
      className={`p-4 rounded-lg shadow-md transition-all duration-300 ${
        email.readStatus !== 1 ? 'bg-blue-50' : 'bg-white'
      }`}
      whileHover={{ scale: 1.02 }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          {email.readStatus !== 1 ? (
            <motion.div
              initial={{ scale: 1 }}
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ repeat: Infinity, duration: 1.5 }}
            >
              <Bell className="h-5 w-5 text-blue-500" />
            </motion.div>
          ) : (
            <CheckCheck className="h-5 w-5 text-green-500" />
          )}
          <div>
            <AnimatePresence>
              {isHovered ? (
                <motion.p
                  key="full-email"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="font-medium"
                >
                  {email.mailId}
                </motion.p>
              ) : (
                <motion.p
                  key="truncated-email"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="font-medium"
                >
                  {truncateEmail(email.mailId)}
                </motion.p>
              )}
            </AnimatePresence>
            <p className="text-sm text-gray-500">Case: {email.CaseNumber}</p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            className="text-yellow-500 focus:outline-none"
          >
            <Star className="h-5 w-5" />
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            className="bg-blue-500 text-white px-3 py-1 rounded-full text-sm focus:outline-none"
            onClick={() => onRead(email)}
          >
            View
          </motion.button>
        </div>
      </div>
      {isHovered && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 10 }}
          className="mt-2 text-sm text-gray-600"
        >
          <p><strong>IPC Section:</strong> {email.Ipc_section}</p>
          <p><strong>Hearing Date:</strong> {new Date(email.Case_hearingDate).toLocaleString()}</p>
        </motion.div>
      )}
    </motion.div>
  )
}

export default EmailNotification

