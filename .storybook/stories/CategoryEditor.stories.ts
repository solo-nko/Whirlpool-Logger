import { Meta, StoryObj } from "@storybook/vue3-vite";
import CategoryEditor from "../../src/components/settings/category/CategoryEditor.vue";
import { GamesCategory } from "./sampledata";

const meta: Meta = {
	title: "CategoryEditor",
	component: CategoryEditor,
	render: (args) => ({
		components: { CategoryEditor },
		setup() {
			return { args };
		},
		template: "<CategoryEditor :category='args.category' />"
	}),
	tags: ["autodocs"]
} satisfies Meta<typeof CategoryEditor>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Primary: Story = {
	args: {
		category: GamesCategory
	}
};
