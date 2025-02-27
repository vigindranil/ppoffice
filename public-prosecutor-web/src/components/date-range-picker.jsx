import { useState } from "react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";

const DateRangePicker = ({ setKolkataPoliceRecords }) => {
  const [fromDate, setFromDate] = useState(null);
  const [toDate, setToDate] = useState(null);

  const handleDateChange = (date, type) => {
    if (type === "from") {
      setFromDate(date);
      setKolkataPoliceRecords((prev) => ({
        ...prev,
        from_date: date ? format(date, "yyyy-MM-dd") : "",
      }));
    } else {
      setToDate(date);
      setKolkataPoliceRecords((prev) => ({
        ...prev,
        to_date: date ? format(date, "yyyy-MM-dd") : "",
      }));
    }
  };

  return (
    <div className="flex gap-6">
      {/* From Date Picker */}
      <Popover>
        <PopoverTrigger asChild>
          <Button variant="outline" className="w-64 flex justify-between items-center">
            {fromDate ? format(fromDate, "PPP") : "Select From Date"}
            <CalendarIcon className="w-4 h-4 ml-2" />
          </Button>
        </PopoverTrigger>
        <PopoverContent align="start">
          <Calendar
            mode="single"
            selected={fromDate}
            onSelect={(date) => handleDateChange(date, "from")}
            initialFocus
          />
        </PopoverContent>
      </Popover>

      {/* To Date Picker */}
      <Popover>
        <PopoverTrigger asChild>
          <Button variant="outline" className="w-64 flex justify-between items-center">
            {toDate ? format(toDate, "PPP") : "Select To Date"}
            <CalendarIcon className="w-4 h-4 ml-2" />
          </Button>
        </PopoverTrigger>
        <PopoverContent align="start">
          <Calendar
            mode="single"
            selected={toDate}
            onSelect={(date) => handleDateChange(date, "to")}
            initialFocus
          />
        </PopoverContent>
      </Popover>
    </div>
  );
};

export default DateRangePicker;
