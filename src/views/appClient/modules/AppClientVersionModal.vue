<template>
  <j-modal
    :title="title"
    :width="width"
    :visible="visible"
    switchFullscreen
    @ok="handleOk"
    :okButtonProps="{ class: { 'jee-hidden': disableSubmit } }"
    @cancel="handleCancel"
    cancelText="关闭"
  >
    <app-client-version-form
      ref="realForm"
      @ok="submitCallback"
      :disabled="disableSubmit"
    />
    <template
      slot="footer"
      v-if="!disableSubmit"
    >
      <a-button @click="handleOk">保存</a-button>
    </template>
  </j-modal>
</template>

<script>
import AppClientVersionForm from './AppClientVersionForm'
export default {
  name: 'AppClientVersionModel',
  props: {
    dataType: {
      type: String,
      default: '',
    },
    dataRef: {
      type: Object,
      default: () => {},
    },
  },
  components: {
    AppClientVersionForm,
  },
  data() {
    return {
      title: '',
      width: 896,
      visible: false,
      disableSubmit: false,
      issubmit: false,
    }
  },
  methods: {
    // add() {
    //   this.visible = true
    //   this.$nextTick(() => {
    //     this.$refs.realForm.add()
    //   })
    // },
    edit(record, clientList) {
      this.visible = true
      this.$nextTick(() => {
        this.$refs.realForm.setClientList(clientList)
        this.$refs.realForm.edit(record)
        
      })
    },
    close() {
      this.$emit('close')
      this.visible = false
    },
    handleItemOk() {
      this.issubmit = false
      this.$refs.itemForm.submitForm()
    },
    handleOk() {
      this.issubmit = false
      this.$refs.realForm.submitForm()
    },
    handleSubmit() {
      this.issubmit = true
      this.$refs.realForm.submitForm()
    },
    submitCallback(data) {
      if (this.issubmit) {
        if (data && data.id) {
          this.$emit('submit', data)
        }
      } else {
        this.$emit('ok')
      }
      this.visible = false
    },
    handleCancel() {
      this.close()
    },
  },
}
</script>
