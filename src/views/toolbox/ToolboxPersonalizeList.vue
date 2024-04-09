<template>
  <a-card :bordered="false">
    <!-- 查询区域 -->
    <div class="table-page-search-wrapper">
      <a-form layout="inline" @keyup.enter.native="searchQuery">
        <a-row :gutter="24">
           <a-col :span="24">
          </a-col>
        </a-row>
      </a-form>
    </div>
    <!-- 查询区域-END -->

    <!-- 操作按钮区域 -->
    <div class="table-operator">
      <a-button @click="handleAdd('添加个性化配置表')" type="primary" v-has="accessControl.tablename + accessControl.add">添加个性化配置表</a-button>
      <a-button type="primary" icon="download" @click="handleExportXls('个性化配置表')" v-has="accessControl.tablename + accessControl.export">导出</a-button>
      <a-upload name="file" :showUploadList="false" :multiple="false" :headers="tokenHeader" :action="importExcelUrl" @change="handleImportExcel" v-has="accessControl.tablename + accessControl.import">
        <a-button type="primary" icon="import">导入</a-button>
      </a-upload>
      <j-super-query :fieldList="superFieldList" ref="superQueryModal" @handleSuperQuery="handleSuperQuery"></j-super-query>
      <a-dropdown v-if="selectedRowKeys.length > 0" v-has="accessControl.tablename + accessControl.batch_delete" >
        <a-menu slot="overlay">
          <a-menu-item key="1" @click="batchDel"><a-icon type="delete"/>删除</a-menu-item>
        </a-menu>
        <a-button style="margin-left: 8px"> 批量操作 <a-icon type="down" /></a-button>
      </a-dropdown>
    </div>

    <!-- table区域-begin -->
    <div>
      <div class="ant-alert ant-alert-info" style="margin-bottom: 16px;">
        <i class="anticon anticon-info-circle ant-alert-icon"></i> 已选择 <a style="font-weight: 600">{{ selectedRowKeys.length }}</a>项
        <a style="margin-left: 24px" @click="onClearSelected">清空</a>
      </div>

      <a-table
        ref="table"
        size="middle"
        :scroll="{x:true}"
        bordered
        rowKey="id"
        :columns="columns"
        :dataSource="dataSource"
        :pagination="ipagination"
        :loading="loading"
        :rowSelection="{selectedRowKeys: selectedRowKeys, onChange: onSelectChange}"
        class="j-table-force-nowrap"
        @change="handleTableChange">

        <template slot="htmlSlot" slot-scope="text">
          <div v-html="text"></div>
        </template>
        <template slot="imgSlot" slot-scope="text">
          <span v-if="!text" style="font-size: 12px;font-style: italic;">无图片</span>
          <img v-else :src="getImgView(text)" height="25px" alt="" style="max-width:80px;font-size: 12px;font-style: italic;"/>
        </template>
        <template slot="fileSlot" slot-scope="text">
          <span v-if="!text" style="font-size: 12px;font-style: italic;">无文件</span>
          <a-button
            v-else
            :ghost="true"
            type="primary"
            icon="eye"
            size="small"
            @click="previewFile(text)">
            预览
          </a-button>
        </template>

        <template slot="action" slot-scope="text, record">
          <span v-if="!record.bpmStatus||record.bpmStatus === '1'">
             <a @click="handleEdit(record)" v-has="accessControl.tablename + accessControl.edit">编辑</a>
             <a-divider type="vertical"/>
             <a-popconfirm title="确定删除吗?" @confirm="() => handleDelete(record.id)" v-has="accessControl.tablename + accessControl.delete" >
                <a>删除</a>
             </a-popconfirm>
          </span>
          <span v-else>
            <a href="javascript:;" @click="handleDetail(record)">详情</a>
          </span>
        </template>
      </a-table>
    </div>

    <toolbox-personalize-modal
      ref="modalForm"
      @ok="modalFormOk"
    />
  </a-card>
</template>

