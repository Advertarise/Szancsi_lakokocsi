"use client"

import Image from "next/image"
import { useRef, useState } from "react"
import { AnimatePresence, motion } from "motion/react"
import { ChevronLeftIcon, ChevronRightIcon, ExpandIcon, XIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog"
import type { CamperImage } from "@/lib/camper-types"
import { asset } from "@/lib/site"
import { cn } from "@/lib/utils"

type Filter = "all" | CamperImage["category"]

const filters: { value: Filter; label: string }[] = [
  { value: "all", label: "Összes" },
  { value: "exterior", label: "Kívülről" },
  { value: "interior", label: "Belülről" },
]

export function GalleryGrid({ images }: { images: CamperImage[] }) {
  const [filter, setFilter] = useState<Filter>("all")
  const [openIndex, setOpenIndex] = useState<number | null>(null)
  const triggers = useRef<(HTMLButtonElement | null)[]>([])
  const lastOpened = useRef(0)
  const visible = filter === "all" ? images : images.filter((i) => i.category === filter)

  return (
    <>
      <div role="group" aria-label="Képek szűrése" className="mb-8 flex justify-center gap-2">
        {filters.map((f) => (
          <Button
            key={f.value}
            type="button"
            variant={filter === f.value ? "default" : "outline"}
            size="lg"
            className="rounded-full"
            aria-pressed={filter === f.value}
            onClick={() => setFilter(f.value)}
          >
            {f.label}
          </Button>
        ))}
      </div>

      <ul className="grid auto-rows-[150px] grid-cols-2 gap-3 sm:auto-rows-[190px] md:grid-cols-4 md:gap-4">
        {visible.map((img, i) => (
          <motion.li
            key={img.src}
            layout
            initial={{ opacity: 0, scale: 0.97 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: Math.min(i, 6) * 0.05 }}
            className={cn(i === 0 && "col-span-2 row-span-2", i === 3 && "md:col-span-2")}
          >
            <button
              type="button"
              ref={(el) => {
                triggers.current[i] = el
              }}
              onClick={() => {
                lastOpened.current = i
                setOpenIndex(i)
              }}
              className="group relative block size-full overflow-hidden rounded-2xl bg-muted shadow-sm focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-ring"
            >
              <Image
                src={asset(img.src)}
                alt={img.alt}
                fill
                sizes={i === 0 ? "(min-width: 768px) 50vw, 100vw" : "(min-width: 768px) 25vw, 50vw"}
                className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
              />
              <span className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-80 transition-opacity group-hover:opacity-100" />
              {img.caption && (
                <span className="absolute inset-x-0 bottom-0 p-3 text-left text-sm font-medium text-white sm:p-4">
                  {img.caption}
                </span>
              )}
              <span className="absolute top-3 right-3 flex size-8 items-center justify-center rounded-full bg-black/40 text-white opacity-0 backdrop-blur transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100">
                <ExpandIcon className="size-4" aria-hidden="true" />
              </span>
              <span className="sr-only">Kép megnyitása nagyban</span>
            </button>
          </motion.li>
        ))}
      </ul>

      <Lightbox
        images={visible}
        index={openIndex}
        onIndexChange={setOpenIndex}
        onClosed={() => triggers.current[lastOpened.current]?.focus()}
      />
    </>
  )
}

function Lightbox({
  images,
  index,
  onIndexChange,
  onClosed,
}: {
  images: CamperImage[]
  index: number | null
  onIndexChange: (i: number | null) => void
  /** Bezáráskor a fókusz visszakerül a megnyitó képre */
  onClosed: () => void
}) {
  const touchStart = useRef<number | null>(null)
  const [direction, setDirection] = useState(1)
  const current = index !== null ? images[index] : null

  function go(delta: number) {
    if (index === null) return
    setDirection(delta)
    onIndexChange((index + delta + images.length) % images.length)
  }

  return (
    <Dialog open={current !== null} onOpenChange={(open) => !open && onIndexChange(null)}>
      <DialogContent
        showCloseButton={false}
        className="flex h-dvh w-screen max-w-none flex-col gap-0 rounded-none bg-black/95 p-0 text-white ring-0 sm:max-w-none"
        onCloseAutoFocus={(e) => {
          e.preventDefault()
          onClosed()
        }}
        onKeyDown={(e) => {
          if (e.key === "ArrowRight") go(1)
          if (e.key === "ArrowLeft") go(-1)
        }}
        onTouchStart={(e) => (touchStart.current = e.touches[0].clientX)}
        onTouchEnd={(e) => {
          if (touchStart.current === null) return
          const dx = e.changedTouches[0].clientX - touchStart.current
          if (Math.abs(dx) > 50) go(dx < 0 ? 1 : -1)
          touchStart.current = null
        }}
      >
        {current && index !== null && (
          <>
            <div className="flex items-center justify-between p-3 sm:p-4">
              <p className="text-sm text-white/80" aria-live="polite">
                {index + 1} / {images.length}
              </p>
              <DialogTitle className="sr-only">{current.caption ?? current.alt}</DialogTitle>
              <DialogDescription className="sr-only">
                A nyilakkal vagy lapozással válthatsz a képek között, az Escape billentyűvel bezárhatod.
              </DialogDescription>
              <DialogClose asChild>
                <Button variant="ghost" size="icon-lg" className="rounded-full text-white hover:bg-white/15 hover:text-white">
                  <XIcon className="size-6" />
                  <span className="sr-only">Galéria bezárása</span>
                </Button>
              </DialogClose>
            </div>

            <div className="relative flex-1 overflow-hidden">
              <AnimatePresence initial={false} custom={direction} mode="popLayout">
                <motion.div
                  key={current.src}
                  custom={direction}
                  initial={{ opacity: 0, x: direction * 60 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: direction * -60 }}
                  transition={{ duration: 0.3, ease: "easeOut" }}
                  className="absolute inset-0 mx-4 sm:mx-20"
                >
                  <Image src={asset(current.src)} alt={current.alt} fill sizes="100vw" className="object-contain" />
                </motion.div>
              </AnimatePresence>

              <Button
                variant="ghost"
                size="icon-lg"
                onClick={() => go(-1)}
                className="absolute top-1/2 left-2 size-12 -translate-y-1/2 rounded-full bg-black/40 text-white hover:bg-white/20 hover:text-white sm:left-4"
                aria-label="Előző kép"
              >
                <ChevronLeftIcon className="size-6" />
              </Button>
              <Button
                variant="ghost"
                size="icon-lg"
                onClick={() => go(1)}
                className="absolute top-1/2 right-2 size-12 -translate-y-1/2 rounded-full bg-black/40 text-white hover:bg-white/20 hover:text-white sm:right-4"
                aria-label="Következő kép"
              >
                <ChevronRightIcon className="size-6" />
              </Button>
            </div>

            <p className="p-4 text-center text-sm text-white/85 sm:p-6">{current.caption ?? current.alt}</p>
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}
