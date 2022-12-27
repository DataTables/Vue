<script lang="ts">
  export let DataTablesLib: any

  export default {
    name: 'Datatables.netVue',
    inheritAttrs: false,
    use(lib: any) {
      DataTablesLib = lib;
    }
  }
</script>

<script lang="ts" setup>
// imports
import { ref, unref, watch, onMounted, onBeforeUnmount } from 'vue'
import type { Api, Config, ConfigColumns } from 'datatables.net'

// props
const props = defineProps<{
  /**
   * Load data for the table's content from an Ajax source
   */
  ajax?: Config['ajax']
  /**
   * Set column specific initialisation properties.
   */
  columns?: ConfigColumns[]
  /**
   * Data to use as the display data for the table.
   */
  data?: any
  /**
   * DataTables options
   */
  options?: Config
}>()

// emits

// setup
const table = ref<HTMLTableElement | null>(null)

// data
const dt = ref<Api<any>>()
const oldData = ref<any[]>([])

// computed

// watch
watch(
  () => props.data,
  (newVal) => {
    let known = dt.value?.data().toArray();

    // Find any new rows
    for (let n of newVal) {
      if (!known?.includes(n)) {
        dt.value?.row.add(n);
      }
    }

    // Remove any old rows
    if(typeof known !== 'undefined') {
      for (let k of known) {
        if (!newVal.includes(k)) {
          dt.value?.row((_idx: any, d: any) => d === k).remove();
        }
      }
    }
    
    // Data in other rows might have changes, so we need to invalidate the rows
    dt.value?.rows().invalidate().draw(false);

    saveOld(newVal);
  }, {
    deep: true
  }
)

// lifecycle
onMounted(() => {
  let options: any = props.options || {};

  if (props.data) {
    options.data = props.data;
    saveOld(options.data);
  }

  if (props.columns) {
    options.columns = props.columns;
  }

  if (props.ajax) {
    options.ajax = props.ajax;
  }

  if (!DataTablesLib) {
    throw new Error('DataTables library not set. See https://datatables.net/tn/19 for details.');
  }

  dt.value = new DataTablesLib(unref(table), options);
})

onBeforeUnmount(() => {
  dt.value?.destroy(true);
})

// methods
function saveOld(d: any) {
  oldData.value = d.value ? d.value.slice() : d.slice();
}

// expose
defineExpose({
  /**
   * DataTable instance
   */
  dt
})
</script>

<template>
  <div class="datatable" v-once>
    <table ref="table" v-bind="$attrs">
      <slot></slot>
    </table>
  </div>
</template>
