<script setup lang="ts">
import DatatablesnetVue from '../src';
import Test from './Test.vue';
import DataTablesLib from 'datatables.net';

const data = [
  [1, 2],
  [3, 4],
];

if(typeof window !== 'undefined') {
  DatatablesnetVue.use(DataTablesLib)
}
</script>

<template>
  <div>

    <Test />

    <div class="m-48">
      <DatatablesnetVue :data="data" class="display">
        <thead>
            <tr>
                <th>A</th>
                <th>B</th>
            </tr>
        </thead>
      </DatatablesnetVue>
    </div>
  </div>
</template>

<style>
  .m-48 {
    margin: 3rem
  }
</style>
