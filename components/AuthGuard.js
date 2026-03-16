"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { getStoredUser } from "@/lib/auth"

export default function AuthGuard({ children }) {
  const router = useRouter()
  const [ready, setReady] = useState(false)
  const [currentUser, setCurrentUser] = useState(null)

  useEffect(() => {
    const user = getStoredUser()

    if (!user) {
      router.replace("/login")
      return
    }

    setCurrentUser(user)
    setReady(true)
  }, [router])

  if (!ready) {
    return (
      <div style={{padding:40}}>
        Loading...
      </div>
    )
  }

  return children(currentUser)
}
