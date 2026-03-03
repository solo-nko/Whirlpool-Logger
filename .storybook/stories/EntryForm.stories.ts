import type { Meta, StoryObj } from "@storybook/vue3-vite"
import EntryForm from "../../src/components/EntryForm.vue"
import { GamesCategory } from "./sampledata"

const meta: Meta = {
	title: "Whirlpool Entry",
	component: EntryForm,
	render: (args) => ({
		components: { EntryForm },
		setup() {
			return { args }
		},
		template: "<EntryForm :category='args.category' :existing-entry='args.existingEntry' />"
	}),
	tags: ["autodocs"]
} satisfies Meta<typeof EntryForm>

export default meta
type Story = StoryObj<typeof meta>

export const Primary: Story = {
	args: {}
}

export const GamesEntry: Story = {
	args: {
		category: GamesCategory
	}
}
