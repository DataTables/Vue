import type { ColumnOptions as ConfigColumns } from 'datatables.net';
import { defineComponent, type PropType } from 'vue';

export type ColumnData = ConfigColumns['data'];
export type ColumnRender = ConfigColumns['render'];
export type ColumnOptions = Omit<ConfigColumns, 'data' | 'render' | 'title' | 'footer'>;

export interface ColumnProps {
	/** Column data source property */
	data?: ColumnData;

	/** Footer display title */
	footer?: string;

	/** Additional DataTables column options */
	options?: ColumnOptions;

	/** Custom renderer function or string formatter */
	render?: ColumnRender;

	/** Header display title */
	title?: string;
}

export const Column = defineComponent({
	name: 'Column',
	props: {
		data: {
			type: [String, Number, Function, Object] as PropType<ColumnData>,
			default: undefined
		},
		footer: {
			type: String,
			default: undefined
		},
		options: {
			type: Object as PropType<ColumnOptions>,
			default: undefined
		},
		render: {
			type: [Function, String, Object] as PropType<ColumnRender>,
			default: undefined
		},
		title: {
			type: String,
			default: undefined
		}
	},
	setup() {
		// Headless descriptor: renders nothing directly to the DOM
		return () => null;
	}
});

export default Column;
