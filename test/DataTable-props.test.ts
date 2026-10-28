import { mount } from '@vue/test-utils';
import DtCore from 'datatables.net';
import { afterEach, beforeAll, describe, expect, it, vi } from 'vitest';
import { createApp, defineComponent, h, nextTick, ref } from 'vue';
import { Column, DataTable } from '../src';

describe('DataTable - Properties and Options', () => {
	beforeAll(() => {
		DataTable.use(DtCore);
	});

	afterEach(() => {
		vi.restoreAllMocks();
	});

	const sampleData = [
		{ id: 1, name: 'Tiger Nixon', position: 'System Architect', office: 'Edinburgh', salary: '$320,800' },
		{ id: 2, name: 'Garrett Winters', position: 'Accountant', office: 'Tokyo', salary: '$170,750' },
		{ id: 3, name: 'Ashton Cox', position: 'Junior Technical Author', office: 'San Francisco', salary: '$86,000' }
	];

	const defaultColumns = [
		{ data: 'name', title: 'Name' },
		{ data: 'position', title: 'Position' },
		{ data: 'office', title: 'Office' },
		{ data: 'salary', title: 'Salary' }
	];

	describe(':data prop', () => {
		it('renders tabular data provided as an array of objects', () => {
			const wrapper = mount(DataTable, {
				props: {
					data: sampleData,
					columns: defaultColumns,
					options: { order: [] }
				}
			});

			const rows = wrapper.findAll('tbody tr');
			expect(rows).toHaveLength(3);

			const firstRowCells = rows[0]!.findAll('td');
			expect(firstRowCells[0]!.text()).toBe('Tiger Nixon');
			expect(firstRowCells[1]!.text()).toBe('System Architect');
			expect(firstRowCells[2]!.text()).toBe('Edinburgh');
			expect(firstRowCells[3]!.text()).toBe('$320,800');

			wrapper.unmount();
		});

		it('renders tabular data provided as a 2D array of primitives', () => {
			const arrayData = [
				['Tiger Nixon', 'System Architect', 'Edinburgh', '$320,800'],
				['Garrett Winters', 'Accountant', 'Tokyo', '$170,750']
			];
			const arrayColumns = [
				{ title: 'Name' },
				{ title: 'Position' },
				{ title: 'Office' },
				{ title: 'Salary' }
			];

			const wrapper = mount(DataTable, {
				props: {
					data: arrayData,
					columns: arrayColumns,
					options: { order: [] }
				}
			});

			const rows = wrapper.findAll('tbody tr');
			expect(rows).toHaveLength(2);
			expect(rows[0]!.findAll('td')[0]!.text()).toBe('Tiger Nixon');
			expect(rows[1]!.findAll('td')[0]!.text()).toBe('Garrett Winters');
			expect(rows[1]!.findAll('td')[1]!.text()).toBe('Accountant');

			wrapper.unmount();
		});

		it('renders an empty table correctly when data is empty array', () => {
			const wrapper = mount(DataTable, {
				props: {
					data: [],
					columns: defaultColumns
				}
			});

			const emptyCell = wrapper.find('tbody td.dt-empty');
			expect(emptyCell.exists()).toBe(true);
			expect(emptyCell.text()).toContain('No data available in table');

			wrapper.unmount();
		});

		it('reactively adds new rows when rows are pushed into the reactive data array', async () => {
			const TestComponent = defineComponent({
				components: { DataTable },
				setup() {
					const tableData = ref([...sampleData]);
					function addRow() {
						tableData.value.push({
							id: 4,
							name: 'Cedric Kelly',
							position: 'Senior Javascript Developer',
							office: 'Edinburgh',
							salary: '$433,060'
						});
					}
					return { tableData, defaultColumns, addRow };
				},
				template: `
					<div>
						<button id="add-btn" @click="addRow">Add</button>
						<DataTable :data="tableData" :columns="defaultColumns" :options="{ order: [] }" />
					</div>
				`
			});

			const wrapper = mount(TestComponent);
			expect(wrapper.findAll('tbody tr')).toHaveLength(3);

			await wrapper.find('#add-btn').trigger('click');
			await nextTick();

			const rows = wrapper.findAll('tbody tr');
			expect(rows).toHaveLength(4);
			expect(rows[3]!.findAll('td')[0]!.text()).toBe('Cedric Kelly');

			wrapper.unmount();
		});

		it('reactively removes rows when rows are spliced from the reactive data array', async () => {
			const TestComponent = defineComponent({
				components: { DataTable },
				setup() {
					const tableData = ref([...sampleData]);
					function removeFirstRow() {
						tableData.value.splice(0, 1);
					}
					return { tableData, defaultColumns, removeFirstRow };
				},
				template: `
					<div>
						<button id="del-btn" @click="removeFirstRow">Delete</button>
						<DataTable :data="tableData" :columns="defaultColumns" :options="{ order: [] }" />
					</div>
				`
			});

			const wrapper = mount(TestComponent);
			expect(wrapper.findAll('tbody tr')).toHaveLength(3);

			await wrapper.find('#del-btn').trigger('click');
			await nextTick();

			const rows = wrapper.findAll('tbody tr');
			expect(rows).toHaveLength(2);
			expect(rows[0]!.findAll('td')[0]!.text()).toBe('Garrett Winters');

			wrapper.unmount();
		});

		it('reactively updates rows when an existing row property is mutated in-place (deep watch)', async () => {
			const TestComponent = defineComponent({
				components: { DataTable },
				setup() {
					const tableData = ref([
						{ id: 1, name: 'Tiger Nixon', position: 'System Architect', office: 'Edinburgh', salary: '$320,800' }
					]);
					function updateRow() {
						tableData.value[0]!.name = 'Tiger Nixon (Updated)';
					}
					return { tableData, defaultColumns, updateRow };
				},
				template: `
					<div>
						<button id="update-btn" @click="updateRow">Update</button>
						<DataTable :data="tableData" :columns="defaultColumns" />
					</div>
				`
			});

			const wrapper = mount(TestComponent);
			expect(wrapper.find('tbody td').text()).toBe('Tiger Nixon');

			await wrapper.find('#update-btn').trigger('click');
			await nextTick();

			expect(wrapper.find('tbody td').text()).toBe('Tiger Nixon (Updated)');

			wrapper.unmount();
		});

		it('reactively updates when the entire data prop reference is replaced', async () => {
			const wrapper = mount(DataTable, {
				props: {
					data: sampleData.slice(0, 1),
					columns: defaultColumns,
					options: { order: [] }
				}
			});

			expect(wrapper.findAll('tbody tr')).toHaveLength(1);

			await wrapper.setProps({
				data: [
					{ id: 10, name: 'Alice', position: 'Engineer', office: 'London', salary: '$100,000' },
					{ id: 11, name: 'Bob', position: 'Designer', office: 'Paris', salary: '$95,000' }
				]
			});
			await nextTick();

			const rows = wrapper.findAll('tbody tr');
			expect(rows).toHaveLength(2);
			expect(rows[0]!.findAll('td')[0]!.text()).toBe('Alice');
			expect(rows[1]!.findAll('td')[0]!.text()).toBe('Bob');

			wrapper.unmount();
		});

		it('prioritizes props.data over options.data when both are specified', () => {
			const optionsData = [
				{ id: 99, name: 'Option Person', position: 'Tester', office: 'Berlin', salary: '$50,000' }
			];

			const wrapper = mount(DataTable, {
				props: {
					data: sampleData,
					options: { data: optionsData, order: [] },
					columns: defaultColumns
				}
			});

			const rows = wrapper.findAll('tbody tr');
			expect(rows).toHaveLength(3);
			expect(rows[0]!.findAll('td')[0]!.text()).toBe('Tiger Nixon');

			wrapper.unmount();
		});

		it('uses options.data when props.data is not provided', () => {
			const optionsData = [
				{ id: 99, name: 'Option Person', position: 'Tester', office: 'Berlin', salary: '$50,000' }
			];

			const wrapper = mount(DataTable, {
				props: {
					options: { data: optionsData },
					columns: defaultColumns
				}
			});

			const rows = wrapper.findAll('tbody tr');
			expect(rows).toHaveLength(1);
			expect(rows[0]!.findAll('td')[0]!.text()).toBe('Option Person');

			wrapper.unmount();
		});
	});

	describe(':columns prop', () => {
		it('renders column titles from columns configuration', () => {
			const wrapper = mount(DataTable, {
				props: {
					data: sampleData,
					columns: [
						{ data: 'name', title: 'Full Name' },
						{ data: 'office', title: 'Work Location' }
					]
				}
			});

			const headers = wrapper.findAll('th');
			expect(headers).toHaveLength(2);
			expect(headers[0]!.text()).toBe('Full Name');
			expect(headers[1]!.text()).toBe('Work Location');

			wrapper.unmount();
		});

		it('applies column render functions and custom class names', () => {
			const wrapper = mount(DataTable, {
				props: {
					data: sampleData.slice(0, 1),
					columns: [
						{
							data: 'name',
							title: 'Name',
							className: 'text-bold',
							render: (data: string) => `<strong>${data}</strong>`
						},
						{
							data: 'salary',
							title: 'Salary',
							className: 'text-success'
						}
					]
				}
			});

			const cells = wrapper.findAll('tbody td');
			expect(cells[0]!.classes()).toContain('text-bold');
			expect(cells[0]!.html()).toContain('<strong>Tiger Nixon</strong>');
			expect(cells[1]!.classes()).toContain('text-success');

			wrapper.unmount();
		});

		it('deep-clones props.columns and does not mutate the original columns prop', () => {
			const originalColumns = [
				{ data: 'name', title: 'Name' },
				{ data: 'office', title: 'Office' }
			];
			const columnsProp = JSON.parse(JSON.stringify(originalColumns));

			const wrapper = mount(DataTable, {
				props: {
					data: sampleData,
					columns: columnsProp
				}
			});

			expect(columnsProp).toEqual(originalColumns);

			wrapper.unmount();
		});
	});

	describe(':options prop', () => {
		it('passes paging and pageLength options to DataTables', () => {
			const manyRows = Array.from({ length: 25 }, (_, i) => ({
				id: i + 1,
				name: `User ${i + 1}`,
				position: 'Staff',
				office: 'Remote',
				salary: '$100,000'
			}));

			const wrapper = mount(DataTable, {
				props: {
					data: manyRows,
					columns: defaultColumns,
					options: {
						pageLength: 5
					}
				}
			});

			// Only 5 rows visible on the current page
			const rows = wrapper.findAll('tbody tr');
			expect(rows).toHaveLength(5);

			wrapper.unmount();
		});

		it('respects searching: false option to disable search filter', () => {
			const wrapper = mount(DataTable, {
				props: {
					data: sampleData,
					columns: defaultColumns,
					options: {
						searching: false
					}
				}
			});

			const searchInput = wrapper.find('input[type="search"]');
			expect(searchInput.exists()).toBe(false);

			wrapper.unmount();
		});

		it('respects initial order option', () => {
			const wrapper = mount(DataTable, {
				props: {
					data: sampleData,
					columns: defaultColumns,
					options: {
						order: [[0, 'desc']]
					}
				}
			});

			// Sorted by Name descending: Tiger Nixon, Garrett Winters, Ashton Cox
			const rows = wrapper.findAll('tbody tr');
			expect(rows[0]!.findAll('td')[0]!.text()).toBe('Tiger Nixon');
			expect(rows[2]!.findAll('td')[0]!.text()).toBe('Ashton Cox');

			wrapper.unmount();
		});

		it('applies columnDefs passed within options', () => {
			const wrapper = mount(DataTable, {
				props: {
					data: sampleData.slice(0, 1),
					columns: defaultColumns,
					options: {
						columnDefs: [
							{
								targets: 1, // position column
								className: 'custom-column-def-class'
							}
						]
					}
				}
			});

			const cells = wrapper.findAll('tbody td');
			expect(cells[1]!.classes()).toContain('custom-column-def-class');

			wrapper.unmount();
		});
	});

	describe(':ajax prop', () => {
		it('loads data when ajax is provided as a function', () => {
			const ajaxFn = vi.fn((_data: any, callback: (res: any) => void) => {
				callback({
					data: [
						{ name: 'Ajax User 1', position: 'Developer', office: 'London', salary: '$120,000' },
						{ name: 'Ajax User 2', position: 'Manager', office: 'Paris', salary: '$140,000' }
					]
				});
			});

			const wrapper = mount(DataTable, {
				props: {
					ajax: ajaxFn,
					columns: defaultColumns
				}
			});

			expect(ajaxFn).toHaveBeenCalled();
			const rows = wrapper.findAll('tbody tr');
			expect(rows).toHaveLength(2);
			expect(rows[0]!.findAll('td')[0]!.text()).toBe('Ajax User 1');
			expect(rows[1]!.findAll('td')[0]!.text()).toBe('Ajax User 2');

			wrapper.unmount();
		});

		it('passes ajax object configuration to DataTables options', () => {
			const ajaxObj = {
				url: '/api/data',
				dataSrc: 'records'
			};

			const wrapper = mount(DataTable, {
				props: {
					ajax: ajaxObj,
					columns: defaultColumns
				}
			});

			const dt = (wrapper.vm as any).dt;
			expect(dt).toBeDefined();

			wrapper.unmount();
		});

		it('passes ajax URL string to DataTables options', () => {
			const wrapper = mount(DataTable, {
				props: {
					ajax: '/api/users.json',
					columns: defaultColumns
				}
			});

			const dt = (wrapper.vm as any).dt;
			expect(dt).toBeDefined();

			wrapper.unmount();
		});
	});

	describe('Template refs, exposed API, and unmount lifecycle', () => {
		it('exposes the DataTables API instance via dt', () => {
			const wrapper = mount(DataTable, {
				props: {
					data: sampleData,
					columns: defaultColumns
				}
			});

			const dt = (wrapper.vm as any).dt;
			expect(dt).toBeDefined();
			expect(dt.rows().count()).toBe(3);
			expect(typeof dt.search).toBe('function');
			expect(typeof dt.draw).toBe('function');

			wrapper.unmount();
		});

		it('forwards HTML attributes and styles to the table element', () => {
			const wrapper = mount(DataTable, {
				attrs: {
					id: 'test-table-id',
					class: 'custom-table-class display',
					'data-custom': 'attribute-value'
				},
				props: {
					data: sampleData,
					columns: defaultColumns
				}
			});

			// Root wrapper is .datatable
			expect(wrapper.classes()).toContain('datatable');

			const table = wrapper.find('table');
			expect(table.attributes('id')).toBe('test-table-id');
			expect(table.classes()).toContain('custom-table-class');
			expect(table.classes()).toContain('display');
			expect(table.attributes('data-custom')).toBe('attribute-value');
			expect(table.attributes('style')).toContain('width: 100%');

			wrapper.unmount();
		});

		it('destroys DataTables instance upon component unmount', () => {
			const wrapper = mount(DataTable, {
				props: {
					data: sampleData,
					columns: defaultColumns
				}
			});

			const dt = (wrapper.vm as any).dt;
			const destroySpy = vi.spyOn(dt, 'destroy');

			wrapper.unmount();
			expect(destroySpy).toHaveBeenCalledWith(true);
		});
	});

	describe('Static methods, plugin install, and error handling', () => {
		it('DataTable.use() returns the registered DataTables static core', () => {
			const core = DataTable.use();
			expect(core).toBe(DtCore);
		});

		it('DataTable.Column statically references the Column component', () => {
			expect(DataTable.Column).toBe(Column);
		});

		it('DataTable.install registers components into the Vue application', () => {
			const app = createApp(defineComponent({ render: () => h('div') }));
			app.use(DataTable);

			expect(app.component('DataTable')).toBe(DataTable);
			expect(app.component('Column')).toBe(Column);
			expect(app.component('DataTableColumn')).toBe(Column);
			expect(app.component('Datatables.netVue')).toBe(DataTable);
		});

		it('throws an informative error if DataTables core library is not set', async () => {
			// Isolate modules so DtCore is not yet set
			vi.resetModules();
			const freshSrc = await import('../src/DataTable');
			const FreshDataTable = freshSrc.default;

			expect(() => {
				mount(FreshDataTable, {
					props: {
						data: [{ id: 1 }]
					}
				});
			}).toThrow('DataTables library not set. See https://datatables.net/tn/19 for details.');

			// Restore DtCore for any subsequent tests
			DataTable.use(DtCore);
		});
	});
});
