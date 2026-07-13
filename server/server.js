require("dotenv").config()

const dns = require("dns")
dns.setServers(["8.8.8.8", "1.1.1.1"])

const express = require("express")
const cors = require("cors")
const mongoose = require("mongoose")
const eventRoutes = require("./routes/eventRoutes")
const path = require("path")
const authRoutes = require("./routes/authRoutes")

const app = express()

app.use(cors())
app.use(express.json())
app.use("/uploads", express.static(path.join(__dirname, "uploads")))

app.use("/api/events", eventRoutes)
app.use("/api/auth", authRoutes)

mongoose
  .connect(process.env.MONGO_URI, {
    serverSelectionTimeoutMS: 30000,
  })
  .then(() => {
    console.log("MongoDB connected")
  })
  .catch((error) => {
    console.log(error)
  })

app.get("/", (req, res) => {
  res.send("Server is working")
})

const PORT = process.env.PORT || 5000

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`)
})