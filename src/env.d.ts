// Module declarations so tsc can follow imports from JavaScript files
declare module '*.vue' {
  import type { DefineComponent } from 'vue';
  const component: DefineComponent<object, object, any>;
  export default component;
}

declare module 'vuetify/styles';
