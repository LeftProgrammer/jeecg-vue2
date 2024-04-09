<template>
  <a-spin :spinning="confirmLoading">
    <j-form-container>
      <a-form
        :form="form"
        slot="detail"
      >
        <a-row>
          
          
          <a-col :span="12">
            <a-form-item
              label="客户端名称"
              :label-col="labelCol"
              :wrapper-col="wrapperCol"
            >
              <a-input
                v-decorator="['name', { rules: [{ required: true, message: '请输入名称!' }] }]"
                placeholder="请输入名称"
                :maxLength="15"
              />
            </a-form-item>
          </a-col>

          <a-col :span="12">
            <a-form-item
              label="APPID"
              :label-col="labelCol"
              :wrapper-col="wrapperCol"
            >
              <a-input
                v-decorator="['appId', { rules: [{ required: true, message: '请输入APPID!' }] }]"
                placeholder="由开发人员提供"
                :maxLength="15"
              />
            </a-form-item>
          </a-col>

          <a-col :span="24">
            <a-form-item
              label="备注说明"
              :labelCol="labelCol2"
              :wrapperCol="wrapperCol2"
            >
              <a-textarea
                v-decorator="['remark']"
                :auto-size="{ minRows: 2, maxRows: 5 }"
              />
            </a-form-item>
          </a-col>
        </a-row>
      </a-form>
    </j-form-container>
  </a-spin>
</template>

<script>
import { httpAction, postAction } from '@/api/manage'
import pick from 'lodash.pick'

export default {
  name: 'AppClientForm',
  components: {},
  data() {
    return {
      form: this.$form.createForm(this), //自动收集
      model: {},
      show: true,
      labelCol: {
        xs: {
          span: 24,
        },
        sm: {
          span: 6,
        },
      },
      wrapperCol: {
        xs: {
          span: 24,
        },
        sm: {
          span: 18,
        },
      },
      labelCol2: {
        xs: {
          span: 24,
        },
        sm: {
          span: 3,
        },
      },
      wrapperCol2: {
        xs: {
          span: 24,
        },
        sm: {
          span: 20,
        },
      },
      confirmLoading: false,
      url: {
        add: '/appClient/version/addClient',
        edit: '/appClient/version/editClient',
      },
    }
  },
  created() {
  },

  methods: {


    add() {
      this.edit({})
    },

    // 组件加载会加载
    edit(data) {
      console.log(this.globalData);
      let record={...data}
      this.profileType = null

      //默认是否可用选择是
      this.form.resetFields()
      this.model = Object.assign({}, record)
      this.visible = true
      
      if (record.id) {
        //编辑时
        this.$nextTick(() => {
          this.form.setFieldsValue(
            pick(
              this.model,
              'name',
              'appId',
              'remark',
            )
          ) 
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
          if (!this.model.id) {
            httpurl += this.url.add
          } else {
            httpurl += this.url.edit
          }
          let formData = Object.assign(this.model, values)
          console.log('表单提交数据', formData)
          postAction(httpurl, formData)
            .then((res) => {
              if (res.success) {
                that.$message.success(res.message)
                var data = that.model
                if (!this.model.id) {
                  data = res.result
                }
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
      this.form.setFieldsValue(
        pick(
          row,
          'name',
          'appId',
          'remark',
        )
      )
    },
  },
}
</script>
