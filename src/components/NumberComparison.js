import { comparisonSign } from "../api/api.js";

export default {
  name: "number-comparison",
  // components: {},
  props: {
    label: {
      type: String,
      required: false,
    },
    numbers: {
      type: Array,
      required: true,
    },
  },
  data() {
    return {
      comparisonSign: comparisonSign,
    };
  },
  // =======================================================
  template: /*template*/ `
  <span>
    <template v-if=label>
      {{label}}:
    </template>
      {{(numbers[0]).toLocaleString()}}
      {{comparisonSign(numbers[0], numbers[1])}}
      {{(numbers[1]).toLocaleString()}}

      ({{Math.abs(numbers[0]-numbers[1]).toLocaleString()}})
  </span>
  `,
};
