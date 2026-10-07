import {
  Ban,
  CalendarDays,
  Calendar as CalendarIcon,
  Sun,
  Sunrise,
} from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  formatLocalDate,
  getFutureLocalDateString,
  getTodayLocalDateString,
} from "@/core/date-utils";
import { cn } from "@/lib/utils";

function toDate(dateStr: string): Date {
  const parts = dateStr.split("-").map(Number);
  return new Date(parts[0] ?? 0, (parts[1] ?? 1) - 1, parts[2] ?? 1);
}

function formatDate(dateStr: string): string {
  const d = toDate(dateStr);
  return d.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

const QUICK_OPTIONS: {
  label: string;
  getValue: () => string;
  icon: React.ComponentType<{ className?: string }>;
}[] = [
  {
    label: "Today",
    getValue: () => getTodayLocalDateString(),
    icon: Sun,
  },
  {
    label: "Tomorrow",
    getValue: () => getFutureLocalDateString(1),
    icon: Sunrise,
  },
  {
    label: "Next Week",
    getValue: () => getFutureLocalDateString(7),
    icon: CalendarDays,
  },
  {
    label: "No Date",
    getValue: () => "",
    icon: Ban,
  },
];

interface DatePickerProps {
  value: string;
  onChange: (value: string) => void;
  className?: string;
  triggerClassName?: string;
  variant?: "outline" | "ghost";
  placeholder?: string;
  iconClassName?: string;
}

export function DatePicker({
  value,
  onChange,
  className,
  triggerClassName,
  variant = "ghost",
  placeholder,
  iconClassName,
}: DatePickerProps) {
  const [open, setOpen] = useState(false);

  const selectedDate = value ? toDate(value) : undefined;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        render={
          <Button
            variant={variant}
            size="sm"
            className={triggerClassName ?? `h-8 ${value ? "gap-1.5" : ""}`}
          />
        }
      >
        <CalendarIcon
          className={cn(
            "size-4",
            value ? "" : "text-muted-foreground",
            iconClassName,
          )}
        />
        {value ? (
          <span>{formatDate(value)}</span>
        ) : (
          placeholder && <span>{placeholder}</span>
        )}
      </PopoverTrigger>
      <PopoverContent className={`w-auto p-0 ${className ?? ""}`}>
        <div className="flex flex-col">
          <div className="flex flex-col p-1 border-b border-border">
            {QUICK_OPTIONS.map((opt) => {
              return (
                <Button
                  key={opt.label}
                  variant="ghost"
                  size="sm"
                  className="h-8 justify-between px-3 text-sm rounded-md"
                  onClick={() => {
                    onChange(opt.getValue());
                    setOpen(false);
                  }}
                >
                  <span className="flex items-center gap-2">
                    <opt.icon className="size-4" />
                    {opt.label}
                  </span>
                </Button>
              );
            })}
          </div>
          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={(day) => {
              if (day) {
                onChange(formatLocalDate(day));
                setOpen(false);
              }
            }}
          />
        </div>
      </PopoverContent>
    </Popover>
  );
}
