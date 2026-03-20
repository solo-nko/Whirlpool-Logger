import { useDisplay } from "vuetify";
import type { Category } from "@/utils/types/Category.ts";
import useCategoriesStore from "@/stores/categories.ts";
import type { IDashboard } from "@/utils/types/IDashboard.ts";

enum LocalStorageKeys {
	DefaultEntry = "defaultEntryCategory",
	DefaultTable = "defaultTableCategory",
	Dashboards = "dashboards"
}

const useSettingsStore = defineStore("settings-store", () => {
	const categoryStore = useCategoriesStore();

	const defaultEntryCategory = ref<Category | undefined>();
	const defaultTableCategory = ref<Category | undefined>();
	const display = useDisplay();

	function SetDefaultEntryToLocalStorage(input: Category) {
		localStorage.setItem(LocalStorageKeys.DefaultEntry, input.id);
	}

	function SetDefaultTableToLocalStorage(input: Category) {
		localStorage.setItem(LocalStorageKeys.DefaultTable, input.id);
	}

	// Dashboard settings
	// TODO: sort order according to category.displayOrder
	const dashboards = ref<IDashboard[]>([]);
	const displayedDashboards = computed(() =>
		dashboards.value.filter((dash) => dash.displayed === true)
	);
	const noneStatus = { id: "none", name: "None" };

	function PopulateDashboardsTable() {
		const storedDashboards = localStorage.getItem(LocalStorageKeys.Dashboards);
		if (storedDashboards && JSON.parse(storedDashboards).length > 0) {
			dashboards.value = JSON.parse(storedDashboards);
		} else {
			dashboards.value = categoryStore.clientCategories.map((category) => ({
				categoryName: category.name,
				categoryId: category.id,
				displayed: false,
				statuses: [
					...category.availableStatuses.map((status) => ({
						id: status.id,
						name: status.name
					})),
					noneStatus
				],
				selectedStatusOne: category.availableStatuses[0]
					? { id: category.availableStatuses[0].id, name: category.availableStatuses[0].name }
					: noneStatus,
				selectedStatusTwo: noneStatus
			}));
		}
	}
	/** Update dashboards to reflect changes made in Category Editor. */
	function UpdateDashboardsTable(category: Category) {
		const findDashboardIndex = dashboards.value.findIndex(
			(dash) => dash.categoryId === category.id
		);
		if (dashboards.value[findDashboardIndex]) {
			dashboards.value[findDashboardIndex].statuses = [
				...category.availableStatuses.map((status) => ({ id: status.name, name: status.name })),
				noneStatus
			];
		}
	}

	// watch for categories to finish querying from Dexie, and populate settings in response
	watch(
		() => categoryStore.clientCategories,
		(loadedCategories) => {
			const storedEntryDefault = localStorage.getItem(LocalStorageKeys.DefaultEntry);
			const storedTableDefault = localStorage.getItem(LocalStorageKeys.DefaultTable);
			if (loadedCategories.length > 0) {
				if (defaultEntryCategory.value === undefined)
					defaultEntryCategory.value =
						loadedCategories.find((category) => category.id === storedEntryDefault) ??
						loadedCategories[0];
				if (defaultTableCategory.value === undefined)
					defaultTableCategory.value =
						loadedCategories.find((category) => category.id === storedTableDefault) ??
						loadedCategories[0];
			}
			if (dashboards.value.length === 0) {
				PopulateDashboardsTable();
			}
		},
		{ immediate: true }
	);

	watch(
		dashboards,
		(newValue) => {
			localStorage.setItem(LocalStorageKeys.Dashboards, JSON.stringify(toRaw(newValue)));
		},
		{ deep: true }
	);

	return {
		defaultEntryCategory,
		defaultTableCategory,
		SetDefaultEntryToLocalStorage,
		SetDefaultTableToLocalStorage,
		display,
		dashboards,
		displayedDashboards,
		PopulateDashboardsTable,
		UpdateDashboardsTable
	};
});

export default useSettingsStore;
