<template>
  <div class="auth-page">
    <form class="auth-form" @submit.prevent="register">
      <h1>Регистрация</h1>

      <input
        v-model="form.username"
        type="text"
        placeholder="Потребителско име"
        required
      />

      <input
        v-model="form.email"
        type="email"
        placeholder="Имейл"
        required
      />

      <input
        v-model="form.password"
        type="password"
        placeholder="Парола"
        required
      />

      <button type="submit">Регистрация</button>

      <p>
        Вече имате профил?
        <RouterLink to="/login">Вход</RouterLink>
      </p>
    </form>
  </div>
</template>

<script setup>
import axios from "axios"
import { ref } from "vue"
import { useRouter } from "vue-router"

const API_URL = import.meta.env.VITE_API_URL
const router = useRouter()

const form = ref({
  username: "",
  email: "",
  password: "",
})

const register = async () => {
  try {
    await axios.post(`${API_URL}/api/auth/register`, form.value)

    alert("Регистрацията е успешна")
    router.push("/login")
  } catch (error) {
    alert(error.response?.data?.message || "Грешка при регистрация")
  }
}
</script>

<style scoped>
.auth-page {
  min-height: 100vh;
  background: #f5f7fb;
  display: flex;
  justify-content: center;
  align-items: center;
}

.auth-form {
  width: 100%;
  max-width: 420px;
  background: white;
  padding: 35px;
  border-radius: 20px;
  box-shadow: 0 10px 30px rgba(0,0,0,0.1);

  display: flex;
  flex-direction: column;
  gap: 15px;
}

.auth-form h1 {
  text-align: center;
  color: #1e293b;
}

.auth-form input {
  padding: 14px;
  border-radius: 10px;
  border: 1px solid #cbd5e1;
  font-size: 16px;
}

.auth-form button {
  background: #2563eb;
  color: white;
  border: none;
  padding: 14px;
  border-radius: 10px;
  font-size: 16px;
  cursor: pointer;
  font-weight: bold;
}

.auth-form p {
  text-align: center;
  color: #64748b;
}
</style>