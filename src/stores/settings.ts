import type { ICategory } from "@/utils/types/ICategory.ts";
import useCategoriesStore from "@/stores/categories.ts";

enum LocalStorageKeys {
	DefaultEntry = "defaultEntryCategory",
	DefaultTable = "defaultTableCategory"
}

const useSettingsStore = defineStore("settings-store", () => {
	const categoryStore = useCategoriesStore();
	const getDefaultEntryCategory = localStorage.getItem(LocalStorageKeys.DefaultEntry);

	const defaultEntryCategory = ref<ICategory | undefined>(
		categoryStore.clientCategories.find((category) => category.id === getDefaultEntryCategory)
	);
	const defaultTableCategory = ref<ICategory | undefined>(
		categoryStore.clientCategories.find(
			(category) => category.id === localStorage.getItem(LocalStorageKeys.DefaultTable)
		)
	);

	function SetDefaultEntryToLocalStorage(input: ICategory) {
		localStorage.setItem(LocalStorageKeys.DefaultEntry, input.id);
	}

	function SetDefaultTableToLocalStorage(input: ICategory) {
		localStorage.setItem(LocalStorageKeys.DefaultTable, input.id);
	}

	return {
		defaultEntryCategory,
		defaultTableCategory,
		SetDefaultEntryToLocalStorage,
		SetDefaultTableToLocalStorage
	};
});

export default useSettingsStore;