<script>

  import '@/assets/less/TableExpand.less'
  import { mixinDevice } from '@/utils/mixin'
  import { JeecgListMixin } from '@/mixins/JeecgListMixin'
  import ToolboxPersonalizeModal from './modules/ToolboxPersonalizeModal'
  import {filterMultiDictText} from '@/components/dict/JDictSelectUtil'

  export default {
    name: 'ToolboxPersonalizeList',
    mixins:[JeecgListMixin, mixinDevice],
    components: {
      ToolboxPersonalizeModal
    },
    data () {
      return {
        description: '个性化配置表管理页面',
        tablename:'toolbox_personalize',
        accessControl: {
          tablename: 'ToolboxPersonalize',
        },
        // 表头
        columns: [
          {
            title: '#',
            dataIndex: '',
            key:'rowIndex',
            width:60,
            align:"center",
            customRender:function (t,r,index) {
              return parseInt(index)+1;
            }
          },
          {
            title:'产品名称',
            align:"center",
            dataIndex: 'productName'
          },
          {
            title:'产品logo',
            align:"center",
            dataIndex: 'logoFile',
            scopedSlots: {customRender: 'fileSlot'}
          },
          {
            title:'宣传标语',
            align:"center",
            dataIndex: 'propagandaSlogan'
          },
          {
            title:'宣传片',
            align:"center",
            dataIndex: 'trailerFile',
            scopedSlots: {customRender: 'fileSlot'}
          },
          {
            title:'登录页图片(管理端)',
            align:"center",
            dataIndex: 'serverpageFile',
            scopedSlots: {customRender: 'fileSlot'}
          },
          {
            title:'登录页图片(客户端)',
            align:"center",
            dataIndex: 'clientpageFile',
            scopedSlots: {customRender: 'fileSlot'}
          },
          {
            title:'首页背景图片(客户端)',
            align:"center",
            dataIndex: 'homepageFile',
            scopedSlots: {customRender: 'fileSlot'}
          },
          {
            title:'皮肤配置',
            align:"center",
            dataIndex: 'colorProfile',
            scopedSlots: {customRender: 'fileSlot'}
          },
          {
            title:'管理端登录页名称',
            align:"center",
            dataIndex: 'loginDisplay_dictText'
          },
          {
            title:'管理端主页名称',
            align:"center",
            dataIndex: 'homeDisplay_dictText'
          },
          {
            title:'客户端登录页名称',
            align:"center",
            dataIndex: 'loginClient_dictText'
          },
          {
            title:'客户端主页名称',
            align:"center",
            dataIndex: 'homeClient_dictText'
          },
          {
            title: '操作',
            dataIndex: 'action',
            align:"center",
            fixed:"right",
            width:147,
            scopedSlots: { customRender: 'action' }
          }
        ],
        url: {
          list: "/toolbox/toolboxPersonalize/list",
          delete: "/toolbox/toolboxPersonalize/delete",
          deleteBatch: "/toolbox/toolboxPersonalize/deleteBatch",
          exportXlsUrl: "/toolbox/toolboxPersonalize/exportXls",
          importExcelUrl: "toolbox/toolboxPersonalize/importExcel",
          
        },
        dictOptions:{},
        superFieldList:[],
      }
    },
    created() {
    this.getSuperFieldList();
    },
    computed: {
      importExcelUrl: function(){
        return `${window._CONFIG.domianURL}/${this.url.importExcelUrl}`;
      },
    },
    methods: {
      initDictConfig(){
      },
      getSuperFieldList(){
        let fieldList=[];
        fieldList.push({type:'string',value:'productName',text:'产品名称',dictCode:''})
        fieldList.push({type:'string',value:'logoFile',text:'产品logo',dictCode:''})
        fieldList.push({type:'string',value:'propagandaSlogan',text:'宣传标语',dictCode:''})
        fieldList.push({type:'string',value:'trailerFile',text:'宣传片',dictCode:''})
        fieldList.push({type:'string',value:'serverpageFile',text:'登录页图片(管理端)',dictCode:''})
        fieldList.push({type:'string',value:'clientpageFile',text:'登录页图片(客户端)',dictCode:''})
        fieldList.push({type:'string',value:'homepageFile',text:'首页背景图片(客户端)',dictCode:''})
        fieldList.push({type:'string',value:'colorProfile',text:'皮肤配置',dictCode:''})
        fieldList.push({type:'string',value:'loginDisplay',text:'管理端登录页名称',dictCode:'toolbox_xs'})
        fieldList.push({type:'string',value:'homeDisplay',text:'管理端主页名称',dictCode:'toolbox_xs'})
        fieldList.push({type:'string',value:'loginClient',text:'客户端登录页名称',dictCode:'toolbox_xs'})
        fieldList.push({type:'string',value:'homeClient',text:'客户端主页名称',dictCode:'toolbox_xs'})
        this.superFieldList = fieldList
      }
    }
  }
</script>
<style scoped>
  @import '~@assets/less/common.less';
</style>