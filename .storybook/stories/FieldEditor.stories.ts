import type { Meta, StoryObj } from "@storybook/vue3-vite";
import FieldEditor from "../../src/components/settings/category/FieldEditor.vue";
import { FieldType, IField } from "../../src/utils/types/IField";
import { ulid } from "ulid";

const meta: Meta = {
	title: "Field Editor",
	component: FieldEditor,
	render: (args: { default: boolean; fieldData?: IField }) => ({
		components: { FieldEditor },
		setup() {
			return { args };
		},
		template: '<FieldEditor :default="args.default" :field-data="args.fieldData" />'
	}),
	tags: ["autodocs"]
} satisfies Meta<typeof FieldEditor>;

export default meta;
type Story = StoryObj<typeof meta>;

export const EditNew: Story = {
	args: {
		default: false
	}
};

const dummyExisting: IField = {
	id: ulid(),
	label: "Purchase Date",
	type: FieldType.DATE,
	hidden: false
};

export const EditExisting: Story = {
	args: {
		default: false,
		fieldData: dummyExisting
	}
};
