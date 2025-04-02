"use client"
import { createContext, useContext, useState } from "react"
import dayjs from "dayjs"

const DateContext = createContext<{
  selectedDate: string
  setSelectedDate: (date: string) => void
} | null>(null)

export function DateProvider({ children }: { children: React.ReactNode }) {
  const [selectedDate, setSelectedDate] = useState<string>(dayjs().format("YYYY-MM-DD"))

  return (
    <DateContext.Provider value={{ selectedDate, setSelectedDate }}>
      {children}
    </DateContext.Provider>
  )
}

export function useDate() {
  const context = useContext(DateContext)
  if (!context) throw new Error("useDate must be used within DateProvider")
  return context
}