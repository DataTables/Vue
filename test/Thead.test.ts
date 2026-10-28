import { mount } from '@vue/test-utils';
import DtCore from 'datatables.net';
import { beforeAll, describe, expect, it } from 'vitest';
import { Column, DataTable } from '../src';
import DataTableColumn from '../src/Column';

describe('Thead and Table Structure', () => {
	beforeAll(() => {
		DataTable.use(DtCore);
	});

	const sampleData = [
		{ id: 1, name: 'Tiger Nixon', position: 'System Architect', office: 'Edinburgh', salary: '$320,800' },
		{ id: 2, name: 'Garrett Winters', position: 'Accountant', office: 'Tokyo', salary: '$170,750' }
	];

	const sampleColumns = [
		{ data: 'name' },
		{ data: 'position' },
		{ data: 'office' },
		{ data: 'salary' }
	];

	describe('Explicit <thead> with :columns prop', () => {
		it('renders the custom <thead> provided in default slot', () => {
			const wrapper = mount({
				components: { DataTable },
				template: `
					<DataTable :data="tableData" :columns="columns" :options="{ order: [] }">
						<thead>
							<tr>
								<th>Full Name</th>
								<th>Job Title</th>
								<th>Office Location</th>
								<th>Annual Salary</th>
							</tr>
						</thead>
					</DataTable>
				`,
				data() {
					return {
						tableData: sampleData,
						columns: sampleColumns
					};
				}
			});

			const thead = wrapper.find('thead');
			expect(thead.exists()).toBe(true);

			const headers = thead.findAll('th');
			expect(headers).toHaveLength(4);
			expect(headers[0]!.text()).toBe('Full Name');
			expect(headers[1]!.text()).toBe('Job Title');
			expect(headers[2]!.text()).toBe('Office Location');
			expect(headers[3]!.text()).toBe('Annual Salary');

			wrapper.unmount();
		});

		it('preserves custom classes and attributes on <thead>, <tr>, and <th> elements', () => {
			const wrapper = mount({
				components: { DataTable },
				template: `
					<DataTable :data="tableData" :columns="columns" :options="{ order: [] }">
						<thead class="table-dark-header" data-testid="thead-custom">
							<tr class="header-row-primary">
								<th class="header-name" data-col="name" style="text-align: left;">Name</th>
								<th class="header-position">Position</th>
								<th class="header-office">Office</th>
								<th class="header-salary">Salary</th>
							</tr>
						</thead>
					</DataTable>
				`,
				data() {
					return {
						tableData: sampleData,
						columns: sampleColumns
					};
				}
			});

			const thead = wrapper.find('thead');
			expect(thead.classes()).toContain('table-dark-header');
			expect(thead.attributes('data-testid')).toBe('thead-custom');

			const headerRow = thead.find('tr');
			expect(headerRow.classes()).toContain('header-row-primary');

			const firstTh = thead.findAll('th')[0]!;
			expect(firstTh.classes()).toContain('header-name');
			expect(firstTh.attributes('data-col')).toBe('name');

			wrapper.unmount();
		});
	});

	describe('Mixing <thead> with <Column> sub-components', () => {
		it('preserves <thead> in DOM while parsing <Column> sub-components into column options', () => {
			const wrapper = mount({
				components: { DataTable, Column },
				template: `
					<DataTable :data="tableData" :options="{ order: [] }">
						<thead>
							<tr>
								<th>Header Name</th>
								<th>Header Position</th>
								<th></th>
								<th>Header Salary</th>
							</tr>
						</thead>
						<Column data="name" />
						<Column data="position" />
						<Column data="office" title="Office (title)" />
						<Column data="salary" />
					</DataTable>
				`,
				data() {
					return { tableData: sampleData };
				}
			});

			// Verify thead remains inside table
			const thead = wrapper.find('thead');
			expect(thead.exists()).toBe(true);

			// Verify <Column> tags are NOT rendered as DOM elements inside <table>
			expect(wrapper.find('column').exists()).toBe(false);

			const headers = wrapper.findAll('thead th');
			expect(headers).toHaveLength(4);
			expect(headers[0]!.text()).toBe('Header Name');
			expect(headers[1]!.text()).toBe('Header Position');
			expect(headers[2]!.text()).toBe('Office (title)');
			expect(headers[3]!.text()).toBe('Header Salary');

			const cells = wrapper.findAll('tbody tr:first-child td');
			expect(cells[0]!.text()).toBe('Tiger Nixon');
			expect(cells[1]!.text()).toBe('System Architect');
			expect(cells[2]!.text()).toBe('Edinburgh');
			expect(cells[3]!.text()).toBe('$320,800');

			wrapper.unmount();
		});

		it('excludes both <Column> and <DataTableColumn> components from table DOM nodes', () => {
			const wrapper = mount({
				components: { DataTable, Column, DataTableColumn },
				template: `
					<DataTable :data="tableData" :options="{ order: [] }">
						<thead>
							<tr>
								<th>Col 1</th>
								<th>Col 2</th>
							</tr>
						</thead>
						<Column data="name" />
						<DataTableColumn data="position" />
					</DataTable>
				`,
				data() {
					return { tableData: sampleData };
				}
			});

			expect(wrapper.find('column').exists()).toBe(false);
			expect(wrapper.find('datatablecolumn').exists()).toBe(false);

			const rows = wrapper.findAll('tbody tr');
			expect(rows).toHaveLength(2);

			wrapper.unmount();
		});
	});

	describe('Multi-row <thead> and complex headers', () => {
		it('renders multi-row <thead> with colspan groupings correctly', () => {
			const complexColumns = [
				{ data: 'name' },
				{ data: 'position' },
				{ data: 'office' },
				{ data: 'salary' }
			];

			const wrapper = mount({
				components: { DataTable },
				template: `
					<DataTable :data="tableData" :columns="columns" :options="{ order: [] }">
						<thead>
							<tr class="super-header">
								<th colspan="2">Personal Details</th>
								<th colspan="2">Location & Compensation</th>
							</tr>
							<tr class="sub-header">
								<th>Name</th>
								<th>Position</th>
								<th>Office</th>
								<th>Salary</th>
							</tr>
						</thead>
					</DataTable>
				`,
				data() {
					return {
						tableData: sampleData,
						columns: complexColumns
					};
				}
			});

			const theadRows = wrapper.findAll('thead tr');
			expect(theadRows).toHaveLength(2);

			const superHeaders = theadRows[0]!.findAll('th');
			expect(superHeaders).toHaveLength(2);
			expect(superHeaders[0]!.text()).toBe('Personal Details');
			expect(superHeaders[0]!.attributes('colspan')).toBe('2');
			expect(superHeaders[1]!.text()).toBe('Location & Compensation');
			expect(superHeaders[1]!.attributes('colspan')).toBe('2');

			const subHeaders = theadRows[1]!.findAll('th');
			expect(subHeaders).toHaveLength(4);
			expect(subHeaders[0]!.text()).toBe('Name');
			expect(subHeaders[3]!.text()).toBe('Salary');

			wrapper.unmount();
		});
	});

	describe('Table with both <thead> and <tfoot>', () => {
		it('preserves both <thead> and <tfoot> inside the table', () => {
			const wrapper = mount({
				components: { DataTable },
				template: `
					<DataTable :data="tableData" :columns="columns" :options="{ order: [] }">
						<thead>
							<tr>
								<th>Name Header</th>
								<th>Position Header</th>
								<th>Office Header</th>
								<th>Salary Header</th>
							</tr>
						</thead>
						<tfoot>
							<tr>
								<th>Name Footer</th>
								<th>Position Footer</th>
								<th>Office Footer</th>
								<th>Salary Footer</th>
							</tr>
						</tfoot>
					</DataTable>
				`,
				data() {
					return {
						tableData: sampleData,
						columns: sampleColumns
					};
				}
			});

			const thead = wrapper.find('thead');
			expect(thead.exists()).toBe(true);
			expect(thead.findAll('th')[0]!.text()).toBe('Name Header');

			const tfoot = wrapper.find('tfoot');
			expect(tfoot.exists()).toBe(true);
			expect(tfoot.findAll('th')[0]!.text()).toBe('Name Footer');
			expect(tfoot.findAll('th')[3]!.text()).toBe('Salary Footer');

			wrapper.unmount();
		});
	});

	describe('HTML sourced data (pure HTML table enhanced by DataTables)', () => {
		it('initializes DataTables from static HTML <thead> and <tbody> without data/columns props', () => {
			const wrapper = mount({
				components: { DataTable },
				template: `
					<DataTable class="display" :options="{ order: [] }">
						<thead>
							<tr>
								<th>Name</th>
								<th>Position</th>
								<th>Office</th>
								<th>Salary</th>
							</tr>
						</thead>
						<tbody>
							<tr>
								<td>Tiger Nixon</td>
								<td>System Architect</td>
								<td>Edinburgh</td>
								<td>$320,800</td>
							</tr>
							<tr>
								<td>Garrett Winters</td>
								<td>Accountant</td>
								<td>Tokyo</td>
								<td>$170,750</td>
							</tr>
							<tr>
								<td>Ashton Cox</td>
								<td>Junior Technical Author</td>
								<td>San Francisco</td>
								<td>$86,000</td>
							</tr>
						</tbody>
					</DataTable>
				`
			});

			const dt = (wrapper.findComponent(DataTable).vm as any).dt;
			expect(dt).toBeDefined();
			expect(dt.rows().count()).toBe(3);

			const headers = wrapper.findAll('thead th');
			expect(headers).toHaveLength(4);
			expect(headers[0]!.text()).toBe('Name');

			const rows = wrapper.findAll('tbody tr');
			expect(rows).toHaveLength(3);
			expect(rows[0]!.findAll('td')[0]!.text()).toBe('Tiger Nixon');
			expect(rows[2]!.findAll('td')[0]!.text()).toBe('Ashton Cox');

			wrapper.unmount();
		});
	});
});
