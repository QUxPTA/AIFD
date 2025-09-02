"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Plus, X } from "lucide-react"

export function CreatePollForm() {
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [options, setOptions] = useState(["", ""])
  const [allowMultipleVotes, setAllowMultipleVotes] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const addOption = () => {
    setOptions([...options, ""])
  }

  const removeOption = (index: number) => {
    if (options.length > 2) {
      setOptions(options.filter((_, i) => i !== index))
    }
  }

  const updateOption = (index: number, value: string) => {
    const newOptions = [...options]
    newOptions[index] = value
    setOptions(newOptions)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    const pollData = {
      title,
      description,
      options: options.filter(option => option.trim() !== ""),
      allowMultipleVotes
    }

    // TODO: Submit to API
    console.log("Creating poll:", pollData)

    // Simulate API call
    setTimeout(() => {
      setIsLoading(false)
      // TODO: Redirect to poll page
    }, 1000)
  }

  const isValid = title.trim() && options.filter(opt => opt.trim()).length >= 2

  return (
    <Card>
      <CardHeader>
        <CardTitle>Poll Details</CardTitle>
        <CardDescription>
          Create an engaging poll with clear options for your audience
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Poll Title */}
          <div className="space-y-2">
            <Label htmlFor="title">Poll Title *</Label>
            <Input
              id="title"
              placeholder="What would you like to ask?"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>

          {/* Poll Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Description (Optional)</Label>
            <Textarea
              id="description"
              placeholder="Provide additional context or details about your poll"
              value={description}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setDescription(e.target.value)}
              rows={3}
            />
          </div>

          {/* Poll Options */}
          <div className="space-y-4">
            <Label>Poll Options *</Label>
            {options.map((option, index) => (
              <div key={index} className="flex items-center space-x-2">
                <Input
                  placeholder={`Option ${index + 1}`}
                  value={option}
                  onChange={(e) => updateOption(index, e.target.value)}
                  required
                />
                {options.length > 2 && (
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={() => removeOption(index)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>
            ))}
            
            <Button
              type="button"
              variant="outline"
              onClick={addOption}
              className="w-full"
            >
              <Plus className="mr-2 h-4 w-4" />
              Add Option
            </Button>
          </div>

          {/* Poll Settings */}
          <div className="space-y-4">
            <Label>Poll Settings</Label>
            <div className="flex items-center space-x-2">
              <Switch
                id="multiple-votes"
                checked={allowMultipleVotes}
                onCheckedChange={setAllowMultipleVotes}
              />
              <Label htmlFor="multiple-votes" className="text-sm">
                Allow multiple votes per user
              </Label>
            </div>
          </div>

          {/* Submit Button */}
          <Button type="submit" disabled={!isValid || isLoading} className="w-full">
            {isLoading ? "Creating Poll..." : "Create Poll"}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
