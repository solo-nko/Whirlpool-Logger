import { useDisplay } from "vuetify";
import type { Category } from "@/utils/types/Category.ts";
import useCategoriesStore from "@/stores/categories.ts";
import type { IDashboard } from "@/utils/types/IDashboard.ts";
import LocalStorageKeys from "@/utils/config/LocalStorageKeys.ts";

const useSettingsStore = defineStore("settings-store", () => {
	const categoryStore = useCategoriesStore();

	/** ID of category to show by default when creating a new whirlpool. */
	const defaultEntryCategory = ref<string | undefined>();
	/** ID of category to show by default when viewing the database table. */
	const defaultTableCategory = ref<string | undefined>();
	const display = useDisplay();

	/** How many items to show per page on the database table. */
	const itemsPerPage = ref<number>(10);

	function SetDefaultEntryToLocalStorage(categoryId: string) {
		localStorage.setItem(LocalStorageKeys.DefaultEntry, categoryId);
	}

	function SetDefaultTableToLocalStorage(categoryId: string) {
		localStorage.setItem(LocalStorageKeys.DefaultTable, categoryId);
	}

	// Snackbar settings
	const isToastDisplayed = ref<boolean>(false);
	const toastMessage = ref<string>("");
	/**
	 * Displays the toast message popup. The message will go away on its own after a preset number of seconds.
	 * @param message Text to display.
	 */
	function DisplayToast(message: string) {
		toastMessage.value = message;
		isToastDisplayed.value = true;
	}

	// Dashboard settings
	const dashboards = ref<IDashboard[]>([]);
	const displayedDashboards = computed(() =>
		dashboards.value
			.filter((dash) => dash.displayed === true)
			.sort((dashOne, dashTwo) => {
				const displayOrderOne = dashOne.displayOrder ?? 0;
				const displayOrderTwo = dashTwo.displayOrder ?? 0;
				return displayOrderOne - displayOrderTwo;
			})
	);
	const noneStatus = { id: "none", name: "None" };

	function PopulateDashboardsTable() {
		const storedDashboards = localStorage.getItem(LocalStorageKeys.Dashboards);
		if (storedDashboards && JSON.parse(storedDashboards).length > 0) {
			dashboards.value = JSON.parse(storedDashboards);
		} else {
			dashboards.value = categoryStore.clientCategories.map(
				(category): IDashboard => ({
					categoryName: category.name,
					categoryId: category.id,
					displayed: false,
					displayOrder: category.displayOrder,
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
					selectedStatusTwo: noneStatus,
					showTags: false
				})
			);
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

	function ResetDashboards() {
		localStorage.removeItem(LocalStorageKeys.Dashboards);
	}

	// watch for categories to finish querying from Dexie, and populate settings in response
	watch(
		() => categoryStore.clientCategories,
		(loadedCategories) => {
			const storedEntryDefault = localStorage.getItem(LocalStorageKeys.DefaultEntry);
			const storedTableDefault = localStorage.getItem(LocalStorageKeys.DefaultTable);
			if (loadedCategories.length > 0) {
				const findEntryCategory =
					loadedCategories.find((category) => category.id === storedEntryDefault) ??
					loadedCategories[0];
				const findTableCategory =
					loadedCategories.find((category) => category.id === storedTableDefault) ??
					loadedCategories[0];
				if (defaultEntryCategory.value === undefined && findEntryCategory)
					defaultEntryCategory.value = findEntryCategory.id;
				if (defaultTableCategory.value === undefined && findTableCategory)
					defaultTableCategory.value = findTableCategory.id;
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
		isToastDisplayed,
		toastMessage,
		DisplayToast,
		display,
		itemsPerPage,
		dashboards,
		displayedDashboards,
		PopulateDashboardsTable,
		UpdateDashboardsTable,
		ResetDashboards
	};
});

export default useSettingsStore;
