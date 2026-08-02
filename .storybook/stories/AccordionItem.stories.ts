import { Meta, StoryObj } from "@storybook/vue3-vite";
import AccordionContainer from "../../src/components/common/accordion/AccordionContainer.vue";
import AccordionPanel from "../../src/components/common/accordion/AccordionPanel.vue";

const meta: Meta = {
	title: "AccordionPanels",
	component: AccordionContainer,
	render: (args) => ({
		components: { AccordionContainer, AccordionPanel },
		setup() {
			return { args };
		},
		template: `
			<AccordionContainer>
				<AccordionPanel :value='0' title='Test Title'
				                :action="{showAction: true, onClickAction: () => console.log('button clicked')}">
					<table>
						<thead>
						<tr>
							<th>Header 1</th>
							<th>Header 2</th>
						</tr>
						</thead>
						<tbody>
						<tr>
							<td>Data 1</td>
							<td>Data 2</td>
						</tr>
						</tbody>
					</table>
				</AccordionPanel>
				<AccordionPanel :value="1" title="Test Title 2">Test Content 2</AccordionPanel>
			</AccordionContainer>`
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
