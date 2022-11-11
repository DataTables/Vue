<script lang="ts">

import { defineComponent } from 'vue';

var DataTablesLib: any;

export interface IData {
  _dt: null | any,
  oldData: Array<any>
}

const Comp = defineComponent({
  name: 'DataTable',
  expose: [
    'dt',
  ],
  data(): IData {
    return {
      _dt: null,
      oldData: [],
    };
  },
  computed: {},
  methods: {
    dt() {
      return this._dt;
    },
    saveOld(d: any) {
      this.oldData = d.value
        ? d.value.slice()
        : d.slice();
    }
  },
  mounted() {
    // Component shown so we can initialise DataTables of the table now
    let table = this.$el.querySelector('table');
    let options: any = this.options;

    if (this.data) {
      options.data = this.data;
      this.saveOld(options.data);
    }

    if (this.columns) {
      options.columns = this.columns;
    }

    if (this.ajax) {
      options.ajax = this.ajax;
    }

    if (! DataTablesLib) {
      throw new Error('DataTables library not set. See https://datatables.net/tn/19 for details.');
    }

    this._dt = new (DataTablesLib as any)(table, options);
  },
  beforeUnmount() {
    this._dt.destroy(true);
  },
  props: {
    ajax: null,
    class: {
      type: String,
      default: '',
    },
    columns: {
      type: Array,
      default: null,
    },
    data: {
      type: Array,
      default: null,
    },
    options: {
      default: {}
    }
  },
  watch: {
    data: {
      handler(newVal) {
        let known = this._dt.data().toArray();

        // Find any new rows
        for (let n of newVal) {
          if (! known.includes(n)) {
            this._dt.row.add(n);
          }
        }

        // Remove any old rows
        for (let k of known) {
          if (! newVal.includes(k)) {
            this._dt.row((_idx: any, d: any) => d === k).remove();
          }
        }

        // Data in other rows might have changes, so we need to invalidate the rows
        this._dt.rows().invalidate().draw(false);

        this.saveOld(newVal);
      },
      deep: true
    }
  }
});

// Expose a static method that can be used to add extensions
Comp.use = function(lib: any) {
  DataTablesLib = lib;
}

export default Comp;

</script>

<template>
  <div class="datatable" v-once>
    <table :class="class">
      <slot></slot>
    </table>
  </div>
</template>
