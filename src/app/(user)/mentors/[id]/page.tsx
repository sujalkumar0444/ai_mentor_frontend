"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import pb from "@/lib/pb"
import { z } from "zod"
import { Avatar, AvatarImage } from "@/components/ui/avatar"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { format, isAfter } from "date-fns"
import { toast } from "sonner"
import { Skeleton } from "@/components/ui/skeleton"

const MentorSchema = z.object({
  id: z.string(),
  user_id: z.string(),
  bio: z.string().optional(),
  domain: z.string().optional(),
  sessions_took: z.number().optional(),
  rating: z.number().optional(),
  availability: z
    .record(
      z.string(),
      z.record(z.string(), z.union([z.literal(true), z.literal("booked")]))
    )
    .optional(),
  expand: z
    .object({
      user_id: z
        .object({
          id: z.string(),
          name: z.string().optional(),
          avatar: z.string().optional(),
        })
        .optional(),
    })
    .optional(),
})

type Mentor = z.infer<typeof MentorSchema>

export default function MentorProfileDetail() {
  const { id } = useParams()
  const router = useRouter()

  const [mentor, setMentor] = useState<Mentor | null>(null)
  const [selectedDate, setSelectedDate] = useState("")
  const [selectedTime, setSelectedTime] = useState("")
  const [pageLoading, setPageLoading] = useState(true)
  const [bookingLoading, setBookingLoading] = useState(false)

  const fetchMentor = async () => {
    setPageLoading(true)
    try {
      const res = await pb.collection("mentors").getOne(id as string, {
        expand: "user_id",
      })
      const parsed = MentorSchema.safeParse(res)
      if (parsed.success) {
        setMentor(parsed.data)
      } else {
        console.error("Mentor schema error:", parsed.error)
      }
    } catch (err) {
      console.error("Failed to fetch mentor:", err)
    } finally {
      setPageLoading(false)
    }
  }

  useEffect(() => {
    fetchMentor()
  }, [id])

  const futureDates = mentor?.availability
    ? Object.entries(mentor.availability)
        .filter(([date]) => isAfter(new Date(date), new Date()))
        .map(([date]) => date)
    : []

  const availableTimes =
    mentor?.availability?.[selectedDate] &&
    Object.entries(mentor.availability[selectedDate])
      .filter(([_, value]) => value === true)
      .map(([time]) => time)

  const handleBooking = async () => {
    if (!selectedDate || !selectedTime) {
      toast.warning("Please select both a date and time.")
      return
    }

    setBookingLoading(true)
    try {
      const currentUser = pb.authStore.model
      if (!currentUser) {
        toast.error("You must be logged in to book.")
        return
      }

      const [startHour] = selectedTime.split(" - ")
      const startTimeISO = new Date(`${selectedDate}T${startHour}:00:00Z`).toISOString()
      const endHour = String(parseInt(startHour) + 1).padStart(2, "0")
      const endTimeISO = new Date(`${selectedDate}T${endHour}:00:00Z`).toISOString()

      // Create meeting
      await pb.collection("meetings").create({
        user_id: currentUser.id,
        mentor_id: mentor?.id,
        startTime: startTimeISO,
        endTime: endTimeISO,
      })

      // Update mentor availability
      const updatedAvailability = { ...mentor?.availability }
      if (!updatedAvailability[selectedDate]) {
        updatedAvailability[selectedDate] = {}
      }
      updatedAvailability[selectedDate][selectedTime] = "booked"

      if (mentor) {
        await pb.collection("mentors").update(mentor.id, {
          availability: updatedAvailability,
        })
      }

      toast.success(`Session booked on ${selectedDate} at ${selectedTime}!`)
      setSelectedDate("")
      setSelectedTime("")
      await fetchMentor() // Refresh local state
    //   router.refresh() // Refresh route cache (optional but nice)
    } catch (err) {
      console.error("Booking error:", err)
      toast.error("Failed to book session. Please try again.")
    } finally {
      setBookingLoading(false)
    }
  }

  if (pageLoading) {
    return (
      <div className="max-w-3xl mx-auto p-6 space-y-4">
        <Skeleton className="h-48 w-full rounded-xl" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
      </div>
    )
  }

  if (!mentor) return <div className="p-6">Mentor not found</div>

  const user = mentor.expand?.user_id

  return (
    <div className="max-w-3xl mx-auto p-6 space-y-6">
      <Card className="shadow-md rounded-2xl">
        <CardContent className="p-6 flex flex-col md:flex-row items-center gap-6">
          <Avatar className="h-32 w-32">
            <AvatarImage
              src={user?.avatar || "/profile-avatar.webp"}
              alt={user?.name || "Mentor Avatar"}
            />
          </Avatar>

          <div className="flex-1 space-y-2">
            <p className="text-xl font-semibold">{user?.name || "Mentor"}</p>
            {mentor.bio && <p className="text-sm text-muted-foreground">{mentor.bio}</p>}
            {mentor.domain && (
              <p>
                <span className="font-semibold">Domain:</span>{" "}
                <Badge variant="outline">{mentor.domain}</Badge>
              </p>
            )}
            <p>
              <span className="font-semibold">Rating:</span> {mentor.rating || 0}
            </p>
            <p>
              <span className="font-semibold">Sessions:</span> {mentor.sessions_took || 0}
            </p>
          </div>
        </CardContent>
      </Card>

      <div className="space-y-4">
        <h2 className="text-lg font-semibold">Book a Session</h2>

        <Select onValueChange={setSelectedDate}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Select a date" />
          </SelectTrigger>
          <SelectContent>
            {futureDates.map((date) => (
              <SelectItem key={date} value={date}>
                {format(new Date(date), "PPP")}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {selectedDate && (
          <Select onValueChange={setSelectedTime}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select a time slot" />
            </SelectTrigger>
            <SelectContent>
              {availableTimes?.length ? (
                availableTimes.map((time) => (
                  <SelectItem key={time} value={time}>
                    {time}
                  </SelectItem>
                ))
              ) : (
                <div className="text-muted-foreground text-sm px-4 py-2">
                  No available time slots
                </div>
              )}
            </SelectContent>
          </Select>
        )}

        <Button
          className="w-full mt-2"
          onClick={handleBooking}
          disabled={!selectedDate || !selectedTime || bookingLoading}
        >
          {bookingLoading ? "Booking..." : "Book Session"}
        </Button>
      </div>
    </div>
  )
}
