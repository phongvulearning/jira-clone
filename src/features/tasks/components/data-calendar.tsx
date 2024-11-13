import { useState } from "react";
import { Calendar, dateFnsLocalizer } from "react-big-calendar";

import { enUS } from "date-fns/locale";

import { Task } from "../type";
import {
  addMonths,
  format,
  getDay,
  parse,
  startOfWeek,
  subMonths,
} from "date-fns";
import { Button } from "@/components/ui/button";
import { CalendarIcon, ChevronLeft, ChevronRight } from "lucide-react";
import { EventCard } from "./event-card";

import "react-big-calendar/lib/css/react-big-calendar.css";
import "./date-calendar.css";

const locales = {
  "en-US": enUS,
};

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales,
});

interface DataCalanderProps {
  data: Task[];
}

interface CustomToolbarProps {
  onNavigate: (action: "PREV" | "NEXT" | "TODAY") => void;
  date: Date | string;
}

const CustomToolbar = ({ onNavigate, date }: CustomToolbarProps) => {
  return (
    <div className="flex bg-4 gap-x-2 items-center w-full lg:w-auto justify-center lg:justify-start">
      <Button
        onClick={() => onNavigate("PREV")}
        variant="secondary"
        size="icon"
      >
        <ChevronLeft className="size-4" />
      </Button>
      <div className="flex items-center border border-input rounded-md px-3 py-2 h-8 w-full  lg:w-auto">
        <CalendarIcon className="size-4 mr-2" />
        <p className="text-sm">{format(date, "MMMM yyyy")}</p>
      </div>
      <Button
        onClick={() => onNavigate("NEXT")}
        variant="secondary"
        size="icon"
      >
        <ChevronRight className="size-4" />
      </Button>
    </div>
  );
};

export const DataCalander = ({ data }: DataCalanderProps) => {
  const [value, setValue] = useState(
    data.length > 0 ? data[0].dueDate : new Date()
  );

  const events = data.map((task) => ({
    start: new Date(task.dueDate),
    end: new Date(task.dueDate),
    title: task.name,
    project: task.project,
    assignee: task.assignee,
    status: task.status,
    id: task.$id,
  }));

  const handleNavigate = (date: "PREV" | "NEXT" | "TODAY") => {
    setValue(
      date === "PREV"
        ? subMonths(value, 1)
        : date === "NEXT"
        ? addMonths(value, 1)
        : new Date()
    );
  };

  return (
    <Calendar
      events={events}
      localizer={localizer}
      date={value}
      views={["month"]}
      defaultView="month"
      showAllEvents
      className="h-full"
      max={new Date(new Date().setFullYear(new Date().getFullYear() + 1))}
      formats={{
        weekdayFormat: (date, culture, localizer) =>
          localizer?.format(date, "EEE", culture) ?? "",
      }}
      components={{
        eventWrapper: ({ event }) => <EventCard {...event} />,
        toolbar: () => (
          <CustomToolbar onNavigate={handleNavigate} date={value} />
        ),
      }}
    />
  );
};
