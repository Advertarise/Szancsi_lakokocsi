"use client"

import type { ReactNode } from "react"
import type { FieldPath, UseFormReturn } from "react-hook-form"

import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"
import type { BookingFormData, BookingFormValues } from "@/lib/validation"

export type BookingForm = UseFormReturn<BookingFormValues, unknown, BookingFormData>
type Name = FieldPath<BookingFormValues>

export function fieldId(name: string) {
  return `mezo-${name}`
}

export function errorOf(form: BookingForm, name: Name): string | undefined {
  const error = form.formState.errors[name as keyof BookingFormValues]
  return typeof error?.message === "string" ? error.message : undefined
}

export function FieldMessage({ id, error, hint }: { id: string; error?: string; hint?: string }) {
  if (error) {
    return (
      <p id={`${id}-hiba`} className="text-sm font-medium text-destructive">
        {error}
      </p>
    )
  }
  return hint ? (
    <p id={`${id}-sugo`} className="text-xs text-muted-foreground">
      {hint}
    </p>
  ) : null
}

export function describedBy(id: string, error?: string, hint?: string) {
  return error ? `${id}-hiba` : hint ? `${id}-sugo` : undefined
}

export function TextField({
  form,
  name,
  label,
  hint,
  className,
  optional,
  ...inputProps
}: {
  form: BookingForm
  name: Exclude<Name, "guestCount" | "acceptTerms" | "acceptPrivacy" | "paymentOption">
  label: ReactNode
  hint?: string
  className?: string
  optional?: boolean
} & Omit<React.ComponentProps<"input">, "name" | "form">) {
  const id = fieldId(name)
  const error = errorOf(form, name)
  return (
    <div className={cn("space-y-1.5", className)}>
      <Label htmlFor={id} className="text-sm font-medium">
        {label}
        {optional && <span className="font-normal text-muted-foreground"> (nem kötelező)</span>}
      </Label>
      <Input
        id={id}
        className="h-11 rounded-xl bg-background px-3 text-base"
        aria-invalid={!!error}
        aria-required={!optional}
        aria-describedby={describedBy(id, error, hint)}
        {...inputProps}
        {...form.register(name)}
      />
      <FieldMessage id={id} error={error} hint={hint} />
    </div>
  )
}
