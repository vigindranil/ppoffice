'use client'

import React, { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import PPUserTable from '@/components/pp-user-table'

const Page = () => {

  return (
    <div className="relative min-h-screen w-full">
      <div className="absolute inset-0 bg-cover bg-center bg-[url('/img/dash2.jpg')]" />
      <div className="absolute inset-0 bg-gradient-to-r from-black/50 via-transparent to-transparent"></div>
      <main className="relative flex-1 p-6 w-full min-h-screen">
        <Card className="w-full max-w-6xl mx-auto bg-white/100 backdrop-blur-sm my-4">
        <CardHeader className="mb-5 bg-gradient-to-r from-cyan-600 to-violet-600 px-6 py-3 rounded-t-lg">
          <CardTitle className="text-white text-xl">Advocate List</CardTitle>
          </CardHeader>
          <CardContent>
          <PPUserTable />
          </CardContent>
          </Card>
        </main>
      </div>
  )
}

export default Page

