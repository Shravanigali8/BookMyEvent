import { useContext, useState } from "react";
import axios from "axios";
import { UserContext } from "../UserContext";
import { useNavigate } from "react-router-dom";

export default function AddEvent() {
  const { user } = useContext(UserContext);
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    owner: user ? user.name : "",
    title: "",
    type: "",
    description: "",
    organizedBy: "",
    eventDate: "",
    eventTime: "",
    location: "",
    ticketPrice: 0,
    image: null,
    likes: 0,
    optional: "",
  });

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (files) {
      setFormData((prev) => ({ ...prev, [name]: files[0] }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const data = new FormData();
      Object.entries(formData).forEach(([key, value]) => {
        if (value !== null && value !== undefined) {
          data.append(key, value);
        }
      });

      const response = await axios.post("/createEvent", data, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      console.log("Event created:", response.data);
      alert("Event created successfully!");
      navigate("/"); // go to homepage
    } catch (error) {
      console.error("Error creating event:", error);
      alert("Failed to create event. Please try again.");
      navigate("/"); // still go home
    }
  };

  return (
    <div className="flex flex-col ml-20 mt-10">
      <h1 className="font-bold text-[36px] mb-5">Post an Event</h1>

      <form
        onSubmit={handleSubmit}
        className="flex flex-col gap-5 w-full max-w-xl"
      >
        <label className="flex flex-col">
          Title:
          <input
            type="text"
            name="title"
            className="rounded mt-2 pl-5 px-4 ring-sky-700 ring-2 h-8 border-none"
            value={formData.title}
            onChange={handleChange}
            required
          />
        </label>

        <label className="flex flex-col">
          Type:
          <input
            type="text"
            name="type"
            className="rounded mt-2 pl-5 px-4 ring-sky-700 ring-2 h-8 border-none"
            value={formData.type}
            onChange={handleChange}
          />
        </label>

        <label className="flex flex-col">
          Optional:
          <input
            type="text"
            name="optional"
            className="rounded mt-2 pl-5 px-4 ring-sky-700 ring-2 h-8 border-none"
            value={formData.optional}
            onChange={handleChange}
          />
        </label>

        <label className="flex flex-col">
          Description:
          <textarea
            name="description"
            className="rounded mt-2 pl-5 px-4 py-2 ring-sky-700 ring-2 border-none"
            value={formData.description}
            onChange={handleChange}
          />
        </label>

        <label className="flex flex-col">
          Organized By:
          <input
            type="text"
            name="organizedBy"
            className="rounded mt-2 pl-5 px-4 ring-sky-700 ring-2 h-8 border-none"
            value={formData.organizedBy}
            onChange={handleChange}
          />
        </label>

        <label className="flex flex-col">
          Event Date:
          <input
            type="date"
            name="eventDate"
            className="rounded mt-2 pl-5 px-4 ring-sky-700 ring-2 h-8 border-none"
            value={formData.eventDate}
            onChange={handleChange}
            required
          />
        </label>

        <label className="flex flex-col">
          Event Time:
          <input
            type="time"
            name="eventTime"
            className="rounded mt-2 pl-5 px-4 ring-sky-700 ring-2 h-8 border-none"
            value={formData.eventTime}
            onChange={handleChange}
          />
        </label>

        <label className="flex flex-col">
          Location:
          <input
            type="text"
            name="location"
            className="rounded mt-2 pl-5 px-4 ring-sky-700 ring-2 h-8 border-none"
            value={formData.location}
            onChange={handleChange}
          />
        </label>

        <label className="flex flex-col">
          Ticket Price:
          <input
            type="number"
            name="ticketPrice"
            className="rounded mt-2 pl-5 px-4 ring-sky-700 ring-2 h-8 border-none"
            value={formData.ticketPrice}
            onChange={handleChange}
            min="0"
          />
        </label>

        <label className="flex flex-col">
          Image:
          <input
            type="file"
            name="image"
            accept="image/*"
            className="rounded mt-2 pl-5 px-4 py-2 ring-sky-700 ring-2 border-none"
            onChange={handleChange}
          />
        </label>

        <button className="primary mt-4" type="submit">
          Submit
        </button>
      </form>
    </div>
  );
}
