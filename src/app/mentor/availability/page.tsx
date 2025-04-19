"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { useDate } from "@/context/DateContext"
import dayjs from "dayjs"
import pb from "@/lib/pb" // Assuming pb is your PocketBase instance
import { useAuth } from "@/stores/auth"
import { any } from "zod"

const intervals = [
  "00 - 01", "01 - 02", "02 - 03", "03 - 04", "04 - 05", "05 - 06",
  "06 - 07", "07 - 08", "08 - 09", "09 - 10", "10 - 11", "11 - 12",
  "12 - 13", "13 - 14", "14 - 15", "15 - 16", "16 - 17", "17 - 18",
  "18 - 19", "19 - 20", "20 - 21", "21 - 22", "22 - 23", "23 - 24"
]

export default function Page() {
  const [mentorData, setMentorData] = useState<any>(null) // Store the mentor's full data
  const [availability, setAvailability] = useState<Record<string, any>>({})
  const [editMode, setEditMode] = useState(false)
  const { selectedDate, setSelectedDate } = useDate()
  const { user } = useAuth() 
  const mentorId = (user as { record: { mentor: { id: string } } })?.record?.mentor?.id

  // Fetch mentor data once on page load (or when user logs in)
  useEffect(() => {
    const fetchMentorData = async () => {
      try {
        const response = await pb.collection("mentors").getOne(mentorId) // Get mentor data by user_id
        setMentorData(response) // Store the entire mentor data
        setAvailability(response?.availability[selectedDate] || {}) // Set the availability for the selected date
      } catch (error) {
        console.error("Error fetching mentor data:", error)
      }
    }

    fetchMentorData()
  }, [mentorId]) // Only fetch once, when mentorId changes (e.g., on login)

  // If mentor data exists, you can simply set the availability for the selected date
  useEffect(() => {
    if (mentorData && selectedDate) {
      setAvailability(mentorData?.availability[selectedDate] || {})
    }
  }, [mentorData, selectedDate]) // Update availability when selectedDate changes

  const handleToggle = (interval: string) => {
    const now = dayjs()
    const selected = dayjs(selectedDate)
    const [startHour] = interval.split(" - ")
    const intervalTime = selected.hour(parseInt(startHour)).minute(0)

    if (!editMode || intervalTime.isBefore(now)) return

    if (availability[interval] === "booked") return // can't change booked

    setAvailability(prev => ({
      ...prev,
      [interval]: prev[interval] ? false : true
    }))
  }

  const getColor = (interval: string) => {
    const now = dayjs()
    const selected = dayjs(selectedDate)
    const [startHour] = interval.split(" - ")
    const intervalTime = selected.hour(parseInt(startHour)).minute(0)
  
    const isPast = intervalTime.isBefore(now)
  
    if (availability[interval] === "booked") {
      return `bg-blue-500 text-white ${isPast ? "cursor-not-allowed" : ""}`
    }
  
    if (availability[interval]) {
      return `bg-green-500 text-white ${isPast ? "cursor-not-allowed" : ""}`
    }
  
    if (isPast) return "bg-gray-300 cursor-not-allowed"
    return "bg-yellow-400 text-black"
  }

  const saveAvailability = async () => {
    try {
      // Prepare the updated availability data
      const updatedData = {
        availability: {
          ...mentorData.availability,
          [selectedDate]: availability, // Update only the selected date's availability
        }
      }

      // Update mentor's availability in PocketBase using the user_id
      const response = await pb.collection("mentors").update(mentorId, updatedData)
      console.log("Successfully saved availability:", response)

      // Optionally update the local mentorData state with the saved data
      setMentorData((prevData: any) => ({
        ...prevData,
        availability: {
          ...prevData.availability,
          [selectedDate]: availability, // Update local state
        }
      }))
      
      setEditMode(false) // Exit edit mode after saving
    } catch (error) {
      console.error("Error saving availability:", error)
    }
  }

  const isPastDate = dayjs(selectedDate).isBefore(dayjs(), "day")

  return (
    <div className="flex flex-col p-8 gap-4">
      <div className="flex items-center gap-4 mb-4">
        <input
          type="date"
          value={selectedDate}
          onChange={(e) => setSelectedDate(e.target.value)}
          className="border px-2 py-1 rounded"
        />
        {!isPastDate && (
          <Button onClick={() => setEditMode(prev => !prev)}>
            {editMode ? "Cancel Edit" : "Edit"}
          </Button>
        )}
        {editMode && (
          <Button onClick={saveAvailability}>Save</Button>
        )}
      </div>

      <div className="grid grid-cols-4 gap-3">
        {intervals.map(interval => (
          <button
            key={interval}
            className={`rounded px-4 py-2 font-medium ${getColor(interval)}`}
            onClick={() => handleToggle(interval)}
          >
            {interval}
          </button>
        ))}
      </div>
    </div>
  )
}
