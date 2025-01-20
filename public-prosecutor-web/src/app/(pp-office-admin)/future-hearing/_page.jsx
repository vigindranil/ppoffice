// 'use client';

// import { useState, useEffect } from "react"
// import { Calendar, Upload } from 'lucide-react'
// import { Button } from "@/components/ui/button"
// import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
// import { Label } from "@/components/ui/label"
// import { Input } from "@/components/ui/input"
// import { Textarea } from "@/components/ui/textarea"
// import {
//   Select,
//   SelectContent,
//   SelectItem,
//   SelectTrigger,
//   SelectValue,
// } from "@/components/ui/select"
// import { motion } from "framer-motion"

// // Import the API functions with updated names
// import { fetchAllDistricts, fetchPoliceStationsByDistrict } from '@/app/api'

// export default function HearingForm() {
//   const [formData, setFormData] = useState({
//     hearingDate: "",
//     description: "",
//     requiredDocuments: "",
//     additionalRemark: "",
//     additionalCallSP: "",
//     additionalCallPS: "",
//     courtOrder: null
//   })

//   const [districts, setDistricts] = useState([])
//   const [policeStations, setPoliceStations] = useState([])

//   useEffect(() => {
//     fetchDistricts()
//   }, [])

//   const fetchDistricts = async () => {
//     try {
//       const districtData = await fetchAllDistricts()
//       setDistricts(districtData)
//     } catch (error) {
//       console.error("Error fetching districts:", error)
//     }
//   }

//   const fetchPoliceStations = async (districtId) => {
//     try {
//       const psData = await fetchPoliceStationsByDistrict(districtId)
//       setPoliceStations(psData)
//     } catch (error) {
//       console.error("Error fetching police stations:", error)
//     }
//   }

//   const handleInputChange = (e) => {
//     const { name, value, type, files } = e.target
//     setFormData(prev => ({
//       ...prev,
//       [name]: type === 'file' ? files[0] : value
//     }))
//   }

//   const handleSelectChange = (value, type) => {
//     setFormData(prev => ({
//       ...prev,
//       [type]: value
//     }))
//     if (type === 'additionalCallSP') {
//       fetchPoliceStations(value)
//     }
//   }

//   const handleSubmit = (e) => {
//     e.preventDefault()
//     console.log('Form submitted:', formData)
//     // Handle form submission logic here
//   }
  
//   return (
//     <div className="relative min-h-screen w-full bg-gradient-to-br from-blue-900 via-blue-600 to-blue-400 p-8">
//       <div className="absolute inset-0 bg-blue-500/10 backdrop-blur-sm"></div>
//       <motion.div
//         initial={{ opacity: 0, y: 20 }}
//         animate={{ opacity: 1, y: 0 }}
//         transition={{ duration: 0.5 }}
//         className="relative z-10 max-w-2xl mx-auto"
//       >
//         <Card className="w-full backdrop-blur-md bg-white/90 shadow-xl rounded-xl border border-blue-200">
//           <CardHeader className="bg-gradient-to-r from-blue-800 to-blue-600 text-white rounded-t-xl">
//             <CardTitle className="text-3xl font-bold text-center">Hearing Summary</CardTitle>
//           </CardHeader>
//           <CardContent className="space-y-6 p-6">
//             <form onSubmit={handleSubmit} className="space-y-4">
//               <motion.div
//                 whileHover={{ scale: 1.02 }}
//                 transition={{ type: "spring", stiffness: 300 }}
//               >
//                 <Label htmlFor="hearingDate" className="text-lg font-semibold text-blue-900">
//                   Next Hearing Date
//                 </Label>
//                 <div className="relative mt-1">
//                   <Input
//                     type="date"
//                     id="hearingDate"
//                     name="hearingDate"
//                     value={formData.hearingDate}
//                     onChange={handleInputChange}
//                     className="pl-10 pr-4 py-2 w-full rounded-lg border-2 border-blue-300 focus:border-blue-500 focus:ring focus:ring-blue-200 transition duration-200"
//                   />
//                   <Calendar className="absolute left-3 top-2.5 h-5 w-5 text-blue-500" />
//                 </div>
//               </motion.div>

//               <div className="grid grid-cols-2 gap-4">
//                 <motion.div
//                   whileHover={{ scale: 1.02 }}
//                   transition={{ type: "spring", stiffness: 300 }}
//                 >
//                   <Label htmlFor="additionalCallSP" className="text-lg font-semibold text-blue-900">
//                     Additional Call SP
//                   </Label>
//                   <Select
//                     onValueChange={(value) => handleSelectChange(value, 'additionalCallSP')}
//                     value={formData.additionalCallSP}
//                   >
//                     <SelectTrigger className="w-full mt-1 border-2 border-blue-300 focus:border-blue-500 focus:ring focus:ring-blue-200 transition duration-200 rounded-lg">
//                       <SelectValue placeholder="Select SP" />
//                     </SelectTrigger>
//                     <SelectContent>
//                       {districts.map((district) => (
//                         <SelectItem key={district.districtId} value={district.districtId.toString()}>
//                           {district.districtName}
//                         </SelectItem>
//                       ))}
//                     </SelectContent>
//                   </Select>
//                 </motion.div>

