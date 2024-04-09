<template>
  <a-spin :spinning="confirmLoading">
    <j-form-container :disabled="formDisabled">
      <a-form :form="form" slot="detail">
        <a-row>
          <div style="font-size:20px;font-weight:bolder">产品配置</div><br/>
          <a-col :span="12">
            <a-form-item label="产品名称" :labelCol="labelCol" :wrapperCol="wrapperCol">
              <a-input v-decorator="['productName']" placeholder="请输入产品名称"  ></a-input>
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item label="产品logo" :labelCol="labelCol" :wrapperCol="wrapperCol">
              <j-upload v-decorator="['logoFile']" :trigger-change="true"  ></j-upload>
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item label="宣传片" :labelCol="labelCol" :wrapperCol="wrapperCol">
              <j-upload v-decorator="['trailerFile']" :trigger-change="true"  ></j-upload>
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item label="宣传标语" :labelCol="labelCol" :wrapperCol="wrapperCol">
              <a-input v-decorator="['propagandaSlogan']" placeholder="请输入宣传标语"  ></a-input>
            </a-form-item>
          </a-col>
          <div style="font-size:20px;font-weight:bolder">管理端</div><br/>
          <a-col :span="6">
            <a-form-item label="登录页图片" :labelCol="labelCol" :wrapperCol="wrapperCol">
              <j-upload v-decorator="['serverpageFile']" :trigger-change="true"  ></j-upload>
            </a-form-item>
          </a-col>
          <a-col :span="6">
            <a-form-item label="登录页名称" :labelCol="labelCol" :wrapperCol="wrapperCol">
              <j-dict-select-tag type="radio" v-decorator="['loginDisplay']" :trigger-change="true" dictCode="toolbox_xs" placeholder="请选择管理端登录页名称" />
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item label="主页名称" :labelCol="labelCol" :wrapperCol="wrapperCol">
              <j-dict-select-tag type="radio" v-decorator="['homeDisplay']" :trigger-change="true" dictCode="toolbox_xs" placeholder="请选择管理端主页名称" />
            </a-form-item>
          </a-col>
          <div style="font-size:20px;font-weight:bolder">客户端</div><br/>
          <a-col :span="6">
            <a-form-item label="登录页图片" :labelCol="labelCol" :wrapperCol="wrapperCol">
              <j-upload v-decorator="['clientpageFile']" :trigger-change="true"  ></j-upload>
            </a-form-item>
          </a-col>
          <a-col :span="6">
            <a-form-item label="首页背景图片" :labelCol="labelCol" :wrapperCol="wrapperCol">
              <j-upload v-decorator="['homepageFile']" :trigger-change="true"  ></j-upload>
            </a-form-item>
          </a-col>     
          <a-col :span="6">
            <a-form-item label="登录页名称" :labelCol="labelCol" :wrapperCol="wrapperCol">
              <j-dict-select-tag type="radio" v-decorator="['loginClient']" :trigger-change="true" dictCode="toolbox_xs" placeholder="请选择客户端登录页名称" />
            </a-form-item>
          </a-col>
          <a-col :span="6">
            <a-form-item label="主页名称" :labelCol="labelCol" :wrapperCol="wrapperCol">
              <j-dict-select-tag type="radio" v-decorator="['homeClient']" :trigger-change="true" dictCode="toolbox_xs" placeholder="请选择客户端主页名称" />
            </a-form-item>
          </a-col>
          <a-col :span="6">
            <a-form-item label="皮肤配置" :labelCol="labelCol" :wrapperCol="wrapperCol">
              <j-upload v-decorator="['colorProfile']" :trigger-change="true"  ></j-upload>
            </a-form-item>
          </a-col>
          <a-col  :span="24" style="text-align: center">
            <a-button @click="cancelHandel">取消</a-button>
            <a-button @click="submitForm">提交</a-button>
          </a-col>
        </a-row>
      </a-form>
    </j-form-container>
  </a-spin>
</template>

<script>

  import { httpAction, getAction } from '@/api/manage'
  import pick from 'lodash.pick'
  import { validateDuplicateValue } from '@/utils/util'

  export default {
    name: 'ToolboxPersonalizeForm',
    components: {
    },
    props: {
      //流程表单data
      formData: {
        type: Object,
      default: () => {
        return {}
      },
        required: false
      },
      //表单模式：true流程表单 false普通表单
      formBpm: {
        type: Boolean,
        default: false,
        required: false
      },
      //表单禁用
      disabled: {
        type: Boolean,
        default: false,
        required: false
      }
    },
    data () {
      return {
        tablename:'toolbox_personalize',
        form: this.$form.createForm(this),
        model: {},
      labelCol: {
        xs: { span: 24 },
        sm: { span: 6 }
      },
      wrapperCol: {
        xs: { span: 24 },
        sm: { span: 18 }
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
        validatorRules: {
        },
        url: {
          add: "/toolbox/toolboxPersonalize/add",
          edit: "/toolbox/toolboxPersonalize/edit",
          queryById: "/toolbox/toolboxPersonalize/queryById"
        }
      }
    },
    computed: {
      formDisabled(){
        if(this.formBpm===true){
          if(this.formData.disabled===false){
            return false
          }
          return true
        }
        return this.disabled
      },
      showFlowSubmitButton(){
        if(this.formBpm===true){
          if(this.formData.disabled===false){
            return true
          }
        }
        return false
      }
    },
    created () {
      //如果是流程中表单，则需要加载流程表单data
      this.showFlowData();
    },
    methods: {
      add () {
        this.edit({});
      },
      edit (record) {
        this.form.resetFields();
        this.model = Object.assign({}, record);
        this.visible = true;
        this.$nextTick(() => {
          this.form.setFieldsValue(pick(this.model,'productName','logoFile','propagandaSlogan','trailerFile','serverpageFile','clientpageFile','homepageFile','colorProfile','loginDisplay','homeDisplay','loginClient','homeClient'))
        })
      },
      //渲染流程表单数据
      showFlowData(){   
          getAction(this.url.queryById).then((res)=>{
            let { result } = res
          if (result == null) {
            this.model = {}
          } else {
            this.model = result
          }
          this.$nextTick(() => {
          this.form.setFieldsValue(pick(this.model,'productName','logoFile','propagandaSlogan','trailerFile','serverpageFile','clientpageFile','homepageFile','colorProfile','loginDisplay','homeDisplay','loginClient','homeClient'))
        })
          });
        
      },
      close() {
        this.id = null;
        this.visible = false;
      },
      cancelHandel() {
        this.close();
      },
      submitForm () {
        const that = this;
        // 触发表单验证
        this.form.validateFields((err, values) => {
          if (!err) {
            that.confirmLoading = true;
            let httpurl = '';
            let method = '';
            if(!this.model.id){
              httpurl+=this.url.add;
              method = 'post';
            }else{
              httpurl+=this.url.edit;
               method = 'put';
            }
            let formData = Object.assign(this.model, values);
            console.log("表单提交数据",formData)
            httpAction(httpurl,formData,method).then((res)=>{
              if(res.success){
                that.$message.success(res.message);
                var data = method === "post" ? res.result : that.model;
                that.$emit('ok',data);
              }else{
                that.$message.warning(res.message);
              }
            }).finally(() => {
              that.confirmLoading = false;
            })
          }

        })
      },
      popupCallback(row){
        this.form.setFieldsValue(pick(row,'productName','logoFile','propagandaSlogan','trailerFile','serverpageFile','clientpageFile','homepageFile','colorProfile','loginDisplay','homeDisplay','loginClient','homeClient'))
      },
    }
  }
</script>
