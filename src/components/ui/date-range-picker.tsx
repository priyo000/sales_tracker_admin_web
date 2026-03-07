"use client"

import { format } from "date-fns"
import { Calendar as CalendarIcon } from "lucide-react"
import { DateRange } from "react-day-picker"
import { id } from "date-fns/locale"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

import { Matcher } from "react-day-picker"

interface DatePickerWithRangeProps {
  date: DateRange | undefined
  onChange: (date: DateRange | undefined) => void
  alreadySelected?: Matcher | Matcher[]
  className?: string
  defaultMonth?: Date
}

export function DatePickerWithRange({
  date,
  onChange,
  alreadySelected,
  className,
  defaultMonth,
}: DatePickerWithRangeProps) {
  return (
    <div className={cn("grid gap-2", className)}>
      <Popover>
        <PopoverTrigger asChild>
          <Button
            id="date"
            variant={"outline"}
            className={cn(
              "w-full justify-start text-left font-normal h-9",
              !date && "text-muted-foreground"
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {date?.from ? (
              date.to ? (
                <>
                  {format(date.from, "LLL dd, y", { locale: id })} -{" "}
                  {format(date.to, "LLL dd, y", { locale: id })}
                </>
              ) : (
                format(date.from, "LLL dd, y", { locale: id })
              )
            ) : (
              <span>Pilih rentang tanggal</span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            initialFocus
            mode="range"
            defaultMonth={defaultMonth || date?.from}
            selected={date}
            onSelect={onChange}
            modifiers={{ booked: alreadySelected || [] }}
            modifiersClassNames={{ booked: "bg-orange-100/50 text-orange-700/80 font-semibold ring-1 ring-inset ring-orange-200/50 underline decoration-orange-300 underline-offset-2" }}
            numberOfMonths={2}
            locale={id}
          />
        </PopoverContent>
      </Popover>
    </div>
  )
}
