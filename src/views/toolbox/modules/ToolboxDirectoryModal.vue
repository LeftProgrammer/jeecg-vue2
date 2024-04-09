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
          <a-col :span="12">
            <a-form-item
              label="所属菜单"
              :labelCol="labelCol"
              :wrapperCol="wrapperCol"
            >
              <j-search-select-tag
                v-decorator="['memuId']"
                dict="toolbox_menu,name,id"
              />
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item
              label="所属资料分类"
              :labelCol="labelCol"
              :wrapperCol="wrapperCol"
            >
              <j-search-select-tag
                v-decorator="['classifyId']"
                dict="toolbox_classify,name,id"
              />
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item
              label="所属项目"
              :labelCol="labelCol"
              :wrapperCol="wrapperCol"
            >
              <j-dict-select-tag
                type="list"
                v-decorator="['resourceId']"
                :trigger-change="true"
                :dictCode="resourceIdDict"
                placeholder="请选择所属项目"
              />
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item
              label="序号"
              :labelCol="labelCol"
              :wrapperCol="wrapperCol"
            >
              <a-input
                v-decorator="['serialNumber']"
                placeholder="请输入序号"
              />
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item
              label="目录名称"
              :labelCol="labelCol"
              :wrapperCol="wrapperCol"
            >
              <a-input
                v-decorator="['name']"
                placeholder="请输入目录名称"
              />
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item
              label="排序"
              :labelCol="labelCol"
              :wrapperCol="wrapperCol"
            >
              <a-input-number
                v-decorator="['sortNo']"
                placeholder="请输入排序"
                style="width: 100%"
              />
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item
              label="父级节点"
              :labelCol="labelCol"
              :wrapperCol="wrapperCol"
            >
              <j-tree-select
                ref="treeSelect"
                placeholder="请选择父级节点"
                v-decorator="['pid']"
                dict="toolbox_directory,name,id"
                pidField="pid"
                pidValue="0"
                hasChildField="has_child"
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
export default {
  name: 'ToolboxDirectoryModal',
  components: {},
  data() {
    return {
      tablename: 'toolbox_directory',
      form: this.$form.createForm(this),
      title: '操作',
      width: 800,
      visible: false,
      model: {},
      resourceIdDict: 'toolbox_resource,title,id , data_type = "2"',
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
        add: '/toolbox/toolboxDirectory/add',
        edit: '/toolbox/toolboxDirectory/edit',
      },
      expandedRowKeys: [],
      pidField: 'pid',
    }
  },
  methods: {
    add(obj) {
      this.edit(obj)
    },
    edit(record) {
      console.log('出发事件', record)
      this.form.resetFields()
      this.model = Object.assign({}, record)
      this.visible = true
      this.$nextTick(() => {
        this.form.setFieldsValue(
          pick(this.model, 'memuId', 'classifyId', 'resourceId', 'serialNumber', 'name', 'sortNo', 'pid')
        )
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
      this.form.setFieldsValue(pick(row, 'memuId', 'classifyId', 'resourceId', 'serialNumber', 'name', 'sortNo', 'pid'))
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
          if (arr[i].key === pid) {
            this.expandedRowKeys.push(arr[i].key)
            this.getExpandKeysByPid(arr[i].parentId, all, all)
          } else {
            this.getExpandKeysByPid(pid, arr[i].children, all)
          }
        }
      }
    },
  },
}
</script>
