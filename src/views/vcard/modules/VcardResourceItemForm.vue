<!-- <template>
  <a-spin :spinning="confirmLoading">
    <j-form-container :disabled="formDisabled">
      <a-form
        :form="form"
        slot="detail"
      >
        <a-row>
          <a-col :span="12">
            <a-form-item
              label="所属目录"
              :label-col="labelCol"
              :wrapper-col="wrapperCol"
            >
              <a-select
                v-decorator="['catalogId', { rules: [{ required: true, message: '请选择所属目录!' }] }]"
                :disabled="formDisabled"
                @change="handleCatalog"
              >
                <a-select-option
                  v-for="catalog in catalogData"
                  :key="catalog.id"
                  :value="catalog.id"
                >
                  {{ catalog.name }}
                </a-select-option>
              </a-select>
            </a-form-item>
          </a-col>

          <a-col :span="12">
            <a-form-item
              label="所属菜单"
              :label-col="labelCol"
              :wrapper-col="wrapperCol"
            >
              <a-select
                v-decorator="['menuId', { rules: [{ required: true, message: '请选择所属菜单!' }] }]"
                :disabled="formDisabled"
              >
                <a-select-option
                  v-for="menu in menuData"
                  :key="menu.id"
                  :value="menu.id"
                >
                  {{ menu.name }}
                </a-select-option>
              </a-select>
            </a-form-item>
          </a-col>
          
          <a-col :span="12">
            <a-form-item
              label="资源名称"
              :label-col="labelCol"
              :wrapper-col="wrapperCol"
            >
              <a-input
                v-decorator="['name', { rules: [{ required: true, message: '请输入资源名称!' }] }]"
                placeholder="请输入项目名称"
                :maxLength="15"
              />
            </a-form-item>
          </a-col>

          <a-col :span="12">
            <a-form-item
              label="资源类型"
              :label-col="labelCol"
              :wrapper-col="wrapperCol"
            >
              <a-select
                v-decorator="['dataType', { rules: [{ required: true, message: '请选择资源类型!' }] }]"
                :disabled="formDisabled"
                @change="handleDataType"
              >
                <a-select-option
                  v-for="dataType in dataTypeOptions"
                  :key="dataType.value"
                  :value="dataType.value"
                >
                {{ dataType.text }}
                </a-select-option>
              </a-select>
            </a-form-item>
          </a-col>
          <a-col
            :span="12"
            v-show="!recordIsTable"
          >
            <a-form-item
              label="资源上传"
              :labelCol="labelCol"
              :wrapperCol="wrapperCol"
            >
              <j-upload-fragment
                v-decorator="['uploadFile']"
                :trigger-change="true"
                :number="profileType == '0' || profileType === '7' ? 1 : 10"
                :disabled="!profileType"
                @fileSuccess="beforeUpload"
              ></j-upload-fragment>
            </a-form-item>
          </a-col>
          <a-tabs v-show="recordIsTable">
            <a-tab-pane
              tab="表单内容"
              class="subTablePane"
              :class="formDisabled ? 'disabledPane' : ''"
              :key="refKeys[0]"
              :forceRender="true"
            >
              <j-editable-table
                :ref="refKeys[0]"
                :loading="resourceTable.loading"
                :columns="resourceTable.columns"
                :dataSource="resourceTable.dataSource"
                :maxHeight="300"
                :rowNumber="true"
                :rowSelection="true"
                :actionButton="true"
                :disabled="formDisabled"
              />
            </a-tab-pane>
          </a-tabs>
        </a-row>
      </a-form>
    </j-form-container>
  </a-spin>
</template>

<script>
import { httpAction, getAction } from '@/api/manage'
import { FormTypes } from '@/utils/JEditableTableUtil'
import { JEditableTableMixin } from '@/mixins/JEditableTableMixin'
import pick from 'lodash.pick'

