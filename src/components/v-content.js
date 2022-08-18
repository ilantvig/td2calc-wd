import {
  boolArrToInt32,
  int32ToBoolArr,
  filterArray,
  updateHash,
  getHashValue,
  comparisonSign,
} from "../api/api.js";

import { weaponBaseDamage } from "../api/weaponBaseDamage.js";

import NumberComparison from "./NumberComparison.js";
import AttributeItem from "./AttributeItem.js";
import LocaleChanger from "./LocaleChanger.js";

export default {
  name: "v-content",
  components: {
    LocaleChanger,
    NumberComparison,
    AttributeItem,
  },
  // emits: [],
  // props: {},
  data() {
    return {
      comparisonSign: comparisonSign,
      weaponBaseDamage: weaponBaseDamage,

      attributeId: [
        "WD_base",
        "WD",
        "WD_type",
        "WD_other",
        "TWD_increaser",
        "TWD_amplifier",
        "D_to_health",
        "D_to_armor",
        "D_to_toc",
        "crit_hit_chance",
        "crit_hit_damage",
        "headshot_damage",
        "D_additional",
        "D_multiplier",
      ],

      modifierId: [
        "hasArmor",
        "isOutOfCover",
        "IsCriticalHit",
        "isAvarageDamage",
      ],

      searchParamsNameList: ["lang", "attrs", "mods", "stats"],

      DATA_ITEM_SEPARATOR: "v",
      DATA_SIDE_SEPARATOR: "a",

      isSettingsMode: false,

      params: {
        lang: "en",
        attrs: [],
        mods: [true, true, false, false],
        stats: [
          [282072, 282072],
          [105, 105],
          [50, 59],
          [0, 0],
          [25, 25],
          [30, 30],
          [0, 0],
          [13, 8],
          [8, 8],
          [34, 34],
          [57, 57],
          [245, 245],
          [0, 0],
          [100, 100],
        ],
      },

      paramsPrev: {},

      // constants
      TYPE_HEAD: 0,
      TYPE_BODY: 1,
    };
  },
  // ================================================================
  computed: {
    // translation begin
    attributeLabels() {
      return [
        this.$t("WD_base"),
        this.$t("WD"),
        this.$t("WD_type"),
        this.$t("WD_other"),
        this.$t("TWD_increaser"),
        this.$t("TWD_amplifier"),
        this.$t("D_to_health"),
        this.$t("D_to_armor"),
        this.$t("D_to_toc"),
        this.$t("crit_hit_chance"),
        this.$t("crit_hit_damage"),
        this.$t("headshot_damage"),
        // this.$t("D_additional"),
        // this.$t("D_multiplier"),
      ];
    },

    switchLabelText() {
      return [this.$t("attributeLabelSet"), this.$t("attributeLabelSelect")];
    },

    switchButtonText() {
      return [
        this.$t("attributeButtonTextSelect"),
        this.$t("attributeButtonTextSet"),
      ];
    },

    modifierLabels() {
      return [
        this.$t("hasArmor"),
        this.$t("isOutOfCover"),
        this.$t("IsCriticalHit"),
        this.$t("isAvarageDamage"),
      ];
    },

    resultText() {
      return {
        head: this.$t("result.head"),
        body: this.$t("result.body"),
        WD: this.$t("result.WD"),
      };
    },

    // translation end

    result_hsd() {
      return [0, 1].map((e) => this.calcDamage(this.TYPE_HEAD, e));
    },

    result_bsd() {
      return [0, 1].map((e) => this.calcDamage(this.TYPE_BODY, e));
    },

    result_pwd() {
      return [0, 1].map((i) =>
        Math.round(
          (this.getDamageByKey("WD_base", 1)[i] *
            (100 +
              this.getDamageByKey("WD", 0)[i] +
              this.getDamageByKey("WD_type", 0)[i] +
              this.getDamageByKey("WD_other", 0)[i])) /
            100
        )
      );
    },

    filteredIndices() {
      return this.params["attrs"].reduce(
        (r, e, i) => (e && i ? [...r, i] : [...r]),
        []
      );
    },

    searchParamsValueList: {
      get() {
        return this.searchParamsNameList.reduce((result, paramName) => {
          result[paramName] = this.getSearchParam(paramName);
          return result;
        }, {});
      },
      set(value) {
        // console.log('setting initial searchParamsValueList');
        this.$i18n.locale = value["lang"];
        this.selectedAttrsBitMask = +value["attrs"];
        this.selectedModsBitMask = +value["mods"];
        let newArr = value["stats"]
          .split(this.DATA_ITEM_SEPARATOR)
          .map((e) => e.split(this.DATA_SIDE_SEPARATOR).map(Number));
        this.params["attrs"].map((e) => (e ? newArr.shift() : 0));
      },
    },

    modifiersEnabled() {
      let result = this.modifierId.map((e) => false);
      [
        ["hasArmor", "D_to_armor"],
        ["isOutOfCover", "D_to_toc"],
        ["IsCriticalHit", "crit_hit_damage"],
        ["isAvarageDamage", "crit_hit_chance"],
      ].forEach(([mod, attr]) => {
        result[this.modifierId.indexOf(mod)] =
          this.params["attrs"][this.attributeId.indexOf(attr)];
      });
      return result;
    },

    selectedAttrsBitMask: {
      get() {
        return boolArrToInt32(this.params["attrs"]);
      },
      set(value) {
        this.params["attrs"] = [
          ...int32ToBoolArr(+value, this.attributeLabels.length),
        ];
      },
    },
    selectedModsBitMask: {
      get() {
        return boolArrToInt32(this.params["mods"]);
      },
      set(value) {
        this.params["mods"] = [
          ...int32ToBoolArr(+value, this.modifierLabels.length),
        ];
      },
    },

    weaponList() {
      return Object.entries(this.weaponBaseDamage).reduce(
        (r, [k, v]) => [...r, ...v.map((o) => Object.assign(o, { type: k }))],
        []
      );
    },

    wrongHashParams() {
      const urlParams = new URLSearchParams(window.location.hash.slice(1));
      const entries = Object.fromEntries(urlParams.entries());
      return Object.entries(entries).filter(
        (e) => !this.searchParamsNameList.includes(e[0])
      );
    },
  },
  // ============================================================
  methods: {
    logging(value) {
      // console.log(value);
    },

    // API begin ================================================

    getSearchParam(paramName) {
      if (paramName === "lang") {
        return this.$i18n.locale;
      } else if (["attrs", "mods"].includes(paramName)) {
        return boolArrToInt32(this.params[paramName]).toString();
      } else if (paramName === "stats") {
        return filterArray(this.params[paramName], this.params["attrs"])
          .map((e) => e.join(this.DATA_SIDE_SEPARATOR))
          .join(this.DATA_ITEM_SEPARATOR);
      } else {
        console.log(`unknown param name: \"${paramName}\"`);
      }
    },

    // API end   ================================================

    // ==========================================================

    syncHash() {
      const urlParams = new URLSearchParams(window.location.hash.slice(1));
      // const entries = Object.fromEntries(urlParams.entries());

      // let url = new URL(window.location);

      let paramValue = undefined;
      let searchParamsValueList = {};
      for (let paramName of this.searchParamsNameList) {
        // paramValue = url.searchParams.get(paramName);
        paramValue = urlParams.get(paramName);
        // проверить paramValue
        if (paramValue) {
          // console.log(`restoring \"${paramName}\" from URI: ${paramValue}`);
          searchParamsValueList[paramName] = paramValue;
        } else {
          paramValue = this.searchParamsValueList[paramName];
          // console.log(`setting \"${paramName}\" from default: ${paramValue}`);
          urlParams.set(paramName, paramValue);
          searchParamsValueList[paramName] = paramValue;
        }
      }
      // window.history.replaceState(null, '', url.href);
      window.location.hash = urlParams.toString();
      this.searchParamsValueList = searchParamsValueList;
    },

    getDamageByKey(key, fallback) {
      let index = this.attributeId.indexOf(key);
      if (index !== -1 && this.params["attrs"][index]) {
        return this.params["stats"][index];
      } else if (fallback !== undefined) {
        return [fallback, fallback];
      } else {
        return [0, 0];
      }
    },

    validateInputInteger(number, min, max) {
      return (
        typeof number == "number" &&
        number == Math.round(number) &&
        min <= number &&
        number <= max
      );
    },

    validateInputFloat(value) {
      return /^\d{1,3}(\.\d){0,1}$/.test(value);
    },

    calcDamage(dmg_type, id) {
      let damage =
        this.getDamageByKey("WD_base", 1)[id] *
        [
          this.getDamageByKey("WD", 0)[id] +
            this.getDamageByKey("WD_type", 0)[id] +
            this.getDamageByKey("WD_other", 0)[id],
          this.getDamageByKey("TWD_increaser", 0)[id],
          this.getDamageByKey("TWD_amplifier", 0)[id],
          this.getDamageByKey("D_additional", 0)[id],
          this.getDamageByKey("D_multiplier", 100)[id] - 100,
          this.params["mods"][this.modifierId.indexOf("hasArmor")]
            ? this.getDamageByKey("D_to_armor", 0)[id]
            : this.getDamageByKey("D_to_health", 0)[id],
          this.params["mods"][this.modifierId.indexOf("isOutOfCover")]
            ? this.getDamageByKey("D_to_toc", 0)[id]
            : 0,
        ].reduce((p, e) => (p * (100 + e)) / 100, 1);

      let calculatedCritDamage = 0;
      if (this.params["mods"][this.modifierId.indexOf("IsCriticalHit")]) {
        calculatedCritDamage = this.getDamageByKey("crit_hit_damage", 0)[id];
      } else if (
        this.params["mods"][this.modifierId.indexOf("isAvarageDamage")]
      ) {
        calculatedCritDamage =
          (this.getDamageByKey("crit_hit_damage", 0)[id] *
            this.getDamageByKey("crit_hit_chance", 0)[id]) /
          100;
      }

      if (dmg_type == this.TYPE_HEAD) {
        damage *=
          (100 +
            this.getDamageByKey("headshot_damage", 0)[id] +
            calculatedCritDamage) /
          100;
      } else {
        damage *= (100 + calculatedCritDamage) / 100;
      }

      return Math.round(damage);
    },
  },
  // =======================================================
  watch: {
    params: {
      deep: true,
      handler(newValue, oldValue) {
        // console.log("watcher for 'params' called");
        const indexCritHit = this.modifierId.indexOf("IsCriticalHit");
        const indexAvarage = this.modifierId.indexOf("isAvarageDamage");

        if (newValue["mods"][indexCritHit] && newValue["mods"][indexAvarage]) {
          if (this.paramsPrev["mods"][indexCritHit]) {
            newValue["mods"][indexCritHit] = false;
          } else {
            newValue["mods"][indexAvarage] = false;
          }
        }
        this.paramsPrev["mods"] = [...newValue["mods"]];

        if (
          JSON.stringify(this.paramsPrev["stats"]) !==
          JSON.stringify(newValue["stats"])
        ) {
          this.paramsPrev["stats"] = [];
          newValue["stats"].forEach((e) => this.paramsPrev["stats"].push(e));
        }
      },
    },

    // переработать и убрать
    searchParamsValueList: {
      deep: true,
      handler(newValue, oldValue) {
        // console.log('searchParamsValueList changed');
        for (let paramName of this.searchParamsNameList) {
          const oldParamValue = getHashValue(paramName);
          const newParamValue = newValue[paramName];
          // console.log('old:', oldParamValue, 'new:', newParamValue, oldParamValue === newParamValue);
          if (newParamValue !== oldParamValue) {
            updateHash(paramName, newParamValue);
            // console.log("replacing", paramName + ':', oldParamValue, "->", newParamValue);
          }
        }
      },
    },
  },

  // =======================================================
  created() {
    this.params["attrs"] = this.attributeLabels.map((e) => true);
    window.addEventListener("hashchange", this.syncHash);
    this.syncHash();

    for (let paramName of this.searchParamsNameList) {
      if (paramName === "lang") {
        this.paramsPrev[paramName] = this.params[paramName];
      } else if (paramName === "stats") {
        this.paramsPrev[paramName] = [];
        this.params[paramName].forEach((e) =>
          this.paramsPrev[paramName].push(e)
        );
      } else {
        this.paramsPrev[paramName] = [...this.params[paramName]];
      }
    }
  },
  beforeDestroy() {
    window.removeEventListener("hashchange", this.syncHash);
  },
  // mounted() {},
  // styles: [`/* inlined css */`],
  // =======================================================
  template: /*template*/ `
        <div class="v-content">

          <locale-changer
            v-model="$i18n.locale"
            :availableLocales = "$i18n.availableLocales"
          />

            <div class="stick stick-top">
              <h3 style="text-align: center; margin: 0.3em;">
                <number-comparison :label="resultText['head']" :numbers="result_hsd">
                </number-comparison>
              </h3>
              <h3 style="text-align: center; margin: 0.3em;">
                <number-comparison :label="resultText['body']" :numbers="result_bsd">
                </number-comparison>
              </h3>
              <div style="text-align: center; margin: 0.3em;">
                <number-comparison :label="resultText['WD']" :numbers="result_pwd">
                </number-comparison>
              </div>
              <!--
              <div style="text-align: center; margin: 0.5em"
                v-if="wrongHashParams.length">
                wrongHashParams: {{wrongHashParams}}
              </div>
              <br />
              -->
            </div>
            
<!-- ///////////////////////////////////////////////////////// -->

            <div class="box-orange">
                {{ switchLabelText[+isSettingsMode]}}
                <button class="td2-button" @click="isSettingsMode = !isSettingsMode">
                    {{[$t('attributeButtonTextSelect'), $t('attributeButtonTextSet')][+isSettingsMode]}}
                </button>                

                <div v-show="!isSettingsMode">

                  <hr class="td2-hr"/>

                  <div v-if="params.attrs[0]"
                    style="margin-top: 4px;"
                    class="model-form">
                    <label>{{attributeLabels[0]}}: </label>
                    <span>
                      <input 
                        v-for="i of [0, 1]"
                        class="td2-input td2-input-number td2-input-data"
                        :list="'weapons-'+i" :name="'weapon-'+i" :id="'weapon-'+i"
                        @focus="$event.target.select()"
                        v-model.lazy="params['stats'][0][i]">

                      <datalist 
                        v-for="i of [0, 1]"
                        :id="'weapons-'+i">
                          <option v-for="weapon of weaponList"
                            :value="weapon.value">
                            {{weapon.name}} ({{weapon.type}})
                          </option>
                      </datalist>
                    </span>
                  </div>

                  <div v-for="index in filteredIndices" 
                    style="margin-top: 4px;"
                    class="model-form">
                      {{attributeLabels[index]}}:
                      <span>
                        <attribute-item
                          :index="index"
                          v-model="params['stats'][index]"
                        />
                      </span>
                  </div>

                  <div v-for="(label,index) in modifierLabels" 
                    style="margin-top: 4px;"
                    :key="'modifiersValue'+index">
                    <template v-if="modifiersEnabled[index]">
                      <input type="checkbox" :id="'modifiersValue'+index" 
                          :name="'modifiersValue'+index" v-model="params['mods'][index]"
                          :class="{ 'unchecked' : !params['mods'][index],
                          'disabled' : !modifiersEnabled[index] }"
                          :disabled="!modifiersEnabled[index]">
                      <label :for="'modifiersValue'+index">
                        {{ label }}
                      </label> <br/>
                    </template>
                  </div>

                </div>  
                <div v-show="isSettingsMode">

                  <hr class="td2-hr"/>
                
                  <div v-for="(label,index) in attributeLabels" 
                    style="margin-top: 4px;"
                    :key="'inputCheck'+index">
                    <input type="checkbox" :id="'inputCheck'+index" 
                        :name="'inputCheck'+index" v-model="params['attrs'][index]"
                        :class="{ 'unchecked' : !params['attrs'][index] }"
                        @change="">
                    <label :for="'inputCheck'+index">
                      {{ label }}
                    </label> <br/>
                  </div>    
                
                </div>
            </div>

            <div style="margin: 15px; margin-bottom: 25%; border: 1px solid #ff6d10;">
            </div>

        </div>
    `,
};