//                 <motion.div
//                   whileHover={{ scale: 1.02 }}
//                   transition={{ type: "spring", stiffness: 300 }}
//                 >
//                   <Label htmlFor="additionalCallPS" className="text-lg font-semibold text-blue-900">
//                     Additional Call PS
//                   </Label>
//                   <Select
//                     onValueChange={(value) => handleSelectChange(value, 'additionalCallPS')}
//                     value={formData.additionalCallPS}
//                     disabled={!formData.additionalCallSP}
//                   >
//                     <SelectTrigger className="w-full mt-1 border-2 border-blue-300 focus:border-blue-500 focus:ring focus:ring-blue-200 transition duration-200 rounded-lg">
//                       <SelectValue placeholder="Select PS" />
//                     </SelectTrigger>
//                     <SelectContent>
//                       {policeStations.map((ps) => (
//                         <SelectItem key={ps.id} value={ps.id.toString()}>
//                           {ps.ps_name}
//                         </SelectItem>
//                       ))}
//                     </SelectContent>
//                   </Select>
//                 </motion.div>
//               </div>

//               <motion.div
//                 whileHover={{ scale: 1.02 }}
//                 transition={{ type: "spring", stiffness: 300 }}
//                 className="space-y-2"
//               >
//                 <Label htmlFor="description" className="text-lg font-semibold text-blue-900">
//                   Description / Court Order
//                 </Label>
//                 <Textarea
//                   id="description"
//                   name="description"
//                   value={formData.description}
//                   onChange={handleInputChange}
//                   placeholder="Enter description or court order details..."
//                   className="min-h-[100px] resize-none w-full rounded-lg border-2 border-blue-300 focus:border-blue-500 focus:ring focus:ring-blue-200 transition duration-200"
//                 />
//               </motion.div>

//               <motion.div
//                 whileHover={{ scale: 1.02 }}
//                 transition={{ type: "spring", stiffness: 300 }}
//                 className="space-y-2"
//               >
//                 <Label htmlFor="requiredDocuments" className="text-lg font-semibold text-blue-900">
//                   Required Documents
//                 </Label>
//                 <Textarea
//                   id="requiredDocuments"
//                   name="requiredDocuments"
//                   value={formData.requiredDocuments}
//                   onChange={handleInputChange}
//                   placeholder="List required documents for next hearing..."
//                   className="min-h-[100px] resize-none w-full rounded-lg border-2 border-blue-300 focus:border-blue-500 focus:ring focus:ring-blue-200 transition duration-200"
//                 />
//               </motion.div>

//               <motion.div
//                 whileHover={{ scale: 1.02 }}
//                 transition={{ type: "spring", stiffness: 300 }}
//                 className="space-y-2"
//               >
//                 <Label htmlFor="additionalRemark" className="text-lg font-semibold text-blue-900">
//                   Additional Remark
//                 </Label>
//                 <Textarea
//                   id="additionalRemark"
//                   name="additionalRemark"
//                   value={formData.additionalRemark}
//                   onChange={handleInputChange}
//                   placeholder="Optional remarks..."
//                   className="min-h-[100px] resize-none w-full rounded-lg border-2 border-blue-300 focus:border-blue-500 focus:ring focus:ring-blue-200 transition duration-200"
//                 />
//               </motion.div>

//               <motion.div
//                 whileHover={{ scale: 1.02 }}
//                 transition={{ type: "spring", stiffness: 300 }}
//                 className="space-y-2"
//               >
//                 <Label htmlFor="courtOrder" className="text-lg font-semibold text-blue-900">
//                   Upload Court Order
//                 </Label>
//                 <div className="relative">
//                   <Input
//                     id="courtOrder"
//                     name="courtOrder"
//                     type="file"
//                     onChange={handleInputChange}
//                     className="cursor-pointer opacity-0 absolute inset-0 w-full h-full"
//                     accept=".pdf,.doc,.docx"
//                   />
//                   <div className="bg-blue-100 text-blue-800 rounded-lg p-4 flex items-center justify-center border-2 border-blue-300 hover:bg-blue-200 transition duration-200">
//                     <Upload className="w-6 h-6 mr-2" />
//                     <span>Choose file or drag and drop</span>
//                   </div>
//                 </div>
//               </motion.div>

