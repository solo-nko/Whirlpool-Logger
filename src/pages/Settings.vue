<script setup lang="ts">
import Quill from "quill"
import CategorySettings from "@/components/settings/category/CategorySettings.vue";
import AboutSettings from "@/components/settings/AboutSettings.vue";
import GeneralSettings from "@/components/settings/general/GeneralSettings.vue";
import ImportExportSettings from "@/components/settings/category/ImportExportSettings.vue";
import ThemeSettings from "@/components/settings/ThemeSettings.vue";
import QuillImporter from "@/utils/QuillImporter.ts";

const settingsPages = {
	AboutSettings,
	CategorySettings,
	GeneralSettings,
	ImportExportSettings,
	ThemeSettings
};

type settingsRefs = keyof typeof settingsPages;

const currentTab = ref<settingsRefs>("GeneralSettings");
onMounted(() => {
	QuillImporter.quill.instance = new Quill("#temp-editor");
});
</script>

<template>
	<div v-show="false" id="temp-editor"></div>
	<!--	TODO: highlight which icon/tab is currently selected -->
	<VNavigationDrawer rail expand-on-hover permanent location="right">
		<VList>
			<VListItem prepend-icon="$cogs" link @click="currentTab = 'GeneralSettings'"
				>General</VListItem
			>
			<VListItem prepend-icon="$swap" link @click="currentTab = 'ImportExportSettings'"
				>Export & Sync</VListItem
			>
			<VListItem prepend-icon="$paletteSwatch" link @click="currentTab = 'ThemeSettings'"
				>Theming</VListItem
			>
			<VListItem prepend-icon="$clipboard" link @click="currentTab = 'CategorySettings'"
				>Categories</VListItem
			>
			<VListItem prepend-icon="$info" link @click="currentTab = 'AboutSettings'">About</VListItem>
		</VList>
	</VNavigationDrawer>
	<VContainer>
		<Component :is="settingsPages[currentTab]"></Component>
	</VContainer>
</template>

<style scoped></style>
