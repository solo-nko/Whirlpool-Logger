<script setup lang="ts">
import useSettingsStore from "@/stores/settings.ts";
import CategoryDashboard from "@/components/CategoryDashboard.vue";

const settingsStore = useSettingsStore();
</script>

<template>
	<VContainer>
		<div>This is the dashboard!</div>
		<VRow>
			<VCol v-for="(dash, index) in settingsStore.displayedDashboards" :key="index">
				<CategoryDashboard :dashboard="dash" />
			</VCol>
		</VRow>
	</VContainer>
</template>
