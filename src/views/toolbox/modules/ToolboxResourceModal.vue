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
    <toolbox-resource-form
      ref="realForm"
      @ok="submitCallback"
      :disabled="disableSubmit"
      :dataType="dataType"
      :dataRef="dataRef"
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
import ToolboxResourceForm from './ToolboxResourceForm'
export default {
  name: 'ToolboxResourceModal',
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
    ToolboxResourceForm,
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
    add() {
      this.visible = true
      this.$nextTick(() => {
        this.$refs.realForm.add()
      })
    },
    edit(record) {
      this.visible = true
      this.$nextTick(() => {
        this.$refs.realForm.edit(record)
      })
    },
    close() {
      this.$emit('close')
      this.visible = false
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
