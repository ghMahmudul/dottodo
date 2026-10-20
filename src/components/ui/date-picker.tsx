import {
  Ban,
  CalendarDays,
  Calendar as CalendarIcon,
  Check,
  Repeat,
  Sun,
  Sunrise,
} from "lucide-react";
import { useEffect, useState } from "react";
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
import {
  formatRepeatLabel,
  parseRepeatRule,
  REPEAT_PRESETS,
} from "@/core/repeat-utils";
import { cn } from "@/lib/utils";

function toDate(dateStr: string): Date {
  const parts = dateStr.split("-").map(Number);
  return new Date(parts[0] ?? 0, (parts[1] ?? 1) - 1, parts[2] ?? 1);
}

function formatDate(dateStr: string): string {
  const d = toDate(dateStr);
  return d.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

export const DATE_QUICK_OPTIONS: {
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

const QUICK_OPTIONS = DATE_QUICK_OPTIONS;

const CUSTOM_UNITS: { label: string; value: "days" | "weeks" | "months" }[] = [
  { label: "days", value: "days" },
  { label: "weeks", value: "weeks" },
  { label: "months", value: "months" },
];

interface DatePickerProps {
  value: string;
  onChange: (value: string) => void;
  repeat?: string;
  onRepeatChange?: (value: string) => void;
  className?: string;
  triggerClassName?: string;
  variant?: "outline" | "ghost";
  placeholder?: string;
  iconClassName?: string;
}

export function DatePicker({
  value,
  onChange,
  repeat,
  onRepeatChange,
  className,
  triggerClassName,
  variant = "ghost",
  placeholder,
  iconClassName,
}: DatePickerProps) {
  const [open, setOpen] = useState(false);

  const selectedDate = value ? toDate(value) : undefined;

  const isCustomRepeat =
    repeat !== undefined &&
    repeat !== "" &&
    !REPEAT_PRESETS.some((p) => p.value === repeat);
  const parsedCustom = isCustomRepeat ? parseRepeatRule(repeat) : null;

  const [showCustom, setShowCustom] = useState(isCustomRepeat);
  const [customInterval, setCustomInterval] = useState(
    parsedCustom?.interval ?? 2,
  );
  const [customUnit, setCustomUnit] = useState<"days" | "weeks" | "months">(
    parsedCustom?.unit ?? "days",
  );

  useEffect(() => {
    if (isCustomRepeat && parsedCustom) {
      setShowCustom(true);
      setCustomInterval(parsedCustom.interval);
      if (parsedCustom.unit) setCustomUnit(parsedCustom.unit);
    }
  }, [repeat, isCustomRepeat, parsedCustom]);

  const handlePresetClick = (presetValue: string) => {
    if (!onRepeatChange) return;
    if (repeat === presetValue) {
      onRepeatChange("");
    } else {
      onRepeatChange(presetValue);
      setShowCustom(false);
    }
  };

  const handleCustomToggle = () => {
    if (!onRepeatChange) return;
    if (showCustom && isCustomRepeat) {
      onRepeatChange("");
      setShowCustom(false);
    } else {
      setShowCustom(true);
      const newValue = `every ${customInterval} ${customUnit}`;
      onRepeatChange(newValue);
    }
  };

  const handleCustomIntervalChange = (newInterval: number) => {
    if (!onRepeatChange) return;
    const clamped = Math.max(1, Math.min(99, newInterval));
    setCustomInterval(clamped);
    onRepeatChange(`every ${clamped} ${customUnit}`);
  };

  const handleCustomUnitChange = (newUnit: "days" | "weeks" | "months") => {
    if (!onRepeatChange) return;
    setCustomUnit(newUnit);
    onRepeatChange(`every ${customInterval} ${newUnit}`);
  };

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
        {repeat && <Repeat className="size-3 text-muted-foreground" />}
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
          {onRepeatChange && (
            <div className="border-t border-border p-2">
              <div className="flex items-center gap-1.5 px-1 pb-1.5">
                <Repeat className="size-3.5 text-muted-foreground" />
                <span className="text-xs font-medium text-muted-foreground">
                  Repeat
                  {repeat ? `: ${formatRepeatLabel(repeat)}` : ""}
                </span>
              </div>
              <div className="flex flex-wrap gap-1">
                {REPEAT_PRESETS.map((preset) => (
                  <button
                    key={preset.value}
                    type="button"
                    className={cn(
                      "px-2.5 py-1 text-xs rounded-md border transition-colors",
                      repeat === preset.value
                        ? "bg-primary text-primary-foreground border-primary"
                        : "bg-transparent text-foreground border-border hover:bg-accent",
                    )}
                    onClick={() => handlePresetClick(preset.value)}
                  >
                    {preset.label}
                  </button>
                ))}
                <button
                  type="button"
                  className={cn(
                    "px-2.5 py-1 text-xs rounded-md border transition-colors",
                    isCustomRepeat
                      ? "bg-primary text-primary-foreground border-primary"
                      : "bg-transparent text-foreground border-border hover:bg-accent",
                  )}
                  onClick={handleCustomToggle}
                >
                  Custom
                </button>
              </div>
              {showCustom && (
                <div className="flex items-center gap-1.5 mt-2 px-0.5">
                  <span className="text-xs text-muted-foreground">Every</span>
                  <input
                    type="number"
                    min={1}
                    max={99}
                    value={customInterval}
                    onChange={(e) =>
                      handleCustomIntervalChange(
                        Number.parseInt(e.target.value, 10) || 1,
                      )
                    }
                    className="w-12 h-7 text-xs text-center rounded-md border border-border bg-transparent focus:outline-none focus:ring-1 focus:ring-ring"
                  />
                  <div className="flex rounded-md border border-border overflow-hidden">
                    {CUSTOM_UNITS.map((u) => (
                      <button
                        key={u.value}
                        type="button"
                        className={cn(
                          "px-2 py-1 text-xs transition-colors",
                          customUnit === u.value
                            ? "bg-primary text-primary-foreground"
                            : "bg-transparent text-foreground hover:bg-accent",
                        )}
                        onClick={() => handleCustomUnitChange(u.value)}
                      >
                        {u.label}
                      </button>
                    ))}
                  </div>
                  {isCustomRepeat && (
                    <Check className="size-3.5 text-primary" />
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
