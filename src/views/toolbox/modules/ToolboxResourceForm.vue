<template>
  <a-spin :spinning="confirmLoading">
    <j-form-container :disabled="formDisabled">
      <a-form
        :form="form"
        slot="detail"
      >
        <a-row>
          <!-- 暂时先 -->
          <!-- <a-col :span="12">
            <a-form-item label="编号" :labelCol="labelCol" :wrapperCol="wrapperCol">
              <a-input v-decorator="['code', { rules: [{ required: true, message: '请输入编号!' }] }]" placeholder="请输入编号">
              </a-input>
            </a-form-item>
          </a-col> -->
          <a-col :span="12">
            <a-form-item
              label="所属菜单"
              :label-col="labelCol"
              :wrapper-col="wrapperCol"
            >
              <!-- <j-search-select-tag
                v-decorator="['memuId', { rules: [{ required: true, message: '请选择所属菜单!' }] }]"
                dict="toolbox_menu,name,id"
                :disabled="formDisabled"
                @change="handlememu"
              /> -->
              <a-select
                v-decorator="['memuId', { rules: [{ required: true, message: '请选择所属菜单!' }] }]"
                :disabled="formDisabled"
                @change="handlememu"
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
              label="所属目录"
              :label-col="labelCol"
              :wrapper-col="wrapperCol"
            >
              <!-- <j-tree-select
                ref="treeSelect"
                placeholder="请选择所属目录"
                v-decorator="['directoryId', { rules: [{ required: false, message: '请选择所属目录!' }] }]"
                :disabled="formDisabled"
                :dict="directoryDictCode"
                :condition="directoryDictCondition"
                pid-field="pid"
                pid-value="0"
                has-child-field="has_child"
                @change="directoryChangehandle"
              /> -->
              <a-select
                v-decorator="['directoryId', { rules: [{ required: true, message: '请选择所属目录!' }] }]"
                :disabled="formDisabled"
              >
                <a-select-option
                  v-for="directory in directoryData"
                  :key="directory.id"
                  :value="directory.id"
                >
                  {{ directory.name }}
                </a-select-option>
              </a-select>
            </a-form-item>
          </a-col>
          <!-- <a-col :span="12">
            <a-form-item
              label="所属分类"
              :label-col="labelCol"
              :wrapper-col="wrapperCol"
            >
              <j-search-select-tag
                v-decorator="['classifyId', { rules: [{ required: false, message: '请选择所属分类!' }] }]"
                :dict="classifyDictCode"
                :disabled="formDisabled"
                @change="choseclass"
              />
            </a-form-item>
          </a-col> -->
          <a-col :span="12">
            <a-form-item
              label="项目名称"
              :label-col="labelCol"
              :wrapper-col="wrapperCol"
            >
              <a-input
                v-decorator="['title', { rules: [{ required: true, message: '请输入项目名称!' }] }]"
                placeholder="请输入项目名称"
                :maxLength="15"
              />
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item
              label="显示顺序"
              :label-col="labelCol"
              :wrapper-col="wrapperCol"
            >
              <a-input-number
                v-decorator="['sortNo', { rules: [{ required: true, message: '请输入顺序!' }] }]"
                placeholder="请输入顺序"
                style="width: 100%"
                :min="1"
              />
            </a-form-item>
          </a-col>

          <a-col :span="12">
            <a-form-item
              label="页面类型"
              :label-col="labelCol"
              :wrapper-col="wrapperCol"
            >
              <j-dict-select-tag
                type="list"
                v-decorator="['dataType', { rules: [{ required: true, message: '请选择页面类型!' }] }]"
                :trigger-change="true"
                dict-code="toolbox_zylx"
                :dict="zltype"
                placeholder="请选择页面类型"
                @change="changeData"
                :disabled="dataTypeDisable"
              />
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item
              label="封面图片"
              :label-col="labelCol"
              :wrapper-col="wrapperCol"
            >
              <j-upload
                accept=".jpg,.jpeg,.png"
                v-decorator="['icoUrl']"
                :trigger-change="true"
                :number="1"
                @beforeUpload="beforeUpload2"
              />
            </a-form-item>
          </a-col>
          <a-col
            :span="12"
            v-if="profileType != '6'"
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
          <a-col :span="12">
            <a-form-item
              label="是否显示"
              :label-col="labelCol"
              :wrapper-col="wrapperCol"
            >
              <j-dict-select-tag
                type="radio"
                v-decorator="['isEnabled', { rules: [{ required: false, message: '请选择是否显示!' }] }]"
                :trigger-change="true"
                dict-code="toolbox_xs"
                placeholder="请选择是否显示"
              />
            </a-form-item>
          </a-col>
          <!-- 网页链接时展示 -->
          <template v-if="profileType == '6'">
            <a-col span="12">
              <a-form-item
                label="是否外网"
                :label-col="labelCol"
                :wrapper-col="wrapperCol"
              >
                <j-dict-select-tag
                  type="radio"
                  v-decorator="['isExtranet']"
                  :trigger-change="true"
                  dict-code="yn"
                  placeholder="请选择是否外网"
                />
              </a-form-item>
            </a-col>
            <a-col :span="12">
              <a-form-item
                label="网页地址"
                :label-col="labelCol"
                :wrapper-col="wrapperCol"
              >
                <a-input v-decorator="['dataUrlId', { rules: [{ required: false, message: '请输入网页地址!' }] }]" />
              </a-form-item>
            </a-col>
            <a-col :span="12">
              <a-form-item
                label="用户名"
                :label-col="labelCol"
                :wrapper-col="wrapperCol"
              >
                <a-input v-decorator="['username', { rules: [{ required: false, message: '请输入用户名!' }] }]" />
              </a-form-item>
            </a-col>
            <a-col :span="12">
              <a-form-item
                label="密码"
                :label-col="labelCol"
                :wrapper-col="wrapperCol"
              >
                <a-input v-decorator="['password', { rules: [{ required: false, message: '请输入用户名!' }] }]" />
              </a-form-item>
            </a-col>
          </template>

          <a-col
            :span="24"
            style="text-align: center"
            v-show="materialType == 0 && false"
          >
            <a-button @click="encryptfile(dataUrlId)">
              {{ encryptFileButtonText }}
            </a-button>
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
  name: 'ToolboxResourceForm',
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
      menuData: [],
      directoryData: [],
      //缓存菜单-列表
      menuidVideoDict: {},
      videoDuration: '',
      projectName: '',
      fileShow: true,
      identifier: '',
      //类型是否可选择
      dataTypeDisable: false,
      storeID: '',
      classname: '',
      encrypt: 0,
      classifyDictCode: 'toolbox_classify,name,id',
      type_code: 'toolbox_classify,name,id',
      memuId_dictText: '',
      fileSize: 0,
      update: 0,
      dataurl: '',
      //控制网络资源字段
      isHtml: false,
      //控制视频加密字段
      isVideo: false,
      //选择项目控制字段
      isProject: false,
      // 附件token
      token:
        'Bearer eyJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJxaXdlbi1jbXMiLCJleHAiOjE2NDkxNDYzOTIsInN1YiI6IntcInVzZXJuYW1lXCI6XCJjaGVubGlhbmdcIn0iLCJhdWQiOiJxaXdlbnNoYXJlIiwiaWF0IjoxNjQ4NTQxNTkyfQ.mCiwREt_5mDE6x_VqCnyhsqX9Ejd0zLPS-a-YQ61nZU',
      showProject: '',
      showID: '',
      statusSuccess: '',
      dataUrlId: '',
      projetId: '',
      videosrc: [],
      projectDictCode: 'toolbox_resource, title,id',
      directoryDictCode: 'toolbox_directory, name, id',
      directoryDictCondition: '',
      dataCode: 'toolbox_directory, name, id',
      dataCodeCondition: '',
      zltype: 'toolbox_zylx,name,id' + ',data_type !=2',
      threeArr: [],
      materialType: '',
      picExtArr: ['png', 'jpg', 'jpeg', 'gif', 'svg'],
      //   labelCol: {
      //     span: 4,
      //   },
      //   wrapperCol: {
      //     span: 14,
      //   },
      //   labelCol2: {
      //     span: 6,
      //   },
      //   wrapperCol2: {
      //     span: 22,
      //   },

      labelCol3: {
        span: 3,
      },
      wrapperCol3: {
        span: 21,
      },

      projectform: {
        name: '',
        region: undefined,
        date1: undefined,
        delivery: false,
        type: [],
        resource: '',
        desc: '',
      },
      value: undefined,
      tablename: 'toolbox_resource',
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
        add: '/toolbox/toolboxResource/add',
        edit: '/toolbox/toolboxResource/edit',
        queryById: '/toolbox/toolboxResource/queryById',
        fileapi: {
          // encryptfile: 'http://127.0.0.1:8058/fileapi/filetransfer/encryptfile',
          // getallfilelist: 'http://127.0.0.1:8058/fileapi/file/getallfilelist',
          // userlogin: 'http://127.0.0.1:8058/fileapi/user/userlogin',
          // encryptfile: 'http://192.168.40.5:8031/filetransfer/encryptfile',
          // getallfilelist: 'http://192.168.40.5:8031/file/getallfilelist',
          // userlogin: 'http://192.168.40.5:8031/user/userlogin',
          encryptfile: '/fileapi/filetransfer/encryptfile',
          getallfilelist: '/fileapi/file/getallfilelist',
          userlogin: '/fileapi/user/userlogin',
        },
        menuList: '/toolbox/toolboxClass/rootList',
        getChildListBatch: '/toolbox/toolboxClass/getChildListBatch',
      },
      profileType: null, //资料类型
    }
  },
  computed: {
    /**
     * 获取加密按钮的显示文字
     */
    encryptFileButtonText() {
      let encrypt = this.encrypt
      return encrypt == 0
        ? '资料加密'
        : encrypt == 1
        ? '正在加密中。。。'
        : encrypt == 2
        ? '视频已加密'
        : encrypt == 3
        ? '加密完成'
        : '加密失败'
    },
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

  mounted() {
    //如果是流程中表单，则需要加载流程表单data
    // this.showFlowData()

  },
  created() {
  },

  methods: {
//    handerImg(file,width,height){
//    var reader = new FileReader();
//    var img = document.createElement('img');
//    reader.onload = function (e) {
//      img.src = e.target.result;
//      img.onload = function () {
//        var canvas = document.createElement('canvas');
//        var context = canvas.getContext('2d');
//        canvas.width = width;//canvas的宽=图片的宽
//        canvas.height = height;//canvas的高=图片的高

//        context.clearRect(0, 0, width, height)//清理canvas
//        context.drawImage(img, 0, 0, width, height)//canvas绘图
//        var newUrl = canvas.toDataURL('image', 1);//canvas导出成为base64
//        downloadBase = newUrl;
//        $(".img_result img").attr("src",newUrl)
//        $(".img_result").show();
//      }
//    }
//    reader.readAsDataURL(file);
//  },
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
  //  transformFile(file){
  //   console.log("file",file);
  //   console.log("-------------------");
  //  },
  // checkImageWH(file, width, height){
  //   return new Promise((resolve) => {
  //     const reader = new FileReader()
  //     reader.readAsDataURL(file)
  //     reader.onload = () => {
  //       const img = document.createElement('img')
  //       img.src = reader.result
  //       img.onload = () => {
  //         const canvas = document.createElement('canvas')
  //         //这里使用变量固定宽高
  //         canvas.width = width 
  //         canvas.height = height
  //         const ctx = canvas.getContext('2d')
  //         ctx.fillRect(0, 0, canvas.width, canvas.height)
  //         ctx.drawImage(img, 0, 0, width, height)
  //         canvas.toBlob((result) => resolve(result))
  //       }
  //     }
  //   })
  // },
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
    loadMenuData(menuID) {
      debugger
      getAction(this.url.menuList)
        .then((res) => {
          if (res.success) {
            let ids = ''
            const menuRootData = res.result.records
            for (let index in menuRootData) {
              if (index == menuRootData.length - 1) {
                ids = ids + menuRootData[index].id
              } else {
                ids = ids + menuRootData[index].id + ','
              }
            }
            getAction(this.url.getChildListBatch, { parentIds: ids }).then((ress) => {
              var i=0;
              var j=0;
              for (let item of ress.result.records) {
                for (let root of menuRootData) {
                  i++;
                  if (item.pid == root.id) {
                    j++;
                    if (!root.hasOwnProperty('children')) {
                      root.children = []
                      root.children.push(item)
                    }else{
                      root.children.push(item)
                    }
                   
                  }
                }
              };
              this.menuData = menuRootData
              this.$set(this,'menuData',menuRootData)
              const selectMenu = menuRootData.find((menu) => menu.id ==menuID)
                if(selectMenu && selectMenu.hasOwnProperty('children')){
                  // this.directoryData = selectMenu.children
                this.$set(this,'directoryData',selectMenu.children)
                }else{
                  this.directoryData = []
                }
                this.form.setFieldsValue(
                  {"memuId": this.memuId,
                  "directoryId": this.directoryId,}
                )
                this.$forceUpdate();
            })
            this.menuData = menuRootData
          } else {
            this.$message.warning(res.message)
          }
        })
        .finally(() => {
          this.loading = false
        })
    },
    //  点击所属菜单
    handlememu(e, options) {
      const selectMenu = this.menuData.find((menu) => menu.id === e + '')
      if (selectMenu && selectMenu.children) {
        this.directoryData = selectMenu.children
      } else {
        this.directoryData = []
      }
      // this.form.setFieldsValue({ memuId: e })
      //如果菜单是 工程展馆 或者 工程咨询，且资料类型不是项目时时，展示项目
      // let showProject = false
      // let selectedOption = options.find((x) => x.value === e)
      // if (selectedOption) {
      //   let dataType = this.form.getFieldValue('dataType')
      //   if ((selectedOption.title === '工程咨询' || selectedOption.title === '工程展馆') && dataType != 2) {
      //     showProject = true
      //   }
      //设置菜单标题
      // this.form.setFieldsValue({ memuId: e, memuId_dictText: selectedOption.title }, callback)
      // this.model.memuId_dictText = selectedOption.title
      // }
      // this.showProject = showProject

      // //设置分类
      // this.setClassifyDictCode(true)
      // //设置项目
      // this.setProjectDictCode(true)
      // //设置目录
      // this.setDirctoryDictCode(true)
      // //请求视频列表
      // this.queryVideoList(() => {
      //   //设置视频
      //   this.setVideoList(true)
      // })
    },
        //  点击所属菜单
    handlememu2(e) {
      debugger
      const selectMenu = this.menuData.find((menu) => menu.id === e + '')
      if (selectMenu && selectMenu.children) {
        this.directoryData = selectMenu.children
      } else {
        this.directoryData = []
      }
    },
    // 选择所属分类后
    choseclass(e) {
      //设置表单字段数据
      this.form.setFieldsValue({ classifyId: e })

      //重置项目
      this.setProjectDictCode(true)
      //重置目录
      this.setDirctoryDictCode(true)
      // 重置视频资料
      this.setVideoList(true)
    },
    // 资料类型
    changeData(e) {
      this.profileType = e
      //如果菜单是 工程展馆 或者 工程咨询，且资料类型不是项目时时，展示项目
      let showProject = false
      let memuId_dictText = this.form.getFieldInstance('memuId').selectedText
      if ((memuId_dictText === '工程咨询' || memuId_dictText === '工程展馆') && e != 2) {
        showProject = true
      }
      this.showProject = showProject
      this.form.setFieldsValue({ dataType: e })

      // 重置视频资料
      this.setVideoList(true)
      if (e == 0) {
        this.isVideo = true
        this.model.isEncrypt = 0
      } else {
        this.isVideo = false
      }
      if (e == 2) {
        this.isProject = true
      } else {
        this.isProject = false
      }
    },
    // 所属项目 根据项目id  来获取所属目录 所属目录请求数据
    projectCodeChangehandle(e) {
      //设置表单字段数据
      this.form.setFieldsValue({ projectId: e })
      //重置目录
      this.setDirctoryDictCode(true)
      // 重置视频资料
      this.setVideoList(true)
    },
    //目录选择事件
    directoryChangehandle(e, text) {
      //设置表单字段数据
      this.form.setFieldsValue({ directoryId: e, directoryId_dictText: text })
      this.model.directoryId_dictText = text
      // 重置视频资料
      this.setVideoList(true)
    },
    //设置分类字典的code
    setClassifyDictCode(clearSelected) {
      //受菜单属性控制
      let memuId = this.form.getFieldValue('memuId') //this.model.memuId
      let classifyDictCode = 'toolbox_classify,name,id,1=1'
      if (memuId) {
        classifyDictCode += " and memu_id='" + memuId + "'"
      }
      this.classifyDictCode = classifyDictCode
      //清空选项
      if (clearSelected) {
        this.form.setFieldsValue({ classifyId: null, classifyId_dictText: null })
      }
    },
    //设置项目字典的code
    setProjectDictCode(clearSelected) {
      //受菜单、分类两个属性控制
      let memuId = this.form.getFieldValue('memuId') //this.model.memuId
      let classifyId = this.form.getFieldValue('classifyId') //this.model.classifyId
      //data_type=2 表示项目
      let projectDictCode = 'toolbox_resource,title,id,data_type=2'
      if (memuId) {
        projectDictCode += " and memu_id='" + memuId + "'"
      }
      if (classifyId) {
        projectDictCode += " and classify_id='" + classifyId + "'"
      }
      this.projectDictCode = projectDictCode
      //清空选项
      if (clearSelected) {
        this.form.setFieldsValue({ projectId: null, projectId_dictText: null })
      }
    },
    //设置目录字典
    setDirctoryDictCode(clearSelected) {
      //受菜单、分类、项目三个属性控制
      let memuId = this.form.getFieldValue('memuId') //this.model.memuId
      let classifyId = this.form.getFieldValue('classifyId') //this.model.classifyId
      let projectId = this.form.getFieldValue('projectId') //this.model.projectId

      let dataCode = 'toolbox_directory, name, id'
      let condition = {}
      // JSON.stringify({
      //     resource_id: id,
      //   })
      if (memuId) {
        condition.memu_id = memuId
      }
      if (classifyId) {
        condition.classify_id = classifyId
      }
      if (projectId) {
        condition.resource_id = projectId
      }
      this.directoryDictCode = dataCode
      this.directoryDictCondition = JSON.stringify(condition)
      //清空选项
      if (clearSelected) {
        this.form.setFieldsValue({ directoryId: null, directoryId_dictText: null })
      }
    },
    //切换是否加密
    isEncryptChangehandle() {
      //清空文件选项，置空md5
      this.form.setFieldsValue({ dataUrlId: null, identifier: null })
    },
    //设置视频列表
    setVideoList(clearSelected) {
      let menuId = this.form.getFieldValue('memuId')
      let memuId_dictText = this.form.getFieldInstance('memuId').selectedText //this.form.getFieldValue('memuId_dictText') //this.model.memuId_dictText
      let classifyId_dictText = this.form.getFieldInstance('classifyId').selectedText
      let projectId_dictText = this.showProject ? this.form.getFieldInstance('projectId').selectedText : null
      let directoryId_dictText = this.showProject ? this.form.getFieldInstance('directoryId').selectedText : null

      let path = '/鲸禾工具箱'
      if (memuId_dictText) {
        path += '/' + memuId_dictText
        if (classifyId_dictText) {
          path += '/' + classifyId_dictText
          if (projectId_dictText) {
            path += '/' + projectId_dictText
            if (directoryId_dictText) {
              path += '/' + directoryId_dictText
            }
          }
        }

        let videoData = this.menuidVideoDict[menuId]
        let type = this.form.getFieldValue('dataType')
        // 1 ： PDF
        // 0 :  视频
        // 2 ： 项目 暂时不处理
        // 3：  图片
        // 4：  其他
        if (type === '0') {
          videoData = videoData.filter((x) => x.filePath.startsWith(path) && x.extendName.toLowerCase() == 'mp4')
        } else if (type === '1') {
          videoData = videoData.filter((x) => x.filePath.startsWith(path) && x.extendName.toLowerCase() == 'pdf')
        } else if (type === '3') {
          videoData = videoData.filter(
            (x) => x.filePath.startsWith(path) && this.picExtArr.includes(x.extendName.toLowerCase())
          )
        } else {
          videoData = videoData.filter((x) => x.filePath.startsWith(path))
        }
        this.videosrc = videoData
      } else {
        this.videosrc = []
      }
      //清空选项
      if (clearSelected) {
        this.form.setFieldsValue({ dataUrlId: null, dataUrl: null, identifier: null, videoDuration: null })
      }
    },
    //请求视频列表
    queryVideoList(callback) {
      let memuId = this.form.getFieldValue('memuId')
      //后一个情况处理：编辑时，第一次 所属菜单 异步请求过程中会有数据无法获取
      let memuId_dictText = this.form.getFieldInstance('memuId').selectedText || this.model.memuId_dictText
      if (memuId_dictText) {
        let path = '/鲸禾工具箱' + '/' + memuId_dictText
        let url = this.url.fileapi.getallfilelist + `?currentPage=1&pageCount=1000&filePath=${path}/&isDir=0`
        getAction(url, {
          Headers: {
            token: this.token,
          },
        }).then((res) => {
          if (res.code == 0) {
            let list = res.data.list
            // console.log('原始视频数据', list)
            let videoList = this.initVideoList(list)
            this.menuidVideoDict[memuId] = videoList
          } else {
            this.menuidVideoDict[memuId] = []
          }
          if (callback && typeof callback === 'function') {
            callback()
          }
        })
      } else {
        console.log('memuId_dictText', memuId_dictText)
      }
    },
    // 资料文件选中后
    selectzl(e, option) {
      console.log('dataUrl', e)
      if (e == undefined) {
        let row = {}
        row.isUpDate = 1
        row.dataUrlId = null
        row.dataUrl = null
        this.dataUrl = null
        this.dataUrlId = ''
        this.form.setFieldsValue(row)
      } else {
        this.dataUrlId = e //值
        let element = option.find((x) => x.value === e)
        if (element) {
          if (element.isEncrypt == 1) {
            this.statusSuccess = 'success'
            this.encrypt = 2
          } else {
            this.statusSuccess = ''
            this.encrypt = 0
          }
          this.dataurl = element.name
          console.log('dataurl//////////', element)

          let isEncrypt = this.form.getFieldValue('isEncrypt')
          //对应不是mp4的文件，不存储md5码，加密时进行存储加密后文件的md5码
          if (element.extendName && element.extendName.toLowerCase() === 'mp4' && isEncrypt != 0) {
            this.identifier = element.encryptedIdentifier
          } else {
            this.identifier = element.identifier
          }
          this.form.setFieldsValue({ identifier: this.identifier })
          this.model.identifier = this.identifier

          //转成Mb
          let size = element.fileSize / (1024 * 1024)
          this.fileSize = size.toFixed(2)
          this.videoDuration = element.videoDuration
          console.log('********', element)
        }
        // })
        // 控制是否更新
        if (this.model.dataUrlId == e.key) {
          this.form.setFieldsValue({
            isUpDate: 1,
          })
        } else {
          this.form.setFieldsValue({
            isUpDate: 0,
          })
        }
      }
    },
    // 资料加密 只有视频的时候才会有加密按钮
    encryptfile(id) {
      if (id) {
        // if (this.encrypt == 0) {
        this.encrypt = 1
        let apiurl = this.url.filename.encryptfile + `?userFileId=${id}`
        getAction(apiurl, {
          Headers: {
            token: this.token,
          },
        }).then((res) => {
          console.log('视频加密', res)
          if (res.code == 0) {
            this.encrypt = 3
            this.identifier = res.data.identifier
            // row.dataUrl = null
            this.statusSuccess = 'success'
            this.$message.success('视频加密成功')
          } else {
            this.encrypt = 4
            this.statusSuccess = 'error'
            this.$message.error('视频加密失败')
          }
        })
      } else {
        this.$message.warning('请选择资料')
      }
    },

    // 获取视频地址
    getvideo() {
      let path
      // 先判断是不是1.资料类型 this.materialType   在判断工程咨询 是的话  再看 资料类型   所属分类 所属项目 是不是有了
      if (this.materialType != undefined) {
        if (this.showProject) {
          // 是工程咨询   2.所属分类 this.classname 3.所属项目 this.projectName
          // 1.资料类型已选择
          // 2.所属分类 this.classname 3.所属项目 this.projectName
          if (this.classname && this.projectName) {
            path = `${this.memuId_dictText}/${this.classname}/${this.projectName}`
            // 2.所属分类 this.classname
          } else if (this.classname) {
            path = `${this.memuId_dictText}/${this.classname}`
            // 3.所属项目 this.projectName
          } else {
            path = `${this.memuId_dictText}`
          }
        } else {
          if (this.classname) {
            path = `${this.memuId_dictText}/${this.classname}`
          } else {
            path = `${this.memuId_dictText}`
          }
        }
        // let url = `/fileapi/file/getallfilelist?currentPage=1&pageCount=1000&filePath=/鲸禾工具箱/${path}/&isDir=0`
        let url =
          this.url.fileapi.getallfilelist + `?currentPage=1&pageCount=1000&filePath=/鲸禾工具箱/${path}/&isDir=0`
        // console.log('获取视频地址url', url, '视频得类型', type)
        this.videosrc = []
        getAction(url, {
          Headers: {
            token: this.token,
          },
        }).then((res) => {
          if (res.code == 0) {
            let list = res.data.list
            // console.log('原始视频数据', list)
            this.videosrc = this.initVideoList(list)
          }
        })
      }
    },
    //
    initVideoList(list) {
      let datas = []
      list.forEach((item) => {
        let filename = item.filePath + item.fileName + '.' + item.extendName
        let node = Object.assign(item, {
          name: filename,
          value: item.userFileId.toString(),
          text: filename,
        })
        datas.push(node)
      })
      return datas
    },
    add() {
      this.edit({})
    },

    // 组件加载会加载
    edit(data) {
      let record={...data}
      this.memuId=record.memuId;
      this.directoryId=record.directoryId;
      this.profileType = null

      setTimeout(()=>{ this.loadMenuData(record.memuId)})

      //是否加密字段控制
      if (record && record.dataType && record.dataType == 0) {
        this.isVideo = true
      } else {
        this.isVideo = false
      }
      //是否是网络资源
      if (record && record.dataType && record.dataType == 2) {
        this.isProject = true
      } else {
        this.isProject = false
      }
      // 这里新增 控制资料显示 然后必须更新
      let storeTool = this.dataType //this.$store.state.toolboxResoureform

      //编辑
      if (record.id) {
        this.profileType = record.dataType
        //项目时
        if (record.dataType == '2') {
          this.showProject = false
          this.fileShow = false
        } else {
          this.fileShow = true
          if (record.memuId_dictText === '工程展馆' || record.memuId_dictText === '工程咨询') {
            this.showProject = true
          } else {
            this.showProject = false
          }
        }
        this.dataTypeDisable = false
      } else {
        //新增项目
        if (storeTool === '1') {
          this.showProject = false
          // 新增资料不显示 大小也就不显示
          this.fileShow = false
          this.dataTypeDisable = false
          // 1 是更新
          record.isUpDate = 0
          // this.$store.commit('toolboxResoureList', 0)
          record.handlememu = null
          record.classifyId = null

          record.dataType = 2
          this.materialType = 2

          record.projectId = null
          record.directoryId = null
          record.labels = null
          record.dataUrlId = null
          // record.dataUrl = null
          record.icoUrl = null
        }
        //新增数据
        else if (storeTool === '2') {
          // 编辑显示资料  大小
          this.showProject = true
          this.fileShow = true
          this.dataTypeDisable = false
          record.isUpDate = 1
          record.isEncrypt = 0
          this.classname = record.classifyId_dictText
          // 处理一下 字节转换成 MB
          if (record.dataUrlId && record.fileSize) {
            let size = record.fileSize / (1024 * 1024)
            this.fileSize = size.toFixed(2)
          } else {
            this.fileSize = 0
          }

          this.projectDictCode = 'toolbox_resource,title,id'
          this.dataCode = 'toolbox_directory, name, id'
          this.materialType = record.dataType

          // 有视频id
          if (record.dataUrlId) {
            this.dataUrlId = record.dataUrlId
            this.dataurl = record.dataUrl
          } else {
            this.dataUrlId = ''
            this.encrypt = 0
            this.statusSuccess = ''
          }
        }
      }
      //默认是否可用选择是
      this.form.resetFields()
      this.model = Object.assign({}, record)
      // console.log('this.model', this.model)
      // this.form.setFieldsValue({
      //   "memuId": record.pid,
      // })
      // this.handlememu2(record.pid);
      // this.form.setFieldsValue({
      //   "directoryId": record.id,
      // })
      this.visible = true
      const selectMenu = this.menuData.find((menu) => menu.id === record.memuId)

      if(selectMenu && !selectMenu.hasOwnProperty('children')){
        this.directoryData = selectMenu.children
      }else{
        this.directoryData = []
      }
      
      if (record.id) {
        this.$nextTick(() => {
          this.form.setFieldsValue(
            pick(
              this.model,
              'code',
              'title',
              'sortNo',
              'memuId',
              'memuId_dictText',
              'classifyId',
              'classifyId_dictText',
              'projectId',
              'projectId_dictText',
              'directoryId',
              'directoryId_dictText',
              'dataType',
              'icoUrl',
              'labels',
              'subAddress',
              'identifier',
              'isEncrypt',
              'passParameter',
              'isEnabled',
              'isUpDate',
              'dataUrlId',
              'isExtranet',
              'username',
              'password',
              'uploadFile'
            )
          )
          //编辑时
          if (this.model.id) {
            //设置分类
            this.setClassifyDictCode()
            //设置项目
            this.setProjectDictCode()
            //设置目录
            this.setDirctoryDictCode()
            // this.queryVideoList(() => {
            //   //设置视频
            //   this.setVideoList()
            // })
          }
        })
      } else {
        // 新增回显菜单，分类
        this.$nextTick(() => {
          let { id, pid } = this.dataRef
          //最上面已经拿到菜单了 为啥这里还需要在拿一遍 没看懂 先注释了
          // const selectMenu = this.menuData.find((menu) => menu.id === pid)
          // console.log("::::::::----")
          // this.directoryData = selectMenu.children
          this.form.setFieldsValue(
            pick({ memuId: pid, directoryId: id, isEnabled: '0' }, 'memuId', 'directoryId', 'isEnabled')
          )
        })
      }
    },
    submitForm() {
      const that = this
      // 触发表单验证
      this.form.validateFields((err, values) => {
        if (this.dataUrlId) {
          this.model.dataUrl = this.dataurl
          this.model.dataUrlId = this.dataUrlId
        } else {
          this.model.dataUrl = ''
          this.model.dataUrlId = ''
        }
        // 发送MD5到后台
        this.model.identifier = this.identifier
        // 存入fileSize
        // videoDuration
        if (this.videoDuration) {
          this.model.videoDuration = this.videoDuration
        }
        // this.model.fileSize = this.fileSize * (1024 * 1024)
        // console.log('this.model', this.model)
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
      this.form.setFieldsValue(
        pick(
          row,
          'code',
          'title',
          'sortNo',
          'memuId',
          'memuId_dictText',
          'classifyId',
          'classifyId_dictText',
          'projectId',
          'projectId_dictText',
          'directoryId',
          'directoryId_dictText',
          'dataType',
          // 'dataType_dictText',
          'icoUrl',
          'labels',
          'subAddress',
          'passParameter',
          'isEnabled',
          'isUpDate',
          'dataUrlId',
          'isEncrypt ',
          'isExtranet',
          'username',
          'password',
          'uploadFile'
        )
      )
    },
  },
}
</script>
