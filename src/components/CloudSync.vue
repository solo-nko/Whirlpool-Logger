<script setup lang="ts">
import useSyncStore from "@/stores/sync.ts";
import localStorageKeys from "@/utils/config/LocalStorageKeys.ts";

const syncStore = useSyncStore();
const syncReady = ref(false);

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
		return "Sync Code must be 10 characters";
	},
	regex: (value: string) => {
		if (ValidateSyncCode(value)) return true;
		return "Sync Code contains invalid characters.";
	}
};

const requestSyncCode = async () => {
	try {
		const pass = import.meta.env.VITE_API_PASSWORD;
		if (pass) {
			const newUser = await syncStore.api.instance.collection("users").create({
				password: pass,
				passwordConfirm: pass
			});
			if (newUser) {
				const newCode = newUser.syncCode;
				localStorage.setItem(localStorageKeys.SyncCode, newCode);
				syncStore.syncCode = newCode;
			}
		}
	} catch (error) {
		console.log(error);
	}
};
</script>

<template>
	<VBtn v-if="!syncStore.syncCode" @click="requestSyncCode">Request Sync Code</VBtn>
	<!--	TODO: add animated transition?-->
	<VBtn v-else :disabled="syncReady !== true">Validate Sync Code</VBtn>
	<VForm v-model="syncReady">
		<VTextField
			v-model="syncStore.syncCode"
			label="Sync Code"
			:rules="[syncCodeRules.hasValue, syncCodeRules.length, syncCodeRules.regex]"
		/>
	</VForm>
	<VBtn>Backup</VBtn>
	<VBtn>Restore</VBtn>
	<VCheckbox label="Sync Automatically"></VCheckbox>
</template>

<style scoped></style>
