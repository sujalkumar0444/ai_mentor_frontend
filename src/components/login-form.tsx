"use client"

import { z } from "zod"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import Link from "next/link"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import pb from "@/lib/pb"
import { useAuth } from "@/stores/auth";
import { Loader2 } from "lucide-react"

const loginSchema = z.object({
  email: z.string().email("Invalid email"),
  password: z.string().min(8, "Password must be at least 6 characters"),
})

export function LoginForm({
  className,
  ...props
}: React.ComponentProps<"form">) {
  const router = useRouter()
  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(loginSchema),
  })
  const { setUser } = useAuth();
  const [loading, setLoading] = useState(false)
  const [apiError, setApiError] = useState<string | null>(null)

  const onSubmit = async (data: any) => {
    setLoading(true)
    setApiError(null)
    try {
      const user = await pb.collection("users").authWithPassword(
        data.email,
        data.password
      )
      if (user.record.role === "mentor") {
        const mentor = await pb.collection("mentors").getFirstListItem(
          `user_id="${user.record.id}"`
        )
        user.record.mentor = mentor
        setUser(user)
        return router.push('/mentor/availability')  // Redirect to mentor availability page
      } else if (user.record.role === "freelancer") {
        
      }
      setUser(user);
      router.push("/")  // Redirect to home page after successful login
    } catch (error: any) {
      console.error("❌ Login Failed:", error)
      setApiError(error?.message || "Invalid login credentials.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className={cn("flex flex-col gap-6", className)} {...props}>
      <div className="flex flex-col items-center gap-2 text-center">
        <h1 className="text-2xl font-bold">Login to your account</h1>
        <p className="text-muted-foreground text-sm text-balance">
          Enter your email below to login to your account
        </p>
      </div>
      {apiError && <p className="text-sm text-red-500 text-center">{apiError}</p>}
      <div className="grid gap-6">

        {/* Email */}
        <div className="grid gap-3">
          <Label htmlFor="email">Email</Label>
          <Input id="email" type="email" {...register("email")} />
          {errors.email && <p className="text-sm text-red-500">{errors.email.message}</p>}
        </div>

        {/* Password */}
        <div className="grid gap-3">
          <div className="flex items-center">
            <Label htmlFor="password">Password</Label>
            <a href="#" className="ml-auto text-sm underline-offset-4 hover:underline">
              Forgot your password?
            </a>
          </div>
          <Input id="password" type="password" {...register("password")} />
          {errors.password && <p className="text-sm text-red-500">{errors.password.message}</p>}
        </div>

        {/* Submit Button */}
        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Login"}
        </Button>
      </div>

      <div className="text-center text-sm">
        Don&apos;t have an account?{" "}
        <Link href="/register" className="underline underline-offset-4">
          Register
        </Link>
      </div>
    </form>
  )
}
