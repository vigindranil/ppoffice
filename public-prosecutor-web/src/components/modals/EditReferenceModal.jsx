// components/modals/EditReferenceModal.jsx
import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { Command, CommandInput, CommandList, CommandEmpty, CommandGroup, CommandItem } from "@/components/ui/command";
import { Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";

export const EditReferenceModal = ({ isOpen, onClose, reference, onSaveChanges, referenceList = [], years = [] }) => {
  const [editedData, setEditedData] = useState(null);
  const [openRefTypeDropdown, setOpenRefTypeDropdown] = useState(false);
  const [openYearDropdown, setOpenYearDropdown] = useState(false);

  useEffect(() => {
    if (reference) {
      setEditedData({ ...reference }); // Copy initial data
    } else {
      setEditedData(null);
    }
  }, [reference, isOpen]);

  const handleInputChange = (field, value) => {
    setEditedData(prev => ({ ...prev, [field]: value }));
  };

   const handleRefTypeSelect = (crmID) => {
     setEditedData(prev => ({ ...prev, crmID: crmID }));
     setOpenRefTypeDropdown(false);
   };

   const handleYearSelect = (year) => {
     setEditedData(prev => ({ ...prev, refferenceyear: year }));
     setOpenYearDropdown(false);
   };

  const handleSave = () => {
    if (!editedData) return;

    // Add validation if needed (e.g., ensure fields aren't empty)
    if (!editedData.crmID || !editedData.refferenceNumber?.trim() || !editedData.refferenceyear) {
        alert("Please fill all reference fields.");
        return;
    }

    onSaveChanges(editedData);
    onClose();
  };

  if (!isOpen || !reference || !editedData) {
    return null;
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Reference</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-2">
           {/* Reference Type Dropdown */}
           <div className="space-y-2">
                <Label>Reference Type</Label>
                <Popover open={openRefTypeDropdown} onOpenChange={setOpenRefTypeDropdown}>
                    <PopoverTrigger asChild>
                    <Button variant="outline" role="combobox" className="w-full justify-between">
                        {editedData.crmID
                        ? referenceList.find(ref => ref.refferenceId.toString() === editedData.crmID)?.refferenceName
                        : "Select Reference Type"}
                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-[--radix-popover-trigger-width] max-h-[--radix-popover-content-available-height]">
                         <Command>
                            <CommandInput placeholder="Search reference type..." />
                            <CommandList>
                            <CommandEmpty>No type found.</CommandEmpty>
                            <CommandGroup>
                                {referenceList.map((ref) => (
                                <CommandItem
                                    key={ref.refferenceId}
                                    value={ref.refferenceName}
                                    onSelect={() => handleRefTypeSelect(ref.refferenceId.toString())}
                                >
                                    <Check className={cn("mr-2 h-4 w-4", editedData.crmID === ref.refferenceId.toString() ? "opacity-100" : "opacity-0")} />
                                    {ref.refferenceName}
                                </CommandItem>
                                ))}
                            </CommandGroup>
                            </CommandList>
                        </Command>
                    </PopoverContent>
                </Popover>
           </div>

           {/* Reference Number Input */}
           <div className="space-y-2">
                <Label htmlFor="editRefNum">Reference Number</Label>
                <Input
                    id="editRefNum"
                    value={editedData.refferenceNumber || ""}
                    onChange={(e) => handleInputChange('refferenceNumber', e.target.value)}
                    placeholder="Enter reference number"
                />
           </div>

           {/* Reference Year Dropdown */}
            <div className="space-y-2">
                <Label>Reference Year</Label>
                <Popover open={openYearDropdown} onOpenChange={setOpenYearDropdown}>
                    <PopoverTrigger asChild>
                    <Button variant="outline" role="combobox" className="w-full justify-between">
                        {editedData.refferenceyear || "Select Year"}
                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-[--radix-popover-trigger-width] max-h-[--radix-popover-content-available-height]">
                        <Command>
                             <CommandInput placeholder="Search year..." />
                            <CommandList>
                                <CommandEmpty>No year found.</CommandEmpty>
                                <CommandGroup>
                                    {years.map((year) => (
                                    <CommandItem
                                        key={year}
                                        value={year}
                                        onSelect={() => handleYearSelect(year)}
                                    >
                                        <Check className={cn("mr-2 h-4 w-4", editedData.refferenceyear === year ? "opacity-100" : "opacity-0")} />
                                        {year}
                                    </CommandItem>
                                    ))}
                                </CommandGroup>
                            </CommandList>
                        </Command>
                    </PopoverContent>
                </Popover>
           </div>

        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="ghost" onClick={onClose}>Cancel</Button>
          </DialogClose>
          <Button onClick={handleSave}>Save Changes</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};