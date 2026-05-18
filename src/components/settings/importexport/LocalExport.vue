<script setup lang="ts">
import { ExportDatabase, ImportDatabase } from "@/utils/ImportExportUtils.ts";
import useSettingsStore from "@/stores/settings.ts";
import QuillImporter from "@/utils/QuillImporter.ts";
import type { IProcessResult } from "@/utils/types/IProcessResult.ts";

const settingsStore = useSettingsStore();
const uploadedFile = ref<File | null>(null);
const oldVersion = ref<boolean>(false);

const onClickExport = async () => {
	await ExportDatabase();
};
const onClickImport = async () => {
	let result: IProcessResult = { result: "ok" };
	if (uploadedFile.value === null) return;
	if (oldVersion.value === true) {
		result = await QuillImporter.ImportOldFormat(uploadedFile.value, true);
	} else {
		result = await ImportDatabase(uploadedFile.value);
	}
	if (result.message) settingsStore.DisplayToast(result.message);
};

// TODO: add option to choose between "overwrite" and "add", basically whether to add on top of existing database, or replace it with what's imported in the json.
</script>

<template>
	<VRow>
		<VCol>
			<h2>Local Import and Export</h2>
			<p>For people who prefer to move their data around the old-fashioned way.</p>
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
			<VRow>
				<VCol>
					<VLabel>Import Whirlpool Logs from local file</VLabel>
					<p>You can import your database from a local JSON file.</p>
				</VCol>
			</VRow>
			<VRow>
				<VCol cols="12" md="9">
					<VCheckboxBtn v-model="oldVersion">
						<template v-slot:label>
							<span>
								I'm importing from the old version of the app! ※Please note! The old version will
								NOT work if you don't have four categories named "Games", "TV", "Movies", and
								"Books" respectively. The current version of the app creates these categories by
								default, so if you haven't renamed any of them, you can ignore this warning.
							</span>
						</template>
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
</template>

<style scoped>
@reference "tailwindcss";

p {
	@apply mt-0 mb-2;
}
</style>
