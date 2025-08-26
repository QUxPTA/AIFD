// Custom hooks for the polling app

import { useState, useEffect } from 'react'
import { Poll, User } from '@/lib/types'

export function usePolls(options?: {
  authorId?: string
  isActive?: boolean
}) {
  const [polls, setPolls] = useState<Poll[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    // TODO: Implement polls fetching
    const fetchPolls = async () => {
      try {
        setIsLoading(true)
        // const data = await getPolls(options)
        // setPolls(data)
        setPolls([])
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred')
      } finally {
        setIsLoading(false)
      }
    }

    fetchPolls()
  }, [options?.authorId, options?.isActive])

  return { polls, isLoading, error, refetch: () => {} }
}

export function usePoll(pollId: string) {
  const [poll, setPoll] = useState<Poll | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    // TODO: Implement poll fetching
    const fetchPoll = async () => {
      try {
        setIsLoading(true)
        // const data = await getPoll(pollId)
        // setPoll(data)
        setPoll(null)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred')
      } finally {
        setIsLoading(false)
      }
    }

    if (pollId) {
      fetchPoll()
    }
  }, [pollId])

  return { poll, isLoading, error, refetch: () => {} }
}

export function useLocalStorage<T>(key: string, initialValue: T) {
  const [storedValue, setStoredValue] = useState<T>(() => {
    if (typeof window === 'undefined') {
      return initialValue
    }
    try {
      const item = window.localStorage.getItem(key)
      return item ? JSON.parse(item) : initialValue
    } catch (error) {
      console.log(error)
      return initialValue
    }
  })

  const setValue = (value: T | ((val: T) => T)) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value
      setStoredValue(valueToStore)
      if (typeof window !== 'undefined') {
        window.localStorage.setItem(key, JSON.stringify(valueToStore))
      }
    } catch (error) {
      console.log(error)
    }
  }

  return [storedValue, setValue] as const
}

export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value)

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value)
    }, delay)

    return () => {
      clearTimeout(handler)
    }
  }, [value, delay])

  return debouncedValue
}
