<!-- template for the user avatar component -->
<template>
  <form @submit.prevent="$emit('searchSubmit', query)">
      <span class="badge badge-block">
          <i class="icon-search"></i>
          <input
            v-focus="focus"
            ref="input"
            type="text"
            v-model="query"
            :placeholder="getPlaceholder"
            autocomplete="true"
            class="txt no-border">
      </span>
  </form>
</template>
<script>
import { focus } from 'vue-focus'

export default {
  directives: {
    focus,
  },

  props: {
    value: String,
    placeholder: { type: String },
    focus: false,
    preset: {
      type: String,
    },
  },

  data () {
    return {
      internalValue: this.preset,
    }
  },

  computed: {
    // making sure value goes from our parent to <input> and back properly...
    query: {
      get () {
        return this.internalValue
      },

      set (value) {
        this.internalValue = value
        this.$emit('input', value)
      },
    },

    getPlaceholder () {
      return this.placeholder || this.$t('general.label.search')
    },
  },
}
</script>
<style scoped lang="scss">
@import '@/assets/sass/_0.commons.scss';
@import '@/assets/sass/badges.scss';
@import '@/assets/sass/inputs.scss';

form  {
  border-right:3px;

  span {
    background: white;

    input {
      width: calc(100% - 40px);
    }
  }
  .badge {
    border-radius: 0;
  }
}

</style>
