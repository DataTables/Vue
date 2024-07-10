<script lang="ts">
export let DataTablesLib: any;

export default {
	name: 'Datatables.netVue',
	inheritAttrs: false,
	use(lib: any) {
		DataTablesLib = lib;
	}
};
</script>

<script lang="ts" setup>
// imports
import {
	h,
	ref,
	render,
	unref,
	watch,
	onMounted,
	onBeforeUnmount,
	getCurrentInstance
} from 'vue';
import type { Api, Config, ConfigColumns } from 'datatables.net';
import dtEvents from './dtEvents';

// props
const props = defineProps<{
	/**
	 * Load data for the table's content from an Ajax source
	 */
	ajax?: Config['ajax'];
	/**
	 * Set column specific initialisation properties.
	 */
	columns?: ConfigColumns[];
	/**
	 * Data to use as the display data for the table.
	 */
	data?: any;
	/**
	 * DataTables options
	 */
	options?: Config;
}>();

// emits
defineEmits(dtEvents);

// setup
const table = ref<HTMLTableElement | null>(null);
const elements: { [key: string]: HTMLElement } = {};

// data
const dt = ref<Api<any>>();
const oldData = ref<any[]>([]);

// computed

// watch
watch(
	() => props.data,
	(newVal) => {
		let api = dt.value;

		if (!api) {
			return;
		}

		var keys = Object.keys(elements);

		for (var i = 0; i < keys.length; i++) {
			delete elements[keys[i]];
		}

		api.clear();
		api.rows.add(newVal).draw(false);
	},
	{
		deep: true
	}
);

// lifecycle
onMounted(() => {
	const inst = getCurrentInstance();
	let options: any = props.options || {};

	if (props.data) {
		options.data = props.data;
		saveOld(options.data);
	}

	if (props.columns) {
		options.columns = props.columns;
	}

	if (options.columns) {
		applyRenderers(options.columns, inst);
	}

	if (props.ajax) {
		options.ajax = props.ajax;
	}

	// Auto detect column slots (those using a `column-` prefix,
	// if not using a prefix, they need to be manually assigned).
	if (! options.columnDefs) {
		options.columnDefs = [];
	}

	if (inst) {
		let slots = Object.keys(inst.slots);

		for (let i=0 ; i<slots.length ; i++) {
			let name = slots[i];
			
			if (name.match(/^column\-/)) {
				let part = name.replace('column-', '');

				options.columnDefs.push({
					target: part.match(/^\d+$/)
						? parseInt(part)
						: part + ':name',
					render: '#' + name
				});
			}
		}

		applyRenderers(options.columnDefs, inst);
	}

	if (!DataTablesLib) {
		throw new Error(
			'DataTables library not set. See https://datatables.net/tn/19 for details.'
		);
	}

	// Create the DataTable!
	dt.value = new DataTablesLib(unref(table), options);

	// When server-side processing or Ajax loading data, the data indexes for
	// rows are reused, so we need to clear out any rendered elements for slots.
	dt.value?.on('preXhr', function () {
		let keys = Object.keys(elements);

		for (var i=0 ; i<keys.length ; i++) {
			delete elements[keys[i]];
		}
	});

	// Re-export all DataTables events by listening for them using DataTable's
	// `on` method and then emit them to our Vue component
	for (let eName of dtEvents) {
		if (dt.value && inst) {
			dt.value.on(eName, function () {
				var args = Array.from(arguments);
				var event = args.shift();

				args.unshift({ event: event, dt: dt });
				args.unshift(eName);

				inst.emit.apply(inst, args as any);
			});
		}
	}
});

onBeforeUnmount(() => {
	dt.value?.destroy(true);
});

// Methods
function saveOld(d: any) {
	oldData.value = d.value ? d.value.slice() : d.slice();
}

/**
 * Create a DataTables rendering function for a slot
 *
 * @param slot Slot to render
 */
function createRenderer(slot: any) {
	return function (
		data: any,
		type: string,
		row: any,
		meta: any
	) {
		let key = meta.row + ',' + meta.col;

		if (!elements[key]) {
			let content = h('div', slot({
				cellData: data,
				colIndex: meta.col,
				rowData: row,
				rowIndex: meta.row,
				type
			}));

			elements[key] = document.createElement('div');
			render(content, elements[key]);
		}

		return elements[key];
	}
}

/**
 * Check and see if there are slots that should be applied to a column
 *
 * @param columns Array of columns (`columns` or `columnDefs`)
 * @param inst Vue instance
 */
function applyRenderers(columns: any[], inst: any) {
	if (! inst) {
		return;
	}

	for (let i=0 ; i<columns.length ; i++) {
		let col = columns[i];

		// Top level rendering given as a slot name
		if (typeof col.render === 'string' && col.render.charAt(0) === '#') {
			var name = col.render.replace('#', '');

			if (inst!.slots[name]) {
				col.render = createRenderer(inst!.slots[name]);
			}
		}
		else if (
			// Display orhtogonal data point given as a slot name
			typeof col.render === 'object' &&
			typeof col.render.display === 'string' &&
			col.render.display.charAt(0) === '#'
		) {
			var name = col.render.display.replace('#', '');

			if (inst!.slots[name]) {
				col.render.display = createRenderer(inst!.slots[name]);
			}
		}
	}
}

// expose
defineExpose({
	/**
	 * DataTable instance
	 */
	dt
});
</script>

<template>
	<div class="datatable" v-once>
		<table ref="table" v-bind="$attrs" style="width: 100%">
			<slot></slot>
		</table>
	</div>
</template>
