"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import pb from "@/lib/pb"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import { format, isAfter, isBefore } from "date-fns"

type MentorUser = {
  name?: string
}

type Mentor = {
  expand?: {
    user_id?: MentorUser
  }
}

type Session = {
  id: string
  startTime: string
  endTime: string
  expand?: {
    mentor_id?: Mentor
  }
}

export default function UserSessionsPage() {
  const [sessions, setSessions] = useState<Session[]>([])
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const now = new Date()

  useEffect(() => {
    const fetchSessions = async () => {
      try {
        const currentUser = pb.authStore.model
        if (!currentUser) {
          toast.error("You must be logged in.")
          return
        }

        const res = await pb.collection("meetings").getFullList<Session>({
          filter: `user_id = "${currentUser.id}"`,
          expand: "mentor_id.user_id",
          sort: "-startTime",
        })

        setSessions(res)
      } catch (err) {
        console.error("Error fetching sessions:", err)
        toast.error("Failed to load your sessions.")
      } finally {
        setLoading(false)
      }
    }

    fetchSessions()
  }, [])

  if (loading) return <div className="p-6">Loading sessions...</div>
  if (sessions.length === 0)
    return <div className="p-6 text-muted-foreground">No sessions booked yet.</div>

  return (
    <div className="max-w-3xl mx-auto p-6 space-y-4">
      <h1 className="text-xl font-semibold">Your Sessions</h1>

      {sessions.map((session) => {
        const start = new Date(session.startTime)
        const end = new Date(session.endTime)

        const isLive = isAfter(now, start) && isBefore(now, end)
        const isPast = isAfter(now, end)

        const mentorName =
          session.expand?.mentor_id?.expand?.user_id?.name || "Unknown Mentor"

        return (
          <Card key={session.id} className="rounded-xl">
            <CardContent className="p-4 space-y-2">
              <p className="text-sm text-muted-foreground">
                <span className="font-semibold">Mentor:</span> {mentorName}
              </p>
              <p className="text-sm">
                <span className="font-semibold">Time:</span>{" "}
                {format(start, "PPP p")} – {format(end, "p")}
              </p>
              <Button
                className="cursor-pointer"
                disabled={!isLive}
                variant={isLive ? "default" : "secondary"}
                onClick={() => {
                  if (isLive) {
                    toast.success("Joining session...")
                    router.push(`/meet/?roomID=${session.id}`)
                  } else {
                    toast.info("Session is not live yet.")
                  }
                }}
              >
                {isPast ? "Session Ended" : isLive ? "Join Session" : "Upcoming"}
              </Button>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
