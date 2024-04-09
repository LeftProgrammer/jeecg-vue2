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
              label="副标题"
              :labelCol="labelCol"
              :wrapperCol="wrapperCol"
            >
            <a-input
                v-decorator="['subTitle']"
                placeholder="请输入副标题"
                :maxLength="16"
              ></a-input>
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
  name: 'VcardCatalogModal',
  components: {},
  data() {
    return {
      tablename: 'vcard_catalog',
      form: this.$form.createForm(this),
      title: '新增目录',
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
        add: '/vcard/catalog/add',
        edit: '/vcard/catalog/edit',
      },
      expandedRowKeys: [],
      pidField: 'catalogId',
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
        this.form.setFieldsValue(pick(this.model, 'catalogId', 'name', 'subTitle'))
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
          let method = 'post'
          if (!this.model.id) {
            httpurl += this.url.add
          } else {
            httpurl += this.url.edit
          }
          
          let formData = Object.assign(this.model, values)
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
