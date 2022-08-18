export default {
  name: "attribute-item",
  // components: {},
  emits: ["update:modelValue"],
  props: {
    index: {
      type: Number,
      required: true,
    },
    modelValue: {
      type: Array,
      required: true,
    },
  },
  data() {
    return {};
  },
  methods: {
    onChange(value) {
      this.$emit(
        "update:modelValue",
        value.map((e) => +e)
      );
    },
  },
  computed: {
    value: {
      get() {
        return this.modelValue;
      },
      set(value) {
        this.$emit("update:modelValue", value.map(Number));
      },
    },
  },
  watch: {},
  created() {},
  // =======================================================
  template: /*template*/ `
  <input 
    v-for="i of [0, 1]"
    :id="['attribute-item', index, i].join('_')"
    v-model.lazy="value[i]"
    @focus="$event.target.select()"
    class="td2-input td2-input-number" 
    type="number" 
    placeholder="0" 
    min="-100" 
    max="9999.9" 
    step="1"
  />
  `,
};
