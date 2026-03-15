<script setup lang="ts">
import QuillImporter from "@/utils/QuillImporter.ts";
import { ExportDatabase } from "@/utils/ImportExportUtils.ts";

const uploadedFile = ref<File | null>(null);
const oldVersion = ref<boolean>(false);

const onClickExport = async () => {
	await ExportDatabase()
}
const onClickImport = async () => {
	if (uploadedFile.value === null) return;
	if (oldVersion.value === true) {
		await QuillImporter.ImportOldFormat(uploadedFile.value);
		// uploadedFile.value = null;
	}
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
				<VBtn @click="onClickExport">Export Whirlpool Logs</VBtn>
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
					<VCol>
						<VCheckboxBtn v-model="oldVersion">
							<template v-slot:label
								><span>I'm importing from the old version of the app!</span></template
							>
						</VCheckboxBtn>
						<VFileInput
							v-model="uploadedFile"
							label="Place database file here..."
							accept=".json"
							clearable
						/>
					</VCol>
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
