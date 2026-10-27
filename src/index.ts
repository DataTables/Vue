import { App, Plugin } from 'vue';

// Import vue component
import DataTable from './DataTable';

// Define typescript interfaces for installable component
export type InstallableComponent = typeof DataTable & { install: Exclude<Plugin['install'], undefined> };

// Default export is installable instance of component.
// IIFE injects install function into component, allowing component
// to be registered via Vue.use() as well as Vue.component(),
export default /*#__PURE__*/((): InstallableComponent => {
  // Assign InstallableComponent type
  const installable = DataTable as unknown as InstallableComponent;

  // Attach install function executed by Vue.use()
  installable.install = (app: App) => {
    app.component('Datatables.netVue', installable);
  };
  return installable;
})();

export {
  DataTable
};
