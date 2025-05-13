// hooks/useFriendsRealtime.ts
import { useEffect } from "react"
import { registerListener } from "./realtimeListener"

export function useFriendsRealtime(onChange: () => void) {
  useEffect(() => {
    registerListener("friend_requests", onChange)
    registerListener("users", onChange)
    registerListener("friends", onChange)
  }, [onChange])
}