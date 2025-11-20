// =======================
//  IMPORTS
// =======================
const express = require("express");
const cors = require("cors");
require("dotenv").config();
const mongoose = require("mongoose");
const UserModel = require("./models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const cookieParser = require("cookie-parser");
const multer = require("multer");
const path = require("path");

const Ticket = require("./models/Ticket");

const app = express();

const bcryptSalt = bcrypt.genSaltSync(10);
const jwtSecret = "bsbsfbrnsftentwnnwnwn";

// =======================
//  MIDDLEWARE
// =======================
app.use(express.json());
app.use(cookieParser());
app.use(
  cors({
    credentials: true,
    origin: "http://localhost:5173",
  })
);

// serve uploaded images if needed
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// =======================
//  MULTER STORAGE
// =======================
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads/"),
  filename: (req, file, cb) => cb(null, file.originalname),
});
const upload = multer({ storage });

// =======================
//  TEST ROUTE
// =======================
app.get("/test", (req, res) => {
  res.json("test ok");
});

// =======================
//  AUTH ROUTES
// =======================

// REGISTER
app.post("/register", async (req, res) => {
  const { name, email, password } = req.body;

  try {
    const exists = await UserModel.findOne({ email });
    if (exists) {
      return res.status(400).json({ error: "Email already exists" });
    }

    const hashed = bcrypt.hashSync(password, bcryptSalt);

    const userDoc = await UserModel.create({
      name,
      email,
      password: hashed,
    });

    return res.status(201).json({
      _id: userDoc._id,
      name: userDoc.name,
      email: userDoc.email,
    });
  } catch (err) {
    console.error("Registration error:", err);
    return res.status(500).json({ error: "Registration failed" });
  }
});

// LOGIN
app.post("/login", async (req, res) => {
  const { email, password } = req.body;

  const userDoc = await UserModel.findOne({ email });
  if (!userDoc) return res.status(404).json({ error: "User not found" });

  const passOk = bcrypt.compareSync(password, userDoc.password);
  if (!passOk) return res.status(401).json({ error: "Invalid password" });

  jwt.sign(
    { email: userDoc.email, id: userDoc._id },
    jwtSecret,
    {},
    (err, token) => {
      if (err) {
        console.error("JWT sign error:", err);
        return res.status(500).json({ error: "Token creation failed" });
      }

      res.cookie("token", token, { httpOnly: true }).json({
        _id: userDoc._id,
        name: userDoc.name,
        email: userDoc.email,
      });
    }
  );
});

// PROFILE
app.get("/profile", (req, res) => {
  const { token } = req.cookies;
  if (!token) return res.json(null);

  jwt.verify(token, jwtSecret, {}, async (err, userData) => {
    if (err) {
      console.error("JWT verify error:", err);
      return res.status(401).json(null);
    }

    const user = await UserModel.findById(userData.id);
    if (!user) return res.json(null);
    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
    });
  });
});

// LOGOUT
app.post("/logout", (req, res) => {
  res.cookie("token", "").json(true);
});

// =======================
//  EVENT MODEL
// =======================

const eventSchema = new mongoose.Schema({
  owner: String,
  title: String,
  type: String,
  description: String,
  organizedBy: String,
  eventDate: Date,
  eventTime: String,
  location: String,
  Participants: Number,
  Count: Number,
  Income: Number,
  ticketPrice: Number,
  Quantity: Number,
  image: String,
  likes: { type: Number, default: 0 },
  Comment: [String],
});

const Event = mongoose.model("Event", eventSchema);

// =======================
//  HELPERS
// =======================

// parse "YYYY-MM-DD" as local date (fixes 1-day early bug)
function parseLocalDate(dateStr) {
  if (!dateStr) return null;
  const [year, month, day] = dateStr.split("-").map(Number);
  // local time (no timezone shift)
  return new Date(year, month - 1, day);
}

// =======================
//  EVENT ROUTES
// =======================

// CREATE EVENT
app.post("/createEvent", upload.single("image"), async (req, res) => {
  try {
    const {
      owner,
      title,
      type,
      description,
      organizedBy,
      eventDate,
      eventTime,
      location,
      Participants,
      Count,
      Income,
      ticketPrice,
      Quantity,
      likes,
      optional, // if you use this in frontend
    } = req.body;

    const eventData = {
      owner,
      title,
      type,
      description,
      organizedBy,
      eventDate: parseLocalDate(eventDate),
      eventTime,
      location,
      Participants: Participants ? Number(Participants) : undefined,
      Count: Count ? Number(Count) : undefined,
      Income: Income ? Number(Income) : undefined,
      ticketPrice: ticketPrice ? Number(ticketPrice) : 0,
      Quantity: Quantity ? Number(Quantity) : undefined,
      likes: likes ? Number(likes) : 0,
      image: req.file ? req.file.path : "",
      optional, // stored if present
    };

    const newEvent = new Event(eventData);
    await newEvent.save();

    res.status(201).json(newEvent);
  } catch (error) {
    console.error("Error saving event:", error);
    res.status(500).json({ error: "Failed to save the event to MongoDB" });
  }
});

