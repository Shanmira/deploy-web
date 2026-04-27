"use client";

import * as React from "react";
import { Check, ChevronsUpDown } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useEffect } from "react";
import { DatePicker } from "./datepicker";

export function Combobox({
  options,
  placeholder = "Pilih Opsi...",
  label = "Opsi",
  defaultValue = "",
  disabled,
  callback = () => {},
}: {
  options: { value: string; label: string }[];
  placeholder?: string;
  label?: string;
  defaultValue?: string;
  disabled?: boolean;
  callback?: (value: string) => void;
}) {
  const [open, setOpen] = React.useState(false);
  const [value, setValue] = React.useState("");
  const [searchInput, setSearchInput] = React.useState("");

  useEffect(() => {
    setValue(defaultValue);
    setSearchInput(defaultValue);
  }, [defaultValue]);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className=" justify-between"
          disabled={disabled}
        >
          <span className="text-xs md:text-sm text-gray-600 truncate">
            {value ? value : placeholder}
          </span>

          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="left-0 p-0 bg-green-500">
        <Command>
          <CommandInput
            placeholder={`Cari ${label}`}
            value={searchInput}
            onValueChange={(e) => setSearchInput(e)}
          />
          <CommandList>
            {/* <CommandEmpty>{searchInput} tidak ditemukan</CommandEmpty> */}

            <CommandGroup>
              {searchInput !== "" &&
                !options.find((o) =>
                  o.value
                    .toLowerCase()
                    .includes(searchInput.toLowerCase().trim())
                ) && (
                  <CommandItem
                    value={searchInput}
                    onSelect={(currentValue) => {
                      setValue(currentValue === value ? "" : currentValue);
                      setOpen(false);
                      callback(currentValue);
                    }}
                  >
                    <Check className={cn("mr-2 h-4 w-4", "opacity-100")} />
                    <span className="text-xs md:text-sm text-gray-600">
                      {searchInput}
                    </span>
                  </CommandItem>
                )}

              {options.map((option, id) => (
                <CommandItem
                  key={id}
                  value={option.value}
                  onSelect={(currentValue) => {
                    setValue(currentValue === value ? "" : currentValue);
                    setOpen(false);
                    callback(currentValue);
                  }}
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      value === option.value ? "opacity-100" : "opacity-0"
                    )}
                  />
                  <span className="text-xs md:text-sm text-gray-600">
                    {option.label}
                  </span>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}

export const InputText = ({
  label,
  name,
  value = "",
  disabled = false,
  required = false,
  placeholder = "",
  type = "text",
  onChange = () => {},
}: {
  label: string;
  name: string;
  value?: string;
  disabled?: boolean;
  required?: boolean;
  placeholder?: string;
  type?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
}) => {
  return (
    <div className="flex flex-col gap-2">
      <label className="text-sm md:text-sm text-gray-600" htmlFor={name}>
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <input
        name={name}
        type={type}
        value={value}
        onChange={onChange}
        disabled={disabled}
        placeholder={placeholder}
        className="text-xs md:text-sm border p-2 rounded-md focus:outline-sky-700"
      />
    </div>
  );
};

export const ComboboxWithLabel = ({
  label,
  name,
  value = "",
  disabled = false,
  required = false,
  options = [],
  onChange = () => {},
}: {
  label: string;
  name: string;
  value?: string;
  disabled?: boolean;
  required?: boolean;
  options: { value: string; label: string }[];
  onChange?: (s: string) => void;
}) => {
  return (
    <div className="flex flex-col gap-2">
      <label className="text-xs md:text-sm text-gray-600" htmlFor={name}>
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <Combobox
        options={options}
        placeholder={`Pilih ${name}`}
        label={name}
        defaultValue={value}
        callback={onChange}
        disabled={disabled}
      ></Combobox>
    </div>
  );
};
export const InputTextArea = ({
  label,
  name,
  value = "",
  disabled = false,
  required = false,
  placeholder = "",
  onChange = () => {},
}: {
  label: string;
  name: string;
  value?: string;
  disabled?: boolean;
  required?: boolean;
  placeholder?: string;
  onChange?: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
}) => {
  return (
    <div className="flex flex-col gap-2">
      <label className="text-xs md:text-base text-gray-600" htmlFor={name}>
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <textarea
        name={name}
        rows={3}
        value={value}
        onChange={onChange}
        disabled={disabled}
        placeholder={placeholder}
        className="text-xs md:text-sm border p-2 rounded-md focus:outline-sky-700"
      />
    </div>
  );
};

export const DatePickerWithLable = ({
  label,
  value = new Date(),
  disabled = false,
  required = false,
  onChange = () => {},
}: {
  label: string;
  value?: Date;
  disabled?: boolean;
  required?: boolean;
  onChange?: (date: Date) => void;
}) => {
  return (
    <div className="flex flex-col gap-2">
      <label className="text-xs md:text-sm text-gray-600">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <DatePicker callback={onChange} value={value} disabled={disabled} />   
    </div>
  );
};
