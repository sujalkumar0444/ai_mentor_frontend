"use client"

import * as React from "react"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { z } from "zod"
import pb from "@/lib/pb"
import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"

// Zod schema based on actual data
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
  created: z.string(),
  updated: z.string(),
  collectionId: z.string(),
  collectionName: z.string(),
  expand: z
    .object({
      user_id: z
        .object({
          id: z.string(),
          name: z.string().optional(),
          avatar: z.string().optional(),
          role: z.string().optional(),
          verified: z.boolean().optional(),
          emailVisibility: z.boolean().optional(),
          collectionId: z.string().optional(),
          collectionName: z.string().optional(),
          created: z.string().optional(),
          updated: z.string().optional(),
        })
        .optional(),
    })
    .optional(),
})

const MentorsResponseSchema = z.object({
  items: z.array(MentorSchema),
  page: z.number(),
  perPage: z.number(),
  totalItems: z.number(),
  totalPages: z.number(),
})

type Mentor = z.infer<typeof MentorSchema>

export default function MentorProfileCard() {
  const [mentors, setMentors] = useState<Mentor[]>([])
  const [loading, setLoading] = useState(true)
  const [isClient, setIsClient] = useState(false)

  const router = useRouter()

  useEffect(() => {
    setIsClient(true)
  }, [])

  useEffect(() => {
    const fetchMentors = async () => {
      try {
        const res = await pb.collection("mentors").getList(1, 500, {
          expand: "user_id",
        })

        const parsed = MentorsResponseSchema.safeParse(res)

        if (parsed.success) {
          setMentors(parsed.data.items)
        } else {
          console.error("Zod validation failed", parsed.error)
        }
      } catch (error) {
        console.error("Error fetching mentors:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchMentors()
  }, [])

  if (!isClient) return null

  if (loading) {
    return (
      <div className="flex flex-wrap justify-center gap-6 p-6">
        {[...Array(3)].map((_, i) => (
          <Skeleton key={i} className="h-64 w-full max-w-xl rounded-2xl" />
        ))}
      </div>
    )
  }

  return (
    <div className="flex flex-wrap justify-center gap-6 p-6">
      {mentors.map((mentor) => {
        const user = mentor.expand?.user_id

        return (
          <Card
            key={mentor.id}
            className="w-full max-w-xl shadow-md rounded-2xl cursor-pointer transition hover:shadow-lg"
            onClick={() => router.push(`/mentors/${mentor.id}`)}
          >
            <CardContent className="p-6">
              <div className="flex flex-col md:flex-row items-center gap-6">
                <div className="flex-1 space-y-2 text-left">
                  {user?.name && (
                    <p>
                      <span className="font-semibold">Name:</span> {user.name}
                    </p>
                  )}
                  {mentor.bio && mentor.bio.trim() && (
                    <p>
                      <span className="font-semibold">Bio:</span> {mentor.bio}
                    </p>
                  )}
                  {mentor.sessions_took !== undefined && (
                    <p>
                      <span className="font-semibold">Sessions:</span> {mentor.sessions_took}
                    </p>
                  )}
                  {mentor.rating !== undefined && (
                    <p>
                      <span className="font-semibold">Rating:</span> {mentor.rating}
                    </p>
                  )}
                  {mentor.domain && mentor.domain.trim() && (
                    <p>
                      <span className="font-semibold">Domain:</span>{" "}
                      <Badge variant="outline">{mentor.domain}</Badge>
                    </p>
                  )}
                </div>

                {/* Avatar */}
                <div className="flex-shrink-0">
                  <Avatar className="h-36 w-36">
                    <AvatarImage
                      src={user?.avatar || "/profile-avatar.webp"}
                      alt="Mentor Avatar"
                    />
                  </Avatar>
                </div>
              </div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
