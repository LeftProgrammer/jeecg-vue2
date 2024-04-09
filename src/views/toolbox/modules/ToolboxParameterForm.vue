<template>
  <a-spin :spinning="confirmLoading">
    <j-form-container :disabled="formDisabled">
      <a-form
        :form="form"
        slot="detail"
      >
        <a-row>
          <a-col :span="12">
            <a-form-item
              label="编号"
              :labelCol="labelCol"
              :wrapperCol="wrapperCol"
            >
              <a-input
                v-decorator="['code']"
                placeholder="请输入编号"
              />
            </a-form-item>
          </a-col>

          <!-- 新增标题 -->
          <!-- <a-col :span="12">
            <a-form-item label="标题" :labelCol="labelCol" :wrapperCol="wrapperCol">
              <a-input
                v-decorator="['title', { rules: [{ required: false, message: '请输入标题!' }] }]"
                placeholder="请输入标题"
              >
              </a-input>
            </a-form-item>
          </a-col> -->

          <a-col :span="12">
            <a-form-item
              label="参数类型"
              :labelCol="labelCol"
              :wrapperCol="wrapperCol"
            >
              <j-dict-select-tag
                type="list"
                v-decorator="['dataType']"
                :trigger-change="true"
                dictCode="toolbox_cslx"
                placeholder="请选择参数类型"
              />
            </a-form-item>
          </a-col>

          <a-col :span="12">
            <a-form-item
              label="所属项目"
              :labelCol="labelCol"
              :wrapperCol="wrapperCol"
            >
              <j-search-select-tag
                v-decorator="['projectId']"
                :dict="projectDictCode"
                :disabled="formDisabled"
              />
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item
              label="内容"
              :labelCol="labelCol"
              :wrapperCol="wrapperCol"
            >
              <a-textarea
                v-decorator="['content']"
                placeholder="请输入内容"
              />
            </a-form-item>
          </a-col>
          <a-col
            v-if="showFlowSubmitButton"
            :span="24"
            style="text-align: center"
          >
            <a-button @click="submitForm">提 交</a-button>
          </a-col>
        </a-row>
      </a-form>
    </j-form-container>
  </a-spin>
</template>

<script>
import { httpAction, getAction } from '@/api/manage'
import pick from 'lodash.pick'

export default {
  name: 'ToolboxParameterForm',
  components: {},
  props: {
    //流程表单data
    formData: {
      type: Object,
      default: () => {
        return {}
      },
      required: false,
    },
    //表单模式：true流程表单 false普通表单
    formBpm: {
      type: Boolean,
      default: false,
      required: false,
    },
    //表单禁用
    disabled: {
      type: Boolean,
      default: false,
      required: false,
    },
  },
  data() {
    return {
      tablename: 'toolbox_parameter',
      form: this.$form.createForm(this),
      projectDictCode: 'toolbox_resource,title,id,data_type=2',
      model: {},
      labelCol: {
        xs: { span: 24 },
        sm: { span: 6 },
      },
      wrapperCol: {
        xs: { span: 24 },
        sm: { span: 18 },
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
        add: '/toolbox/toolboxParameter/add',
        edit: '/toolbox/toolboxParameter/edit',
        queryById: '/toolbox/toolboxParameter/queryById',
      },
    }
  },
  computed: {
    formDisabled() {
      if (this.formBpm === true) {
        if (this.formData.disabled === false) {
          return false
        }
        return true
      }
      return this.disabled
    },
    showFlowSubmitButton() {
      if (this.formBpm === true) {
        if (this.formData.disabled === false) {
          return true
        }
      }
      return false
    },
  },
  created() {
    //如果是流程中表单，则需要加载流程表单data
    this.showFlowData()
  },
  methods: {
    add() {
      this.edit({})
    },
    edit(record) {
      this.form.resetFields()
      this.model = Object.assign({}, record)
      this.visible = true
      this.$nextTick(() => {
        this.form.setFieldsValue(pick(this.model, 'code', 'dataType', 'content', 'projectId', 'title'))
      })
    },
    //渲染流程表单数据
    showFlowData() {
      if (this.formBpm === true) {
        let params = { id: this.formData.dataId }
        getAction(this.url.queryById, params).then((res) => {
          if (res.success) {
            this.edit(res.result)
          }
        })
      }
    },
    submitForm() {
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
          console.log('表单提交数据', formData)
          httpAction(httpurl, formData, method)
            .then((res) => {
              if (res.success) {
                that.$message.success(res.message)
                var data = method === 'post' ? res.result : that.model
                that.$emit('ok', data)
              } else {
                that.$message.warning(res.message)
              }
            })
            .finally(() => {
              that.confirmLoading = false
            })
        }
      })
    },
    popupCallback(row) {
      this.form.setFieldsValue(pick(row, 'code', 'dataType', 'content', 'projectId', 'title'))
    },
  },
}
</script>
