type SelectedStatus = {
	id: string;
	name: string;
};
export type IDashboard = {
	categoryName: string;
	categoryId: string;
	displayed: boolean;
	displayOrder?: number;
	statuses: SelectedStatus[];
	selectedStatusOne: SelectedStatus;
	selectedStatusTwo: SelectedStatus;
	showTags: boolean;
};
