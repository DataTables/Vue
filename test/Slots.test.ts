import { mount } from '@vue/test-utils';
import DtCore from 'datatables.net';
import { afterEach, beforeAll, describe, expect, it, vi } from 'vitest';
import { defineComponent, h, nextTick, onBeforeUnmount, ref } from 'vue';
import { DataTable } from '../src';

describe('Slots - Legacy Column Renderers', () => {
	beforeAll(() => {
		DataTable.use(DtCore);
	});

	afterEach(() => {
		vi.restoreAllMocks();
	});

	const sampleData = [
		{ id: 1, name: 'Tiger Nixon', position: 'System Architect', office: 'Edinburgh', salary: '$320,800' },
		{ id: 2, name: 'Garrett Winters', position: 'Accountant', office: 'Tokyo', salary: '$170,750' }
	];

	const sampleColumns = [
		{ data: 'name', title: 'Name' },
		{ data: 'position', title: 'Position' },
		{ data: 'office', title: 'Office', name: 'office' },
		{ data: 'salary', title: 'Salary' }
	];

	describe('#column-[index] automatic target mapping', () => {
		it('renders custom cell content for column target index matching #column-N', () => {
			const wrapper = mount({
				components: { DataTable },
				template: `
					<DataTable :data="tableData" :columns="columns" :options="{ order: [] }">
						<template #column-1="props">
							<span class="custom-position-slot">{{ props.cellData }} (Dept)</span>
						</template>
					</DataTable>
				`,
				data() {
					return {
						tableData: sampleData,
						columns: sampleColumns
					};
				}
			});

			const slots = wrapper.findAll('.custom-position-slot');
			expect(slots).toHaveLength(2);
			expect(slots[0]!.text()).toBe('System Architect (Dept)');
			expect(slots[1]!.text()).toBe('Accountant (Dept)');

			// Other columns should remain un-slotted default rendering
			const firstRowCells = wrapper.findAll('tbody tr:first-child td');
			expect(firstRowCells[0]!.text()).toBe('Tiger Nixon');
			expect(firstRowCells[2]!.text()).toBe('Edinburgh');

			wrapper.unmount();
		});

		it('passes cellData, rowData, rowIndex, and colIndex to the #column-N slot', () => {
			const capturedProps: any[] = [];

			const wrapper = mount({
				components: { DataTable },
				template: `
					<DataTable :data="tableData" :columns="columns" :options="{ order: [] }">
						<template #column-0="props">
							<span>{{ record(props) }}</span>
						</template>
					</DataTable>
				`,
				data() {
					return {
						tableData: sampleData,
						columns: sampleColumns
					};
				},
				methods: {
					record(props: any) {
						capturedProps.push(props);
						return props.cellData;
					}
				}
			});

			expect(capturedProps.length).toBeGreaterThanOrEqual(2);
			expect(capturedProps[0].cellData).toBe('Tiger Nixon');
			expect(capturedProps[0].rowData).toEqual(sampleData[0]);
			expect(capturedProps[0].rowIndex).toBe(0);
			expect(capturedProps[0].colIndex).toBe(0);
			expect(typeof capturedProps[0].type).toBe('string');

			wrapper.unmount();
		});
	});

	describe('#column-[name] automatic target mapping', () => {
		it('renders custom cell content targeting column by name matching #column-name', () => {
			const wrapper = mount({
				components: { DataTable },
				template: `
					<DataTable :data="tableData" :columns="columns" :options="{ order: [] }">
						<template #column-office="props">
							<span class="office-badge">Location: {{ props.cellData }}</span>
						</template>
					</DataTable>
				`,
				data() {
					return {
						tableData: sampleData,
						columns: sampleColumns
					};
				}
			});

			const badges = wrapper.findAll('.office-badge');
			expect(badges).toHaveLength(2);
			expect(badges[0]!.text()).toBe('Location: Edinburgh');
			expect(badges[1]!.text()).toBe('Location: Tokyo');

			wrapper.unmount();
		});
	});

	describe('Explicit render: "#slotName" in columns configuration', () => {
		it('renders cell content using a named slot referenced via render string "#slotName"', () => {
			const customCols = [
				{
					data: 'name',
					title: 'Name',
					render: '#customNameSlot'
				},
				{ data: 'position', title: 'Position' }
			];

			const wrapper = mount({
				components: { DataTable },
				template: `
					<DataTable :data="tableData" :columns="customCols" :options="{ order: [] }">
						<template #customNameSlot="props">
							<strong class="user-custom-name">{{ props.cellData }}!</strong>
						</template>
					</DataTable>
				`,
				data() {
					return {
						tableData: sampleData,
						customCols
					};
				}
			});

			const names = wrapper.findAll('.user-custom-name');
			expect(names).toHaveLength(2);
			expect(names[0]!.text()).toBe('Tiger Nixon!');
			expect(names[1]!.text()).toBe('Garrett Winters!');

			wrapper.unmount();
		});
	});

	describe('Explicit render: { display: "#slotName" } in columns configuration', () => {
		it('renders cell content using a named slot referenced via render object display property', () => {
			const customCols = [
				{ data: 'name', title: 'Name' },
				{
					data: 'salary',
					title: 'Salary',
					render: {
						display: '#salaryDisplaySlot'
					}
				}
			];

			const wrapper = mount({
				components: { DataTable },
				template: `
					<DataTable :data="tableData" :columns="customCols" :options="{ order: [] }">
						<template #salaryDisplaySlot="props">
							<em class="salary-formatted">Pay: {{ props.cellData }}</em>
						</template>
					</DataTable>
				`,
				data() {
					return {
						tableData: sampleData,
						customCols
					};
				}
			});

			const salaries = wrapper.findAll('.salary-formatted');
			expect(salaries).toHaveLength(2);
			expect(salaries[0]!.text()).toBe('Pay: $320,800');
			expect(salaries[1]!.text()).toBe('Pay: $170,750');

			wrapper.unmount();
		});
	});

	describe('Child components inside legacy slots', () => {
		it('mounts child Vue components with props and event handlers inside legacy slot', async () => {
			const clickedRows: any[] = [];

			const Tag = defineComponent({
				name: 'Tag',
				props: {
					value: { type: String, required: true },
					row: { type: Object, required: true }
				},
				emits: ['tag-click'],
				template: `<div class="tag-chip" @click="$emit('tag-click', row)">{{ value }}</div>`
			});

			const wrapper = mount({
				components: { DataTable, Tag },
				template: `
					<DataTable :data="tableData" :columns="columns" :options="{ order: [] }">
						<template #column-2="props">
							<Tag
								:value="props.cellData"
								:row="props.rowData"
								@tag-click="onTagClick"
							/>
						</template>
					</DataTable>
				`,
				data() {
					return {
						tableData: sampleData,
						columns: sampleColumns
					};
				},
				methods: {
					onTagClick(row: any) {
						clickedRows.push(row);
					}
				}
			});

			const chips = wrapper.findAll('.tag-chip');
			expect(chips).toHaveLength(2);
			expect(chips[0]!.text()).toBe('Edinburgh');
			expect(chips[1]!.text()).toBe('Tokyo');

			await chips[0]!.trigger('click');
			expect(clickedRows).toHaveLength(1);
			expect(clickedRows[0]!.name).toBe('Tiger Nixon');

			wrapper.unmount();
		});
	});

	describe('Reactivity and lifecycle cleanup with legacy slots', () => {
		it('updates slot elements when data prop changes reactively', async () => {
			const TestComponent = defineComponent({
				components: { DataTable },
				setup() {
					const data = ref([
						{ id: 1, name: 'Tiger Nixon', position: 'Architect', office: 'Edinburgh', salary: '$320,800' }
					]);
					function addData() {
						data.value.push({
							id: 2,
							name: 'Garrett Winters',
							position: 'Accountant',
							office: 'Tokyo',
							salary: '$170,750'
						});
					}
					return { data, sampleColumns, addData };
				},
				template: `
					<div>
						<button id="add-row" @click="addData">Add Row</button>
						<DataTable :data="data" :columns="sampleColumns" :options="{ order: [] }">
							<template #column-0="props">
								<span class="slot-name-item">{{ props.cellData }}</span>
							</template>
						</DataTable>
					</div>
				`
			});

			const wrapper = mount(TestComponent);
			expect(wrapper.findAll('.slot-name-item')).toHaveLength(1);

			await wrapper.find('#add-row').trigger('click');
			await nextTick();

			const items = wrapper.findAll('.slot-name-item');
			expect(items).toHaveLength(2);
			expect(items[0]!.text()).toBe('Tiger Nixon');
			expect(items[1]!.text()).toBe('Garrett Winters');

			wrapper.unmount();
		});

		it('unmounts legacy slot components when DataTable unmounts', () => {
			const unmountSpy = vi.fn();

			const SlotItem = defineComponent({
				setup() {
					onBeforeUnmount(() => {
						unmountSpy();
					});
					return () => h('span', 'Legacy Item');
				}
			});

			const wrapper = mount({
				components: { DataTable, SlotItem },
				template: `
					<DataTable :data="tableData" :columns="columns" :options="{ order: [] }">
						<template #column-0>
							<SlotItem />
						</template>
					</DataTable>
				`,
				data() {
					return {
						tableData: sampleData,
						columns: sampleColumns
					};
				}
			});

			expect(unmountSpy).not.toHaveBeenCalled();

			wrapper.unmount();
			expect(unmountSpy).toHaveBeenCalledTimes(2);
		});
	});
});
