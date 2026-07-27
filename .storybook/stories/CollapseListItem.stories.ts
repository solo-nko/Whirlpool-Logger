import { Meta, StoryObj } from "@storybook/vue3-vite";
import AccordionContainer from "../../src/components/common/accordion/AccordionContainer.vue";
import AccordionPanel from "../../src/components/common/accordion/AccordionPanel.vue";

const meta: Meta = {
	title: "CollapseList",
	component: AccordionContainer,
	render: (args) => ({
		components: { CollapseList: AccordionContainer, CollapseListItem: AccordionPanel },
		setup() {
			return { args };
		},
		template: `
				<CollapseList>
					<CollapseListItem :value='0' title='Test Title'>Test Content</CollapseListItem>
					<CollapseListItem :value="1" title="Test Title 2">Test Content 2</CollapseListItem>
				</CollapseList>`
	}),
	tags: ["autodocs"]
} satisfies Meta<typeof AccordionContainer>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Primary: Story = {
	args: {
		title: "Test Title",
		isOpen: true
	}
};
