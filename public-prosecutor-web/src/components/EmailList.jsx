import React, { useState } from 'react'
import { motion } from 'framer-motion'
import EmailNotification from './EmailNotification'
import { Input } from '@/components/ui/input'
import { Search } from 'lucide-react'

const EmailList = ({ emails, onReadEmail }) => {
  const [searchTerm, setSearchTerm] = useState('')

  const filteredEmails = emails.filter(email =>
    email.mailId.toLowerCase().includes(searchTerm.toLowerCase()) ||
    email.CaseNumber.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="space-y-4">
      <div className="relative">
        <Input
          type="text"
          placeholder="Search emails..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
      </div>
      <motion.div layout className="space-y-4">
        {filteredEmails.map((email) => (
          <EmailNotification key={email.id} email={email} onRead={onReadEmail} />
        ))}
      </motion.div>
    </div>
  )
}

export default EmailList

