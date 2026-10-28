import { mount } from '@vue/test-utils';
import DtCore from 'datatables.net';
import { beforeAll, describe, expect, it } from 'vitest';
import { Column, DataTable } from '../src';
import DataTableColumn from '../src/Column';

describe('Column - Properties', () => {
	beforeAll(() => {
		DataTable.use(DtCore);
	});

	const sampleData = [
		{
			id: 1,
			name: 'Tiger Nixon',
			position: 'System Architect',
			details: { city: 'Edinburgh', country: 'UK' },
			salary: '$320,800',
			score: 95
		},
		{
			id: 2,
			name: 'Garrett Winters',
			position: 'Accountant',
			details: { city: 'Tokyo', country: 'Japan' },
			salary: '$170,750',
			score: 80
		}
	];

	describe('title prop', () => {
		it('renders column header title from title prop', () => {
			const wrapper = mount({
				components: { DataTable, Column },
				template: `
					<DataTable :data="tableData" :options="{ order: [] }">
						<Column data="name" title="Full Name" />
						<Column data="position" title="Job Title" />
					</DataTable>
				`,
				data() {
					return { tableData: sampleData };
				}
			});

			const headers = wrapper.findAll('th');
			expect(headers).toHaveLength(2);
			expect(headers[0]!.text()).toBe('Full Name');
			expect(headers[1]!.text()).toBe('Job Title');

			wrapper.unmount();
		});
	});

	describe('data prop', () => {
		it('extracts cell data from top-level object property using a string key', () => {
			const wrapper = mount({
				components: { DataTable, Column },
				template: `
					<DataTable :data="tableData" :options="{ order: [] }">
						<Column data="name" title="Name" />
						<Column data="salary" title="Salary" />
					</DataTable>
				`,
				data() {
					return { tableData: sampleData };
				}
			});

			const cells = wrapper.findAll('tbody tr:first-child td');
			expect(cells[0]!.text()).toBe('Tiger Nixon');
			expect(cells[1]!.text()).toBe('$320,800');

			wrapper.unmount();
		});

		it('extracts cell data from nested properties using dotted string notation', () => {
			const wrapper = mount({
				components: { DataTable, Column },
				template: `
					<DataTable :data="tableData" :options="{ order: [] }">
						<Column data="name" title="Name" />
						<Column data="details.city" title="City" />
						<Column data="details.country" title="Country" />
					</DataTable>
				`,
				data() {
					return { tableData: sampleData };
				}
			});

			const firstRowCells = wrapper.findAll('tbody tr:first-child td');
			expect(firstRowCells[1]!.text()).toBe('Edinburgh');
			expect(firstRowCells[2]!.text()).toBe('UK');

			const secondRowCells = wrapper.findAll('tbody tr:nth-child(2) td');
			expect(secondRowCells[1]!.text()).toBe('Tokyo');
			expect(secondRowCells[2]!.text()).toBe('Japan');

			wrapper.unmount();
		});

		it('extracts cell data using array indices for 2D array data', () => {
			const arrayData = [
				['Edinburgh', 'UK'],
				['Tokyo', 'Japan']
			];

			const wrapper = mount({
				components: { DataTable, Column },
				template: `
					<DataTable :data="tableData" :options="{ order: [] }">
						<Column :data="0" title="City" />
						<Column :data="1" title="Country" />
					</DataTable>
				`,
				data() {
					return { tableData: arrayData };
				}
			});

			const rows = wrapper.findAll('tbody tr');
			expect(rows[0]!.findAll('td')[0]!.text()).toBe('Edinburgh');
			expect(rows[0]!.findAll('td')[1]!.text()).toBe('UK');
			expect(rows[1]!.findAll('td')[0]!.text()).toBe('Tokyo');
			expect(rows[1]!.findAll('td')[1]!.text()).toBe('Japan');

			wrapper.unmount();
		});

		it('extracts cell data using a custom data function', () => {
			const wrapper = mount({
				components: { DataTable, Column },
				template: `
					<DataTable :data="tableData" :options="{ order: [] }">
						<Column :data="combineNamePosition" title="Employee Profile" />
					</DataTable>
				`,
				data() {
					return {
						tableData: sampleData,
						combineNamePosition: (row: any) => `${row.name} - ${row.position}`
					};
				}
			});

			const cells = wrapper.findAll('tbody td');
			expect(cells[0]!.text()).toBe('Tiger Nixon - System Architect');
			expect(cells[1]!.text()).toBe('Garrett Winters - Accountant');

			wrapper.unmount();
		});

		it('supports data as null with defaultContent for computed or empty columns', () => {
			const wrapper = mount({
				components: { DataTable, Column },
				template: `
					<DataTable :data="tableData" :options="{ order: [] }">
						<Column data="name" title="Name" />
						<Column :data="null" title="Action" :options="{ defaultContent: 'Edit / Delete' }" />
					</DataTable>
				`,
				data() {
					return { tableData: sampleData };
				}
			});

			const cells = wrapper.findAll('tbody tr:first-child td');
			expect(cells[0]!.text()).toBe('Tiger Nixon');
			expect(cells[1]!.text()).toBe('Edit / Delete');

			wrapper.unmount();
		});
	});

	describe('render prop', () => {
		it('transforms cell display using a render function', () => {
			const wrapper = mount({
				components: { DataTable, Column },
				template: `
					<DataTable :data="tableData" :options="{ order: [] }">
						<Column data="score" title="Score" :render="formatScore" />
					</DataTable>
				`,
				data() {
					return {
						tableData: sampleData,
						formatScore: (data: number) => `${data} / 100 pts`
					};
				}
			});

			const cells = wrapper.findAll('tbody td');
			expect(cells[0]!.text()).toBe('95 / 100 pts');
			expect(cells[1]!.text()).toBe('80 / 100 pts');

			wrapper.unmount();
		});

		it('transforms cell display using an orthogonal object renderer', () => {
			const wrapper = mount({
				components: { DataTable, Column },
				template: `
					<DataTable :data="tableData" :options="{ order: [] }">
						<Column data="name" title="Name" :render="orthogonalRenderer" />
					</DataTable>
				`,
				data() {
					return {
						tableData: sampleData,
						orthogonalRenderer: {
							display: (data: string) => `Person: ${data.toUpperCase()}`,
							sort: (data: string) => data
						}
					};
				}
			});

			const cells = wrapper.findAll('tbody td');
			expect(cells[0]!.text()).toBe('Person: TIGER NIXON');
			expect(cells[1]!.text()).toBe('Person: GARRETT WINTERS');

			wrapper.unmount();
		});
	});

	describe('footer prop', () => {
		it('passes footer configuration to the column options', () => {
			const wrapper = mount({
				components: { DataTable, Column },
				template: `
					<DataTable :data="tableData" :options="{ order: [] }">
						<Column data="name" title="Name" footer="Name Total" />
						<Column data="salary" title="Salary" footer="Salary Total" />
						<tfoot>
							<tr>
								<th></th>
								<th></th>
							</tr>
						</tfoot>
					</DataTable>
				`,
				data() {
					return { tableData: sampleData };
				}
			});

			const dt = (wrapper.findComponent(DataTable).vm as any).dt;
			const col0 = dt.column(0);
			const col1 = dt.column(1);
			expect(col0.footer()).toBeDefined();
			expect(col1.footer()).toBeDefined();

			wrapper.unmount();
		});
	});

	describe('options prop', () => {
		it('passes custom column options like className, orderable, searchable, and width', () => {
			const wrapper = mount({
				components: { DataTable, Column },
				template: `
					<DataTable :data="tableData" :options="{ order: [] }">
						<Column
							data="name"
							title="Name"
							:options="{
								className: 'custom-user-cell',
								orderable: false,
								searchable: false,
								width: '300px'
							}"
						/>
					</DataTable>
				`,
				data() {
					return { tableData: sampleData };
				}
			});

			const cells = wrapper.findAll('tbody td');
			expect(cells[0]!.classes()).toContain('custom-user-cell');

			const dt = (wrapper.findComponent(DataTable).vm as any).dt;
			const colConfig = dt.init().columns[0];
			expect(colConfig.orderable).toBe(false);
			expect(colConfig.searchable).toBe(false);
			expect(colConfig.width).toBe('300px');

			wrapper.unmount();
		});

		it('supports column visibility via options.visible: false', () => {
			const wrapper = mount({
				components: { DataTable, Column },
				template: `
					<DataTable :data="tableData" :options="{ order: [] }">
						<Column data="name" title="Name" />
						<Column data="position" title="Position" :options="{ visible: false }" />
						<Column data="salary" title="Salary" />
					</DataTable>
				`,
				data() {
					return { tableData: sampleData };
				}
			});

			const headers = wrapper.findAll('th');
			expect(headers).toHaveLength(2);
			expect(headers[0]!.text()).toBe('Name');
			expect(headers[1]!.text()).toBe('Salary');

			const cells = wrapper.findAll('tbody tr:first-child td');
			expect(cells).toHaveLength(2);
			expect(cells[0]!.text()).toBe('Tiger Nixon');
			expect(cells[1]!.text()).toBe('$320,800');

			wrapper.unmount();
		});
	});

	describe('precedence: props override options', () => {
		it('allows top-level data, title, and render props to override options object properties', () => {
			const wrapper = mount({
				components: { DataTable, Column },
				template: `
					<DataTable :data="tableData" :options="{ order: [] }">
						<Column
							data="name"
							title="Overridden Title"
							:render="customRenderer"
							:options="{
								data: 'position',
								title: 'Initial Option Title',
								render: fallbackRenderer
							}"
						/>
					</DataTable>
				`,
				data() {
					return {
						tableData: sampleData,
						customRenderer: (val: string) => `Prop: ${val}`,
						fallbackRenderer: () => 'From options'
					};
				}
			});

			const header = wrapper.find('th');
			expect(header.text()).toBe('Overridden Title');

			const cell = wrapper.find('tbody td');
			expect(cell.text()).toBe('Prop: Tiger Nixon');

			wrapper.unmount();
		});
	});

	describe('component identity and headless behavior', () => {
		it('recognizes both <Column> and <DataTableColumn> components', () => {
			const wrapper = mount({
				components: { DataTable, Column, DataTableColumn },
				template: `
					<DataTable :data="tableData" :options="{ order: [] }">
						<Column data="name" title="Column Component" />
						<DataTableColumn data="position" title="DataTableColumn Component" />
					</DataTable>
				`,
				data() {
					return { tableData: sampleData };
				}
			});

			const headers = wrapper.findAll('th');
			expect(headers).toHaveLength(2);
			expect(headers[0]!.text()).toBe('Column Component');
			expect(headers[1]!.text()).toBe('DataTableColumn Component');

			wrapper.unmount();
		});

		it('Column is a headless component that renders nothing to the DOM directly', () => {
			const wrapper = mount(Column, {
				props: {
					data: 'name',
					title: 'Name'
				}
			});

			expect(wrapper.html()).toBe('');
			wrapper.unmount();
		});
	});
});
