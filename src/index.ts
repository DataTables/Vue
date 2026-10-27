import type { App, Plugin } from 'vue';
import DataTableComponent from './DataTable';

export type DataTableWithInstall = typeof DataTableComponent & Plugin;
const DataTable = DataTableComponent as DataTableWithInstall;

// Attach install method for app.use(DataTable)
DataTable.install = (app: App) => {
	app.component('DataTable', DataTable);

	// Maintain backward compatibility for v1 templates using <Datatables.netVue>
	app.component('Datatables.netVue', DataTable);
};

export default DataTable;
export { DataTable };
