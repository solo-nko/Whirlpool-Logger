<script setup lang="ts">
import useWhirlpoolStore from "@/stores/whirlpools.ts";
import useSyncStore from "@/stores/sync.ts";
import useSettingsStore from "@/stores/settings.ts";

enum SyncScenarios {
	SERVER_HAS_DATA_CLIENT_HAS_DATA,
	SERVER_HAS_DATA_CLIENT_NO_DATA,
	SERVER_NO_DATA_CLIENT_NO_DATA,
	SERVER_NO_DATA_CLIENT_HAS_DATA,
	ERROR_STATUS
}

type SyncConfirmProps = {
	isOpen: boolean;
};

const { isOpen } = defineProps<SyncConfirmProps>();
const emits = defineEmits<{
	confirmSync: [syncPriority?: "server" | "client"];
	cancelSync: [];
}>();
const whirlpoolStore = useWhirlpoolStore();
const syncStore = useSyncStore();
const settingsStore = useSettingsStore();

const internalIsOpen = ref(isOpen);
const syncButtonLoading = ref(false);
const syncPossible = ref(false);

const nonDeletedWhirlpools = computed(() =>
	whirlpoolStore.clientWhirlpools.filter((whirlpool) => whirlpool.deletedOn === null)
);
const serverWhirlpools = computed(() => syncStore.serverWhirlpools ?? []);
const whichSyncScenario = computed(() => {
	if (syncPossible.value === false) return SyncScenarios.ERROR_STATUS;
	// Scenario: No Whirlpools on Client + Whirlpools on Server
	if (nonDeletedWhirlpools.value.length === 0 && serverWhirlpools.value.length > 0)
		return SyncScenarios.SERVER_HAS_DATA_CLIENT_NO_DATA;

	// Scenario: Whirlpools on Client + No Whirlpools on Server
	if (nonDeletedWhirlpools.value.length > 0 && serverWhirlpools.value.length === 0)
		return SyncScenarios.SERVER_NO_DATA_CLIENT_HAS_DATA;

	// Scenario: Whirlpools on Client + Whirlpools on Server
	if (nonDeletedWhirlpools.value.length > 0 && serverWhirlpools.value.length > 0)
		return SyncScenarios.SERVER_HAS_DATA_CLIENT_HAS_DATA;

	// Scenario: No Whirlpools on Client + No Whirlpools on Server
	return SyncScenarios.SERVER_NO_DATA_CLIENT_NO_DATA;
});

const onSyncConfirm = () => {
	emits("confirmSync");
};
const onSyncCancel = () => {
	emits("cancelSync");
};

watch(
	() => isOpen,
	async (newValue) => {
		internalIsOpen.value = newValue;
		// this was initially in an onMounted hook, but vuetify mounts dialogs in the background even before they're properly opened, which I anticipate could lead to some unintended query results.
		if (newValue === true) {
			const syncCode = syncStore.syncCode;
			if (syncCode && syncStore.ValidateSyncCode(syncCode)) {
				syncButtonLoading.value = true;
				const getResult = await syncStore
					.GetServerRecords(syncCode)
					.finally(() => (syncButtonLoading.value = false));
				if (getResult.message) settingsStore.DisplayToast(getResult.message);
				syncPossible.value = getResult.result === "ok";
			}
		}
	}
);
</script>

<template>
	<VDialog v-model="internalIsOpen">
		<VCard>
			<VCardTitle>Sync Confirmation</VCardTitle>
			<VSkeletonLoader type="sentences" :loading="syncButtonLoading">
				<!--	Scenario: No Whirlpools on Client + Whirlpools on Server-->
				<VCardText v-if="whichSyncScenario === SyncScenarios.SERVER_HAS_DATA_CLIENT_NO_DATA">
					You do not appear to have any whirlpools saved locally, but there is data linked to this
					Sync Code on the server. Proceed with sync to restore your data from the server.
				</VCardText>

				<!--	Scenario: No Whirlpools on Client + No Whirlpools on Server-->
				<VCardText
					v-else-if="
						whichSyncScenario === SyncScenarios.SERVER_NO_DATA_CLIENT_NO_DATA ||
						whichSyncScenario === SyncScenarios.SERVER_NO_DATA_CLIENT_HAS_DATA
					"
				>
					No data linked to this Sync Code was found on the server. Proceed with sync to backup your
					local data.
				</VCardText>

				<!--	Scenario: Whirlpools on Client + Whirlpools on Server (first time) -->
				<!--				<VCardText-->
				<!--					v-else-if="-->
				<!--						whichSyncScenario === SyncScenarios.SERVER_HAS_DATA_CLIENT_HAS_DATA &&-->
				<!--						syncStore.lastSynced === null-->
				<!--					"-->
				<!--				>-->
				<!--					Data linked to this Sync Code was found on the server, but you also have data saved-->
				<!--					locally. Please choose which side to prioritize. The side you don't choose will be-->
				<!--					overwritten by the side you do. This should only be necessary for this first sync.-->
				<!--					<VRadioGroup v-model="prioritizeServerRecords">-->
				<!--						<VRadio :value="true" label="Cloud (Restore from Cloud)" />-->
				<!--						<VRadio :value="false" label="Local (Backup from Local)" />-->
				<!--					</VRadioGroup>-->
				<!--				</VCardText>-->
				<!--	Scenario: No Whirlpools on Client + Whirlpools on Server-->
				<VCardText v-else-if="whichSyncScenario === SyncScenarios.ERROR_STATUS">
					Unable to acquire sync information.
				</VCardText>
				<VCardText v-else>Data found on the server.</VCardText>
			</VSkeletonLoader>

			<VCardActions>
				<VBtn :loading="syncButtonLoading" :disabled="!syncPossible" @click="onSyncConfirm">
					Sync
				</VBtn>
				<VBtn @click="onSyncCancel">Cancel</VBtn>
			</VCardActions>
		</VCard>
	</VDialog>
</template>

<style scoped></style>
