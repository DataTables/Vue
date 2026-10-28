import type { App, Plugin } from 'vue';
import Column from './Column';
import DataTableComponent from './DataTable';

export type DataTableWithInstall = typeof DataTableComponent & Plugin & {
	Column: typeof Column;
};
const DataTable = DataTableComponent as DataTableWithInstall;

// Attach Column statically for UMD/script-tag (DataTable.Column)
DataTable.Column = Column;

// Attach install method for app.use(DataTable)
DataTable.install = (app: App) => {
	app.component('DataTable', DataTable);
	app.component('Column', Column);
	app.component('DataTableColumn', Column);

	// Maintain backward compatibility for v1 templates using <Datatables.netVue>
	app.component('Datatables.netVue', DataTable);
};

export default DataTable;
export { Column, DataTable };

