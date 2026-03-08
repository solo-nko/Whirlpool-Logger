<script setup lang="ts">
import { ImportOldFormat } from "@/utils/transformers.ts";

const uploadedFile = ref<File | null>(null);

const onClickImport = () => {
	if (uploadedFile.value === null) return;
	ImportOldFormat(uploadedFile.value);
};
</script>

<template>
	<VContainer>
		<VRow>
			<VCol>
				<h1>Local Import and Export</h1>
				<p>For people who prefer to move their data around the old-fashioned way.</p>
			</VCol>
		</VRow>
		<VRow>
			<VCol>
				<VLabel>Export Whirlpool Logs to a local file.</VLabel>
				<p>
					Export your entire database to a small JSON file. You can later use the import area below
					to add it back in. To protect the integrity of your data, it is strongly recommended to
					avoid directly editing the file.
				</p>
				<VBtn>Export Whirlpool Logs</VBtn>
			</VCol>
		</VRow>
		<VRow>
			<VCol>
				<VRow>
					<VCol>
						<VLabel>Import Whirlpool Logs from local file</VLabel>
						<p>You can import your database from a local JSON file.</p>
					</VCol>
				</VRow>
				<VRow>
					<VCol cols="12" md="9">
						<VFileInput
							v-model="uploadedFile"
							label="Place database file here..."
							accept=".json"
							clearable
						/>
					</VCol>

					<!--	TODO: I'd prefer to use the append slot here because it aligns better, but it doesn't work too great with mobile screens. Maybe we can do something with v-if and tailwind breakpoints? -->
					<VCol><VBtn @click="onClickImport">Import Whirlpool Logs</VBtn></VCol>
				</VRow>
			</VCol>
		</VRow>
	</VContainer>
</template>

<style scoped>
@reference "tailwindcss";

p {
	@apply mt-0 mb-2;
}
</style>
