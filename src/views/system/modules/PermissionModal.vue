<template>
  <a-drawer
    :title="title"
    :width="drawerWidth"
    @close="handleCancel"
    :visible="visible"
    :confirmLoading="confirmLoading"
  >
    <div :style="{ width: '100%', border: '1px solid #e9e9e9', padding: '10px 16px', background: '#fff' }">
      <a-spin :spinning="confirmLoading">
        <a-form :form="form">
          <a-row>
            <a-col :span="24">
              <a-form-item label="菜单类型" :labelCol="labelCol" :wrapperCol="wrapperCol">
                <a-radio-group @change="onChangeMenuType" v-decorator="['menuType', { initialValue: localMenuType }]">
                  <a-radio :value="0">一级菜单</a-radio>
                  <a-radio :value="1">子菜单</a-radio>
                  <a-radio :value="2">按钮/权限</a-radio>
                </a-radio-group>
              </a-form-item>
            </a-col>
            <a-col :span="12">
              <a-form-item :labelCol="labelCol2" :wrapperCol="wrapperCol2" :label="menuLabel" hasFeedback>
                <a-input
                  placeholder="请输入菜单名称"
                  v-decorator="['name', validatorRules.name]"
                  :readOnly="disableSubmit"
                />
              </a-form-item>
            </a-col>
            <a-col :span="12">
              <a-form-item
                v-show="localMenuType != 0"
                label="上级菜单"
                :labelCol="labelCol2"
                :wrapperCol="wrapperCol2"
                :validate-status="validateStatus"
                :hasFeedback="true"
                :required="true"
              >
                <span slot="help">{{ validateStatus == 'error' ? '请选择上级菜单' : '&nbsp;&nbsp;' }}</span>
                <a-tree-select
                  style="width: 100%"
                  :dropdownStyle="{ maxHeight: '200px', overflow: 'auto' }"
                  :treeData="treeData"
                  v-model="model.parentId"
                  placeholder="请选择父级菜单"
                  :disabled="disableSubmit"
                  @change="handleParentIdChange"
                >
                </a-tree-select>
              </a-form-item>
            </a-col>
            <a-col :span="24">
              <a-form-item :labelCol="labelCol" :wrapperCol="wrapperCol" label="菜单路径">
                <a-input
                  placeholder="请输入菜单路径"
                  v-decorator="['url', validatorRules.url]"
                  :readOnly="disableSubmit"
                />
              </a-form-item>
            </a-col>
            <a-col :span="24">
              <a-form-item v-show="show" :labelCol="labelCol" :wrapperCol="wrapperCol" label="前端组件">
                <a-input
                  placeholder="请输入前端组件"
                  v-decorator="['component', validatorRules.component]"
                  :readOnly="disableSubmit"
                />
              </a-form-item>
            </a-col>
            <a-col :span="24">
              <a-form-item
                v-show="localMenuType == 0"
                :labelCol="labelCol"
                :wrapperCol="wrapperCol"
                label="默认跳转地址"
              >
                <a-input
                  placeholder="请输入路由参数 redirect"
                  v-decorator="['redirect', {}]"
                  :readOnly="disableSubmit"
                />
              </a-form-item>
            </a-col>
            <a-col :span="24">
              <a-form-item v-show="!show" :labelCol="labelCol" :wrapperCol="wrapperCol" label="授权标识">
                <a-input
                  placeholder="请输入授权标识, 如: user:list"
                  v-decorator="[
                    'perms',
                    { rules: [{ required: false, message: '请输入授权标识!' }, { validator: this.validatePerms }] },
                  ]"
                  :readOnly="disableSubmit"
                />
              </a-form-item>
            </a-col>
            <a-col :span="24">
              <a-form-item v-show="!show" :labelCol="labelCol" :wrapperCol="wrapperCol" label="授权策略">
                <j-dict-select-tag
                  v-decorator="['permsType', {}]"
                  placeholder="请选择授权策略"
                  :type="'radio'"
                  :triggerChange="true"
                  dictCode="global_perms_type"
                />
              </a-form-item>
            </a-col>
            <a-col :span="24">
              <a-form-item v-show="!show" :labelCol="labelCol" :wrapperCol="wrapperCol" label="状态">
                <j-dict-select-tag
                  v-decorator="['status', {}]"
                  placeholder="请选择状态"
                  :type="'radio'"
                  :triggerChange="true"
                  dictCode="valid_status"
                />
              </a-form-item>
            </a-col>
            <a-col :span="12">
              <a-form-item v-show="show" :labelCol="labelCol2" :wrapperCol="wrapperCol2" label="菜单图标">
                <a-input placeholder="点击选择图标" v-model="model.icon" :readOnly="disableSubmit">
                  <a-icon slot="addonAfter" type="setting" @click="selectIcons" />
                </a-input>
              </a-form-item>
            </a-col>
            <a-col :span="12">
              <a-form-item v-show="show" :labelCol="labelCol" :wrapperCol="wrapperCol" label="排序">
                <a-input-number
                  placeholder="请输入菜单排序"
                  style="width: 200px"
                  v-decorator="['sortNo', validatorRules.sortNo]"
                  :readOnly="disableSubmit"
                />
              </a-form-item>
            </a-col>
            <a-col :span="12">
              <a-form-item v-show="show" :labelCol="labelCol2" :wrapperCol="wrapperCol2" label="是否路由菜单">
                <a-switch checkedChildren="是" unCheckedChildren="否" v-model="routeSwitch" />
              </a-form-item>
            </a-col>
            <a-col :span="12">
              <a-form-item v-show="show" :labelCol="labelCol2" :wrapperCol="wrapperCol2" label="隐藏路由">
                <a-switch checkedChildren="是" unCheckedChildren="否" v-model="menuHidden" />
              </a-form-item>
            </a-col>
            <a-col :span="12">
              <a-form-item v-show="show" :labelCol="labelCol2" :wrapperCol="wrapperCol2" label="是否缓存路由">
                <a-switch checkedChildren="是" unCheckedChildren="否" v-model="isKeepalive" />
              </a-form-item>
            </a-col>
            <a-col :span="12">
              <a-form-item v-show="show" :labelCol="labelCol2" :wrapperCol="wrapperCol2" label="聚合路由">
                <a-switch checkedChildren="是" unCheckedChildren="否" v-model="alwaysShow" />
              </a-form-item>
            </a-col>
            <a-col :span="12">
              <!--update_begin author:wuxianquan date:20190908 for:增加组件，外链打开方式可选 -->
              <a-form-item v-show="show" :labelCol="labelCol2" :wrapperCol="wrapperCol2" label="打开方式">
                <a-switch checkedChildren="外部" unCheckedChildren="内部" v-model="internalOrExternal" />
              </a-form-item>
              <!--update_end author:wuxianquan date:20190908 for:增加组件，外链打开方式可选 -->
            </a-col>

            <a-col :span="24">
              <hr style="border-top: none; border-bottom: 0.5px solid #eee" />
            </a-col>
            <a-col :span="12">
              <a-form-item v-show="show" :labelCol="labelCol2" :wrapperCol="wrapperCol2" label="移动端菜单">
                <a-switch checkedChildren="是" unCheckedChildren="否" v-model="appShow" />
              </a-form-item>
            </a-col>
            <a-col :span="12">
              <a-form-item v-show="show" :labelCol="labelCol2" :wrapperCol="wrapperCol2" label="APP菜单图标">
                <a-input placeholder="点击选择APP菜单图标" v-model="model.appIcon" :readOnly="disableSubmit">
                  <a-icon slot="addonAfter" type="setting" @click="selectAppIcons" />
                </a-input>
              </a-form-item>
            </a-col>
            <!-- <a-col :span="24">
              <a-form-item v-show="show" :labelCol="labelCol" :wrapperCol="wrapperCol" label="APP标识">
                <a-input placeholder="请输入APP标识" v-decorator="['appIdentifying']" :readOnly="disableSubmit" />
              </a-form-item>
            </a-col> -->
            <a-col :span="24">
              <a-form-item v-show="show" :labelCol="labelCol" :wrapperCol="wrapperCol" label="APP组件路径">
                <a-input placeholder="请输入APP组件路径" v-decorator="['appPath']" :readOnly="disableSubmit" />
              </a-form-item>
            </a-col>

            <a-col :span="24">
              <hr style="border-top: none; border-bottom: 0.5px solid #eee" />
            </a-col>

            <a-col :span="24" v-if="localMenuType == '1'">
              <a-form-item :labelCol="labelCol" :wrapperCol="wrapperCol" label="按钮权限">
                <div :style="{ borderBottom: '1px solid #E9E9E9' }">
                  <a-checkbox :indeterminate="indeterminate" :checked="checkAll" @change="btnAuthoritysAllChangeHandle">
                    全选/清空
                  </a-checkbox>
                </div>
                <a-checkbox-group
                  v-model="btnAuthoritys"
                  name="checkboxgroup"
                  :options="btnAuthoritysOptions"
                  @change="btnAuthoritysChangeHandle"
                />
              </a-form-item>
            </a-col>
          </a-row>
        </a-form>
        <!-- 选择图标 -->
        <icons @choose="handleIconChoose" @close="handleIconCancel" :iconChooseVisible="iconChooseVisible"></icons>
      </a-spin>
      <a-row :style="{ textAlign: 'right' }">
        <a-button :style="{ marginRight: '8px' }" @click="handleCancel"> 关闭 </a-button>
        <a-button :disabled="disableSubmit" @click="handleOk" type="primary">确定</a-button>
      </a-row>
    </div>
  </a-drawer>
