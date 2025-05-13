import { supabase } from "../supabase/supabaseClient"

type TableListenerMap = {
  [tableName: string]: (() => void)[]
}

const listeners: TableListenerMap = {}
const debounceMap: { [key: string]: NodeJS.Timeout | null } = {}
const DEBOUNCE_DELAY = 300 // milliseconds

export function registerListener(table: string, cb: () => void) {
  if (!listeners[table]) listeners[table] = []
  listeners[table].push(cb)
}

export function startGlobalRealtimeListener(tables: string[]) {
  tables.forEach((table) => {
    supabase
      .channel(`global:${table}`)
      .on("postgres_changes", { event: "*", schema: "public", table }, (payload) => {
        console.log(`Global change on ${table}:`, payload)

        // Clear any existing debounce timer
        if (debounceMap[table]) {
          clearTimeout(debounceMap[table]!)
        }

        // Set a new debounce timer
        debounceMap[table] = setTimeout(() => {
          listeners[table]?.forEach((cb) => cb())
          debounceMap[table] = null
        }, DEBOUNCE_DELAY)
      })
      .subscribe()
  })
}
