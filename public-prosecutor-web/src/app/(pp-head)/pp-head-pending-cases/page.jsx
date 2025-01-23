'use client'

import CaseTable from '@/components/pending-cases-table'

const Page = () => {
  return (
    <div className="container mx-auto py-10 px-3">
      <h1 className="text-3xl font-bold mb-5">Pending Cases</h1>
      <CaseTable />
    </div>
  )
}

export default Page

