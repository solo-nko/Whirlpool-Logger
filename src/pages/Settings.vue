<script setup lang="ts">
import CategorySettings from "@/components/settings/category/CategorySettings.vue";
import AboutSettings from "@/components/settings/AboutSettings.vue";
import GeneralSettings from "@/components/settings/general/GeneralSettings.vue";
import ImportExportSettings from "@/components/settings/importexport/ImportExportSettings.vue";
import ThemeSettings from "@/components/settings/theme/ThemeSettings.vue";

const settingsPages = {
	AboutSettings,
	CategorySettings,
	GeneralSettings,
	ImportExportSettings,
	ThemeSettings
};

type settingsRefs = keyof typeof settingsPages;

const currentTab = ref<settingsRefs>("GeneralSettings");
</script>

<template>
	<VNavigationDrawer rail expand-on-hover permanent location="right">
		<VList>
			<VListItem
				prepend-icon="$cogs"
				link
				:class="currentTab === 'GeneralSettings' ? 'active-tab' : ''"
				@click="currentTab = 'GeneralSettings'"
			>
				General
			</VListItem>
			<VListItem
				prepend-icon="$swap"
				link
				:class="currentTab === 'ImportExportSettings' ? 'active-tab' : ''"
				@click="currentTab = 'ImportExportSettings'"
			>
				Export & Sync
			</VListItem>
			<VListItem
				prepend-icon="$paletteSwatch"
				link
				:class="currentTab === 'ThemeSettings' ? 'active-tab' : ''"
				@click="currentTab = 'ThemeSettings'"
			>
				Theming
			</VListItem>
			<VListItem
				prepend-icon="$clipboard"
				link
				:class="currentTab === 'CategorySettings' ? 'active-tab' : ''"
				@click="currentTab = 'CategorySettings'"
			>
				Categories
			</VListItem>
			<VListItem
				prepend-icon="$info"
				link
				:class="currentTab === 'AboutSettings' ? 'active-tab' : ''"
				@click="currentTab = 'AboutSettings'"
				>About
			</VListItem>
		</VList>
	</VNavigationDrawer>
	<VContainer>
		<KeepAlive>
			<Component :is="settingsPages[currentTab]" />
		</KeepAlive>
	</VContainer>
</template>

<!--suppress CssUnresolvedCustomProperty -->
<style scoped>
.active-tab {
	color: rgb(var(--v-theme-secondary));
}
</style>
