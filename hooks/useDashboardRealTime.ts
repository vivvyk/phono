// hooks/useDashboardRealtime.ts
import { useEffect } from "react"
import { registerListener } from "./realtimeListener"

export function useDashboardRealtime(onChange: () => void) {
  useEffect(() => {
    registerListener("transactions", onChange)
    registerListener("users", onChange)
    registerListener("friends", onChange)
    registerListener("notifications", onChange)
  }, [onChange])
}