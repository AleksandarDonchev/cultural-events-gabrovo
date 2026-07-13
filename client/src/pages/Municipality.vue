<template>
  <div class="municipality-page">
    <div class="page-header">
      <h1>{{ formattedName }}</h1>

      <button
  v-if="canManageEvents"
  class="add-button"
  @click="showForm = !showForm"
>
        {{ showForm ? "Затвори формата" : "Добави събитие / обява" }}
      </button>
    </div>

    <form v-if="showForm" class="event-form" @submit.prevent="addEvent">
      <h2>Добавяне на събитие или обява</h2>

      <input v-model="newEvent.title" type="text" placeholder="Заглавие" required />

      <input v-model="newEvent.date" type="date" required />

      <select v-model="newEvent.type" required>
        <option value="event">Събитие</option>
        <option value="announcement">Обява</option>
      </select>

      <textarea v-model="newEvent.description" placeholder="Кратко описание" required></textarea>

      <input
  type="file"
  accept="image/*"
  @change="handleImageChange"
/>

      <button type="submit">Добави</button>
    </form>

    <div class="events-section">
  <h2 class="section-title">Предстоящи събития</h2>

  <div
    v-for="event in upcomingEvents"
    :key="event._id"
    class="event-card"
    @click="openEvent(event)"
  >
    <span class="event-type">
      {{ event.type === "event" ? "Събитие" : "Обява" }}
    </span>

    <h2>{{ event.title }}</h2>

    <p class="date">{{ formatDate(event.date) }}</p>

    <p class="description">{{ event.description }}</p>

    <img
  v-if="event.image"
  :src="`${API_URL}${event.image}`"
  alt="Снимка към събитието"
  class="event-image"
/>
  </div>

  <p v-if="upcomingEvents.length === 0" class="empty-text">
    Няма предстоящи събития.
  </p>

  <div class="past-divider">
    <span></span>
    <h2>Отминали събития</h2>
    <span></span>
  </div>

  <div
    v-for="event in pastEvents"
    :key="event._id"
    class="event-card past-event-card"
    @click="openEvent(event)"
  >
    <span class="past-badge">Отминало</span>

    <h2>{{ event.title }}</h2>

    <p class="date past-date">{{ formatDate(event.date) }}</p>

    <p class="description">
      {{ event.description }}
    </p>
  </div>

  <p v-if="pastEvents.length === 0" class="empty-text">
    Няма отминали събития.
  </p>
</div>

    <div v-if="selectedEvent" class="modal-overlay" @click.self="closeEvent">
  <div class="modal">
    <div class="modal-actions">
     <button
  v-if="canEditEvent(selectedEvent)"
  class="edit-button"
  @click="startEdit"
>
        Редактирай
      </button>

      <button
  v-if="canEditEvent(selectedEvent)"
  class="delete-button"
  @click="deleteEvent"
>
        Изтрий
      </button>

      <button class="close-button" @click="closeEvent">
        ×
      </button>
    </div>

    <div v-if="!isEditing">
      <span class="event-type">
        {{ selectedEvent.type === "event" ? "Събитие" : "Обява" }}
      </span>

      <h2>{{ selectedEvent.title }}</h2>

      <p class="date">{{ formatDate(selectedEvent.date) }}</p>

      <p class="description">{{ selectedEvent.description }}</p>

      <img
  v-if="selectedEvent.image"
  :src="`http://localhost:5000${selectedEvent.image}`"
  alt="Снимка към събитието"
  class="modal-image"
/>
    </div>

    <form v-else class="edit-form" @submit.prevent="saveEdit">
      <h2>Редактиране на събитие</h2>

      <input
        v-model="editEvent.title"
        type="text"
        placeholder="Заглавие"
        required
      />

      <input
        v-model="editEvent.date"
        type="date"
        required
      />

      <textarea
        v-model="editEvent.description"
        placeholder="Описание"
        required
      ></textarea>

      <div class="edit-buttons">
        <button type="submit" class="save-button">
          Запази
        </button>

        <button type="button" class="cancel-button" @click="isEditing = false">
          Отказ
        </button>
      </div>
    </form>
  </div>
  </div>
</div>
</template>

<script setup>
import axios from "axios"
import { computed, onMounted, ref } from "vue"
import { useRoute } from "vue-router"


const API_URL = import.meta.env.VITE_API_URL
const route = useRoute()
const municipality = route.params.name

const showForm = ref(false)
const selectedEvent = ref(null)
const events = ref([])

const currentUser = JSON.parse(localStorage.getItem("user"))

const canManageEvents =
  currentUser &&
  (currentUser.role === "admin" || currentUser.role === "organizer")

const newEvent = ref({
  title: "",
  date: "",
  type: "event",
  description: "",
  image: null,
})

const isEditing = ref(false)

const editEvent = ref({
  title: "",
  description: "",
  date: "",
})

