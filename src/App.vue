<script setup lang="ts"></script>

<template>
  <VApp>
    <VAppBar>
      <VAppBarTitle>Whirlpool Logger</VAppBarTitle>
    </VAppBar>
    <VMain><RouterView /></VMain>
    <VBottomNavigation>
      <VBtn to="home">Home</VBtn>
      <VBtn to="entry">Entry</VBtn>
      <VBtn to="records">Records</VBtn>
      <VBtn to="settings">Settings</VBtn>
    </VBottomNavigation>
  </VApp>
</template>

<style scoped></style>
