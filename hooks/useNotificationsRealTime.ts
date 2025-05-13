// hooks/useDashboardRealtime.ts
import { useEffect } from "react"
import { registerListener } from "./realtimeListener"

export function useNotificationsRealTime(onChange: () => void) {
  useEffect(() => {
    registerListener("notifications", onChange)
  }, [onChange])
}