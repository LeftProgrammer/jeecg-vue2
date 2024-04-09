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
              label="版本"
              :label-col="labelCol"
              :wrapper-col="wrapperCol"
            >
              <a-input
                v-decorator="['version', { rules: [{ required: true, message: '请输入版本!' }] }]"
                placeholder="请输入版本"
                :maxLength="15"
              />
            </a-form-item>
          </a-col>

          <a-col :span="12">
            <a-form-item
              label="版本ID"
              :label-col="labelCol"
              :wrapper-col="wrapperCol"
            >
              <a-input
                v-decorator="['versionCode', { rules: [{ required: true, message: '请输入版本ID!' }] }]"
                placeholder="请输入版本ID"
                :maxLength="15"
              />
            </a-form-item>
          </a-col>

          <a-col :span="12">
            <a-form-item
              label="延时生效"
              :label-col="labelCol"
              :wrapper-col="wrapperCol"
            >
              <j-date
                v-decorator="['activeTime']"
                placeholder="不填表示即时生效"
                :maxLength="15"
              />
            </a-form-item>
          </a-col>

          <a-col :span="12">
            <a-form-item
              label="客户端类型"
              :label-col="labelCol"
              :wrapper-col="wrapperCol"
            >
              <a-select v-decorator="['clientId', { rules: [{ required: true, message: '请选择所属目录!' }] }]">
                <a-select-option
                  v-for="client in clientList"
                  :key="client.id"
                  :value="client.id"
                >
                  {{ client.name }}
                </a-select-option>
              </a-select>
            </a-form-item>
          </a-col>

          <a-col :span="12">
            <a-form-item label="全量包" :labelCol="labelCol" :wrapperCol="wrapperCol">
              <j-upload-fragment
                v-decorator="['url']"
                :trigger-change="true"
                @fileSuccess="beforeUpload"
              ></j-upload-fragment>
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item
              label="增量包"
              :labelCol="labelCol"
              :wrapperCol="wrapperCol"
            >
              <j-upload-fragment
                v-decorator="['wgtUrl']"
                :trigger-change="true"
                @fileSuccess="beforeUpload2"
              ></j-upload-fragment>
            </a-form-item>
          </a-col>
          <a-col :span="24">
            <a-form-item
              label="更新信息"
              :labelCol="labelCol2"
              :wrapperCol="wrapperCol2"
            >
              <a-textarea
                v-decorator="['note']"
                placeholder="本次更新的内容"
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
  name: 'VcardResourceForm',
  components: {},
  inject:['globalData'],
  props: {
    //流程表单data
    formData: {
      type: Object,
      default: () => {},
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
      clientList: [],
      update: 0,
      // 附件token
      token:
        'Bearer eyJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJxaXdlbi1jbXMiLCJleHAiOjE2NDkxNDYzOTIsInN1YiI6IntcInVzZXJuYW1lXCI6XCJjaGVubGlhbmdcIn0iLCJhdWQiOiJxaXdlbnNoYXJlIiwiaWF0IjoxNjQ4NTQxNTkyfQ.mCiwREt_5mDE6x_VqCnyhsqX9Ejd0zLPS-a-YQ61nZU',

      value: undefined,
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
        add: '/appClient/version/add',
        edit: '/appClient/version/edit',
        fileapi: {
          encryptfile: '/fileapi/filetransfer/encryptfile',
          getallfilelist: '/fileapi/file/getallfilelist',
          userlogin: '/fileapi/user/userlogin',
        },
      },
      profileType: null, //资料类型
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

    //文件服务器上文件的md5
    filemd5() {
      if (this.videosrc && this.videosrc.length > 0) {
        let item = this.videosrc.find((x) => x.userFileId == this.model.dataUrlId)
        if (item) {
          let isEncrypt = this.form.getFieldValue('isEncrypt')
          if (item.extendName && item.extendName.toLowerCase() === 'mp4' && isEncrypt != 0) {
            return item.encryptedIdentifier
          }
          return item.identifier
        }
      }
      return null
    },
    //是否md5正常
    md5ErrorMsg() {
      if (!this.model.identifier) {
        return 'md5为空，请重新选择资料'
      }
      if (this.model.identifier && this.model.identifier != this.filemd5) {
        return 'md5不一致，请重新选择资料'
      }
      return ''
    },
    videoMax() {
      const type = this.form.getFieldValue('dataType')
      // 视频，文档1个；图片10个；链接输入none;
      return type === '0' || type === '7' ? 0 : type === '3' ? 10 : type === '6' ? 'none' : true
    },
  },

  created() {
  },

  methods: {

    /**
    * resize 生成自定义大小的图片
    */
    resizedataURL(datas, wantedWidth, wantedHeight){
      return new Promise(async function(resolve,reject){
        var img = document.createElement('img');
        img.onload = function()
        {        
          var canvas = document.createElement('canvas');
          var ctx = canvas.getContext('2d');
          canvas.width = wantedWidth;
          canvas.height = wantedHeight;
          ctx.drawImage(this, 0, 0, wantedWidth, wantedHeight);
          var dataURI = canvas.toDataURL();
          resolve(dataURI);
        };
        img.src = datas;
     })
    },
    beforeUpload2(file,filelist){
      console.log("file,filelist",file,filelist);
      //拿到文件大小
      this.model.wgtSize = file.result.fileSize;
    },
    beforeUpload(file,filelist){
      console.log("file",file,filelist);
      //拿到文件大小
      this.model.apkSize = file.result.fileSize;
    },

 
    setClientList(data) {
      this.clientList = data
    },
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
              'version',
              'versionCode',
              'url',
              'wgtUrl',
              'note',
              'activeTime',
              'clientId',
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
          'version',
          'versionCode',
          'url',
          'wgtUrl',
          'note',
          'activeTime',
          'clientId',
        )
      )
    },
  },
}
</script>