export default {
  name: 'VcardResourceForm',
  mixins: [JEditableTableMixin],
  components: {},
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
    //新增类型
    dataType: {
      type: String,
      default: '',
    },
    dataRef: {
      type: Object,
      default: () => {},
    },
  },
  data() {
    return {
      showMenu:false,
      catalogData: [],
      menuData: [],
      dataTypeOptions:[],
      //编辑的条目是否为表单
      recordIsTable: false,
      refKeys: ['resourceItems'],
      resourceTable: {
        loading: false,
        dataSource: [],
        columns: [
          {
            title: '',
            key: 'name',
            type: FormTypes.input_pop,
            width: '35%',
            placeholder: '请输入${title}',
            defaultValue: '',
            validateRules: [{ required: true, message: '${title}不能为空' }],
          },
          {
            title: '',
            key: 'content',
            type: FormTypes.input_pop,
            width: '64%',
            placeholder: '请输入${title}',
            defaultValue: '',
            validateRules: [{ required: true, message: '${title}不能为空' }],
          },
        ],
      },
      fileShow: true,
      encrypt: 0,
      fileSize: 0,
      update: 0,
      dataurl: '',
      // 附件token
      token:
        'Bearer eyJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJxaXdlbi1jbXMiLCJleHAiOjE2NDkxNDYzOTIsInN1YiI6IntcInVzZXJuYW1lXCI6XCJjaGVubGlhbmdcIn0iLCJhdWQiOiJxaXdlbnNoYXJlIiwiaWF0IjoxNjQ4NTQxNTkyfQ.mCiwREt_5mDE6x_VqCnyhsqX9Ejd0zLPS-a-YQ61nZU',
      showProject: '',

      labelCol3: {
        span: 3,
      },
      wrapperCol3: {
        span: 21,
      },

      value: undefined,
      tablename: 'vcard_resource',
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
      validatorRules: {},
      url: {
        add: '/vcard/resource/add',
        edit: '/vcard/resource/edit',
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
      const isJpgOrPng = file.type === 'image/jpeg' || file.type === 'image/png';
      if (!isJpgOrPng) {
        message.error('You can only upload JPG file!');
      }
    },
    beforeUpload(file,filelist){
      console.log("file",file);
      //拿到文件大小
      this.model.fileSize = file.result.fileSize;//(file.result.fileSize / (1024 * 1024)).toFixed(2)
    },

    //  点击所属菜单
    handleCatalog(e, options) {
      console.log("选择目录");
      console.log(e);
      console.log(options);
      const selected = this.catalogData.find((catalog) => catalog.id === e + '')
      if (selected && selected.children) {
        this.menuData = selected.children
      } else {
        this.menuData = []
      }
    },
    handleDataType(e, options) {
      console.log("选择目录");
      console.log(e);
      console.log(options);
      if (e==1) {
        this.recordIsTable = true
      } else {
        this.recordIsTable = false
      }
    },
    setMenuOptions(data) {
      this.catalogData = data
    },
    setDatatypeOptions(data) {
      this.dataTypeOptions = data
    },
    add() {
      this.edit({})
    },

    // 组件加载会加载
    edit(data) {
      let record={...data}
      this.menuId=record.menuId;
      this.catalogId=record.catalogId;
      //默认是否可用选择是
      this.form.resetFields()
      this.model = Object.assign({}, record)
      const selected = this.catalogData.find((catalog) => catalog.id === record.catalogId)

      if(selected && !!selected.children){
        this.menuData = selected.children
      }else{
        this.menuData = []
      }
      
      if (record.id) {
        //编辑时
        this.$nextTick(() => {
          this.recordIsTable = record.dataType==1
          this.form.setFieldsValue(
            pick(
              this.model,
              'name',
              'catalogId',
              'menuId',
              'dataType',
              'uploadFile',
            )
          ) 
        })
      } else {
        // 新增回显菜单，分类
        this.$nextTick(() => {
          this.form.setFieldsValue(
            pick(this.model, 'menuId', 'catalogId')
          )
        })
      }
    },
    submitForm() {
      const that = this
      // 触发表单验证
      this.form.validateFields((err, values) => {
        console.log('表单全部数据')
        console.log(values)
        // this.model.fileSize = this.fileSize * (1024 * 1024)
        // console.log('this.model', this.model)
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
          'catalogId',
          'menuId',
          'dataType',
          'uploadFile',
        )
      )
    },
  },
}
</script> -->
