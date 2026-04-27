"use client";

import * as React from "react";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { id } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { DateRange } from "react-day-picker";

interface SingleProps {
  mode?: "single";
  value: Date;
  callback: (date: Date) => void;
  disabled?: boolean;
}

interface RangeProps {
  mode: "range";
  value: DateRange;
  callback: (range: DateRange) => void;
  disabled?: boolean;
}

type DatePickerProps = SingleProps | RangeProps;

export function DatePicker(props : DatePickerProps){
  const { mode = "single", disabled = false } = props;
  const label = () => {
    if (mode === "range") {
      const { value } = props as RangeProps;
      if (value?.from && value?.to)
        return `${format(value.from, "dd LLL y", { locale: id })} – ${format(value.to, "dd LLL y", { locale: id })}`;
      if (value?.from)
        return format(value.from, "dd LLL y", { locale: id });
      return <span>Pilih periode</span>;
    }

    const { value } = props as SingleProps;
    return value
      ? format(value, "LLLL dd, y", { locale: id })
      : <span>Tanggal Kedatangan</span>;
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant={"outline"}
          className={cn(
            "w-full justify-start text-left font-normal",
            !props.value && "text-muted-foreground"
          )}
          disabled={disabled}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {label()}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        {mode === "range" ? (
          <div>
            {((props as RangeProps).value?.from || (props as RangeProps).value?.to) && (
              <div className="flex justify-between items-center px-3 py-2 border-b">
                <span className="text-xs text-muted-foreground">
                  {(props as RangeProps).value?.from && !(props as RangeProps).value?.to
                    ? "Pilih tanggal akhir"
                    : "Periode dipilih"}
                </span>
                <button
                  onClick={() => (props as RangeProps).callback({ from: undefined, to: undefined })}
                  className="text-xs text-destructive hover:underline"
                >
                  Reset
                </button>
              </div>
            )}
            <Calendar
              mode="range"
              selected={(props as RangeProps).value}
              onSelect={(range) => range && (props as RangeProps).callback(range)}
              numberOfMonths={2}
              initialFocus
            />
          </div>
        ) : (
          <Calendar
            mode="single"
            selected={(props as SingleProps).value}
            onSelect={(date) => date && (props as SingleProps).callback(date)}
            initialFocus
          />
        )}
      </PopoverContent>
    </Popover>
  );
}
