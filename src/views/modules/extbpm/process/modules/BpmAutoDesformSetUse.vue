<template>
  <a-modal
    :title="title"
    :width="800"
    :visible="visible"
    :confirmLoading="confirmLoading"
    @ok="handleOk"
    @cancel="handleCancel"
    cancelText="关闭">

    <a-spin :spinning="confirmLoading">
      <a-form :form="form">
        <a-form-item label=''>
          <template v-if="processTypeDictOptions.length>0">
            <a-checkbox-group @change="designNameChange" v-model="designNameValue" style="width: 100%">
              <template v-for="item of processTypeDictOptions">
                <a-col :xl="24" :lg="24" :md="24" :sm="24" :xs="24">
                  <a-card :loading="loading" :title="item.text" :style="{ marginTop: '12px',height:'auto' }" :headStyle="{ backgroundColor:'#eaeaea' }">
                    <a-row>
                      <template v-for="(des) in designNameOption">
                        <template v-if="des.procType == item.value">
                          <a-col :span="6">
                            <a-checkbox :value="des.value">{{ des.text }}</a-checkbox>
                          </a-col>
                        </template>
                      </template>
                    </a-row>
                  </a-card>
                </a-col>
              </template>
            </a-checkbox-group>
          </template>
        </a-form-item>

      </a-form>
    </a-spin>
    <div class="drawer-bootom-button">
      <a-dropdown style="float: left" :trigger="['click']" placement="topCenter">
        <a-menu slot="overlay">
          <a-menu-item key="1" @click="checkALL">全部勾选</a-menu-item>
          <a-menu-item key="2" @click="cancelCheckALL">取消全选</a-menu-item>
        </a-menu>
        <a-button>
          树操作 <a-icon type="up" />
        </a-button>
      </a-dropdown>
    </div>
  </a-modal>
</template>

<script>
  import {httpAction, getAction} from '@/api/manage'
  import  JEllipsis  from '@/components/jeecg/JEllipsis'
  import {initDictOptions} from '@/components/dict/JDictSelectUtil'

  export default {
    name: "BpmAutoDesformSetUse",
    components: {
      JEllipsis
    },
    data() {
      return {
        title: "常用流程设置",
        visible: false,
        model: {},
        labelCol: {
          xs: {span: 24},
          sm: {span: 5},
        },
        wrapperCol: {
          xs: {span: 24},
          sm: {span: 16},
        },
        confirmLoading: false,
        form: this.$form.createForm(this),
        validatorRules: {},
        url: {
          add: "/joa/designform/designFormCommuse/commUseDesignAdd",
          roleDegisnList:"/joa/designform/designFormCommuse/roleDegisnList",
          commUseList:"/joa/designform/designFormCommuse/getCommuseByUserId"
        },
        designNameOption: [],
        roleId: "",
        newDesignId:"",
        oldDessignId:"",
        designNameValue:[],
        processTypeDictOptions:[],
        desformList: [],
      }
    },
    created() {
      this.loadDesformList();
    },
    methods: {
      add() {
        this.edit({});
      },
      edit(record) {
        this.roleId = record;
        this.form.resetFields();
        this.model = Object.assign({}, record);
        var designName = [];
        for (let value of this.desformList) {
          designName.push({
            value: value.id,
            text: value.desformName,
            procType:value.procType,
          })
        }
        this.designNameOption = designName;
        this.visible = true;
        getAction(this.url.commUseList).then((res) => {
          if (res.success) {
            var designName = [];
            for (let value of res.result) {
              designName.push(value.id)
            }
            this.oldDessignId=designName.join(",");
            this.designNameValue = designName;
            this.newDesignId = designName.join(",");
          }
        });
      },
      close() {
        this.$emit('close');
        this.visible = false;
      },
      handleOk() {
        const that = this;
        // 触发表单验证
        that.confirmLoading = true;
        let  httpurl = this.url.add;
        let  method = 'post';
        let formData = Object.assign(this.model, {});
        //时间格式化
        // formData.roleId = this.roleId;
        formData.newDesignId=this.newDesignId;
        formData.oldDessignId=this.oldDessignId;
        httpAction(httpurl, formData, method).then((res) => {
          if (res.success) {
            that.$message.success(res.message);
            that.$emit('reload');
            that.$emit('ok');
          } else {
            that.$message.warning(res.message);
          }
        }).finally(() => {
          that.confirmLoading = false;
          that.close();
        })
      },
      handleCancel() {
        this.designNameOption=[];
        this.designNameValue=[];
        this.close()
      },
      designNameChange(selectedValue) {
        this.newDesignId=selectedValue.join(",");
      },
      checkALL(){
        var designName = [];
        for (let value of this.desformList) {
          designName.push(
            value.id
          )
        }
        this.designNameValue = designName;
        this.newDesignId=designName.join(",");
      },
      cancelCheckALL(){
        this.designNameValue=[];
        this.newDesignId="";
      },
      /** 加载desform */
      async loadDesformList() {
        this.loading = true
        var processTypeDict = [];
        let dictRes =  await initDictOptions('bpm_process_type');
        if (dictRes.success) {
          processTypeDict = dictRes.result;
        }
        let res =   await getAction(this.url.roleDegisnList, {});
        if (res.success) {
          this.desformList = res.result
        }
        this.processTypeDictOptions = processTypeDict.filter(item => {
          for (var item2 of this.desformList) {
            if(item2.procType == item.value){
              return true;
            }
          }
          return false;
        });
        this.loading = false;
      },
    }
  }
</script>

<style lang="less" scoped>
  .drawer-bootom-button {
    position: absolute;
    bottom: 0;
    width: 100%;
    border-top: 1px solid #e8e8e8;
    padding: 16px 16px;
    text-align: right;
    left: 0;
    background: #fff;
    border-radius: 0 0 2px 2px;
  }
</style>