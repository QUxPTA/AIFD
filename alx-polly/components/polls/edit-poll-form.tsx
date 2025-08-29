"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Plus, X, ArrowLeft } from "lucide-react"
import Link from "next/link"
import { getPoll, updatePoll } from "@/lib/db"
import type { Poll, UpdatePollData, ApiResponse } from "@/lib/types"

interface EditPollFormProps {
  pollId: string
}

export function EditPollForm({ pollId }: EditPollFormProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [isLoadingPoll, setIsLoadingPoll] = useState(true)
  const [error, setError] = useState<string>("")
  const [success, setSuccess] = useState<string>("")
  const [poll, setPoll] = useState<Poll | null>(null)
  
  // Form state
  const [question, setQuestion] = useState("")
  const [description, setDescription] = useState("")
  const [options, setOptions] = useState<string[]>(["", ""])
  const [allowMultipleVotes, setAllowMultipleVotes] = useState(false)
  const [isAnonymous, setIsAnonymous] = useState(false)
  const [expiresAt, setExpiresAt] = useState("")

  useEffect(() => {
    loadPoll()
  }, [pollId])

  const loadPoll = async () => {
    try {
      setIsLoadingPoll(true)
      const result = await getPoll(pollId)
      
      if (result.success && result.data) {
        const pollData = result.data
        setPoll(pollData as Poll) // Cast since we need the basic poll data
        
        // Populate form fields
        setQuestion(pollData.question || "")
        setDescription(pollData.description || "")
        setAllowMultipleVotes(pollData.allow_multiple_votes || false)
        setIsAnonymous(pollData.is_anonymous || false)
        setExpiresAt(pollData.expires_at ? new Date(pollData.expires_at).toISOString().slice(0, 16) : "")
        
        // Handle options - they might be in options_with_results format
        if (pollData.options_with_results) {
          const optionTexts = pollData.options_with_results.map((opt: any) => opt.option_text || opt.text)
          setOptions([...optionTexts, ""])
        } else if (pollData.options) {
          const optionTexts = pollData.options.map((opt: any) => opt.text || opt)
          setOptions([...optionTexts, ""])
        }
      } else {
        setError(result.error || 'Failed to load poll')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unexpected error occurred')
    } finally {
      setIsLoadingPoll(false)
    }
  }

  // Add new option
  const addOption = () => {
    if (options.length < 10) {
      setOptions([...options, ""])
    }
  }

  // Remove option
  const removeOption = (index: number) => {
    if (options.length > 2) {
      setOptions(options.filter((_, i) => i !== index))
    }
  }

  // Update option
  const updateOption = (index: number, value: string) => {
    const newOptions = [...options]
    newOptions[index] = value
    setOptions(newOptions)
  }

  // Form validation
  const validateForm = () => {
    if (!question.trim()) {
      return "Poll question is required"
    }

    const validOptions = options.filter(opt => opt.trim().length > 0)
    if (validOptions.length < 2) {
      return "At least 2 options are required"
    }

    if (expiresAt && new Date(expiresAt) <= new Date()) {
      return "Expiry date must be in the future"
    }

    return null
  }

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setSuccess("")

    const validationError = validateForm()
    if (validationError) {
      setError(validationError)
      return
    }

    setIsLoading(true)

    try {
      const validOptions = options.filter(opt => opt.trim().length > 0)
      
      // Convert string options to PollOption objects
      const formattedOptions = validOptions.map((text, index) => ({
        id: `option_${index + 1}`,
        text: text.trim(),
      }))

      const pollData: UpdatePollData = {
        question: question.trim(),
        description: description.trim() || undefined,
        options: formattedOptions,
        allow_multiple_votes: allowMultipleVotes,
        is_anonymous: isAnonymous,
        expires_at: expiresAt || undefined
      }

      const result = await updatePoll(pollId, pollData)

      if (result.success) {
        setSuccess("Poll updated successfully! Redirecting...")
        setError("")
        
        setTimeout(() => {
          router.push(`/dashboard/polls/${pollId}`)
        }, 1500)
      } else {
        setError(result.error || "Failed to update poll")
        setSuccess("")
      }
    } catch (err) {
      console.error("Error updating poll:", err)
      setError("An unexpected error occurred")
      setSuccess("")
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoadingPoll) {
    return (
      <Card className="w-full">
        <CardContent className="p-6">
          <div className="text-center">Loading poll...</div>
        </CardContent>
      </Card>
    )
  }

  if (!poll) {
    return (
      <Card className="w-full">
        <CardContent className="p-6">
          <div className="text-center text-red-600">
            {error || 'Poll not found'}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center space-x-4">
          <Button variant="ghost" size="sm" asChild>
            <Link href={`/dashboard/polls/${pollId}`}>
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <CardTitle>Edit Poll</CardTitle>
            <CardDescription>
              Update your poll question, options, and settings
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Error Display */}
          {error && (
            <div className="p-3 text-sm text-red-700 bg-red-50 border border-red-200 rounded-md">
              {error}
            </div>
          )}

          {/* Success Display */}
          {success && (
            <div className="p-3 text-sm text-green-700 bg-green-50 border border-green-200 rounded-md">
              {success}
            </div>
          )}

          {/* Question */}
          <div className="space-y-2">
            <Label htmlFor="question">
              Poll Question <span className="text-red-500">*</span>
            </Label>
            <Input
              id="question"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="What would you like to ask?"
              maxLength={500}
              required
            />
            <p className="text-sm text-gray-500">
              {question.length}/500 characters
            </p>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Description (optional)</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Add more context to your poll..."
              maxLength={1000}
              rows={3}
            />
            <p className="text-sm text-gray-500">
              {description.length}/1000 characters
            </p>
          </div>

          {/* Options */}
          <div className="space-y-4">
            <Label>Poll Options <span className="text-red-500">*</span></Label>
            {options.map((option, index) => (
              <div key={index} className="flex items-center space-x-2">
                <Input
                  value={option}
                  onChange={(e) => updateOption(index, e.target.value)}
                  placeholder={`Option ${index + 1}`}
                  maxLength={200}
                />
                {options.length > 2 && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removeOption(index)}
                    className="text-red-500 hover:text-red-700"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>
            ))}
            
            {options.length < 10 && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addOption}
                className="w-full"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Option
              </Button>
            )}
          </div>

          {/* Settings */}
          <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
            <h3 className="font-medium">Poll Settings</h3>
            
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label htmlFor="multiple-votes">Allow Multiple Votes</Label>
                <p className="text-sm text-gray-500">
                  Let users select multiple options
                </p>
              </div>
              <Switch
                id="multiple-votes"
                checked={allowMultipleVotes}
                onCheckedChange={setAllowMultipleVotes}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label htmlFor="anonymous">Anonymous Voting</Label>
                <p className="text-sm text-gray-500">
                  Hide voter identities in results
                </p>
              </div>
              <Switch
                id="anonymous"
                checked={isAnonymous}
                onCheckedChange={setIsAnonymous}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="expires-at">Expiry Date (optional)</Label>
              <Input
                id="expires-at"
                type="datetime-local"
                value={expiresAt}
                onChange={(e) => setExpiresAt(e.target.value)}
                min={new Date().toISOString().slice(0, 16)}
              />
              <p className="text-sm text-gray-500">
                Leave empty for no expiry
              </p>
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex justify-end space-x-4">
            <Button type="button" variant="outline" asChild>
              <Link href={`/dashboard/polls/${pollId}`}>Cancel</Link>
            </Button>
            <Button 
              type="submit" 
              disabled={isLoading}
              className="min-w-[120px]"
            >
              {isLoading ? 'Updating...' : 'Update Poll'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
