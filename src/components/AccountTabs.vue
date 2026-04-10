<script setup>
const tabs = [
  { to: '/profile', label: 'Обзор' },
  { to: '/profile/public', label: 'Профиль' },
  { to: '/profile/referrals', label: 'Рефералы' },
  { to: '/profile/social', label: 'Социальный блок' },
]
</script>

<template>
  <nav class="account-tabs">
    <RouterLink v-for="tab in tabs" :key="tab.to" :to="tab.to" class="tab-link">
      {{ tab.label }}
    </RouterLink>
  </nav>
</template>
