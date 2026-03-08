import { liveQuery } from "dexie";
import { DateTime } from "luxon";
import { defineStore } from "pinia";
import { useObservable } from "@vueuse/rxjs";
import { from } from "rxjs";
import { computed } from "vue";
import type { ICategory } from "@/utils/types/ICategory";
import type DatabaseCategory from "@/utils/database/models/DatabaseCategory";
import LoggerDatabase from "@/utils/database/LoggerDatabase.ts";
import { DatabaseStatus } from "@/utils/database/models/DatabaseStatus.ts";

const useCategoriesStore = defineStore("category-store", () => {
	const databaseCategories = useObservable<DatabaseCategory[]>(
		from(liveQuery(async () => LoggerDatabase.categories.toArray()))
	);
	const clientCategories = computed<ICategory[]>(() => {
		const stored = databaseCategories.value;
		if (stored) {
			return stored
				.map((category): ICategory => {
					return {
						...category,
						availableStatuses: DatabaseStatus.ConvertStatusesFromDatabase(
							category.availableStatuses
						),
						deletedOn: category.deletedOn ? DateTime.fromJSDate(category.deletedOn) : undefined,
						updatedOn: DateTime.fromJSDate(category.updatedOn),
						createdOn: DateTime.fromJSDate(category.createdOn)
					};
				})
				.sort((cat1, cat2) => {
					// sort based on defined order
					if (cat1.displayOrder === undefined && cat2.displayOrder === undefined) return 0;
					if (cat1.displayOrder === undefined) return 1;
					if (cat2.displayOrder === undefined) return -1;
					return cat1.displayOrder - cat2.displayOrder;
				});
		}
		return [];
	});

	return { databaseCategories, clientCategories };
});

export default useCategoriesStore;
