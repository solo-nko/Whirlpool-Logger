<script setup lang="ts">
import { useTheme } from "vuetify";
import useSettingsStore from "./stores/settings";
import { TOAST_TIMEOUT } from "@/utils/Constants.ts";
import useSyncStore from "@/stores/sync.ts";
import LocalStorageKeys from "@/utils/config/LocalStorageKeys.ts";

const settingsStore = useSettingsStore();
const syncStore = useSyncStore();
const themeInstance = useTheme();

onMounted(() => {
	// set theme
	const storedTheme = localStorage.getItem(LocalStorageKeys.Theme);
	if (storedTheme) {
		themeInstance.change(storedTheme);
	}
});

onMounted(async () => {
	// sync stuff
	if (syncStore.autoSyncEnabled === true && syncStore.syncCode) {
		syncStore.syncInProgress = true;
		await syncStore.AutoSync().finally(() => (syncStore.syncInProgress = false));
	}
});
</script>

<template>
	<VApp>
		<VAppBar>
			<VAppBarTitle>Whirlpool Logger</VAppBarTitle>
			<VProgressLinear
				:active="syncStore.syncInProgress"
				location="bottom"
				indeterminate
				absolute
			/>
			<template v-slot:append>
				<VFadeTransition>
					<VLabel v-if="syncStore.syncInProgress">Sync in progress...</VLabel>
				</VFadeTransition>
			</template>
		</VAppBar>
		<VMain>
			<RouterView />
			<VSnackbar
				v-model="settingsStore.isToastDisplayed"
				:text="settingsStore.toastMessage"
				:timeout="TOAST_TIMEOUT"
			/>
		</VMain>
		<VBottomNavigation grow order="-1" tag="footer">
			<VBtn to="home">
				<VIcon icon="$spiral" />
				<span>Home</span>
			</VBtn>
			<VBtn to="entry">
				<VIcon icon="$plus" />
				<span>Entry</span>
			</VBtn>
			<VBtn to="records">
				<VIcon icon="$table" />
				<span>Records</span>
			</VBtn>
			<VBtn to="settings">
				<VIcon icon="$cog" />
				<span>Settings</span>
			</VBtn>
		</VBottomNavigation>
	</VApp>
</template>

<style scoped></style>