// GET FUTURE + TODAY EVENTS (used by homepage)
app.get("/createEvent", async (req, res) => {
  try {
    const now = new Date();
    const events = await Event.find({
      eventDate: { $gte: now },
    }).sort({ eventDate: 1 });

    res.json(events);
  } catch (error) {
    console.error("Error fetching events:", error);
    res.status(500).json({ error: "Failed to fetch events from MongoDB" });
  }
});

// GET ALL EVENTS (used by CalendarView)
app.get("/events", async (req, res) => {
  try {
    const events = await Event.find().sort({ eventDate: 1 });
    res.json(events);
  } catch (error) {
    console.error("Error fetching events:", error);
    res.status(500).json({ error: "Failed to fetch events" });
  }
});

// GET ONE EVENT
app.get("/event/:id", async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ error: "Event not found" });
    res.json(event);
  } catch (error) {
    console.error("Error fetching event:", error);
    res.status(500).json({ error: "Failed to fetch event from MongoDB" });
  }
});

// LIKE EVENT
app.post("/event/:eventId", async (req, res) => {
  try {
    const ev = await Event.findById(req.params.eventId);
    if (!ev) return res.status(404).json({ error: "Event not found" });

    ev.likes += 1;
    await ev.save();

    res.json(ev);
  } catch (err) {
    console.error("Error liking event:", err);
    res.status(500).json({ error: "Like failed" });
  }
});

// DELETE EVENT + RELATED TICKETS
app.delete("/event/:id", async (req, res) => {
  try {
    const eventId = req.params.id;

    await Ticket.deleteMany({ eventid: eventId });
    const deleted = await Event.findByIdAndDelete(eventId);

    if (!deleted) {
      return res.status(404).json({ error: "Event not found" });
    }

    res.json({ message: "Event deleted" });
  } catch (err) {
    console.error("Error deleting event:", err);
    res.status(500).json({ error: "Delete failed" });
  }
});

// ORDER / PAYMENT SUMMARY (if you use these)
app.get("/event/:id/ordersummary", async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ error: "Event not found" });
    res.json(event);
  } catch (error) {
    console.error("Error fetching event:", error);
    res.status(500).json({ error: "Failed to fetch event from MongoDB" });
  }
});

app.get("/event/:id/ordersummary/paymentsummary", async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ error: "Event not found" });
    res.json(event);
  } catch (error) {
    console.error("Error fetching event:", error);
    res.status(500).json({ error: "Failed to fetch event from MongoDB" });
  }
});

// =======================
//  TICKET ROUTES
// =======================

app.post("/tickets", async (req, res) => {
  try {
    const ticketDetails = req.body;
    const newTicket = new Ticket(ticketDetails);
    await newTicket.save();
    return res.status(201).json({ ticket: newTicket });
  } catch (error) {
    console.error("Error creating ticket:", error);
    return res.status(500).json({ error: "Failed to create ticket" });
  }
});

// (Note: this route name is odd, but keeping your original)
app.get("/tickets/:id", async (req, res) => {
  try {
    const tickets = await Ticket.find();
    res.json(tickets);
  } catch (error) {
    console.error("Error fetching tickets:", error);
    res.status(500).json({ error: "Failed to fetch tickets" });
  }
});

app.get("/tickets/user/:userId", (req, res) => {
  const userId = req.params.userId;

  Ticket.find({ userid: userId })
    .then((tickets) => {
      res.json(tickets);
    })
    .catch((error) => {
      console.error("Error fetching user tickets:", error);
      res.status(500).json({ error: "Failed to fetch user tickets" });
    });
});

app.delete("/tickets/:id", async (req, res) => {
  try {
    const ticketId = req.params.id;
    await Ticket.findByIdAndDelete(ticketId);
    res.status(204).send();
  } catch (error) {
    console.error("Error deleting ticket:", error);
    res.status(500).json({ error: "Failed to delete ticket" });
  }
});

// =======================
//  AUTO DELETE OLD EVENTS
// =======================

async function deletePastEvents() {
  try {
    const now = new Date();
    const oldEvents = await Event.find({ eventDate: { $lt: now } });
    const ids = oldEvents.map((e) => e._id.toString());

    if (ids.length === 0) {
      console.log("🧹 No past events to delete.");
      return;
    }

    const resultEvents = await Event.deleteMany({ _id: { $in: ids } });
    const resultTickets = await Ticket.deleteMany({ eventid: { $in: ids } });

    console.log(
      `🧹 Auto cleanup: deleted ${resultEvents.deletedCount} event(s) and ${resultTickets.deletedCount} ticket(s).`
    );
  } catch (err) {
    console.error("Auto cleanup failed:", err);
  }
}

// =======================
//  MONGODB CONNECTION
// =======================

const PORT = process.env.PORT || 4000;

mongoose
  .connect("mongodb+srv://mgali1_db_user:Mohan23@cluster0.nizetzu.mongodb.net/?appName=Cluster0")
  .then(() => {
    console.log("MongoDB Connected");

    // run cleanup on start + hourly
    deletePastEvents();
    setInterval(deletePastEvents, 1000 * 60 * 60);

    app.listen(PORT, () => {
      console.log(` Server running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error(" MongoDB connection error:", err);
  });
