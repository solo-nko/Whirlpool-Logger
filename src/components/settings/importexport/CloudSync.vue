<script setup lang="ts">
import { DateTime } from "luxon";
import useSyncStore from "@/stores/sync.ts";
import useSettingsStore from "@/stores/settings.ts";
import SyncConfirm from "@/components/settings/importexport/SyncConfirm.vue";

const syncStore = useSyncStore();
const settingsStore = useSettingsStore();
const syncCodeInputValid = ref<boolean>(false);

const requestButtonLoading = ref(false);
const validateButtonLoading = ref(false);
const syncButtonLoading = ref(false);
const syncConfirmOpen = ref(false);

const lastSyncedMessage = computed(() => {
	const lastSynced = syncStore.lastSynced;
	if (lastSynced === null) return "Unknown";
	return lastSynced.toLocaleString(DateTime.DATETIME_FULL);
});

const syncPossible = ref<boolean>(syncStore.CheckAuth() || false);
const hasSyncedBefore = computed(() => syncStore.lastSynced !== null);

const syncCodeRules = {
	hasValue: (value: string) => {
		if (value) return true;
		return "Enter Sync Code.";
	},
	length: (value: string) => {
		if (value.length === 10) return true;
		return "Sync Code must be 10 characters.";
	},
	regex: (value: string) => {
		if (syncStore.ValidateSyncCode(value)) return true;
		return "Sync Code contains invalid characters.";
	}
};

const login = async () => {
	validateButtonLoading.value = true;
	const result = await syncStore.ValidateUser();
	if (result.message) settingsStore.DisplayToast(result.message);
	if (result.result === "ok") syncPossible.value = true;
	validateButtonLoading.value = false;
};

const getNewSyncCode = async () => {
	requestButtonLoading.value = true;
	const result = await syncStore.RequestSyncCode();
	if (result.message) settingsStore.DisplayToast(result.message);
	// if (result.result === "ok") syncPossible.value = true;
	requestButtonLoading.value = false;
};

const onConfirmSync = async () => {
	syncButtonLoading.value = true;
	syncConfirmOpen.value = false;
	const syncCode = syncStore.syncCode;
	if (syncCode && syncStore.ValidateSyncCode(syncCode)) {
		syncStore.syncInProgress = true;
		// As we already set up the synced data in the display prompt (SyncConfirm), we proceed directly to sync operations
		const syncResult = await syncStore
			.SyncWithServer(syncCode)
			.finally(() => (syncStore.syncInProgress = false));
		if (syncResult.message) settingsStore.DisplayToast(syncResult.message);
	}
	syncButtonLoading.value = false;
};

const onClickSync = () => {
	syncConfirmOpen.value = true;
};

const onCancelSync = () => {
	syncConfirmOpen.value = false;
};

watch(
	() => syncStore.syncCode,
	() => {
		syncPossible.value = syncStore.CheckAuth();
	}
);
</script>

<template>
	<VCard>
		<VContainer>
			<VRow>
				<VCol>
					<h2 class="mt-1">Cloud Sync</h2>
					<h3 class="opacity-75 my-0">Sync your whirlpool data to the cloud!</h3>
					<p>
						Using a "Sync Code," you can keep your data up-to-date on whatever device you use the
						app on. To use this feature, first request a new Sync Code from the server. This will be
						used to identify your data across devices. Validate the new Sync Code to "login" to the
						service, and then press "Sync." Once you have your Sync Code, you can enter it here on
						other devices to download your data. Sync Codes automatically expire after a period of
						inactivity. When that happens, all of your data synced on the cloud will be deleted, but
						you can simply re-upload it by requesting a new Sync Code and syncing again.
					</p>
					<p class="alert">⚠️ This feature is still in testing.</p>
					<p class="alert">
						⚠️ Data is not encrypted, so do not use this feature with sensitive information.
					</p>
				</VCol>
			</VRow>
			<VRow>
				<VCol>
					<VForm v-model="syncCodeInputValid">
						<VTextField
							v-model="syncStore.syncCode"
							label="Sync Code"
							:rules="[syncCodeRules.hasValue, syncCodeRules.length, syncCodeRules.regex]"
							clearable
						/>
					</VForm>
				</VCol>
			</VRow>
			<VRow>
				<VSkeletonLoader
					type="sentences"
					:loading="syncStore.syncInProgress"
					class="grow"
					elevation="0"
				>
					<div class="opacity-75 text-center">Last Synced: {{ lastSyncedMessage }}</div>
				</VSkeletonLoader>
			</VRow>
			<VRow>
				<VCol class="flex-grow-0 h-full self-center">
					<VBtn v-if="!syncStore.syncCode" :loading="requestButtonLoading" @click="getNewSyncCode">
						Request Sync Code
					</VBtn>
					<!--	TODO: add animated transition?-->
					<VBtn
						v-else
						:loading="validateButtonLoading"
						:disabled="syncCodeInputValid !== true"
						@click="login"
					>
						Validate Sync Code
					</VBtn>
				</VCol>
				<VCol class="flex-grow-0 h-full self-center">
					<VTooltip v-if="!syncPossible" location="bottom" text="Validate Sync Code first">
						<template v-slot:activator="{ props }">
							<!-- Tooltips dont seem to activate on buttons that are disabled, so I wrapped the button in a span.-->
							<span v-bind="props"><VBtn :loading="syncButtonLoading" disabled>Sync</VBtn></span>
						</template>
					</VTooltip>
					<VBtn v-else :loading="syncButtonLoading" :disabled="!syncPossible" @click="onClickSync">
						Sync
					</VBtn>
				</VCol>
				<VCol cols="12" md="8">
					<VCheckbox
						v-model="syncStore.autoSyncEnabled"
						:disabled="!syncPossible || !hasSyncedBefore"
						:label="
							hasSyncedBefore
								? 'Sync Automatically'
								: 'Sync Automatically (Complete a manual sync first)'
						"
						:hide-details="true"
					></VCheckbox>
				</VCol>
			</VRow>
		</VContainer>
	</VCard>
	<SyncConfirm
		:is-open="syncConfirmOpen"
		@confirm-sync="onConfirmSync"
		@cancel-sync="onCancelSync"
	/>
</template>

<style scoped></style>
