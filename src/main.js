// main.js
import { createApp } from "vue";

import i18n from "./i18n.js";
import vMainWrapper from "./components/v-main-wrapper.js";

createApp({
  data() {
    return {
      title: "TD2 Weapom Damage Calculator",
    };
  },
  template: /*template*/ `{{title}}`,
}).mount("#title");

createApp({
  components: {
    vMainWrapper,
  },
  data() {
    return {};
  },
  template: /*template*/ `
      <v-main-wrapper />
  `,
})
  .use(i18n)
  .mount("#app");
