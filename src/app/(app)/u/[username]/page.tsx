"use client"

import { useParams } from 'next/navigation'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import { toast } from 'sonner'
import axios, { AxiosError } from 'axios'
import { ApiResponse } from '@/types/ApiResponse'
import { Loader2 } from 'lucide-react'
import Link from 'next/link'

const SendMessagePage = () => {
  const params = useParams<{ username: string }>()
  const username = params.username
  const [message, setMessage] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isSuggestLoading, setIsSuggestLoading] = useState(false)
  const [suggestedMessages, setSuggestedMessages] = useState<string[]>([])

  const handleSendMessage = async () => {
    if (!message.trim()) {
      toast.error("Error", {
        description: "Please enter a message"
      })
      return
    }

    if (message.length < 10) {
      toast.error("Error", {
        description: "Message must be at least 10 characters"
      })
      return
    }

    setIsLoading(true)
    try {
      const response = await axios.post<ApiResponse>('/api/send-message', {
        username,
        content: message
      })
      
      toast.success("Success", {
        description: response.data.message
      })
      setMessage('')
    } catch (error) {
      const axiosError = error as AxiosError<ApiResponse>
      toast.error("Error", {
        description: axiosError.response?.data.message || "Failed to send message"
      })
    } finally {
      setIsLoading(false)
    }
  }

  const fetchSuggestedMessages = async () => {
    setIsSuggestLoading(true)
    try {
      const response = await fetch('/api/suggest-messages', {
        method: 'POST'
      })

      if (!response.ok) {
        throw new Error('Failed to fetch suggestions')
      }

      const text = await response.text()
      // Split by || to get individual suggestions
      const suggestions = text.split('||').map(s => s.trim()).filter(Boolean)
      setSuggestedMessages(suggestions)
      
      toast.success("Success", {
        description: "Suggestions loaded!"
      })
    } catch (error) {
      console.error('Error fetching suggestions:', error)
      toast.error("Error", {
        description: "Failed to load suggestions"
      })
    } finally {
      setIsSuggestLoading(false)
    }
  }

  const handleSuggestionClick = (suggestion: string) => {
    setMessage(suggestion)
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-2">Send Anonymous Message</h1>
          <p className="text-gray-600">to @{username}</p>
        </div>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Your Anonymous Message</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Textarea
              placeholder="Write your anonymous message here..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="min-h-[150px]"
              maxLength={300}
            />
            <div className="text-sm text-gray-500 text-right">
              {message.length}/300 characters
            </div>
            <Button 
              onClick={handleSendMessage} 
              disabled={isLoading}
              className="w-full"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Sending...
                </>
              ) : (
                'Send Anonymous Message'
              )}
            </Button>
          </CardContent>
        </Card>

        <Separator className="my-6" />

        <Card>
          <CardHeader>
            <CardTitle>Need Inspiration?</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button 
              onClick={fetchSuggestedMessages}
              disabled={isSuggestLoading}
              variant="outline"
              className="w-full"
            >
              {isSuggestLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Loading Suggestions...
                </>
              ) : (
                'Suggest Messages'
              )}
            </Button>

            {suggestedMessages.length > 0 && (
              <div className="space-y-2">
                <p className="text-sm text-gray-600 mb-2">Click on a suggestion to use it:</p>
                {suggestedMessages.map((suggestion, index) => (
                  <Card 
                    key={index}
                    className="cursor-pointer hover:bg-gray-100 transition-colors"
                    onClick={() => handleSuggestionClick(suggestion)}
                  >
                    <CardContent className="p-4">
                      <p className="text-sm">{suggestion}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <div className="mt-8 text-center">
          <p className="text-gray-600 mb-4">Want to receive anonymous messages too?</p>
          <Link href="/sign-up">
            <Button variant="outline">Create Your Account</Button>
          </Link>
        </div>
      </div>
    </div>
  )
}

export default SendMessagePage