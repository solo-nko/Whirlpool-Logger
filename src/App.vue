<script setup lang="ts">
import useSettingsStore from "./stores/settings";
import { TOAST_TIMEOUT } from "@/utils/Constants.ts";

const settingsStore = useSettingsStore();
</script>

<template>
	<VApp>
		<VAppBar>
			<VAppBarTitle>Whirlpool Logger</VAppBarTitle>
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
