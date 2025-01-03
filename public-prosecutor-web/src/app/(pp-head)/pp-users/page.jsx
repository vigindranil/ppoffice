'use client'

import React, { useEffect, useState } from 'react'
import PPUserTable from '@/components/pp-user-table'

const Page = () => {
  return (
    <div className="container mx-auto py-10 px-3">
      <h1 className="text-3xl font-bold mb-5">PP Users</h1>
      <PPUserTable />
    </div>
  )
}

export default Page

