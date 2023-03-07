<script setup lang="ts">
import { nextTick, ref } from 'vue'
import DataTable from 'datatables.net';

import JsData from './JsData.vue';
import HtmlSource from './HtmlSource.vue';
import Responsive from './Responsive.vue';
import Select from './Select.vue';
import ReactiveDt from './Reactive.vue';

let display = ref<string>('basic');

function show(item: string) {
  display.value = item;
  
  // For the demo, when a table is made visible we need to call its
  // `columns.adjust` method.
  nextTick(() => {
    let tables = DataTable.tables( { visible: true, api: true } );

    (tables as any).columns.adjust();
  });
}
</script>

<template>
  <div>
    <h1>DataTables Vue 3 component examples</h1>

    <ul class="example-list">
      <li><button @click="show('basic')">HTML sourced data</button></li>
      <li><button @click="show('js-data')">Javascript sourced data</button></li>
      <li><button @click="show('responsive')">Responsive extension</button></li>
      <li><button @click="show('select')">Select extension</button></li>
      <li><button @click="show('reactive')">Reactive data</button></li>
    </ul>

    <div v-show="display === 'basic'">
      <HtmlSource />
    </div>
    <div v-show="display === 'js-data'">
      <JsData />
    </div>
    <div v-show="display === 'responsive'">
      <Responsive />
    </div>
    <div v-show="display === 'select'">
      <Select />
    </div>
    <div v-show="display === 'reactive'">
      <ReactiveDt />
    </div>
  </div>
</template>

<style>

ul.example-list button {
  background: none;
  border: none;
  color: blue;
}

ul.example-list button:hover {
  text-decoration: underline;
  cursor: pointer;
}

</style>
