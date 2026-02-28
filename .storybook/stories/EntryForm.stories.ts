import type { Meta, StoryObj } from "@storybook/vue3-vite"
import EntryForm from "../../src/components/EntryForm.vue"

const meta: Meta = {
	title: "Whirlpool Entry",
	component: EntryForm
} satisfies Meta<typeof EntryForm>

export default meta
type Story = StoryObj<typeof meta>

export const Primary: Story = {
	render: (args) => ({
		components: { EntryForm },
		setup() {
			return { args }
		},
		template: "<EntryForm />"
	}),
	tags: ["autodocs"]
}
