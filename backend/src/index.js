require("dotenv").config();
const express = require("express");
const cors = require("cors");

const app = express();
app.use(cors({ origin: process.env.FRONTEND_ORIGIN || "http://localhost:3000" }));
app.use(express.json());

app.get("/health", (req, res) => res.json({ ok: true }));

// Routes go here, e.g. app.use("/pickups", require("./routes/pickups"));

const port = process.env.PORT || 4000;
app.listen(port, () => console.log(`API running on port ${port}`));
