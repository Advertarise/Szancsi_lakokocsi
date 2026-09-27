import { useSyncExternalStore } from "react"

const subscribe = () => () => {}

/**
 * `false` a szerveren és a hidratálás alatt, utána `true`. A statikusan
 * előállított oldalon így a mai dátumtól függő tartalom (pl. a naptár) csak a
 * böngészőben renderelődik, és nem tér el a build idején készült HTML-től.
 */
export function useHydrated(): boolean {
  return useSyncExternalStore(
    subscribe,
    () => true,
    () => false,
  )
}
