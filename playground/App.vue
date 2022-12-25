<script setup lang="ts">
import { ref, onMounted } from 'vue'
import DatatablesnetVue from '../src';
import Test from './Test.vue';
import ReactiveDt from './Reactive.vue';
import DataTablesLib from 'datatables.net';

const dtRef = ref<InstanceType<typeof DatatablesnetVue> | null>(null)

const data = [
  [1, 2],
  [3, 4],
];

if(typeof window !== 'undefined') {
  DatatablesnetVue.use(DataTablesLib)
}

onMounted(() => {
  console.log(dtRef.value?.dt)
})
</script>

<template>
  <div>

    <Test />

    <div class="m-48">
      <DatatablesnetVue ref="dtRef" :data="data" class="display">
        <thead>
            <tr>
                <th>A</th>
                <th>B</th>
            </tr>
        </thead>
      </DatatablesnetVue>
    </div>


    <ReactiveDt />

  </div>
</template>

<style>
  .m-48 {
    margin: 3rem
  }
</style>
