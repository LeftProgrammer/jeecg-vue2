<template>
  <j-modal
    :title="title"
    :width="width"
    :visible="visible"
    :confirmLoading="confirmLoading"
    switchFullscreen
    @ok="handleOk"
    @cancel="handleCancel"
    :destroyOnClose="true"
    cancelText="关闭"
  >
    <a-spin :spinning="confirmLoading">
      <a-form :form="form">
        <a-row>
          <!-- <a-col :span="12">
          <a-form-item label="父级节点" :labelCol="labelCol" :wrapperCol="wrapperCol">
          <j-tree-select
            ref="treeSelect"
            placeholder="请选择父级节点"
            v-decorator="['pid']"
            dict="toolbox_class,name,id"
            pidField="pid"
            pidValue="0"
            hasChildField="has_child"
            >
          </j-tree-select>
        </a-form-item>
      </a-col> -->
          <a-col :span="12">
            <a-form-item
              :label="JSON.stringify(model) != '{}' ? '项目名称' : '菜单名称'"
              :labelCol="labelCol"
              :wrapperCol="wrapperCol"
            >
              <a-input
                v-decorator="['name', { rules: [{ required: true, message: '请输入名称!' }] }]"
                placeholder="请输入名称"
                :maxLength="16"
              ></a-input>
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item
              label="是否显示"
              :labelCol="labelCol"
              :wrapperCol="wrapperCol"
            >
              <j-dict-select-tag
                type="radio"
                v-decorator="['isVisible', { initialValue:'0'}]"
                :trigger-change="true"
                dictCode="toolbox_xs"
                placeholder="请选择是否显示"
              />
            </a-form-item>
          </a-col>
        </a-row>
      </a-form>
    </a-spin>
  </j-modal>
</template>

<script>
import { httpAction } from '@/api/manage'
import pick from 'lodash.pick'
import { validateDuplicateValue } from '@/utils/util'
export default {
  name: 'ToolboxClassModal',
  components: {},
  data() {
    return {
      tablename: 'toolbox_class',
      form: this.$form.createForm(this),
      title: '新增分类',
      width: 800,
      visible: false,
      model: {},
      isVisible:0,
      labelCol: {
        xs: { span: 24 },
        sm: { span: 6 },
      },
      wrapperCol: {
        xs: { span: 24 },
        sm: { span: 16 },
      },
      labelCol2: {
        xs: { span: 24 },
        sm: { span: 3 },
      },
      wrapperCol2: {
        xs: { span: 24 },
        sm: { span: 20 },
      },
      confirmLoading: false,
      validatorRules: {},
      url: {
        add: '/toolbox/toolboxClass/add',
        edit: '/toolbox/toolboxClass/edit',
      },
      expandedRowKeys: [],
      pidField: 'pid',
    }
  },
  created() {},
  methods: {
    add(obj) {
      console.log("---------",obj)
      this.isVisible = 0
      this.edit(obj)
    },
    edit(record) {
      this.form.resetFields()
      this.model = Object.assign({}, record)
      console.log(this.model)
      this.visible = true
      this.$nextTick(() => {
        this.form.setFieldsValue(pick(this.model, 'pid', 'code', 'name', 'type', 'isVisible'))
      })
    },
    close() {
      this.$emit('close')
      this.visible = false
    },
    handleOk() {
      const that = this
      // 触发表单验证
      this.form.validateFields((err, values) => {
        if (!err) {
          that.confirmLoading = true
          let httpurl = ''
          let method = ''
          if (!this.model.id) {
            httpurl += this.url.add
            method = 'post'
          } else {
            httpurl += this.url.edit
            method = 'put'
          }
          let old_pid = this.model[this.pidField]
          let formData = Object.assign(this.model, values)
          let new_pid = this.model[this.pidField]
          if (this.model.id && this.model.id === new_pid) {
            that.$message.warning('父级节点不能选择自己')
            that.confirmLoading = false
            return
          }
          console.log('表单提交数据', formData)
          httpAction(httpurl, formData, method)
            .then((res) => {
              if (res.success) {
                that.$message.success(res.message)
                this.$emit('ok')
              } else {
                that.$message.warning(res.message)
              }
            })
            .finally(() => {
              that.confirmLoading = false
              that.close()
            })
        }
      })
    },
    handleCancel() {
      this.close()
    },
    popupCallback(row) {
      this.form.setFieldsValue(pick(row, 'pid', 'code', 'name', 'type', 'isVisible'))
    },
    submitSuccess(formData, flag) {
      if (!formData.id) {
        let treeData = this.$refs.treeSelect.getCurrTreeData()
        this.expandedRowKeys = []
        this.getExpandKeysByPid(formData[this.pidField], treeData, treeData)
        this.$emit('ok', formData, this.expandedRowKeys.reverse())
      } else {
        this.$emit('ok', formData, flag)
      }
    },
    getExpandKeysByPid(pid, arr, all) {
      if (pid && arr && arr.length > 0) {
        for (let i = 0; i < arr.length; i++) {
          if (arr[i].key == pid) {
            this.expandedRowKeys.push(arr[i].key)
            this.getExpandKeysByPid(arr[i]['parentId'], all, all)
          } else {
            this.getExpandKeysByPid(pid, arr[i].children, all)
          }
        }
      }
    },
  },
}
</script>
