<template>
  <a-row :gutter="24">
    <component v-for="(formitem, index) in properties" :key="index" :is="createWidgets(formitem)" :formitem="formitem">
    </component>
  </a-row>
</template>

<script>
import widgetRegistry from './model/WidgetRegistry'
import { WIDGET_PRE } from './model/Constants'

export default {
  name: 'OnlineFormItem',
  props: {
    properties: {
      type: Array,
      default: () => {
        return []
      },
      required: false,
    },
  },
  methods: {
    createWidgets(formitem) {
      let key = WIDGET_PRE + formitem.type
      var w = widgetRegistry.getType(key)
      return w
    },
  },
}
</script>

<style scoped>
</style>