import { Meta, StoryObj } from "@storybook/vue3-vite";
import AccordionContainer from "../../src/components/common/accordion/AccordionContainer.vue";
import AccordionPanel from "../../src/components/common/accordion/AccordionPanel.vue";
import TipTapEditor from "../../src/components/TipTapEditor.vue";

const meta: Meta = {
	title: "AccordionPanels",
	component: AccordionContainer,
	render: (args) => ({
		components: { AccordionContainer, AccordionPanel, TipTapEditor },
		setup() {
			return { args };
		},
		template: `
			<AccordionContainer :default-open-panels="[1]">
				<AccordionPanel :value='0' title='Test Title'
												:actions="[{showAction: true, onClickAction: () => console.log('button clicked')}]">
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
				<AccordionPanel :value="1" title="Test Title 2"
												:actions="[
													{
														showAction: true, 
														onClickAction: () => console.log('delete button clicked'), 
														actionText: 'Delete'
													},
													{
														showAction: true, 
														onClickAction: () => console.log('edit button clicked'), 
														actionText: 'Add Below'
													}
													]">
					<TipTapEditor />
				</AccordionPanel>
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
