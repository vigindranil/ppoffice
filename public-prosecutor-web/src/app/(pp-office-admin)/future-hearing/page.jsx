'use client'

import { useState } from "react"
import { Calendar } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"

export default function HearingForm() {
  const [formData, setFormData] = useState({
    hearingDate: "",
    description: "",
    requiredDocuments: "",
    additionalRemark: "",
    sp: false,
    ps: false,
    courtOrder: null
  })

  const handleInputChange = (e) => {
    const { name, value, type, checked, files } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : type === 'file' ? files[0] : value
    }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    console.log('Form submitted:', formData)
    // Handle form submission logic here
  }
  
  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader className="bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-t-lg">
        <CardTitle className="text-2xl font-bold">Hearing Summary</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6 p-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="hearingDate" className="text-lg font-semibold">
              Next Hearing Date
            </Label>
            <div className="relative">
              <Input
                type="date"
                id="hearingDate"
                name="hearingDate"
                value={formData.hearingDate}
                onChange={handleInputChange}
                className="pl-10"
              />
              <Calendar className="absolute left-3 top-2.5 h-5 w-5 text-gray-500" />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description" className="text-lg font-semibold">
              Description / Court Order
            </Label>
            <Textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              placeholder="Enter description or court order details..."
              className="min-h-[100px] resize-none"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="requiredDocuments" className="text-lg font-semibold">
              Required Documents
            </Label>
            <Textarea
              id="requiredDocuments"
              name="requiredDocuments"
              value={formData.requiredDocuments}
              onChange={handleInputChange}
              placeholder="List required documents for next hearing..."
              className="min-h-[100px] resize-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Additional Call</h3>
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="sp" 
                    name="sp"
                    checked={formData.sp}
                    onCheckedChange={(checked) => 
                      setFormData(prev => ({ ...prev, sp: checked }))
                    }
                  />
                  <label
                    htmlFor="sp"
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    SP
                  </label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="ps" 
                    name="ps"
                    checked={formData.ps}
                    onCheckedChange={(checked) => 
                      setFormData(prev => ({ ...prev, ps: checked }))
                    }
                  />
                  <label
                    htmlFor="ps"
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    PS
                  </label>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="additionalRemark" className="text-lg font-semibold">
                Additional Remark
              </Label>
              <Textarea
                id="additionalRemark"
                name="additionalRemark"
                value={formData.additionalRemark}
                onChange={handleInputChange}
                placeholder="Optional remarks..."
                className="h-[80px] resize-none"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="courtOrder" className="text-lg font-semibold">
              Upload Court Order
            </Label>
            <Input
              id="courtOrder"
              name="courtOrder"
              type="file"
              onChange={handleInputChange}
              className="cursor-pointer"
              accept=".pdf,.doc,.docx"
            />
          </div>

          <Button 
            type="submit"
            className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white hover:from-blue-600 hover:to-purple-700"
          >
            Submit
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}

