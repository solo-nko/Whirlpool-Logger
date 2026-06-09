<script setup lang="ts">
import { ExportDatabase, ImportDatabase } from "@/utils/ImportExportUtils.ts";
import useSettingsStore from "@/stores/settings.ts";
import useSyncStore from "@/stores/sync.ts";

const settingsStore = useSettingsStore();
const syncStore = useSyncStore();
const uploadedFile = ref<File | undefined>(undefined);

const onClickExport = async () => {
	await ExportDatabase();
};
const onClickImport = async () => {
	if (uploadedFile.value === undefined || uploadedFile.value === null) return;
	const result = await ImportDatabase(uploadedFile.value, true);
	if (result.message) settingsStore.DisplayToast(result.message);
	if (syncStore.autoSyncEnabled) await syncStore.AutoSync();
};
</script>

<template>
	<VCard>
		<VContainer>
			<VRow>
				<VCol>
					<h2 class="mt-1">Local Import and Export</h2>
					<p>For people who prefer to move their data around the old-fashioned way.</p>
				</VCol>
			</VRow>
			<VRow>
				<VCol>
					<h3 class="opacity-75 my-0">Export Whirlpool Logs to a local file.</h3>
					<p>
						Export your entire database to a small JSON file. You can later use the import area
						below to add it back in.
					</p>
					<p class="alert">
						⚠️ To protect the integrity of your data, do not edit the exported file yourself.
					</p>
					<VBtn class="mt-4" @click="onClickExport">Export Whirlpool Logs</VBtn>
				</VCol>
			</VRow>
			<VRow>
				<VDivider thickness="2" />
			</VRow>
			<VRow>
				<VCol>
					<VRow density="compact">
						<VCol>
							<h3 class="opacity-75 my-0">Import Whirlpool Logs from local file</h3>
							<p>
								You can import your database from a file exported using the Export button above.
							</p>
							<!--	While it is probably possible to handle imports additively, I think that could create unforeseen issues at the moment, so I'll consider implementing it later. -->
							<p class="alert">⚠️ Importing will overwrite your current database.</p>
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
		</VContainer>
	</VCard>
</template>

<style scoped>
@reference "tailwindcss";

p {
	@apply mt-0 mb-2;
}
</style>