</template>

<script>
import { addPermission, editPermission, queryTreeList, duplicateCheck } from '@/api/api'
import Icons from './icon/Icons'
import pick from 'lodash.pick'

export default {
  name: 'PermissionModal',
  components: { Icons },
  data() {
    return {
      isAppIcon: true, // 是否时app图标
      drawerWidth: 1000,
      treeData: [],
      treeValue: '0-0-4',
      title: '操作',
      visible: false,
      disableSubmit: false,
      model: {},
      localMenuType: 0,
      alwaysShow: false, //表单元素-聚合路由
      menuHidden: false, //表单元素-隐藏路由
      routeSwitch: true, //是否路由菜单
      appShow: false, //表单元素-是否App菜单
      /*update_begin author:wuxianquan date:20190908 for:定义变量，初始值代表内部打开*/
      internalOrExternal: false, //菜单打开方式
      /*update_end author:wuxianquan date:20190908 for:定义变量，初始值代表内部打开*/
      isKeepalive: true, //是否缓存路由
      show: true, //根据菜单类型，动态显示隐藏表单元素
      menuLabel: '菜单名称',
      isRequrie: true, // 是否需要验证
      labelCol: {
        xs: { span: 24 },
        sm: { span: 3 },
      },
      wrapperCol: {
        xs: { span: 24 },
        sm: { span: 20 },
      },
      labelCol2: {
        xs: { span: 24 },
        sm: { span: 6 },
      },
      wrapperCol2: {
        xs: { span: 24 },
        sm: { span: 16 },
      },
      confirmLoading: false,
      form: this.$form.createForm(this),

      iconChooseVisible: false,
      validateStatus: '',

      btnAuthoritysOptions: [
        {
          label: '新增',
          value: 'add',
        },
        {
          label: '删除',
          value: 'delete',
        },
        {
          label: '修改',
          value: 'edit',
        },
        {
          label: '调整',
          value: 'adjust',
        },
        // {
        //   label: '详情',
        //   value: 'view',
        // },
        {
          label: '导入',
          value: 'import',
        },
        {
          label: '导出',
          value: 'export',
        },
        // {
        //   label: '启动流程',
        //   value: 'start',
        // },
        {
          label: '批量删除',
          value: 'batch_delete',
        },
        // {
        //   label: '提交',
        //   value: 'submit',
        // },
      ],
      btnAuthoritys: ['add', 'delete', 'edit', 'adjust', 'batch_delete', 'import', 'export'],
      indeterminate: true,
      checkAll: true,
    }
  },
  computed: {
    validatorRules: function () {
      return {
        name: { rules: [{ required: true, message: '请输入菜单标题!' }] },
        component: { rules: [{ required: this.show, message: '请输入前端组件!' }] },
        url: { rules: [{ required: this.show, message: '请输入菜单路径!' }] },
        permsType: { rules: [{ required: true, message: '请输入授权策略!' }] },
        sortNo: { initialValue: 1.0 },
      }
    },
  },
  created() {
    this.initDictConfig()
  },
  methods: {
    //按钮权限
    btnAuthoritysChangeHandle(checkedList) {
      this.indeterminate = !!checkedList.length && checkedList.length < this.btnAuthoritysOptions.length
      this.checkAll = checkedList.length === this.btnAuthoritysOptions.length
    },
    //按钮权限全选/清空
    btnAuthoritysAllChangeHandle(e) {
      this.btnAuthoritys = e.target.checked ? this.btnAuthoritysOptions.map((x) => x.value) : []
      this.indeterminate = false
      this.checkAll = e.target.checked
    },
    loadTree() {
      var that = this
      queryTreeList().then((res) => {
        if (res.success) {
          console.log('----queryTreeList---')
          console.log(res)
          that.treeData = []
          let treeList = res.result.treeList
          for (let a = 0; a < treeList.length; a++) {
            let temp = treeList[a]
            temp.isLeaf = temp.leaf
            that.treeData.push(temp)
            //获取按钮权限
            if (that.localMenuType == 1) {
              that.btnAuthoritys = []
              if (temp.key == that.model.parentId) {
                for (let i = 0; i < temp.children.length; i++) {
                  const child = temp.children[i]
                  if (child.key == that.model.id) {
                    var btns = child.children

                    var arr = that.model.component.split('/')
                    var pageName = ''
                    if (arr.length > 0) {
                      pageName = arr[arr.length - 1]
                      if (pageName.length > 4 && pageName.endsWith('List')) {
                        pageName = pageName.substring(0, pageName.length - 4)
                      }
                    }
                    if (btns && btns.length > 0) {
                      that.btnAuthoritys = btns
                        .filter((x) => x.perms && x.perms.indexOf(':') > -1 && x.perms.startsWith(pageName))
                        .map((x) => x.perms.split(':')[1])
                      console.log(that.btnAuthoritys)
                    }
                    break
                  }
                }
              }
            }
          }
        }
      })
    },
    add() {
      // 默认值
      this.edit({ status: '1', permsType: '1', route: true })
    },
    edit(record) {
      this.resetScreenSize() // 调用此方法,根据屏幕宽度自适应调整抽屉的宽度
      this.form.resetFields()
      this.model = Object.assign({}, record)
      //--------------------------------------------------------------------------------------------------
      //根据菜单类型，动态展示页面字段
      console.log(record)
      this.alwaysShow = !record.alwaysShow ? false : true
      this.menuHidden = !record.hidden ? false : true
      this.appShow = !record.appShow ? false : true

      if (record.route != null) {
        this.routeSwitch = record.route ? true : false
      }

      if (record.keepAlive != null) {
        this.isKeepalive = record.keepAlive ? true : false
      } else {
        this.isKeepalive = false // 升级兼容 如果没有（后台没有传过来、或者是新建）默认为false
      }

      /*update_begin author:wuxianquan date:20190908 for:编辑初始化数据*/
      if (record.internalOrExternal != null) {
        this.internalOrExternal = record.internalOrExternal ? true : false
      } else {
        this.internalOrExternal = false
      }
      /*update_end author:wuxianquan date:20190908 for:编辑初始化数据*/

      //console.log('record.menuType', record.menuType);
      this.show = record.menuType == 2 ? false : true
      this.menuLabel = record.menuType == 2 ? '按钮/权限' : '菜单名称'

      if (this.model.parentId) {
        if (record.menuType == 2) {
          this.localMenuType = 2
        } else {
          this.localMenuType = 1
        }
      } else {
        this.localMenuType = 0
      }
      //----------------------------------------------------------------------------------------------

      this.visible = true
      this.loadTree()
      let fieldsVal = pick(
        this.model,
        'name',
        'perms',
        'permsType',
        'component',
        'redirect',
        'url',
        'sortNo',
        'menuType',
        'status',
        'appIdentifying',
        'appPath'
      )
      this.$nextTick(() => {
        this.form.setFieldsValue(fieldsVal)
      })
    },
    close() {
      this.$emit('close')
      this.disableSubmit = false
      this.visible = false
    },
    handleOk() {
      const that = this
      // 触发表单验证
      this.form.validateFields((err, values) => {
        if (!err) {
          this.model.alwaysShow = this.alwaysShow
          this.model.appShow = this.appShow
          this.model.hidden = this.menuHidden
          this.model.route = this.routeSwitch
          this.model.keepAlive = this.isKeepalive
          /*update_begin author:wuxianquan date:20190908 for:获取值*/
          this.model.internalOrExternal = this.internalOrExternal
          /*update_end author:wuxianquan date:20190908 for:获取值*/

          let formData = Object.assign(this.model, values)
          if ((formData.menuType == 1 || formData.menuType == 2) && !formData.parentId) {
            that.validateStatus = 'error'
            that.$message.error('请检查你填的类型以及信息是否正确！')
            return
          } else {
            that.validateStatus = 'success'
          }
          if (formData.menuType == 1) {
            var btnAuthoritys = []
            for (let i = 0; i < this.btnAuthoritysOptions.length; i++) {
              const btn = this.btnAuthoritysOptions[i]
              if (this.btnAuthoritys.includes(btn.value)) {
                btnAuthoritys.push(btn)
              }
            }
            formData.btnAuthoritys = btnAuthoritys
          } else {
            formData.btnAuthoritys = []
          }
          that.confirmLoading = true
          console.log(formData)
          let obj
          if (!this.model.id) {
            obj = addPermission(formData)
          } else {
            obj = editPermission(formData)
          }
          obj
            .then((res) => {
              if (res.success) {
                that.$message.success(res.message)
                that.$emit('ok')
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
    validateNumber(rule, value, callback) {
      if (!value || new RegExp(/^[0-9]*[1-9][0-9]*$/).test(value)) {
        callback()
      } else {
        callback('请输入正整数!')
      }
    },
    validatePerms(rule, value, callback) {
      if (value && value.length > 0) {
        //校验授权标识是否存在
        var params = {
          tableName: 'sys_permission',
          fieldName: 'perms',
          fieldVal: value,
          dataId: this.model.id,
        }
        duplicateCheck(params).then((res) => {
          if (res.success) {
            callback()
          } else {
            callback('授权标识已存在!')
          }
        })
      } else {
        callback()
      }
    },
    onChangeMenuType(e) {
      //console.log('localMenuType checked', e.target.value)
      this.localMenuType = e.target.value
      if (e.target.value == 2) {
        this.show = false
        this.menuLabel = '按钮/权限'
      } else {
        this.show = true
        this.menuLabel = '菜单名称'
      }
      this.$nextTick(() => {
        this.form.validateFields(['url', 'component'], { force: true })
      })
    },
    selectIcons() {
      this.isAppIcon = false
      this.iconChooseVisible = true
    },
    selectAppIcons() {
      this.isAppIcon = true
      this.iconChooseVisible = true
    },
    handleIconCancel() {
      this.iconChooseVisible = false
    },
    handleIconChoose(value) {
      console.log(value)
      if (this.isAppIcon) {
        this.model.appIcon = value
        this.form.appIcon = value
      } else {
        this.model.icon = value
        this.form.icon = value
      }
      this.iconChooseVisible = false
    },
    // 根据屏幕变化,设置抽屉尺寸
    resetScreenSize() {
      let screenWidth = document.body.clientWidth
      if (screenWidth < 500) {
        this.drawerWidth = screenWidth
      } else {
        this.drawerWidth = 1000
      }
    },
    initDictConfig() {},
    handleParentIdChange(value) {
      if (!value) {
        this.validateStatus = 'error'
      } else {
        this.validateStatus = 'success'
      }
    },
  },
}
</script>

<style scoped>
</style>