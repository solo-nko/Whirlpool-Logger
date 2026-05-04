<script setup lang="ts">
import useSyncStore from "@/stores/sync.ts";
import useSettingsStore from "@/stores/settings.ts";

const syncStore = useSyncStore();
const settingsStore = useSettingsStore();
const syncCodeValid = ref(false);

const requestButtonLoading = ref(false);
const validateButtonLoading = ref(false);
const syncButtonLoading = ref(false);

function ValidateSyncCode(code: string) {
	const testCondition = /^[a-zA-Z0-9]{10}$/;
	return testCondition.test(code);
}

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
		if (ValidateSyncCode(value)) return true;
		return "Sync Code contains invalid characters.";
	}
};

const login = async () => {
	validateButtonLoading.value = true;
	const result = await syncStore.ValidateUser();
	if (result.message) settingsStore.DisplayToast(result.message);
	validateButtonLoading.value = false;
};

const getNewSyncCode = async () => {
	requestButtonLoading.value = true;
	const result = await syncStore.RequestSyncCode();
	if (result.message) settingsStore.DisplayToast(result.message);
	requestButtonLoading.value = false;
};

const sync = async () => {
	syncButtonLoading.value = true;
	const syncCode = syncStore.syncCode;
	if (syncCode && ValidateSyncCode(syncCode)) {
		await syncStore.SyncWithServer(syncCode);
	}
	syncButtonLoading.value = false;
};
</script>

<template>
	<VRow>
		<VCol>
			<h2>Cloud Sync</h2>
			<VLabel>Sync your whirlpool data to the cloud!</VLabel>
			<p>
				Using a sync code, you can keep your data up-to-date on whatever device you use the app on.
			</p>
		</VCol>
	</VRow>
	<VRow>
		<VCol>
			<VForm v-model="syncCodeValid">
				<VTextField
					v-model="syncStore.syncCode"
					label="Sync Code"
					:rules="[syncCodeRules.hasValue, syncCodeRules.length, syncCodeRules.regex]"
				/>
			</VForm>
		</VCol>
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
				:disabled="syncCodeValid !== true"
				@click="login"
			>
				Validate Sync Code
			</VBtn>
		</VCol>
		<VCol class="flex-grow-0 h-full self-center">
			<VBtn :loading="syncButtonLoading" :disabled="!syncStore.syncPossible" @click="sync"
				>Sync</VBtn
			>
		</VCol>
		<VCol cols="12" md="8">
			<VCheckbox
				v-model="syncStore.autoSyncEnabled"
				:disabled="!syncStore.syncPossible"
				label="Sync Automatically"
				:hide-details="true"
			></VCheckbox>
		</VCol>
	</VRow>
</template>

<style scoped></style>
