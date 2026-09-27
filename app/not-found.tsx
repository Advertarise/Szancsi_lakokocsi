import Link from "next/link"
import { CompassIcon } from "lucide-react"

import { PageShell, StatusCard } from "@/components/layout/page-shell"
import { Button } from "@/components/ui/button"

export default function NotFound() {
  return (
    <PageShell>
      <StatusCard icon={<CompassIcon />} title="Letértünk az útról">
        <p>Ez az oldal nem létezik, vagy elköltözött. Irány vissza a főoldalra!</p>
        <Button asChild variant="sunset" size="lg">
          <Link href="/">Vissza a főoldalra</Link>
        </Button>
      </StatusCard>
    </PageShell>
  )
}
