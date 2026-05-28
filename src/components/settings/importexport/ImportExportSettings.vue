<script setup lang="ts">
import LocalExport from "@/components/settings/importexport/LocalExport.vue";
import CloudSync from "@/components/settings/importexport/CloudSync.vue";
</script>

<template>
	<VContainer>
		<VRow>
			<VCol>
				<LocalExport />
			</VCol>
		</VRow>
		<VRow> </VRow>
		<VRow>
			<VCol>
				<CloudSync />
			</VCol>
		</VRow>
	</VContainer>
</template>

<style scoped></style>
