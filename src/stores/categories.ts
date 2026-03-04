import { liveQuery } from "dexie";
import { DateTime } from "luxon";
import { defineStore } from "pinia";
import { useObservable } from "@vueuse/rxjs";
import { from } from "rxjs";
import { computed, ref } from "vue";
import type { ICategory } from "@/utils/types/ICategory";
import type DatabaseCategory from "@/utils/database/models/DatabaseCategory";
import LoggerDatabase from "@/utils/database/LoggerDatabase.ts";

const useCategoriesStore = defineStore("category-store", () => {
	const databaseCategories = useObservable<DatabaseCategory[]>(
		from(liveQuery(() => LoggerDatabase.categories.toArray()))
	);
	const defaultCategory = ref<ICategory>();
	const clientCategories = computed<ICategory[]>(() => {
		const stored = databaseCategories.value;
		if (stored) {
			return stored.map((category) => {
				return {
					id: category.id,
					name: category.name,
					modifiedFields: category.modifiedFields,
					extraFields: category.extraFields,
					statuses: category.statuses,
					color: category.color,
					syncCode: category.syncCode,
					unsyncedChanges: category.unsyncedChanges,
					deletedOn: category.deletedOn ? DateTime.fromJSDate(category.deletedOn) : undefined,
					updatedOn: DateTime.fromJSDate(category.updatedOn),
					createdOn: DateTime.fromJSDate(category.createdOn)
				};
			});
		}
		return [];
	});

	return { databaseCategories, clientCategories, defaultCategory };
});

export default useCategoriesStore;
