<template>
  <div>
    <nav class="navbar">
      <RouterLink to="/" class="logo">
        Изживей обалст Габрово
      </RouterLink>

      <div class="nav-actions">
        <template v-if="currentUser">
          <span class="user-info">
            {{ currentUser.username }} — {{ currentUser.role }}
          </span>

          <button class="logout-button" @click="logout">
            Изход
          </button>
        </template>

        <template v-else>
          <RouterLink to="/login" class="nav-link">
            Вход
          </RouterLink>

          <RouterLink to="/register" class="nav-link register-link">
            Регистрация
          </RouterLink>
        </template>
      </div>
    </nav>

    <RouterView />
  </div>
</template>

<script setup>
import { ref } from "vue"
import { useRouter } from "vue-router"

const router = useRouter()

const currentUser = ref(
  JSON.parse(localStorage.getItem("user"))
)

const logout = () => {
  localStorage.removeItem("token")
  localStorage.removeItem("user")

  currentUser.value = null

  router.push("/login")
}
</script>

<style scoped>
.navbar {
  height: 70px;
  padding: 0 40px;

  background: white;
  border-bottom: 1px solid #e2e8f0;

  display: flex;
  justify-content: space-between;
  align-items: center;
}

.logo {
  font-size: 28px;
  font-weight: 700;
  color: #1e293b;
  text-decoration: none;

  position: relative;

  transition: color 0.25s ease;
}

.logo::after {
  content: "";

  position: absolute;

  left: 0;
  bottom: -4px;

  width: 100%;
  height: 3px;

  

  border-radius: 999px;

  transform: scaleX(0);
  transform-origin: center;

  transition: transform 0.25s ease;
}

.logo:hover {
  color: #8a7a3c;
}

.logo:hover::after {
  transform: scaleX(1);
  background: #8a7a3c;
}

.nav-actions {
  display: flex;
  align-items: center;
  gap: 15px;
}

.nav-link {
  color: #2563eb;
  text-decoration: none;
  font-weight: bold;
}

.register-link {
  background: #2563eb;
  color: white;
  padding: 9px 14px;
  border-radius: 8px;
}

.user-info {
  color: #475569;
  font-weight: bold;
}

.logout-button {
  background: #ef4444;
  color: white;

  border: none;
  border-radius: 8px;

  padding: 9px 14px;

  cursor: pointer;
  font-weight: bold;
}

.logout-button:hover {
  background: #dc2626;
}
</style>