"use client"

import { useEffect } from "react"

/** Sikeres foglalás után töröljük a böngészőfülön tárolt űrlap-piszkozatot. */
export function ClearBookingDraft() {
  useEffect(() => {
    try {
      sessionStorage.removeItem("roadnest-foglalas-vazlat")
    } catch {
      // nem elérhető tárhely – nincs mit törölni
    }
  }, [])
  return null
}
