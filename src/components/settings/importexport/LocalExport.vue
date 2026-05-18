<script setup lang="ts">
import { ExportDatabase, ImportDatabase } from "@/utils/ImportExportUtils.ts";
import useSettingsStore from "@/stores/settings.ts";

const settingsStore = useSettingsStore();
const uploadedFile = ref<File | undefined>(undefined);
const overwrite = ref<boolean>(true);

const onClickExport = async () => {
	await ExportDatabase();
};
const onClickImport = async () => {
	if (uploadedFile.value === undefined || uploadedFile.value === null) return;
	const result = await ImportDatabase(uploadedFile.value, overwrite.value);
	if (result.message) settingsStore.DisplayToast(result.message);
};
</script>

<template>
	<VRow>
		<VCol>
			<h2>Local Import and Export</h2>
			<p>For people who prefer to move their data around the old-fashioned way.</p>
		</VCol>
	</VRow>
	<VRow>
		<VCol>
			<VLabel>Export Whirlpool Logs to a local file.</VLabel>
			<p>
				Export your entire database to a small JSON file. You can later use the import area below to
				add it back in. To protect the integrity of your data, it is strongly recommended to avoid
				directly editing the file.
			</p>
			<VBtn @click="onClickExport">Export Whirlpool Logs</VBtn>
		</VCol>
	</VRow>
	<VRow>
		<VCol>
			<VRow density="compact">
				<VCol>
					<VLabel>Import Whirlpool Logs from local file</VLabel>
					<p>You can import your database from a local JSON file.</p>
				</VCol>
			</VRow>
			<VRow density="compact">
				<VCol>
					<VCheckboxBtn v-model="overwrite" label="Overwrite existing database" />
				</VCol>
			</VRow>
			<VRow class="items-center" density="compact">
				<VCol cols="12" md="9">
					<VFileInput
						v-model="uploadedFile"
						label="Place database file here..."
						accept=".json"
						clearable
						hide-details
					/>
				</VCol>
				<VCol>
					<VBtn :disabled="uploadedFile === undefined" @click="onClickImport">
						Import Whirlpool Logs
					</VBtn>
				</VCol>
			</VRow>
		</VCol>
	</VRow>
</template>

<style scoped>
@reference "tailwindcss";

p {
	@apply mt-0 mb-2;
}
</style>
