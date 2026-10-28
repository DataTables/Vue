import { mount } from '@vue/test-utils';
import DtCore from 'datatables.net';
import { afterEach, beforeAll, describe, expect, it, vi } from 'vitest';
import { nextTick } from 'vue';
import { DataTable } from '../src';

describe('Events - DataTables Event Forwarding', () => {
	beforeAll(() => {
		DataTable.use(DtCore);
	});

	afterEach(() => {
		vi.restoreAllMocks();
	});

	const sampleData = Array.from({ length: 25 }, (_, i) => ({
		id: i + 1,
		name: `User ${i + 1}`,
		position: i % 2 === 0 ? 'Developer' : 'Designer',
		office: i % 3 === 0 ? 'London' : 'New York',
		salary: `$${(i + 1) * 10},000`
	}));

	const sampleColumns = [
		{ data: 'name', title: 'Name' },
		{ data: 'position', title: 'Position' },
		{ data: 'office', title: 'Office' },
		{ data: 'salary', title: 'Salary' }
	];

	it('emits @init event when table finishes asynchronous initialization (e.g. via ajax)', async () => {
		const initHandler = vi.fn();

		const wrapper = mount(DataTable, {
			props: {
				ajax: (_data: any, callback: (res: any) => void) => {
					setTimeout(() => {
						callback({ data: sampleData.slice(0, 2) });
					}, 20);
				},
				columns: sampleColumns,
				onInit: initHandler
			}
		});

		await new Promise(resolve => setTimeout(resolve, 50));

		expect(initHandler).toHaveBeenCalled();
		const [payload, settings] = initHandler.mock.calls[0]!;

		expect(payload).toBeDefined();
		expect(payload.event).toBeDefined();
		expect(payload.dt).toBeDefined();
		expect(typeof payload.dt.value.rows).toBe('function');
		expect(settings).toBeDefined();

		wrapper.unmount();
	});

	it('emits @draw event when table is redrawn', () => {
		const drawHandler = vi.fn();

		const wrapper = mount(DataTable, {
			props: {
				data: sampleData.slice(0, 5),
				columns: sampleColumns,
				onDraw: drawHandler
			}
		});

		const dt = (wrapper.vm as any).dt;
		drawHandler.mockClear();

		// Trigger redrawing via DataTables API
		dt.draw();

		expect(drawHandler).toHaveBeenCalled();
		const [payload] = drawHandler.mock.calls[0]!;
		expect(payload.event).toBeDefined();
		expect(payload.dt).toBeDefined();

		wrapper.unmount();
	});

	it('emits @order event when column ordering is triggered', () => {
		const orderHandler = vi.fn();

		const wrapper = mount(DataTable, {
			props: {
				data: sampleData,
				columns: sampleColumns,
				onOrder: orderHandler
			}
		});

		const dt = (wrapper.vm as any).dt;
		orderHandler.mockClear();

		// Trigger sorting on column 1 descending
		dt.order([1, 'desc']).draw();

		expect(orderHandler).toHaveBeenCalled();
		const [payload] = orderHandler.mock.calls[0]!;
		expect(payload.event).toBeDefined();
		expect(payload.dt).toBeDefined();

		wrapper.unmount();
	});

	it('emits @search event when filtering/searching is performed', () => {
		const searchHandler = vi.fn();

		const wrapper = mount(DataTable, {
			props: {
				data: sampleData,
				columns: sampleColumns,
				onSearch: searchHandler
			}
		});

		const dt = (wrapper.vm as any).dt;
		searchHandler.mockClear();

		// Trigger search
		dt.search('Designer').draw();

		expect(searchHandler).toHaveBeenCalled();
		const [payload] = searchHandler.mock.calls[0]!;
		expect(payload.event).toBeDefined();
		expect(payload.dt).toBeDefined();

		wrapper.unmount();
	});

	it('emits @page event when table pagination changes', () => {
		const pageHandler = vi.fn();

		const wrapper = mount(DataTable, {
			props: {
				data: sampleData,
				columns: sampleColumns,
				options: { pageLength: 5 },
				onPage: pageHandler
			}
		});

		const dt = (wrapper.vm as any).dt;
		pageHandler.mockClear();

		// Navigate to page 2 (0-indexed page 1)
		dt.page(1).draw('page');

		expect(pageHandler).toHaveBeenCalled();
		const [payload] = pageHandler.mock.calls[0]!;
		expect(payload.event).toBeDefined();
		expect(payload.dt).toBeDefined();

		wrapper.unmount();
	});

	it('emits @length event when pageLength is altered', () => {
		const lengthHandler = vi.fn();

		const wrapper = mount(DataTable, {
			props: {
				data: sampleData,
				columns: sampleColumns,
				options: { pageLength: 5 },
				onLength: lengthHandler
			}
		});

		const dt = (wrapper.vm as any).dt;
		lengthHandler.mockClear();

		// Change page length to 10
		dt.page.len(10).draw();

		expect(lengthHandler).toHaveBeenCalled();
		const [payload] = lengthHandler.mock.calls[0]!;
		expect(payload.event).toBeDefined();
		expect(payload.dt).toBeDefined();

		wrapper.unmount();
	});

	it('emits @destroy event when table instance is destroyed', () => {
		const destroyHandler = vi.fn();

		const wrapper = mount(DataTable, {
			props: {
				data: sampleData,
				columns: sampleColumns,
				onDestroy: destroyHandler
			}
		});

		wrapper.unmount();

		expect(destroyHandler).toHaveBeenCalled();
		const [payload] = destroyHandler.mock.calls[0]!;
		expect(payload.event).toBeDefined();
		expect(payload.dt).toBeDefined();
	});
});
