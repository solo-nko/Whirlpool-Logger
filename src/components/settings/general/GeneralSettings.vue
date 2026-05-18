<script setup lang="ts">
import { useDisplay } from "vuetify";
import useCategoriesStore from "@/stores/categories.ts";
import useSettingsStore from "@/stores/settings.ts";
import { type Category } from "@/utils/types/Category.ts";
import type { IHeaderItem } from "@/utils/types/IHeaderItem.ts";

const settingsStore = useSettingsStore();
const categoryStore = useCategoriesStore();
const display = useDisplay();

// Display settings
const entryDefault = ref<Category[]>([]);
const tableDefault = ref<Category[]>([]);

// Dashboard settings
const tableHeaders = ref<IHeaderItem[]>([
	{ title: "Display on Home", key: "displayed", sortable: false },
	{ title: "Category", value: "categoryName", sortable: true },
	{
		title: "First Display Status",
		key: "selectedStatusOne",
		sortable: false
	},
	{
		title: "Second Display Status",
		key: "selectedStatusTwo",
		sortable: false
	}
]);

const onClickResetDashboards = () => {
	settingsStore.ResetDashboards();
	settingsStore.PopulateDashboardsTable();
};

watch(
	() => categoryStore.clientCategories,
	(loadedCategories) => {
		if (loadedCategories.length > 0) {
			if (entryDefault.value.length === 0) entryDefault.value.push(...loadedCategories);
			if (tableDefault.value.length === 0) tableDefault.value.push(...loadedCategories);
		}
	},
	{ immediate: true }
);

const sendToEntryStoreFunction = (input: string | null) => {
	if (input !== null) settingsStore.SetDefaultEntryToLocalStorage(input);
};
const sendToTableStoreFunction = (input: string | null) => {
	if (input !== null) settingsStore.SetDefaultTableToLocalStorage(input);
};
</script>

<template>
	<VContainer>
		<h2>General Settings</h2>
		<!--Display Settings-->
		<VCard>
			<VContainer>
				<VCardTitle>Display Defaults</VCardTitle>

				<VRow>
					<VCol>
						<VRadioGroup
							v-model="settingsStore.defaultEntryCategory"
							label="Default Entry Category"
							@update:model-value="sendToEntryStoreFunction"
						>
							<VRadio
								v-for="category in entryDefault"
								:key="category.id"
								:label="category.name"
								:value="category.id"
							/>
						</VRadioGroup>
					</VCol>
					<VCol>
						<VRadioGroup
							v-model="settingsStore.defaultTableCategory"
							label="Default Table Category"
							@update:model-value="sendToTableStoreFunction"
						>
							<VRadio
								v-for="category in tableDefault"
								:key="category.id"
								:label="category.name"
								:value="category.id"
							/>
						</VRadioGroup>
					</VCol>
				</VRow>
			</VContainer>
		</VCard>
		<br />
		<VCard>
			<VContainer>
				<VCardTitle>Home Settings</VCardTitle>
				<VContainer class="py-0">
					<p>
						Here you can set what appears on the home screen.
						<span v-if="display.mobile.value"
							>Try using the "Reset Dashboards display" button if your dashboards stop displaying
							correctly. You may also need to refresh the page.
						</span>
					</p>
				</VContainer>
				<VDataTable :headers="tableHeaders" :items="settingsStore.dashboards" hide-default-footer>
					<!--	 eslint-disable vue/valid-v-slot -->
					<!-- eslint-disable		vue/v-on-event-hyphenation-->
					<template v-slot:item.displayed="{ item }">
						<VCheckboxBtn
							v-model="item.displayed"
							:disabled="
								settingsStore.displayedDashboards.length >= 4 &&
								!settingsStore.displayedDashboards.find(
									(dash) => dash.categoryId === item.categoryId
								)
							"
						/>
					</template>
					<!-- eslint-enable		vue/v-on-event-hyphenation-->
					<template v-slot:item.selectedStatusOne="{ item }">
						<VSelect
							v-model="item.selectedStatusOne"
							:disabled="
								!settingsStore.displayedDashboards.find(
									(dash) => dash.categoryId === item.categoryId
								)
							"
							:items="item.statuses"
							item-title="name"
							return-object
							hide-details
							class="my-2"
						/>
					</template>
					<template v-slot:item.selectedStatusTwo="{ item }">
						<VSelect
							v-model="item.selectedStatusTwo"
							:disabled="
								!settingsStore.displayedDashboards.find(
									(dash) => dash.categoryId === item.categoryId
								)
							"
							:items="item.statuses"
							item-title="name"
							return-object
							hide-details
						/>
					</template>
					<!--		 eslint-enable vue/valid-v-slot -->
					<template v-slot:bottom>
						<VRow>
							<VCol v-if="!display.mobile.value">
								<VTooltip
									text="Try this if your dashboards stop displaying correctly (usually after an import or sync). You may also need to refresh the page."
									location="bottom"
								>
									<template v-slot:activator="{ props }">
										<VBtn v-bind="props" variant="outlined" @click="onClickResetDashboards()"
											>Reset Dashboards display</VBtn
										>
									</template>
								</VTooltip>
							</VCol>

							<VCol v-else>
								<VBtn variant="outlined" @click="onClickResetDashboards()"
									>Reset Dashboards display</VBtn
								>
							</VCol>
						</VRow>
					</template>
				</VDataTable>
			</VContainer>
		</VCard>
	</VContainer>
</template>

<style scoped></style>
