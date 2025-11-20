// CalendarView.jsx
import axios from "axios";
import {
  format,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  addMonths,
  isSameDay,
} from "date-fns";
import { useEffect, useState } from "react";
import { BsCaretLeftFill, BsFillCaretRightFill } from "react-icons/bs";
import { Link } from "react-router-dom";

export default function CalendarView() {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [events, setEvents] = useState([]);

  // ⭐ helper: treat eventDate as a pure calendar day (fixes 1-day shift)
  const normalizeEventDate = (dateLike) => {
    if (!dateLike) return null;
    const d = new Date(dateLike);
    // Use UTC parts so timezone offset doesn’t push it to the previous day
    return new Date(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate());
  };

  // Fetch events once
  useEffect(() => {
    axios
      .get("/events")
      .then((response) => {
        setEvents(response.data || []);
      })
      .catch((error) => {
        console.error("Error fetching events:", error);
      });
  }, []);

  const firstDayOfMonth = startOfMonth(currentMonth);
  const lastDayOfMonth = endOfMonth(currentMonth);
  const daysInMonth = eachDayOfInterval({
    start: firstDayOfMonth,
    end: lastDayOfMonth,
  });

  const firstDayOfWeek = firstDayOfMonth.getDay();

  // Empty cells before the 1st of the month
  const emptyCells = Array.from({ length: firstDayOfWeek }, (_, index) => (
    <div
      key={`empty-${index}`}
      className="p-2 bg-white ring-4 ring-background"
    ></div>
  ));

  return (
    <div className="p-4 md:mx-16">
      <div className="rounded p-2">
        {/* Month header + navigation */}
        <div className="flex items-center mb-4 justify-center gap-6">
          <button
            className="primary"
            onClick={() =>
              setCurrentMonth((prevMonth) => addMonths(prevMonth, -1))
            }
          >
            <BsCaretLeftFill className="w-auto h-5" />
          </button>
          <span className="text-xl font-semibold">
            {format(currentMonth, "MMMM yyyy")}
          </span>
          <button
            className="primary"
            onClick={() =>
              setCurrentMonth((prevMonth) => addMonths(prevMonth, 1))
            }
          >
            <BsFillCaretRightFill className="w-auto h-5" />
          </button>
        </div>

        {/* Weekday headers */}
        <div className="grid grid-cols-7 text-center">
          {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
            <div
              key={day}
              className="p-2 font-semibold bg-white ring-4 ring-background"
            >
              {day}
            </div>
          ))}
        </div>

        {/* Calendar days */}
        <div className="grid grid-cols-7">
          {emptyCells.concat(
            daysInMonth.map((date) => {
              // Events that belong to this calendar day
              const eventsForThisDay = events.filter((event) => {
                if (!event.eventDate) return false;
                const eventDate = normalizeEventDate(event.eventDate);
                return eventDate && isSameDay(eventDate, date);
              });

              return (
                <div
                  key={date.toISOString()}
                  className="p-2 relative top-0 pb-20 sm:pb-24 ring-4 bg-white ring-background flex flex-col items-start justify-start"
                >
                  <div className="font-bold">{format(date, "dd")}</div>

                  <div className="absolute top-8 space-y-1">
                    {eventsForThisDay.map((event) => (
                      <div key={event._id} className="mt-0 flex md:mt-2">
                        <Link to={"/event/" + event._id}>
                          <div className="text-white bg-primary rounded p-1 font-bold text-xs md:text-base md:p-2">
                            {event.title.toUpperCase()}
                          </div>
                        </Link>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
