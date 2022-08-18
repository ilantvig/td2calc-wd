export default {
  name: "locale-changer",
  emits: ["update:modelValue"],
  props: {
    availableLocales: {
      type: Array,
      required: true,
    },
    modelValue: {
      type: String,
      required: true,
    },
  },
  data() {
    return {
      languages: {
        en: "English",
        fr: "Français",
        es: "Español",
        gr: "Deutsche",
        ru: "Pусский",
      },
    };
  },
  computed: {
    value: {
      get() {
        return this.modelValue;
      },
      set(value) {
        this.$emit("update:modelValue", value);
      },
    },
  },
  methods: {},
  watch: {},
  created() {},
  // =======================================================
  template: /*template*/ `
    <div class="locale-container">
      <select
        class="td2-input"
        v-model="value">
        <option 
          v-for="locale in availableLocales" 
          :key="'locale-'+locale"
          :value="locale">
          {{ languages[locale] }}
        </option>
      </select>
    </div>
  `,
};
