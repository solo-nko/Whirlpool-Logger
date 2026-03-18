import type { ICategory } from "@/utils/types/ICategory.ts";
import useCategoriesStore from "@/stores/categories.ts";
import { useDisplay } from "vuetify";
enum LocalStorageKeys {
	DefaultEntry = "defaultEntryCategory",
	DefaultTable = "defaultTableCategory"
}

const useSettingsStore = defineStore("settings-store", () => {
	const categoryStore = useCategoriesStore();

	const defaultEntryCategory = ref<ICategory | undefined>();
	const defaultTableCategory = ref<ICategory | undefined>();
	const display = useDisplay();

	function SetDefaultEntryToLocalStorage(input: ICategory) {
		localStorage.setItem(LocalStorageKeys.DefaultEntry, input.id);
	}

	function SetDefaultTableToLocalStorage(input: ICategory) {
		localStorage.setItem(LocalStorageKeys.DefaultTable, input.id);
	}

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
		},
		{ immediate: true }
	);

	return {
		defaultEntryCategory,
		defaultTableCategory,
		SetDefaultEntryToLocalStorage,
		SetDefaultTableToLocalStorage,
		display
	};
});

export default useSettingsStore;
