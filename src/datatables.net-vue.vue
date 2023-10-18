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
	if(!Object.prototype.hasOwnProperty.call(options,"initComplete")){
		options.initComplete = ()=>{
			this.$emit("init");
		};
	}	

	if (props.data) {
		options.data = props.data;
		saveOld(options.data);
	}

	if (props.columns) {
		options.columns = props.columns;
	}

	if (props.ajax) {
		options.ajax = props.ajax;
	}

	if (!DataTablesLib) {
		throw new Error(
			'DataTables library not set. See https://datatables.net/tn/19 for details.'
		);
	}

	if (!options.columnDefs) {
		options.columnDefs = [];
	}

	if (inst) {
		let slotNames = Object.keys(inst.slots);

		if (slotNames.length && !DataTablesLib.versionCheck('2')) {
			throw new Error(
				'DataTables 2 is required to be able to use template slots for columns.'
			);
		}

		slotNames.forEach((name) => {
			if (name.match(/^column-\d+$/)) {
				options.columnDefs.push({
					target: parseInt(name.replace('column-', '')),
					render: function (
						data: any,
						type: string,
						row: any,
						meta: any
					) {
						let key = meta.row + ',' + meta.col;

						if (!elements[key]) {
							elements[key] = document.createElement('div');

							let content = h(
								'div',
								inst!.slots[name]!({
									cellData: data,
									colIndex: meta.col,
									rowData: row,
									rowIndex: meta.row,
									type
								})
							);

							render(content, elements[key]);
						}

						return elements[key].childNodes[0];
					}
				});
			}
		});
	}

	// Create the DataTable!
	dt.value = new DataTablesLib(unref(table), options);

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

// methods
function saveOld(d: any) {
	oldData.value = d.value ? d.value.slice() : d.slice();
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
