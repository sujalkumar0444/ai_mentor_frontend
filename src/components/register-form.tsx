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
import { Loader2 } from "lucide-react"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

const formSchema = z
  .object({
    email: z.string().email("Invalid email"),
    password: z.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string(),
    role: z.enum(["mentor", "freelancer", "user"], {
      required_error: "Please select a role",
    }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  })

  type FormData = z.infer<typeof formSchema>

export function RegisterForm({
  className,
  ...props
}: React.ComponentProps<"form">) {
  const router = useRouter()
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(formSchema),
  })

  const [loading, setLoading] = useState(false)
  const [apiError, setApiError] = useState<string | null>(null)

  const onSubmit = async (data: FormData) => {
    setLoading(true)
    setApiError(null)
    try {
      const user = await pb.collection("users").create({
        email: data.email,
        password: data.password,
        passwordConfirm: data.confirmPassword,
        role: data.role,
      })
      if (data.role === "mentor") {
        await pb.collection("mentors").create({
          user_id: user.id,
          availability: {},
        })
      } else if (data.role === "freelancer") {
        // await pb.collection("freelancers").create({
        //   user_id: user.id,
        // })
      }
      router.push("/login")
    } catch (error: any) {
      console.error("❌ Registration Failed:", error)
      if (error?.data?.data?.email?.code === "validation_not_unique") {
        setApiError("Email is already registered. Please use a different email.")
      } else {
        setApiError(error?.message || "An error occurred during registration")
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className={cn("flex flex-col gap-6", className)}
      {...props}
    >
      <div className="flex flex-col items-center gap-2 text-center">
        <h1 className="text-2xl font-bold">Register new account</h1>
        <p className="text-muted-foreground text-sm text-balance">
          Enter your email below to register new account
        </p>
      </div>

      {apiError && <p className="text-sm text-red-500 text-center">{apiError}</p>}

      <div className="grid gap-6">
        <div className="grid gap-3">
          <Label htmlFor="role">Select Role</Label>
          <Select onValueChange={(val) => setValue("role", val as any)}>
            <SelectTrigger id="role" className="w-full">
              <SelectValue placeholder="Select a role" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="mentor">Mentor</SelectItem>
              <SelectItem value="freelancer">Freelancer</SelectItem>
              <SelectItem value="user">Normal User</SelectItem>
            </SelectContent>
          </Select>
          {errors.role && (
            <p className="text-sm text-red-500">{errors.role.message}</p>
          )}
        </div>

        <div className="grid gap-3">
          <Label htmlFor="email">Email</Label>
          <Input id="email" type="email" {...register("email")} />
          {errors.email && (
            <p className="text-sm text-red-500">{errors.email.message}</p>
          )}
        </div>

        <div className="grid gap-3">
          <Label htmlFor="password">Password</Label>
          <Input id="password" type="password" {...register("password")} />
          {errors.password && (
            <p className="text-sm text-red-500">{errors.password.message}</p>
          )}
        </div>

        <div className="grid gap-3">
          <Label htmlFor="confirmPassword">Confirm Password</Label>
          <Input
            id="confirmPassword"
            type="password"
            {...register("confirmPassword")}
          />
          {errors.confirmPassword && (
            <p className="text-sm text-red-500">
              {errors.confirmPassword.message}
            </p>
          )}
        </div>

        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Register"}
        </Button>
      </div>

      <div className="text-center text-sm">
        Already have an account?{" "}
        <Link href="/login" className="underline underline-offset-4">
          Login
        </Link>
      </div>
    </form>
  )
}
