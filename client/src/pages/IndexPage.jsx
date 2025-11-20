/* eslint-disable react/jsx-key */
import axios from "axios";
import { useEffect, useState, useContext } from "react";
import { Link } from "react-router-dom";
import { BsArrowRightShort } from "react-icons/bs";
import { BiLike } from "react-icons/bi";
import ImageSlider from "./ImageSlider";
import { UserContext } from "../UserContext";

export default function IndexPage(params) {
  const { user } = useContext(UserContext);

  const [events, setEvents] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);

  // show 1 event per page
  const itemsPerPage = 1;

  // ============================
  // FETCH EVENTS (only when logged in)
  // ============================
  useEffect(() => {
    if (!user) {
      setEvents([]);
      return;
    }

    axios
      .get("/createEvent")
      .then((response) => {
        console.log("Events from backend:", response.data);
        setEvents(response.data);
      })
      .catch((error) => {
        console.error("Error fetching events:", error);
      });
  }, [user]);

  // ============================
  // LIKE EVENT
  // ============================
  const handleLike = (eventId) => {
    axios
      .post(`/event/${eventId}`)
      .then(() => {
        setEvents((prevEvents) =>
          prevEvents.map((event) =>
            event._id === eventId
              ? { ...event, likes: event.likes + 1 }
              : event
          )
        );
      })
      .catch((error) => {
        console.error("Error liking:", error);
      });
  };

  // ============================
  // DELETE EVENT
  // ============================
  const handleDelete = async (eventId) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this event?"
    );
    if (!confirmed) return;

    try {
      await axios.delete(`/event/${eventId}`);
      setEvents((prevEvents) =>
        prevEvents.filter((event) => event._id !== eventId)
      );
      setCurrentPage(1);
    } catch (error) {
      console.error("Error deleting event:", error);
      alert("Error deleting event. Please check console.");
    }
  };

  // ============================
  // FILTER + PAGINATION
  // ============================
  const query = (params?.searchQuery || "").toLowerCase();

  const filteredEvents = events.filter((event) =>
    event.title.toLowerCase().includes(query) ||
    event.location.toLowerCase().includes(query) ||
    event.description.toLowerCase().includes(query) ||
    event.organizedBy.toLowerCase().includes(query) ||
    event.type.toLowerCase().includes(query)
  );

  // Show all events (no date filter for now)
  const validEvents = filteredEvents;

  const totalPages =
    validEvents.length === 0
      ? 1
      : Math.ceil(validEvents.length / itemsPerPage);

  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentEvents = validEvents.slice(startIndex, endIndex);

  const handlePrevPage = () => {
    if (validEvents.length === 0) return;
    setCurrentPage((prev) => (prev <= 1 ? totalPages : prev - 1));
  };

  const handleNextPage = () => {
    if (validEvents.length === 0) return;
    setCurrentPage((prev) => (prev >= totalPages ? 1 : prev + 1));
  };

  // ============================
  // RENDER
  // ============================
  return (
    <div className="mt-1 flex flex-col min-h-screen bg-[#FFF5E8]">
      {/* Slider is always visible */}
      <div className="hidden sm:block">
        <ImageSlider />
      </div>

      {/* If NOT logged in: message */}
      {!user && (
        <div className="flex flex-col items-center justify-center py-10">
          <h2 className="text-2xl font-semibold mb-3">
            Please sign in to view events
          </h2>
          <p className="mb-6 text-gray-600">
            Log in to explore and book upcoming events on BookMyEvent.
          </p>
          <Link to="/login">
            <button className="primary px-6 py-2 rounded">Sign In</button>
          </Link>
        </div>
      )}

      {/* If logged in: show event cards */}
      {user && (
        <>
          <div className="mx-10 my-5 flex justify-center sm:mx-5">
            <div className="grid gap-x-6 gap-y-8 grid-cols-1 max-w-xl w-full">
              {currentEvents.map((event) => (
                <div className="bg-white rounded-xl relative" key={event._id}>
                  <div className="rounded-tl-[0.75rem] rounded-tr-[0.75rem] overflow-hidden">
                    {event.image && (
                      <img
                        src={
                          event.image
                            ? event.image
                            : "https://img.freepik.com/free-photo/group-young-people-celebrating-concert_53876-14478.jpg"
                        }
                        alt={event.title}
                        className="w-full h-[200px] object-cover rounded-tl-[0.75rem] rounded-tr-[0.75rem]"
                      />
                    )}

                    <div className="absolute flex gap-4 bottom-[240px] right-8 md:bottom-[20px] md:right-3 lg:bottom-[250px] lg:right-4 sm:bottom-[260px] sm:right-3">
                      <button onClick={() => handleLike(event._id)}>
                        <BiLike className="w-auto h-12 lg:h-10 sm:h-12 md:h-10 bg-white p-2 rounded-full shadow-md transition-all hover:text-primary" />
                      </button>
                    </div>
                  </div>

                  <div className="m-2 grid gap-2">
                    <div className="flex justify-between items-center">
                      <h1 className="font-bold text-lg mt-2">
                        {event.title.toUpperCase()}
                      </h1>
                      <div className="flex gap-2 items-center mr-4 text-red-600">
                        <BiLike /> {event.likes}
                      </div>
                    </div>

                    <div className="flex text-sm flex-nowrap justify-between text-primarydark font-bold mr-4">
                      <div>
                        {(event.eventDate
                          ? event.eventDate.split("T")[0]
                          : "")}{" "}
                        {event.eventTime}
                      </div>
                      <div>
                        {event.ticketPrice === 0
                          ? "Free"
                          : "$ " + event.ticketPrice}
                      </div>
                    </div>

                    <div className="flex justify-between items-center my-2 mr-4">
                      <div className="text-sm text-primarydark ">
                        Organized By: <br />
                        <span className="font-bold">{event.organizedBy}</span>
                      </div>
                      <div className="text-sm text-primarydark ">
                        Created By: <br />
                        <span className="font-semibold">
                          {event.owner ? event.owner.toUpperCase() : ""}
                        </span>
                      </div>
                    </div>

                    <div className="flex justify-center gap-3">
                      <Link
                        to={"/event/" + event._id}
                        className="flex justify-center"
                      >
                        <button className="primary flex items-center gap-2">
                          View
                          <BsArrowRightShort className="w-6 h-6" />
                        </button>
                      </Link>

                      <button
                        onClick={() => handleDelete(event._id)}
                        className="px-4 py-2 rounded bg-red-500 text-white hover:bg-red-600 transition"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}

              {validEvents.length === 0 && (
                <div className="text-center text-gray-600 py-10">
                  No events found.
                </div>
              )}
            </div>
          </div>

          {/* Pagination – only if there is at least 1 event */}
          {validEvents.length > 0 && (
            <div className="flex justify-center items-center gap-4 mt-4 mb-10">
              <button
                className="primary px-4 py-2 rounded disabled:opacity-50"
                onClick={handlePrevPage}
              >
                Previous
              </button>
              <span>
                Event {currentPage} of {totalPages}
              </span>
              <button
                className="primary px-4 py-2 rounded disabled:opacity-50"
                onClick={handleNextPage}
              >
                Next
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
