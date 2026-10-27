import type { Api, ColumnOptions, DataTablesStatic, Options } from 'datatables.net';
import {
	defineComponent,
	Fragment,
	getCurrentInstance,
	h,
	onBeforeUnmount,
	onMounted,
	ref,
	render,
	unref,
	watch,
	type ComponentInternalInstance,
	type PropType,
	type VNode
} from 'vue';
import dtEvents from './dtEvents';

let DtCore: DataTablesStatic;

export interface DataTableProps {
	/** Load data for the table's content from an Ajax source */
	ajax?: Options['ajax'];

	/** Set column specific initialisation properties */
	columns?: ColumnOptions[];

	/** Data to use as the display data for the table */
	data?: any;

	/** DataTables options */
	options?: Options;
}

export type SlotElementMap = Record<string, HTMLElement>;

/**
 * Create a DataTables render function for a Vue slot.
 */
function createRenderer(slot: (...args: any[]) => any, elements: SlotElementMap) {
	return function (data: any, type: string, row: any, meta: any) {
		const key =
			(meta.settings.sTableId || meta.settings.tableId) + ',' + meta.row + ',' + meta.col;

		if (!elements[key]) {
			const content = h(
				Fragment,
				slot({
					cellData: data,
					colIndex: meta.col,
					rowData: row,
					rowIndex: meta.row,
					type
				})
			);

			elements[key] = document.createElement('div');
			render(content, elements[key]);
		}

		return elements[key];
	};
}
/**
 * Inspect columns/columnDefs and wire `#slotName` references to Vue slots.
 */
function applyRenderers(
	columns: any[],
	inst: ComponentInternalInstance | null,
	elements: SlotElementMap
): void {
	if (!inst) {
		return;
	}

	for (let i = 0; i < columns.length; i++) {
		const col = columns[i];

		if (typeof col.render === 'string' && col.render.charAt(0) === '#') {
			const name = col.render.replace('#', '');

			if (inst.slots[name]) {
				col.render = createRenderer(inst.slots[name], elements);
			}
		}
		else if (
			typeof col.render === 'object' &&
			typeof col.render.display === 'string' &&
			col.render.display.charAt(0) === '#'
		) {
			const name = col.render.display.replace('#', '');

			if (inst.slots[name]) {
				col.render.display = createRenderer(inst.slots[name], elements);
			}
		}
	}
}

/**
 * Remove and unmount all rendered Vue slot elements belonging to a specific
 * table.
 */
function deleteElements(elements: SlotElementMap, dt: Api): void {
	const keys = Object.keys(elements);
	const tableNode = dt.table().node() as HTMLElement | undefined;
	const id = tableNode?.id;
	const prefix = id + ',';

	for (let i = 0; i < keys.length; i++) {
		let key = keys[i];

		if (key && key.startsWith(prefix) && elements[key]) {
			// Triggers Vue unmount lifecycles
			render(null, elements[key]);

			delete elements[key];
		}
	}
}

const DataTableComponent = defineComponent({
	name: 'Datatables.netVue',
	inheritAttrs: false,
	props: {
		ajax: {
			type: [String, Function, Object] as PropType<Options['ajax']>,
			default: undefined
		},
		columns: {
			type: Array as PropType<ColumnOptions[]>,
			default: undefined
		},
		data: {
			type: [Array, Object] as PropType<any>,
			default: undefined
		},
		options: {
			type: Object as PropType<Options>,
			default: undefined
		}
	},
	emits: dtEvents,
	setup(props, { attrs, slots, expose }) {
		const table = ref<HTMLTableElement | null>(null);
		const elements: SlotElementMap = {};

		const dt = ref<Api<any>>();

		// Expose dt instance to parent components
		expose({ dt });

		// Watch data changes
		watch(
			() => props.data,
			newVal => {
				const api = dt.value;
				if (!api) {
					return;
				}

				deleteElements(elements, api);
				api.clear();
				api.rows.add(newVal).draw(false);
			},
			{ deep: true }
		);

		// Lifecycle
		onMounted(() => {
			if (!DtCore) {
				throw new Error(
					'DataTables library not set. See https://datatables.net/tn/19 for details.'
				);
			}

			const inst = getCurrentInstance();
			const options: Options = DtCore.util.object.assignDeep({}, props.options);

			if (props.data) {
				options.data = props.data;
			}

			if (props.columns) {
				options.columns = DtCore.util.object.assignDeep([], props.columns);
			}

			if (options.columns) {
				applyRenderers(options.columns, inst, elements);
			}

			if (props.ajax) {
				options.ajax = props.ajax;
			}

			if (!options.columnDefs) {
				options.columnDefs = [];
			}

			if (inst) {
				const slotKeys = Object.keys(inst.slots);

				for (let i = 0; i < slotKeys.length; i++) {
					const name = slotKeys[i];

					if (name && name.match(/^column-/)) {
						const part = name.replace('column-', '');

						options.columnDefs.push({
							target: part.match(/^\d+$/) ? parseInt(part, 10) : part + ':name',
							render: '#' + name
						});
					}
				}

				applyRenderers(options.columnDefs, inst, elements);
			}

			// Initialize DataTables
			dt.value = new DtCore(unref(table)!, options);

			dt.value?.on('preXhr', () => {
				deleteElements(elements, dt.value!);
			});

			dt.value?.on('column-reorder', () => {
				deleteElements(elements, dt.value!);
			});

			// Forward events to Vue component
			for (const eName of dtEvents) {
				if (dt.value && inst) {
					dt.value.on(eName, function () {
						const args = Array.from(arguments);
						const event = args.shift();

						args.unshift({ event: event, dt: dt });
						args.unshift(eName);

						inst.emit.apply(inst, args as any);
					});
				}
			}
		});

		onBeforeUnmount(() => {
			if (dt.value) {
				deleteElements(elements, dt.value);
				dt.value.destroy(true);
			}
		});

		// Replicating `v-once`: cache the VNode tree so Vue never re-diffs
		// or destroys the DOM structure created by DataTables.
		let staticVNode: VNode | null = null;

		return () => {
			if (!staticVNode) {
				staticVNode = h('div', { class: 'datatable' }, [
					h(
						'table',
						{
							ref: table,
							...attrs,
							style: { width: '100%' }
						},
						slots.default?.()
					)
				]);
			}
			return staticVNode;
		};
	}
});

// Typing for component + static .use() overload
export interface DataTableType extends ReturnType<typeof defineComponent> {
	new (): InstanceType<typeof DataTableComponent>;
	use(): any;
	use(lib: any): void;
}

function use(): any;
function use(lib: any): void;
function use(lib?: any): any {
	if (lib) {
		DtCore = lib;
		return;
	}

	return DtCore;
}

const DataTable = DataTableComponent as unknown as DataTableType;
DataTable.use = use;

export default DataTable;
