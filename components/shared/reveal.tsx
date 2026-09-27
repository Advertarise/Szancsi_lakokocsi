"use client"

import { motion, MotionConfig } from "motion/react"
import type { ReactNode } from "react"

/** Görgetésre finoman beúszó tartalom. A „csökkentett mozgás” beállítást tiszteletben tartja. */
export function Reveal({
  children,
  delay = 0,
  className,
  y = 24,
}: {
  children: ReactNode
  delay?: number
  className?: string
  y?: number
}) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "0px 0px -80px 0px" }}
      transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1], delay }}
    >
      {children}
    </motion.div>
  )
}

export function MotionProvider({ children }: { children: ReactNode }) {
  return <MotionConfig reducedMotion="user">{children}</MotionConfig>
}
