const express = require("express")
const multer = require("multer")
const path = require("path")
const Event = require("../models/event")
const { protect, allowRoles } = require("../middleware/authMiddleware")

const router = express.Router()

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/")
  },

  filename: (req, file, cb) => {
    const uniqueName = Date.now() + "-" + file.originalname
    cb(null, uniqueName)
  },
})

const upload = multer({ storage })

// Взимане на всички събития
router.get("/", async (req, res) => {
  try {
    const events = await Event.find().sort({ date: 1 })
    res.json(events)
  } catch (error) {
    res.status(500).json({ message: "Грешка при зареждане на събитията" })
  }
})

// Добавяне на ново събитие със снимка
router.post(
  "/",
  protect,
  allowRoles("admin", "organizer"),
  upload.single("image"),
  async (req, res) => {
  try {
    const imagePath = req.file ? `/uploads/${req.file.filename}` : ""

    const newEvent = await Event.create({
      title: req.body.title,
      description: req.body.description,
      date: req.body.date,
      type: req.body.type,
      municipality: req.body.municipality,
      image: imagePath,
      createdBy: req.user.id,
    })

    res.status(201).json(newEvent)
  } catch (error) {
    res.status(400).json({ message: "Грешка при добавяне на събитие" })
  }
})

// Редактиране на събитие
router.put(
  "/:id",
  protect,
  allowRoles("admin", "organizer"),
  upload.single("image"),
  async (req, res) => {
    try {
      const event = await Event.findById(req.params.id)

      if (!event) {
        return res.status(404).json({
          message: "Събитието не е намерено",
        })
      }

      if (
        req.user.role === "organizer" &&
        event.createdBy?.toString() !== req.user.id
      ) {
        return res.status(403).json({
          message: "Можете да редактирате само собствени събития",
        })
      }

      event.title = req.body.title ?? event.title
      event.description = req.body.description ?? event.description
      event.date = req.body.date ?? event.date
      event.type = req.body.type ?? event.type
      event.municipality =
        req.body.municipality ?? event.municipality

    
      if (req.file) {
        event.image = `/uploads/${req.file.filename}`
      }

      const updatedEvent = await event.save()
      

      res.json(updatedEvent)
    } catch (error) {
      console.error("UPDATE ERROR:", error)

      res.status(500).json({
        message: "Грешка при редактиране на събитие",
      })
    }
  }
)

// Изтриване на събитие
router.delete(
  "/:id",
  protect,
  allowRoles("admin", "organizer"),
  async (req, res) => {
    console.log("DELETE ROUTE HIT")
    console.log("Event ID:", req.params.id)

    try {
      const event = await Event.findById(req.params.id)

      console.log("Event found:", event)

      if (!event) {
        return res.status(404).json({
          message: "Събитието не е намерено",
        })
      }

      await Event.findByIdAndDelete(req.params.id)

      console.log("EVENT DELETED")

      res.json({
        message: "Събитието е изтрито успешно",
      })
    } catch (error) {
      console.log("DELETE ERROR:", error)

      res.status(500).json({
        message: "Грешка при изтриване на събитие",
      })
    }
  }
)

module.exports = router