//               <motion.div
//                 whileHover={{ scale: 1.05 }}
//                 whileTap={{ scale: 0.95 }}
//               >
//                 <Button 
//                   type="submit"
//                   className="w-full bg-gradient-to-r from-blue-700 to-blue-500 text-white text-lg py-3 rounded-lg hover:from-blue-800 hover:to-blue-600 transition duration-300 transform hover:-translate-y-1 hover:shadow-lg"
//                 >
//                   Submit
//                 </Button>
//               </motion.div>
//             </form>
//           </CardContent>
//         </Card>
//       </motion.div>
//     </div>
//   )
// }
// ---------------------------------------------------------//
'use client';

import { useState, useEffect } from "react"
import { Calendar, Upload } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { BASE_URL } from '@/app/constants'; 
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { motion } from "framer-motion"

// Import the API functions with updated names
import { fetchAllDistricts, fetchPoliceStationsByDistrict } from '@/app/api'

export default function HearingForm() {
  const [formData, setFormData] = useState({
    hearingDate: "",
    description: "",
    requiredDocuments: "",
    additionalRemark: "",
    additionalCallSP: "",
    additionalCallPS: "",
    courtOrder: null
  })

  const [districts, setDistricts] = useState([])
  const [policeStations, setPoliceStations] = useState([])
  const [token, setToken] = useState("YOUR_AUTH_TOKEN_HERE")  // Add token logic if required

  useEffect(() => {
    fetchDistricts()
  }, [])

  const fetchDistricts = async () => {
    try {
      const districtData = await fetchAllDistricts()
      setDistricts(districtData)
    } catch (error) {
      console.error("Error fetching districts:", error)
    }
  }

  const fetchPoliceStations = async (districtId) => {
    try {
      const psData = await fetchPoliceStationsByDistrict(districtId)
      setPoliceStations(psData)
    } catch (error) {
      console.error("Error fetching police stations:", error)
    }
  }

  const handleInputChange = (e) => {
    const { name, value, type, files } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'file' ? files[0] : value
    }))
  }

  const handleSelectChange = (value, type) => {
    setFormData(prev => ({
      ...prev,
      [type]: value
    }))
    if (type === 'additionalCallSP') {
      fetchPoliceStations(value)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Create a new FormData object
    const form = new FormData();
    form.append('CaseNumber', 'WB/ER/RR');  // Replace with formData.CaseNumber if you have this value in state
    form.append('CaseDescription', formData.description);
    form.append('CaseId', '190');  // Replace with dynamic CaseId if available
    form.append('EntryUserID', '1');  // Replace with dynamic EntryUserID if available
    form.append('CaseDate', formData.hearingDate);
    form.append('DistrictID', formData.additionalCallSP);
    form.append('psID', formData.additionalCallPS);
    form.append('caseTypeID', '1');  // Replace with dynamic caseTypeID if available
    form.append('nexthearingDate', formData.hearingDate);
    form.append('requiredDocument', formData.requiredDocuments);
    form.append('additionalRemarks', formData.additionalRemark);

    // Append the file if selected
    if (formData.courtOrder) {
      form.append('caseuploadDocumentPath', formData.courtOrder);
    }

    try {
      const response = await fetch(`${BASE_URL}/cases/caseDetail`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: form,
      });

      const result = await response.json();

      if (response.ok && result.status === 0) {
        console.log('Case details saved successfully:', result);
        // handle success, maybe clear the form or show a success message
      } else {
        console.error('Error:', result.message || 'Failed to save case details');
      }
    } catch (error) {
      console.error('Error submitting the form:', error);
    }
  }

  return (
    <div className="relative min-h-screen w-full bg-gradient-to-br from-blue-900 via-blue-600 to-blue-400 p-8">
      <div className="absolute inset-0 bg-blue-500/10 backdrop-blur-sm"></div>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative z-10 max-w-2xl mx-auto"
      >
        <Card className="w-full backdrop-blur-md bg-white/90 shadow-xl rounded-xl border border-blue-200">
          <CardHeader className="bg-gradient-to-r from-blue-800 to-blue-600 text-white rounded-t-xl">
            <CardTitle className="text-3xl font-bold text-center">Hearing Summary</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6 p-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              <motion.div
                whileHover={{ scale: 1.02 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <Label htmlFor="hearingDate" className="text-lg font-semibold text-blue-900">
                  Next Hearing Date
                </Label>
                <div className="relative mt-1">
                  <Input
                    type="date"
                    id="hearingDate"
                    name="hearingDate"
                    value={formData.hearingDate}
                    onChange={handleInputChange}
                    className="pl-10 pr-4 py-2 w-full rounded-lg border-2 border-blue-300 focus:border-blue-500 focus:ring focus:ring-blue-200 transition duration-200"
                  />
                  <Calendar className="absolute left-3 top-2.5 h-5 w-5 text-blue-500" />
                </div>
              </motion.div>

              <div className="grid grid-cols-2 gap-4">
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  <Label htmlFor="additionalCallSP" className="text-lg font-semibold text-blue-900">
                    Additional Call SP
                  </Label>
                  <Select
                    onValueChange={(value) => handleSelectChange(value, 'additionalCallSP')}
                    value={formData.additionalCallSP}
                  >
                    <SelectTrigger className="w-full mt-1 border-2 border-blue-300 focus:border-blue-500 focus:ring focus:ring-blue-200 transition duration-200 rounded-lg">
                      <SelectValue placeholder="Select SP" />
                    </SelectTrigger>
                    <SelectContent>
                      {districts.map((district) => (
                        <SelectItem key={district.districtId} value={district.districtId.toString()}>
                          {district.districtName}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </motion.div>

                <motion.div
                  whileHover={{ scale: 1.02 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  <Label htmlFor="additionalCallPS" className="text-lg font-semibold text-blue-900">
                    Additional Call PS
                  </Label>
                  <Select
                    onValueChange={(value) => handleSelectChange(value, 'additionalCallPS')}
                    value={formData.additionalCallPS}
                    disabled={!formData.additionalCallSP}
                  >
                    <SelectTrigger className="w-full mt-1 border-2 border-blue-300 focus:border-blue-500 focus:ring focus:ring-blue-200 transition duration-200 rounded-lg">
                      <SelectValue placeholder="Select PS" />
                    </SelectTrigger>
                    <SelectContent>
                      {policeStations.map((ps) => (
                        <SelectItem key={ps.id} value={ps.id.toString()}>
                          {ps.ps_name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </motion.div>
              </div>

              <motion.div
                whileHover={{ scale: 1.02 }}
                transition={{ type: "spring", stiffness: 300 }}
                className="space-y-2"
              >
                <Label htmlFor="description" className="text-lg font-semibold text-blue-900">
                  Description / Court Order
                </Label>
                <Textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="Enter description or court order details..."
                  className="min-h-[100px] resize-none w-full rounded-lg border-2 border-blue-300 focus:border-blue-500 focus:ring focus:ring-blue-200 transition duration-200"
                />
              </motion.div>

              <motion.div
                whileHover={{ scale: 1.02 }}
                transition={{ type: "spring", stiffness: 300 }}
                className="space-y-2"
              >
                <Label htmlFor="requiredDocuments" className="text-lg font-semibold text-blue-900">
                  Required Documents
                </Label>
                <Textarea
                  id="requiredDocuments"
                  name="requiredDocuments"
                  value={formData.requiredDocuments}
                  onChange={handleInputChange}
                  placeholder="List required documents for next hearing..."
                  className="min-h-[100px] resize-none w-full rounded-lg border-2 border-blue-300 focus:border-blue-500 focus:ring focus:ring-blue-200 transition duration-200"
                />
              </motion.div>

              <motion.div
                whileHover={{ scale: 1.02 }}
                transition={{ type: "spring", stiffness: 300 }}
                className="space-y-2"
              >
                <Label htmlFor="additionalRemark" className="text-lg font-semibold text-blue-900">
                  Additional Remark
                </Label>
                <Textarea
                  id="additionalRemark"
                  name="additionalRemark"
                  value={formData.additionalRemark}
                  onChange={handleInputChange}
                  placeholder="Optional remarks..."
                  className="min-h-[100px] resize-none w-full rounded-lg border-2 border-blue-300 focus:border-blue-500 focus:ring focus:ring-blue-200 transition duration-200"
                />
              </motion.div>

              <motion.div
                whileHover={{ scale: 1.02 }}
                transition={{ type: "spring", stiffness: 300 }}
                className="space-y-2"
              >
                <Label htmlFor="courtOrder" className="text-lg font-semibold text-blue-900">
                  Upload Court Order
                </Label>
                <div className="relative">
                  <Input
                    id="courtOrder"
                    name="courtOrder"
                    type="file"
                    onChange={handleInputChange}
                    className="cursor-pointer opacity-0 absolute inset-0 w-full h-full"
                    accept=".pdf,.doc,.docx"
                  />
                  <div className="bg-blue-100 text-blue-800 rounded-lg p-4 flex items-center justify-center border-2 border-blue-300 hover:bg-blue-200 transition duration-200">
                    <Upload className="w-6 h-6 mr-2" />
                    <span>Choose file or drag and drop</span>
                  </div>
                </div>
              </motion.div>

              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button 
                  type="submit"
                  className="w-full bg-gradient-to-r from-blue-700 to-blue-500 text-white text-lg py-3 rounded-lg hover:from-blue-800 hover:to-blue-600 transition duration-300 transform hover:-translate-y-1 hover:shadow-lg"
                >
                  Submit
                </Button>
              </motion.div>
            </form>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}
