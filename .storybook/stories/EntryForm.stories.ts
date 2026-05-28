import type { Meta, StoryObj } from "@storybook/vue3-vite";
import EntryForm from "../../src/components/EntryForm.vue";
import { existingGamesEntry, GamesCategory } from "./sampledata";

const meta: Meta = {
	title: "Whirlpool Entry",
	component: EntryForm,
	render: (args) => ({
		components: { EntryForm },
		setup() {
			return { args };
		},
		template: "<EntryForm :category-id='args.category.id' :existing-entry='args.existingEntry' />"
	}),
	tags: ["autodocs"]
} satisfies Meta<typeof EntryForm>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Primary: Story = {
	args: {}
};

export const GamesEntryNew: Story = {
	args: {
		category: GamesCategory
	}
};

export const GamesEntryExisting: Story = {
	args: {
		category: GamesCategory,
		existingEntry: existingGamesEntry
	}
};