const fetchEvents = async () => {
  const response = await axios.get(`${API_URL}/api/events`)
  events.value = response.data
}

const handleImageChange = (event) => {
  newEvent.value.image = event.target.files[0]
}

const addEvent = async () => {
  const formData = new FormData()

  formData.append("title", newEvent.value.title)
  formData.append("date", newEvent.value.date)
  formData.append("type", newEvent.value.type)
  formData.append("description", newEvent.value.description)
  formData.append("municipality", municipality)

  if (newEvent.value.image) {
    formData.append("image", newEvent.value.image)
  }

  const response = await axios.post(
  `${API_URL}/api/events`,
  formData,
  getAuthHeaders()
)

  events.value.push(response.data)

  newEvent.value = {
    title: "",
    date: "",
    type: "event",
    description: "",
    image: null,
  }

  showForm.value = false
}

onMounted(() => {
  fetchEvents()
})

const filteredEvents = computed(() => {
  return events.value.filter(event => event.municipality === municipality)
})

const upcomingEvents = computed(() => {
  const today = new Date()

  today.setHours(0, 0, 0, 0)

  return filteredEvents.value
    .filter(event => {
      const eventDate = new Date(event.date)
      eventDate.setHours(0, 0, 0, 0)

      return eventDate >= today
    })
    .sort((a, b) => new Date(a.date) - new Date(b.date))
})

const pastEvents = computed(() => {
  const today = new Date()

  today.setHours(0, 0, 0, 0)

  return filteredEvents.value
    .filter(event => {
      const eventDate = new Date(event.date)
      eventDate.setHours(0, 0, 0, 0)

      return eventDate < today
    })
    .sort((a, b) => new Date(b.date) - new Date(a.date))
})

const formattedName = computed(() => {
  const names = {
    gabrovo: "Община Габрово",
    sevlievo: "Община Севлиево",
    dryanovo: "Община Дряново",
    tryavna: "Община Трявна",
  }

  return names[municipality]
})

const formatDate = (dateString) => {
  const date = new Date(dateString)
  return date.toLocaleDateString("bg-BG")
}

const openEvent = (event) => {
  selectedEvent.value = event
}

const closeEvent = () => {
  selectedEvent.value = null
}

const deleteEvent = async () => {
  console.log("DELETE CLICKED")
  console.log("ID:", selectedEvent.value?._id)

  try {
    const response = await axios.delete(
      `${API_URL}/api/events/${selectedEvent.value._id}`,
      getAuthHeaders()
    )

    console.log("DELETE RESPONSE:", response.data)
    alert("Изтрито успешно")

    events.value = events.value.filter(
      event => event._id !== selectedEvent.value._id
    )

    selectedEvent.value = null
  } catch (error) {
    console.log("DELETE ERROR:", error.response?.data || error)
    alert("Грешка при изтриване")
  }
}

const startEdit = () => {
  editEvent.value = {
    title: selectedEvent.value.title,
    description: selectedEvent.value.description,
    date: selectedEvent.value.date.split("T")[0],
  }

  isEditing.value = true
}

const saveEdit = async () => {
  try {
    const response = await axios.put(
   `${API_URL}/api/events/${selectedEvent.value._id}`,
  {
    title: editEvent.value.title,
    description: editEvent.value.description,
    date: editEvent.value.date,
    type: selectedEvent.value.type,
    municipality: selectedEvent.value.municipality,
  },
  getAuthHeaders()
)

    const index = events.value.findIndex(
      event => event._id === selectedEvent.value._id
    )

    if (index !== -1) {
      events.value[index] = response.data
    }

    selectedEvent.value = response.data
    isEditing.value = false
  } catch (error) {
    console.log(error)
    alert("Грешка при редактиране")
  }
}

const getAuthHeaders = () => {
  const token = localStorage.getItem("token")

  return {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  }
}

const canEditEvent = (event) => {
  if (!currentUser) return false

  if (currentUser.role === "admin") {
    return true
  }

  if (
    currentUser.role === "organizer" &&
    event.createdBy === currentUser.id
  ) {
    return true
  }

  return false
}
</script>

<style scoped>
.municipality-page {
  min-height: 100vh;
  padding: 40px;

  background: linear-gradient(
    180deg,
    #eef4ff 0%,
    #f8fafc 40%,
    #f5f7fb 100%
  );
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 35px;
  gap: 20px;
}

h1 {
  font-size: 42px;
  color: #1e293b;
}

.add-button {
  background: #2563eb;
  color: white;
  border: none;
  padding: 14px 22px;
  border-radius: 12px;
  font-size: 16px;
  cursor: pointer;
  font-weight: bold;
}

.add-button:hover {
  background: #1d4ed8;
}

.event-form {
  background: white;
  padding: 25px;
  border-radius: 18px;
  margin-bottom: 35px;
  box-shadow: 0 5px 18px rgba(0,0,0,0.08);

  display: flex;
  flex-direction: column;
  gap: 15px;
}

