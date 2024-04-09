<template>
  <a-card :bordered="false">
    <!-- 查询区域 -->
    <div class="table-page-search-wrapper">
      <a-form layout="inline" @keyup.enter.native="searchQuery">
        <a-row :gutter="24">
          <a-col :span="24"> </a-col>
        </a-row>
      </a-form>
    </div>
    <!-- 查询区域-END -->

    <!-- 操作按钮区域 -->
    <div class="table-operator">
      <a-button
        @click="handleAdd('添加sys_attachment')"
        type="primary"
        v-has="accessControl.tablename + accessControl.add"
        >添加sys_attachment</a-button
      >
      <a-button
        type="primary"
        icon="download"
        @click="handleExportXls('sys_attachment')"
        v-has="accessControl.tablename + accessControl.export"
        >导出</a-button
      >
      <a-upload
        name="file"
        :showUploadList="false"
        :multiple="false"
        :headers="tokenHeader"
        :action="importExcelUrl"
        @change="handleImportExcel"
        v-has="accessControl.tablename + accessControl.import"
      >
        <a-button type="primary" icon="import">导入</a-button>
      </a-upload>
      <j-super-query
        :fieldList="superFieldList"
        ref="superQueryModal"
        @handleSuperQuery="handleSuperQuery"
      ></j-super-query>
    </div>

    <!-- table区域-begin -->
    <div>
      <div class="ant-alert ant-alert-info" style="margin-bottom: 16px">
        <i class="anticon anticon-info-circle ant-alert-icon"></i> 已选择
        <a style="font-weight: 600">{{ selectedRowKeys.length }}</a
        >项
        <a style="margin-left: 24px" @click="onClearSelected">清空</a>
      </div>

      <a-table
        ref="table"
        size="middle"
        :scroll="{ x: true }"
        bordered
        rowKey="id"
        :columns="columns"
        :dataSource="dataSource"
        :pagination="ipagination"
        :loading="loading"
        :rowSelection="{ selectedRowKeys: selectedRowKeys, onChange: onSelectChange }"
        class="j-table-force-nowrap"
        @change="handleTableChange"
      >
        <template slot="htmlSlot" slot-scope="text">
          <div v-html="text"></div>
        </template>
        <template slot="imgSlot" slot-scope="text">
          <span v-if="!text" style="font-size: 12px; font-style: italic">无图片</span>
          <img
            v-else
            :src="getImgView(text)"
            height="25px"
            alt=""
            style="max-width: 80px; font-size: 12px; font-style: italic"
          />
        </template>
        <template slot="fileSlot" slot-scope="text">
          <span v-if="!text" style="font-size: 12px; font-style: italic">无文件</span>
          <a-button v-else :ghost="true" type="primary" icon="download" size="small" @click="downloadFile(text)">
            下载
          </a-button>
        </template>
        <template slot="action" slot-scope="text, record">
          <span>
            <a href="javascript:;" @click="handleDetail(record)">详情</a>
          </span>
        </template>
      </a-table>
    </div>
  </a-card>
</template>

<script>
import '@/assets/less/TableExpand.less'
import { mixinDevice } from '@/utils/mixin'
import { JeecgListMixin } from '@/mixins/JeecgListMixin'

export default {
  name: 'SysAttachmentList',
  mixins: [JeecgListMixin, mixinDevice],
  components: {},
  data() {
    return {
      description: 'sys_attachment管理页面',
      accessControl: {
        tablename: 'SysAttachment',
      },
      // 表头
      columns: [
        {
          title: '#',
          dataIndex: '',
          key: 'rowIndex',
          width: 60,
          align: 'center',
          customRender: function (t, r, index) {
            return parseInt(index) + 1
          },
        },
        {
          title: '对应业务的ID',
          align: 'center',
          dataIndex: 'businessId',
        },
        {
          title: '模块、资源编码',
          align: 'center',
          dataIndex: 'resCode',
        },
        {
          title: '字段编码',
          align: 'center',
          dataIndex: 'fileCode',
        },
        {
          title: '文件名称',
          align: 'center',
          dataIndex: 'fileName',
        },
        {
          title: '文件大小',
          align: 'center',
          dataIndex: 'fileSize',
        },
        {
          title: '文件类型',
          align: 'center',
          dataIndex: 'fileType',
        },
        {
          title: '文件路径',
          align: 'center',
          dataIndex: 'filePath',
        },
        {
          title: '文件md5附件',
          align: 'center',
          dataIndex: 'fileMd5',
        },
        {
          title: '下载次数',
          align: 'center',
          dataIndex: 'downLoadAmount',
        },
        {
          title: '排序',
          align: 'center',
          dataIndex: 'sortNo',
        },
        {
          title: '是否已删除（0：未删除，1：已删除）',
          align: 'center',
          dataIndex: 'isDeleted',
        },
        {
          title: '操作',
          dataIndex: 'action',
          align: 'center',
          fixed: 'right',
          width: 147,
          scopedSlots: { customRender: 'action' },
        },
      ],
      url: {
        list: '/system/sysAttachment/list',
        delete: '/system/sysAttachment/delete',
        deleteBatch: '/system/sysAttachment/deleteBatch',
        exportXlsUrl: '/system/sysAttachment/exportXls',
        importExcelUrl: '/system/sysAttachment/importExcel',
      },
      dictOptions: {},
      superFieldList: [],
    }
  },
  created() {
    this.getSuperFieldList()
  },
  computed: {
    importExcelUrl: function () {
      return `${window._CONFIG['domianURL']}/${this.url.importExcelUrl}`
    },
  },
  methods: {
    initDictConfig() {},
    getSuperFieldList() {
      let fieldList = []
      fieldList.push({ type: 'string', value: 'businessId', text: '对应业务的ID' })
      fieldList.push({ type: 'string', value: 'resCode', text: '模块、资源编码' })
      fieldList.push({ type: 'string', value: 'fileCode', text: '字段编码' })
      fieldList.push({ type: 'string', value: 'fileName', text: '文件名称' })
      fieldList.push({ type: 'int', value: 'fileSize', text: '文件大小' })
      fieldList.push({ type: 'string', value: 'fileType', text: '文件类型' })
      fieldList.push({ type: 'string', value: 'filePath', text: '文件路径' })
      fieldList.push({ type: 'string', value: 'fileMd5', text: '文件md5附件' })
      fieldList.push({ type: 'int', value: 'downLoadAmount', text: '下载次数' })
      fieldList.push({ type: 'int', value: 'sortNo', text: '排序' })
      fieldList.push({ type: 'int', value: 'isDeleted', text: '是否已删除（0：未删除，1：已删除）' })
      this.superFieldList = fieldList
    },
  },
}
</script>
<style scoped>
@import '~@assets/less/common.less';
</style>