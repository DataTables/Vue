<script setup lang="ts">
import { ref, onMounted } from 'vue';

import DataTable from '../src';
import DataTablesLib from 'datatables.net';
import 'datatables.net-select';


if(typeof window !== 'undefined') {
  DataTable.use(DataTablesLib);
}

let dt: any
let counter = 0;
const data = ref<any>([]);
const table = ref();
const columns = [
  {
    data: 'a',
    title: 'First',
  },
  {
    data: 'b',
    title: 'Second',
  },
  {
    data: 'c',
    title: 'Third',
  },
];

// Initial data
for (let i = 0; i < 5; i++) {
  add();
}

// Get a DataTables API reference
onMounted(function () {
  dt = table.value.dt;
});

// Add new rows - note how the data object in Vue is changed and the DataTable will reflect
// those changes, rather than using the DataTables API to manipulate the rows.
function add() {
  data.value.push({
    a: 'A-' + counter,
    b: 'B-' + counter,
    c: 'C-' + counter,
  });

  counter += 1;
}

// For each selected row just add an indicator to show that it's data has been updated
function update() {
  dt.rows({ selected: true }).every(function () {
    // @ts-expect-error this
    let row = this.data();

    row.a += ' Updated';
    row.b += ' Updated';
    row.c += ' Updated';
  });
}

// For each selected row find the data object in `data` array and remove it
function remove() {
  dt.rows({ selected: true }).every(function () {
    // @ts-expect-error this
    let idx = data.value.indexOf(this.data());
    data.value.splice(idx, 1);
  });
}
</script>

<template>
  <div class="m-48">
    <h1>Simple table</h1>
    <h2>DataTables + Vue3 example</h2>
    <p>
      This example demonstrates the <code>datatables.net-vue3</code> package
      being used to display an interactive DataTable in a Vue application.
    </p>

    <button @click="add">Add new row</button><br />
    <button @click="update">Update selected rows</button><br />
    <button @click="remove">Delete selected rows</button>

    <DataTable
      class="display"
      :columns="columns"
      :data="data"
      :options="{ select: true }"
      ref="table"
    />
  </div>
</template>