.event-form input,
.event-form select,
.event-form textarea {
  padding: 13px;
  border-radius: 10px;
  border: 1px solid #cbd5e1;
  font-size: 16px;
}

.event-form textarea {
  min-height: 110px;
  resize: vertical;
}

.event-form button {
  background: #16a34a;
  color: white;
  border: none;
  padding: 14px;
  border-radius: 12px;
  font-size: 16px;
  cursor: pointer;
  font-weight: bold;
}

.events-section {
  display: flex;
  flex-direction: column;
  gap: 25px;
}

.event-card {
  background: white;
  padding: 25px;
  border-radius: 18px;
  box-shadow: 0 5px 18px rgba(0,0,0,0.08);
  cursor: pointer;
}

.event-type {
  display: inline-block;
  background: #e0f2fe;
  color: #0369a1;
  padding: 6px 12px;
  border-radius: 999px;
  font-size: 14px;
  font-weight: bold;
  margin-bottom: 12px;
}

.event-card h2 {
  margin-bottom: 12px;
  color: #0f172a;
}

.date {
  color: #2563eb;
  font-weight: bold;
  margin-bottom: 10px;
}

.description {
  color: #475569;
  line-height: 1.5;
}

.event-image {
  margin-top: 18px;
  max-width: 300px;
  border-radius: 12px;
  display: block;
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;

  width: 100%;
  height: 100%;

  background: rgba(15, 23, 42, 0.65);

  display: flex;
  justify-content: center;
  align-items: center;

  padding: 30px;

  z-index: 1000;
}

.modal {
  position: relative;

  background: white;

  max-width: 650px;
  width: 100%;

  padding: 60px 30px 30px 30px;

  border-radius: 22px;

  box-shadow: 0 20px 60px rgba(0,0,0,0.25);

  display: flex;
  flex-direction: column;
  gap: 15px;
}

.modal-actions {
  position: absolute;
  top: 10px;
  right: 20px;

  display: flex;
  gap: 10px;
  padding-top: 10px;
}

.close-button {
  border: none;

  background: #ef4444;
  color: white;

  width: 36px;
  height: 36px;

  border-radius: 50%;

  font-size: 24px;

  cursor: pointer;
}

.modal-image {
  margin-top: 20px;

  width: 100%;
  max-height: 420px;

  object-fit: contain;

  border-radius: 14px;
}

@media (max-width: 700px) {
  .page-header {
    flex-direction: column;
    align-items: flex-start;
  }

  h1 {
    font-size: 34px;
  }
}

.delete-button {
  background: #dc2626;
  color: white;

  border: none;
  border-radius: 10px;

  padding: 8px 14px;

  cursor: pointer;

  font-size: 14px;
  font-weight: bold;
}

.delete-button:hover {
  background: #b91c1c;
}

.edit-button {
  background: #2563eb;
  color: white;

  border: none;
  border-radius: 10px;

  padding: 8px 14px;

  cursor: pointer;

  font-size: 14px;
  font-weight: bold;
}

.edit-button:hover {
  background: #1d4ed8;
}

.edit-form {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.edit-form input,
.edit-form textarea {
  padding: 13px;
  border-radius: 10px;
  border: 1px solid #cbd5e1;
  font-size: 16px;
}

.edit-form textarea {
  min-height: 120px;
  resize: vertical;
}

.edit-buttons {
  display: flex;
  gap: 12px;
}

.save-button {
  background: #16a34a;
  color: white;

  border: none;
  border-radius: 10px;

  padding: 12px 18px;

  cursor: pointer;
  font-weight: bold;
}

.cancel-button {
  background: #64748b;
  color: white;

  border: none;
  border-radius: 10px;

  padding: 12px 18px;

  cursor: pointer;
  font-weight: bold;
}

.section-title {
  font-size: 26px;
  color: #1e293b;
  margin-bottom: 5px;
}

.past-divider {
  display: flex;
  align-items: center;
  gap: 18px;
  margin: 45px 0 10px;
}

.past-divider span {
  flex: 1;
  height: 1px;
  background: #cbd5e1;
}

.past-divider h2 {
  color: #64748b;
  font-size: 24px;
  white-space: nowrap;
}

.past-event-card {
  background: #f1f5f9;
  opacity: 0.75;
}

.past-event-card h2,
.past-event-card .description {
  color: #64748b;
}

.past-date {
  color: #64748b;
}

.past-badge {
  display: inline-block;
  background: #e2e8f0;
  color: #64748b;
  padding: 6px 12px;
  border-radius: 999px;
  font-size: 14px;
  font-weight: bold;
  margin-bottom: 12px;
}

.empty-text {
  color: #64748b;
  font-style: italic;
  margin-top: 10px;
}
</style>