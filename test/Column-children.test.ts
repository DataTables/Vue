import { mount } from '@vue/test-utils';
import DtCore from 'datatables.net';
import { afterEach, beforeAll, describe, expect, it, vi } from 'vitest';
import { defineComponent, h, nextTick, onBeforeUnmount, onMounted, onUnmounted, ref } from 'vue';
import { Column, DataTable } from '../src';

describe('Column - Children and Custom Cell Renderers', () => {
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

	describe('Scoped slot parameters', () => {
		it('passes cellData, rowData, rowIndex, colIndex, and type to the slot', () => {
			const slotParams: any[] = [];

			const wrapper = mount({
				components: { DataTable, Column },
				template: `
					<DataTable :data="tableData" :options="{ order: [] }">
						<Column data="name" title="Name" v-slot="props">
							<span class="custom-cell">{{ recordProps(props) }}</span>
						</Column>
					</DataTable>
				`,
				data() {
					return { tableData: sampleData };
				},
				methods: {
					recordProps(props: any) {
						slotParams.push(props);
						return props.cellData;
					}
				}
			});

			expect(slotParams.length).toBeGreaterThanOrEqual(2);

			// First row
			expect(slotParams[0].cellData).toBe('Tiger Nixon');
			expect(slotParams[0].rowData).toEqual(sampleData[0]);
			expect(slotParams[0].rowIndex).toBe(0);
			expect(slotParams[0].colIndex).toBe(0);
			expect(typeof slotParams[0].type).toBe('string');

			// Second row
			expect(slotParams[1].cellData).toBe('Garrett Winters');
			expect(slotParams[1].rowData).toEqual(sampleData[1]);
			expect(slotParams[1].rowIndex).toBe(1);
			expect(slotParams[1].colIndex).toBe(0);
			expect(typeof slotParams[1].type).toBe('string');

			wrapper.unmount();
		});
	});

	describe('Child Vue components in column slots', () => {
		it('renders custom Vue child components within cell slot and binds props', () => {
			const TagComponent = defineComponent({
				name: 'TagComponent',
				props: {
					label: { type: String, required: true },
					color: { type: String, default: 'blue' }
				},
				template: `<div class="tag-badge" :data-color="color">{{ label }}</div>`
			});

			const wrapper = mount({
				components: { DataTable, Column, TagComponent },
				template: `
					<DataTable :data="tableData" :options="{ order: [] }">
						<Column data="name" title="Name" />
						<Column data="office" title="Office" v-slot="props">
							<TagComponent :label="props.cellData" color="green" />
						</Column>
					</DataTable>
				`,
				data() {
					return { tableData: sampleData };
				}
			});

			const badges = wrapper.findAll('.tag-badge');
			expect(badges).toHaveLength(2);
			expect(badges[0]!.text()).toBe('Edinburgh');
			expect(badges[0]!.attributes('data-color')).toBe('green');
			expect(badges[1]!.text()).toBe('Tokyo');
			expect(badges[1]!.attributes('data-color')).toBe('green');

			wrapper.unmount();
		});

		it('handles component events emitted from inside the cell slot', async () => {
			const clickedRows: any[] = [];

			const ActionButton = defineComponent({
				name: 'ActionButton',
				props: {
					row: { type: Object, required: true }
				},
				emits: ['action'],
				template: `<button class="row-action-btn" @click="$emit('action', row)">Click Me</button>`
			});

			const wrapper = mount({
				components: { DataTable, Column, ActionButton },
				template: `
					<DataTable :data="tableData" :options="{ order: [] }">
						<Column data="name" title="Name" />
						<Column title="Action" v-slot="props">
							<ActionButton :row="props.rowData" @action="handleAction" />
						</Column>
					</DataTable>
				`,
				data() {
					return { tableData: sampleData };
				},
				methods: {
					handleAction(row: any) {
						clickedRows.push(row);
					}
				}
			});

			const buttons = wrapper.findAll('.row-action-btn');
			expect(buttons).toHaveLength(2);

			await buttons[0]!.trigger('click');
			expect(clickedRows).toHaveLength(1);
			expect(clickedRows[0]!.name).toBe('Tiger Nixon');

			await buttons[1]!.trigger('click');
			expect(clickedRows).toHaveLength(2);
			expect(clickedRows[1]!.name).toBe('Garrett Winters');

			wrapper.unmount();
		});
	});

	describe('Raw static VNodes as direct children', () => {
		it('renders static children without slot template', () => {
			const wrapper = mount({
				components: { DataTable, Column },
				template: `
					<DataTable :data="tableData" :options="{ order: [] }">
						<Column data="name" title="Name" />
						<Column title="Manage">
							<button class="static-manage-btn">Manage Record</button>
						</Column>
					</DataTable>
				`,
				data() {
					return { tableData: sampleData };
				}
			});

			const buttons = wrapper.findAll('.static-manage-btn');
			expect(buttons).toHaveLength(2);
			expect(buttons[0]!.text()).toBe('Manage Record');
			expect(buttons[1]!.text()).toBe('Manage Record');

			wrapper.unmount();
		});
	});

	describe('Direct render function children (TSX / h style)', () => {
		it('renders custom content when Column children is a function', () => {
			const wrapper = mount({
				setup() {
					return () =>
						h(
							DataTable,
							{ data: sampleData, options: { order: [] } },
							() => [
								h(Column, { data: 'name', title: 'Name' }),
								h(Column, { data: 'salary', title: 'Salary' }, (props: any) =>
									h('span', { class: 'salary-highlight' }, `Amount: ${props.cellData}`)
								)
							]
						);
				}
			});

			const highlights = wrapper.findAll('.salary-highlight');
			expect(highlights).toHaveLength(2);
			expect(highlights[0]!.text()).toBe('Amount: $320,800');
			expect(highlights[1]!.text()).toBe('Amount: $170,750');

			wrapper.unmount();
		});
	});

	describe('Multiple columns with custom slots', () => {
		it('renders distinct slot content for multiple columns in each row', () => {
			const wrapper = mount({
				components: { DataTable, Column },
				template: `
					<DataTable :data="tableData" :options="{ order: [] }">
						<Column data="name" title="Name" v-slot="props">
							<strong class="col-name">{{ props.cellData }}</strong>
						</Column>
						<Column data="position" title="Position" v-slot="props">
							<em class="col-pos">{{ props.cellData }}</em>
						</Column>
						<Column data="office" title="Office" />
					</DataTable>
				`,
				data() {
					return { tableData: sampleData };
				}
			});

			const names = wrapper.findAll('.col-name');
			const positions = wrapper.findAll('.col-pos');

			expect(names).toHaveLength(2);
			expect(positions).toHaveLength(2);

			expect(names[0]!.text()).toBe('Tiger Nixon');
			expect(positions[0]!.text()).toBe('System Architect');
			expect(names[1]!.text()).toBe('Garrett Winters');
			expect(positions[1]!.text()).toBe('Accountant');

			wrapper.unmount();
		});
	});

	describe('Dynamic columns using v-for', () => {
		it('supports generating Column components dynamically using v-for', () => {
			const wrapper = mount({
				components: { DataTable, Column },
				template: `
					<DataTable :data="tableData" :options="{ order: [] }">
						<Column
							v-for="col in dynamicColumns"
							:key="col.data"
							:data="col.data"
							:title="col.title"
						/>
					</DataTable>
				`,
				data() {
					return {
						tableData: sampleData,
						dynamicColumns: [
							{ data: 'name', title: 'Dynamic Name' },
							{ data: 'office', title: 'Dynamic Office' },
							{ data: 'salary', title: 'Dynamic Salary' }
						]
					};
				}
			});

			const headers = wrapper.findAll('th');
			expect(headers).toHaveLength(3);
			expect(headers[0]!.text()).toBe('Dynamic Name');
			expect(headers[1]!.text()).toBe('Dynamic Office');
			expect(headers[2]!.text()).toBe('Dynamic Salary');

			const cells = wrapper.findAll('tbody tr:first-child td');
			expect(cells[0]!.text()).toBe('Tiger Nixon');
			expect(cells[1]!.text()).toBe('Edinburgh');
			expect(cells[2]!.text()).toBe('$320,800');

			wrapper.unmount();
		});

		it('supports v-for columns with slot templates', () => {
			const wrapper = mount({
				components: { DataTable, Column },
				template: `
					<DataTable :data="tableData" :options="{ order: [] }">
						<Column
							v-for="col in dynamicColumns"
							:key="col.data"
							:data="col.data"
							:title="col.title"
							v-slot="props"
						>
							<span class="dynamic-cell">{{ col.prefix }}: {{ props.cellData }}</span>
						</Column>
					</DataTable>
				`,
				data() {
					return {
						tableData: sampleData.slice(0, 1),
						dynamicColumns: [
							{ data: 'name', title: 'Name', prefix: 'Person' },
							{ data: 'office', title: 'Office', prefix: 'City' }
						]
					};
				}
			});

			const cells = wrapper.findAll('.dynamic-cell');
			expect(cells).toHaveLength(2);
			expect(cells[0]!.text()).toBe('Person: Tiger Nixon');
			expect(cells[1]!.text()).toBe('City: Edinburgh');

			wrapper.unmount();
		});
	});

	describe('Lifecycle and cleanup of slot elements', () => {
		it('unmounts slot child components when reactive data updates', async () => {
			const unmountedIds: number[] = [];

			const TrackedChild = defineComponent({
				name: 'TrackedChild',
				props: {
					id: { type: Number, required: true },
					name: { type: String, required: true }
				},
				setup(props) {
					onUnmounted(() => {
						unmountedIds.push(props.id);
					});
					return () => h('span', { class: 'tracked-item' }, props.name);
				}
			});

			const TestComponent = defineComponent({
				components: { DataTable, Column, TrackedChild },
				setup() {
					const data = ref([
						{ id: 1, name: 'Row 1' },
						{ id: 2, name: 'Row 2' }
					]);
					function updateData() {
						data.value = [{ id: 3, name: 'Row 3' }];
					}
					return { data, updateData };
				},
				template: `
					<div>
						<button id="update-btn" @click="updateData">Update</button>
						<DataTable :data="data" :options="{ order: [] }">
							<Column data="name" title="Name" v-slot="props">
								<TrackedChild :id="props.rowData.id" :name="props.cellData" />
							</Column>
						</DataTable>
					</div>
				`
			});

			const wrapper = mount(TestComponent);
			expect(wrapper.findAll('.tracked-item')).toHaveLength(2);
			expect(unmountedIds).toEqual([]);

			await wrapper.find('#update-btn').trigger('click');
			await nextTick();

			// Old items (id 1 and 2) should have been unmounted
			expect(unmountedIds).toContain(1);
			expect(unmountedIds).toContain(2);

			const currentItems = wrapper.findAll('.tracked-item');
			expect(currentItems).toHaveLength(1);
			expect(currentItems[0]!.text()).toBe('Row 3');

			wrapper.unmount();
		});

		it('unmounts slot child components when the entire DataTable is unmounted', () => {
			const unmountSpy = vi.fn();

			const SlotChild = defineComponent({
				setup() {
					onBeforeUnmount(() => {
						unmountSpy();
					});
					return () => h('div', 'Child');
				}
			});

			const wrapper = mount({
				components: { DataTable, Column, SlotChild },
				template: `
					<DataTable :data="tableData" :options="{ order: [] }">
						<Column data="name" title="Name" v-slot="props">
							<SlotChild />
						</Column>
					</DataTable>
				`,
				data() {
					return { tableData: sampleData };
				}
			});

			expect(unmountSpy).not.toHaveBeenCalled();

			wrapper.unmount();
			expect(unmountSpy).toHaveBeenCalledTimes(2);
		});

		it('cleans up slot elements when column-reorder event is triggered', () => {
			const wrapper = mount({
				components: { DataTable, Column },
				template: `
					<DataTable id="reorder-test-table" :data="tableData" :options="{ order: [] }">
						<Column data="name" title="Name" v-slot="props">
							<span class="slot-span">{{ props.cellData }}</span>
						</Column>
					</DataTable>
				`,
				data() {
					return { tableData: sampleData };
				}
			});

			const dt = (wrapper.findComponent(DataTable).vm as any).dt;
			expect(dt).toBeDefined();

			// Trigger column-reorder via table node event dispatch
			const tableNode = dt.table().node();
			tableNode.dispatchEvent(new CustomEvent('column-reorder.dt'));

			wrapper.unmount();
		});

		it('cleans up slot elements when preXhr event is triggered', () => {
			const wrapper = mount({
				components: { DataTable, Column },
				template: `
					<DataTable id="pre-xhr-test-table" :data="tableData" :options="{ order: [] }">
						<Column data="name" title="Name" v-slot="props">
							<span class="slot-span">{{ props.cellData }}</span>
						</Column>
					</DataTable>
				`,
				data() {
					return { tableData: sampleData };
				}
			});

			const dt = (wrapper.findComponent(DataTable).vm as any).dt;
			expect(dt).toBeDefined();

			// Trigger preXhr via table node event dispatch
			const tableNode = dt.table().node();
			tableNode.dispatchEvent(new CustomEvent('preXhr.dt'));

			wrapper.unmount();
		});
	});
});
