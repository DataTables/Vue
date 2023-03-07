
# DataTables component for Vue 3

This library provides a Vue 3 component for [DataTables.net](https://datatables.net) to be used inside a Vue application.

To install:

```
npm install --save datatables.net-vue3
```

This will automatically install DataTables as a dependency. Other DataTables extensions can also be installed in your application - see below.

In your Vue component you can then:

```js
import DataTable from 'datatables.net-vue3'
import DataTablesLib from 'datatables.net';

DataTable.use(DataTablesLib);
```

Note how both the DataTables core and DataTables Vue component must both be imported. This is so the extensions for DataTables can also be imported in this scope and used (see below). This behaviour is **new in v2** of this component and is required for compatibility with DataTables 1.13 and newer.

Which makes a `DataTable` component available. It provides the following parameters:

* `columns` - Define the columns array used for [DataTables initialisation](https://datatables.net/reference/option/#datatables%20-%20columns)
* `data` - [Data array for DataTables](https://datatables.net/reference/option/data). This is _optional_ and if you are using Ajax to load the DataTable data is not required.
* `ajax` - [Ajax option for DataTables](https://datatables.net/reference/option/ajax) - to load data for the table over Ajax.
* `class` - Class name to assign to the `table` tag
* `options` - The [DataTables options](https://datatables.net/reference/option) for the table. Note that this can include `columns`, `data` and `ajax` - if they are provided by one of the properties from above that will override a matching option given here.


### Templates

The `DataTable` component provides a single slot that can be used to define the HTML for the table structure - i.e. the `thead` and `tfoot`:

```html
<DataTable :data="[[1,2], [3,4]]" class="display">
	<thead>
		<tr>
			<th>A</th>
			<th>B</th>
		</tr>
	</thead>
</DataTable>
```

**IMPORTANT** You should not use a Vue `for` in the template to display the HTML for the table body! Doing so will cause a conflict between DataTables and Vue both trying to control the same DOM elements. Allow DataTables to build the HTML for the rows.


## Extensions

DataTables provides [a wide range of extensions](https://datatables.net/extensions/index) that significantly expands its abilities. Extensions can be imported from npm as modules directly in the script where you wish to make use of them in your DataTable, and then assign the resulting DataTables library to the DataTables Vue3 component - e.g.:

```js
import DataTable from 'datatables.net-vue3'
import DataTablesLib from 'datatables.net';
import 'datatables.net-select';

DataTable.use(DataTablesLib);
```


## Styling

The Vue component for DataTables doesn't include any styling by default. We provide support for a number of different styling libraries, and you will need to install those that you require and for any additional extensions you require.

For example, to use Bootstrap 5 styling, you would install the `-bs5` packages for DataTables:

```
npm install datatables.net-bs5
npm install datatables.net-select-bs5
```

Your JS import would then be:

```js
import DataTable from 'datatables.net-vue3'
import DataTablesLib from 'datatables.net-bs5';
import 'datatables.net-select-bs5';

DataTable.use(DataTablesLib);
```

And in your Vue application's CSS (assuming your are using Vite or some other builder which can resolve the `style` property for npm packages):

```css
@import 'datatables.net-dt';
@import 'datatables.net-select-dt';
```


## Development

Clone this repo and then in your terminal:

```
npm install
npm run dev
```

You will then be able to access various examples in your browser by clicking the link shown in your terminal.
