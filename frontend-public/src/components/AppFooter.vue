<script setup lang="ts">
const currentYear = new Date().getFullYear();
</script>

<template>
  <footer class="app-footer">
    <div class="container footer-content">
      <div class="footer-info">
        <p>&copy; {{ currentYear }} Geek Flea Market. Все права защищены.</p>
        <p class="footer-tagline">Площадка для настоящих гиков.</p>
      </div>
      
      <div class="footer-links">
        <div class="link-group">
          <h4>Платформа</h4>
          <router-link to="/">Все объявления</router-link>
          <router-link to="/login">Личный кабинет</router-link>
        </div>
        
        <div class="link-group">
          <h4>Помощь</h4>
          <a href="#">Правила площадки</a>
          <a href="#">Безопасность</a>
        </div>
      </div>
    </div>
  </footer>
</template>

<style scoped>
.app-footer {
  background-color: #f9fafb;
  border-top: 1px solid #eee;
  padding: 3rem 0;
  margin-top: auto;
  color: #6b7280;
}

.footer-content {
  display: flex;
  justify-content: space-between;
  gap: 2rem;
  flex-wrap: wrap;
}

.footer-tagline {
  font-size: 0.875rem;
  margin-top: 0.5rem;
}

.footer-links {
  display: flex;
  gap: 4rem;
}

.link-group h4 {
  color: #111827;
  font-size: 0.875rem;
  font-weight: 700;
  text-transform: uppercase;
  margin-bottom: 1rem;
  letter-spacing: 0.025em;
}

.link-group a {
  display: block;
  text-decoration: none;
  color: inherit;
  font-size: 0.875rem;
  margin-bottom: 0.5rem;
  transition: color 0.2s;
}

.link-group a:hover {
  color: #3b82f6;
}

@media (max-width: 640px) {
  .footer-content {
    flex-direction: column;
  }
  
  .footer-links {
    gap: 2rem;
  }
}
</style>
