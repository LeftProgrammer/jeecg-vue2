<!--
<template>
  <component :is="component" :formData="formData" v-if="component" />
</template>
<script>
  export default {
    name: 'dynamic-link',
    props: ['formData', 'path'],
    data() {
      return {
        component: null,
      }
    },
    computed: {
      loader() {
        if (!this.path) {
          return null
        }
        return () => import(`@/${this.path}`)
      },
    },
    mounted() {
      let that = this
      that.loader().then(() => {
        that.component = () => that.loader()
        console.log("表单数据",this.formData)
        })
        .catch(() => {
          //that.component = () => import('./FormModule.vue')
        })
    },
  }
</script>
-->

<template>
  <component :is="comp" :formData="formData" v-if="comp" form-bpm @complete="completeProcess"></component>
</template>
<script>
export default {
  name: 'dynamic-link',
  data() {
    return {
      compName: this.path,
    }
  },
  computed: {
    comp: function () {
      console.log('BPM 组件名称：', this.compName)
      console.log('BPM 组件数据：', this.formData)
      if (this.compName) {
        if (this.compName.endsWith('.vue')) {
          return () => import(`@/views/${this.compName}`)
        } else {
          return () => import(`@/views/${this.compName}.vue`)
        }
      }
      return () => import(`@/views/${this.compName}.vue`)
    },
  },
  props: ['path', 'formData'],
  methods: {
    completeProcess() {
      this.$emit('complete')
    },
  },
}
</script>