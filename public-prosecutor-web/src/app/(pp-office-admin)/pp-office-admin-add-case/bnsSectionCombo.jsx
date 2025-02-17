"use client";

import * as React from "react";
import { Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
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

export function BnsSectionComboBox({ bnsSections, onSelect }) {
  const [open, setOpen] = React.useState(false);
  const [value, setValue] = React.useState("");

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between"
        >
          {value
            ? bnsSections.find((section) => section.bnsId.toString() === value)
                ?.bnsSection
            : "Select BNS Section"}
          <ChevronsUpDown className="opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full p-0">
        <Command>
          <CommandInput placeholder="Search BNS Section..." className="h-9" />
          <CommandList>
            <CommandEmpty>No BNS Section found.</CommandEmpty>
            <CommandGroup>
              {bnsSections.map((section) => (
                <CommandItem
                  key={section.bnsId}
                  value={section.bnsSection}
                  onSelect={(currentValue) => {
                    const selected = bnsSections.find(
                      (s) => s.bnsSection === currentValue
                    );
                    console.log("Selected BNS ID:", selected?.bnsId);
                    const newValue = selected?.bnsId.toString();
                    setValue(newValue);
                    onSelect(selected?.bnsId);
                    setOpen(false);
                  }}
                >
                  {section.bnsSection}
                  <Check
                    className={cn(
                      "ml-auto",
                      value === section.bnsId.toString()
                        ? "opacity-100"
                        : "opacity-0"
                    )}
                  />
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
