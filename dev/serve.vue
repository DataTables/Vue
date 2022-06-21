<script lang="ts">
import { defineComponent } from 'vue';
import Datatables.netVue from '@/datatables.net-vue.vue';

export default defineComponent({
  name: 'ServeDev',
  components: {
    Datatables.netVue
  }
});
</script>

<template>
  <div id="app">
    <datatables.net-vue />
  </div>
</template>
