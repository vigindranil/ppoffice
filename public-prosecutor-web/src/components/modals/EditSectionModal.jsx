// components/modals/EditSectionModal.jsx
import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
// Import necessary components for standard section dropdown if implementing
// import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
// import { Command, CommandInput, CommandList, CommandEmpty, CommandGroup, CommandItem } from "@/components/ui/command";
// import { Check, ChevronsUpDown } from "lucide-react";

export const EditSectionModal = ({ isOpen, onClose, section, onSaveChanges, ipcActList = [], bnsSectionList = [], useIpcDisplay = true }) => {
  const [editedData, setEditedData] = useState(null);
  const [openDropdown, setOpenDropdown] = useState(false); // For standard section dropdown

  useEffect(() => {
    // Initialize local state when the modal opens or the section changes
    if (section) {
      setEditedData({ ...section.data }); // Copy initial data
    } else {
      setEditedData(null);
    }
  }, [section, isOpen]);

  const handleInputChange = (field, value) => {
    setEditedData(prev => ({ ...prev, [field]: value }));
  };

  const handleDropdownSelect = (bnsId) => {
     // Find the corresponding IPC section label (or BNS if needed)
     const item = ipcActList.find(i => i.bnsId?.toString() === bnsId?.toString());
     setEditedData(prev => ({
         ...prev,
         bnsId: bnsId,
         ipcSection: item?.ipcSection || prev.ipcSection // Update label if found
     }));
     setOpenDropdown(false);
  };

  const handleSave = () => {
    if (!editedData) return;

    // Basic validation for 'other' type
    if (section?.type === 'other' && !editedData.ipcValue?.trim() && !editedData.bnsValue?.trim()) {
      alert("Please enter at least an IPC Act or BNS Section for 'Other' sections.");
      return;
    }
    // Add validation for 'standard' type if needed

    onSaveChanges(editedData); // Pass the updated data back
    onClose(); // Close the modal
  };

  if (!isOpen || !section || !editedData) {
    return null; // Don't render if not open or no section data
  }

  const { type } = section;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Section</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-2">
          {type === 'standard' && (
            <div className="space-y-2">
               <Label>Standard Section</Label>
               {/* --- Standard Section Dropdown (Example - Requires ipcActList/bnsSectionList) --- */}
               {/*
               <Popover open={openDropdown} onOpenChange={setOpenDropdown}>
                 <PopoverTrigger asChild>
                   <Button variant="outline" className="w-full justify-between">
                     {editedData.ipcSection || "Select Section..."}
                     <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                   </Button>
                 </PopoverTrigger>
                 <PopoverContent className="w-[--radix-popover-trigger-width] max-h-[--radix-popover-content-available-height]">
                   <Command>
                     <CommandInput placeholder="Search section..." />
                     <CommandList>
                       <CommandEmpty>No section found.</CommandEmpty>
                       <CommandGroup>
                         {(useIpcDisplay ? ipcActList : bnsSectionList).map((item) => (
                           <CommandItem
                             key={item.bnsId}
                             value={useIpcDisplay ? item.ipcSection : item.bnsSection}
                             onSelect={() => handleDropdownSelect(item.bnsId)}
                           >
                             <Check className={cn("mr-2 h-4 w-4", editedData.bnsId === item.bnsId ? "opacity-100" : "opacity-0")} />
                             {useIpcDisplay ? item.ipcSection : item.bnsSection}
                           </CommandItem>
                         ))}
                       </CommandGroup>
                     </CommandList>
                   </Command>
                 </PopoverContent>
               </Popover>
               */}
                <p className="text-sm text-gray-600">
                    Editing standard sections via dropdown in modal needs implementation.
                    Currently showing: <span className="font-semibold">{editedData.ipcSection} (ID: {editedData.bnsId})</span>
                 </p>
            </div>
          )}

          {type === 'other' && (
            <>
              <div className="space-y-2">
                <Label htmlFor="editOtherIpc">Other IPC Act</Label>
                <Input
                  id="editOtherIpc"
                  value={editedData.ipcValue || ""}
                  onChange={(e) => handleInputChange('ipcValue', e.target.value)}
                  placeholder="Enter other IPC Act"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="editOtherBns">Corresponding BNS Section</Label>
                <Input
                  id="editOtherBns"
                  value={editedData.bnsValue || ""}
                  onChange={(e) => handleInputChange('bnsValue', e.target.value)}
                  placeholder="Enter corresponding BNS section"
                />
              </div>
            </>
          )}
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