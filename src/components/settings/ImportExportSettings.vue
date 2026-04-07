<script setup lang="ts">
import ImportExport from "@/components/ImportExport.vue";
import CloudSync from "@/components/CloudSync.vue";
</script>

<template>
	<VContainer>
		<h2>Local Import and Export</h2>
		<p>For people who prefer to move their data around the old-fashioned way.</p>
		<ImportExport />
		<h2>Cloud Sync</h2>
		<p>Sync your whirlpools in the cloud!</p>
		<CloudSync />
	</VContainer>
</template>

<style scoped></style>
