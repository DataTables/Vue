import { mount } from '@vue/test-utils';
import DtCore from 'datatables.net';
import { beforeAll, describe, expect, it } from 'vitest';
import { nextTick } from 'vue';
import { Column, DataTable } from '../src';

describe('DataTable.vue', () => {
	beforeAll(() => {
		// Register the DataTables core library
		DataTable.use(DtCore);
	});

	const testData = [
		{ id: 1, name: 'Alice', city: 'London' },
		{ id: 2, name: 'Bob', city: 'Paris' }
	];

	it('initializes a DataTable with props', () => {
		const wrapper = mount(DataTable, {
			props: {
				data: testData,
				columns: [
					{ data: 'name', title: 'Name' },
					{ data: 'city', title: 'City' }
				]
			}
		});

		const headers = wrapper.findAll('th');
		expect(headers).toHaveLength(2);
		expect(headers[0]!.text()).toBe('Name');
		expect(headers[1]!.text()).toBe('City');

		const cells = wrapper.findAll('tbody td');
		expect(cells[0]!.text()).toBe('Alice');
		expect(cells[1]!.text()).toBe('London');

		wrapper.unmount();
	});

	it('renders columns defined via child <Column> components', () => {
		const wrapper = mount({
			components: { DataTable, Column },
			template: `
				<DataTable :data="tableData">
				<Column data="name" title="Full Name" />
				<Column data="city" title="Location" />
				</DataTable>
			`,
			data() {
				return { tableData: testData };
			}
		});

		const headers = wrapper.findAll('th');
		expect(headers).toHaveLength(2);
		expect(headers[0]!.text()).toBe('Full Name');
		expect(headers[1]!.text()).toBe('Location');

		wrapper.unmount();
	});

	it('renders custom cell content using a <Column> slot', () => {
		const wrapper = mount({
			components: { DataTable, Column },
			template: `
				<DataTable :data="tableData">
				<Column data="name" title="Name" #default="{ cellData }">
					<span class="user-badge">{{ cellData }}!</span>
				</Column>
				</DataTable>
			`,
			data() {
				return { tableData: [{ name: 'Charlie' }] };
			}
		});

		const badge = wrapper.find('.user-badge');
		expect(badge.exists()).toBe(true);
		expect(badge.text()).toBe('Charlie!');

		wrapper.unmount();
	});

	it('updates table rows reactively when :data prop changes', async () => {
		const wrapper = mount(DataTable, {
			props: {
				data: testData,
				columns: [{ data: 'name', title: 'Name' }]
			}
		});

		expect(wrapper.findAll('tbody tr')).toHaveLength(2);

		await wrapper.setProps({
			data: [
				{ id: 1, name: 'Alice' },
				{ id: 2, name: 'Bob' },
				{ id: 3, name: 'David' }
			]
		});
		await nextTick();

		expect(wrapper.findAll('tbody tr')).toHaveLength(3);

		wrapper.unmount();
	});
});
