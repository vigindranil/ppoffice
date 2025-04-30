import Link from 'next/link'
import { AlertTriangle } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card"

export default function UnauthorizedPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <Card className="w-[350px]">
        <CardHeader>
          <div className="w-20 h-20 rounded-full bg-yellow-100 flex items-center justify-center mx-auto mb-4">
            <AlertTriangle className="h-10 w-10 text-yellow-600" />
          </div>
          <CardTitle className="text-2xl font-bold text-red-600 text-center">Unauthorized Access !</CardTitle>
          <CardDescription className="text-center">
            You don't have permission to access this page.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-center text-gray-600">
            If you believe this is an error, please contact your system administrator or try logging in again.
          </p>
        </CardContent>
        <CardFooter className="flex justify-center">
          <Button asChild>
            <Link href="/logout">
              Return to Login
            </Link>
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}

