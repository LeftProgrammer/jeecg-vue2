<template>
  <a-modal
    :title="title"
    :width="modalWidth"
    :visible="visible"
    :confirmLoading="confirmLoading"
    @ok="handleOk"
    @cancel="handleCancel"
    cancelText="关闭"
  >
    <a-spin :spinning="confirmLoading">
      <a-form :form="form">
        <!--        <a-form-item
          :labelCol="labelCol"
          :wrapperCol="wrapperCol"
          label="旧密码">
          <a-input type="password" placeholder="请输入旧密码" v-decorator="[ 'oldpassword', validatorRules.oldpassword]" />
        </a-form-item>-->
        <a-alert
          :show-icon="false"
          type="warning"
          style="text-align: center; margin-bottom: 20px"
          message="应公司信息化安全规定，请修改原始密码"
        />

        <div id="pwdStrong">
          <div class="input_span">
            <label style="margin-left: 40px">强度:</label>
            <span id="one"></span>
            <span id="two"></span>
            <span id="three"></span>
          </div>
          <div id="font">
            <span>弱</span>
            <span>中</span>
            <span>强</span>
          </div>
        </div>
        <a-form-item :labelCol="labelCol" :wrapperCol="wrapperCol" label="新密码">
          <a-input
            type="password"
            id="inputValue"
            @change="valueChange"
            placeholder="请输入新密码"
            v-decorator="['password', validatorRules.password]"
          />
        </a-form-item>

        <a-form-item :labelCol="labelCol" :wrapperCol="wrapperCol" label="确认新密码">
          <a-input
            type="password"
            @blur="handleConfirmBlur"
            placeholder="请确认新密码"
            v-decorator="['confirmpassword', validatorRules.confirmpassword]"
          />
        </a-form-item>
      </a-form>
    </a-spin>
  </a-modal>
</template>

<script>
import { putAction } from '@/api/manage'
import store from '@/store/'
import { mapActions, mapGetters, mapState } from 'vuex'

export default {
  name: 'UserPassword',
  data() {
    return {
      title: '修改密码',
      modalWidth: 800,
      visible: false,
      confirmLoading: false,
      validatorRules: {
        /*oldpassword:{
            rules: [{
              required: true, message: '请输入旧密码!',
            }],
          },*/
        /*password:{
            rules: [{
              required: true, message: '请输入新密码!',
            }, {
              validator: this.validateToNextPassword,
            }],
          },*/
        password: {
          rules: [
            {
              required: true,
              pattern: /^(?=.*[a-zA-Z])(?=.*\d)(?=.*[~!@#$%^&*()_+`\-={}:";'<>?,./]).{8,}$/,
              message: '密码由数字、字母和特殊符号组成!最短长度需8位',
            },
            {
              validator: this.validateToNextPassword,
            },
          ],
        },
        confirmpassword: {
          rules: [
            {
              required: true,
              message: '请确认新密码!',
            },
            {
              validator: this.compareToFirstPassword,
            },
          ],
        },
      },
      confirmDirty: false,
      labelCol: {
        xs: { span: 24 },
        sm: { span: 5 },
      },
      wrapperCol: {
        xs: { span: 24 },
        sm: { span: 16 },
      },

      form: this.$form.createForm(this),
      url: 'sys/user/updatePassword',
      username: '',
    }
  },
  methods: {
    ...mapActions(['Logout']),
    show(uname) {
      if (!uname) {
        this.$message.warning('当前系统无登录用户!')
        return
      } else {
        this.username = uname
        this.form.resetFields()
        this.visible = true
      }
    },
    handleCancel() {
      var that = this
      let isDefault = store.getters.userInfo.isDefault
      if (isDefault == '1') {
        this.close()
      } else {
        // this.$message.warning('应公司信息化安全规定，请修改原始密码')
        this.$confirm({
          title: '提示',
          content: '是否退出到登录页 ?',
          onOk() {
            return that
              .Logout({})
              .then(() => {
                that.$router.push({ path: '/user/login' })
              })
              .catch((err) => {
                that.$message.error({
                  title: '错误',
                  description: err.message,
                })
              })
          },
          onCancel() {},
        })
      }
    },
    close() {
      this.$emit('close')
      this.visible = false
      this.disableSubmit = false
      this.selectedRole = []
    },
    valueChange(e) {
      const msgText = this.checkStrong(e.target.value)
      if (msgText > 1 || msgText == 1) {
        document.getElementById('one').style.background = 'red'
      } else {
        document.getElementById('one').style.background = '#eee'
      }
      if (msgText > 2 || msgText == 2) {
        document.getElementById('two').style.background = 'orange'
      } else {
        document.getElementById('two').style.background = '#eee'
      }
      if (msgText == 4) {
        document.getElementById('three').style.background = '#00D1B2'
      } else {
        document.getElementById('three').style.background = '#eee'
      }
    },
    checkStrong(sValue) {
      var modes = 0
      //正则表达式验证符合要求的
      if (sValue.length < 1) return modes
      if (/\d/.test(sValue)) modes++ //数字
      if (/[a-z]/.test(sValue)) modes++ //小写
      if (/[A-Z]/.test(sValue)) modes++ //大写
      if (/\W/.test(sValue)) modes++ //特殊字符

      //逻辑处理
      switch (modes) {
        case 1:
          return 1
          break
        case 2:
          return 2
          break
        case 3:
        case 4:
          return sValue.length < 4 ? 3 : 4
          break
      }
      return modes
    },
    handleOk() {
      const that = this
      // 触发表单验证
      this.form.validateFields((err, values) => {
        if (!err) {
          that.confirmLoading = true
          let params = Object.assign({ username: this.username, isDefault: '1' }, values)
          console.log('修改密码提交数据', params)
          putAction(this.url, params)
            .then((res) => {
              if (res.success) {
                that.$message.success(res.message)
                this.$emit('fatherMethod')
                //    that.close();
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
    validateToNextPassword(rule, value, callback) {
      const form = this.form
      if (value && this.confirmDirty) {
        form.validateFields(['confirm'], { force: true })
      }
      callback()
    },
    compareToFirstPassword(rule, value, callback) {
      const form = this.form
      if (value && value !== form.getFieldValue('password')) {
        callback('两次输入的密码不一样！')
      } else {
        callback()
      }
    },
    handleConfirmBlur(e) {
      const value = e.target.value
      this.confirmDirty = this.confirmDirty || !!value
    },
  },
}
</script>

<style scoped>
#pwdStrong {
  position: relative;
  margin-left: 70px;
  margin-top: auto;
}
.input_span span {
  display: inline-block;
  width: 85px;
  height: 10px;
  background: #eee;
  line-height: 20px;
}

#one {
  border-top-left-radius: 5px;
  border-bottom-left-radius: 5px;
  border-right: 0px solid;
  margin-left: 20px;
  margin-right: 3px;
}

#two {
  border-left: 0px solid;
  border-right: 0px solid;
  margin-left: -5px;
  margin-right: 3px;
}

#three {
  border-top-right-radius: 5px;
  border-bottom-right-radius: 5px;
  border-left: 0px solid;
  margin-left: -5px;
}
#font span:nth-child(1) {
  color: red;
  margin-left: 80px;
}
#font span:nth-child(2) {
  color: orange;
  margin: 0 60px;
}
#font span:nth-child(3) {
  color: #00d1b2;
}
</style>

