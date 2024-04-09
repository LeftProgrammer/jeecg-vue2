<template>
  <a-card :bordered="false">
    <!-- 查询区域 -->
    <div class="table-page-search-wrapper">
      <a-form
        layout="inline"
        @keyup.enter.native="searchQuery"
      >
        <a-row :gutter="24">
          <a-col :span="24" />
        </a-row>
      </a-form>
    </div>
    <!-- 查询区域-END -->

    <!-- 操作按钮区域 -->
    <div class="table-operator">
      <a-button
        @click="handleAdd('添加分类管理记录表')"
        type="primary"
      >
        添加分类管理记录表
      </a-button>
      <a-button
        type="primary"
        icon="download"
        @click="handleExportXls('分类管理记录表')"
      >
        导出
      </a-button>
      <a-upload
        name="file"
        :showUploadList="false"
        :multiple="false"
        :headers="tokenHeader"
        :action="importExcelUrl"
        @change="handleImportExcel"
      >
        <a-button
          type="primary"
          icon="import"
        >
          导入
        </a-button>
      </a-upload>
      <j-super-query
        :fieldList="superFieldList"
        ref="superQueryModal"
        @handleSuperQuery="handleSuperQuery"
      />
      <a-dropdown v-if="selectedRowKeys.length > 0">
        <a-menu slot="overlay">
          <a-menu-item
            key="1"
            @click="batchDel"
          >
            <a-icon type="delete" />
            删除
          </a-menu-item>
        </a-menu>
        <a-button style="margin-left: 8px">
          批量操作
          <a-icon type="down" />
        </a-button>
      </a-dropdown>
    </div>

    <!-- table区域-begin -->
    <div>
      <div
        class="ant-alert ant-alert-info"
        style="margin-bottom: 16px"
      >
        <i class="anticon anticon-info-circle ant-alert-icon" />
        已选择
        <a style="font-weight: 600">
          {{ selectedRowKeys.length }}
        </a>
        项
        <a
          style="margin-left: 24px"
          @click="onClearSelected"
        >
          清空
        </a>
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
        <template
          slot="htmlSlot"
          slot-scope="text"
        >
          <div v-html="text" />
        </template>
        <template
          slot="imgSlot"
          slot-scope="text"
        >
          <span
            v-if="!text"
            style="font-size: 12px; font-style: italic"
          >
            无图片
          </span>
          <img
            v-else
            :src="getImgView(text)"
            height="25px"
            alt=""
            style="max-width: 80px; font-size: 12px; font-style: italic"
          />
        </template>
        <template
          slot="fileSlot"
          slot-scope="text"
        >
          <span
            v-if="!text"
            style="font-size: 12px; font-style: italic"
          >
            无文件
          </span>
          <a-button
            v-else
            :ghost="true"
            type="primary"
            icon="eye"
            size="small"
            @click="previewFile(text)"
          >
            预览
          </a-button>
        </template>

        <template
          slot="action"
          slot-scope="text, record"
        >
          <span v-if="!record.bpmStatus || record.bpmStatus === '1'">
            <a @click="handleEdit(record)">编辑</a>
            <a-divider type="vertical" />
            <a-popconfirm
              title="确定删除吗?"
              @confirm="() => handleDelete(record.id)"
            >
              <a>删除</a>
            </a-popconfirm>
          </span>
          <span v-else>
            <a
              href="javascript:;"
              @click="handleDetail(record)"
            >
              详情
            </a>
          </span>
        </template>
      </a-table>
    </div>

    <toolbox-classify-modal
      ref="modalForm"
      @ok="modalFormOk"
    />
  </a-card>
</template>

<script>
import '@/assets/less/TableExpand.less'
import { mixinDevice } from '@/utils/mixin'
import { JeecgListMixin } from '@/mixins/JeecgListMixin'
import ToolboxClassifyModal from './modules/ToolboxClassifyModal'

export default {
  name: 'ToolboxClassifyList',
  mixins: [JeecgListMixin, mixinDevice],
  components: {
    ToolboxClassifyModal,
  },
  data() {
    return {
      description: '分类管理记录表管理页面',
      tablename: 'toolbox_classify',
      accessControl: {
        tablename: 'ToolboxClassify',
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
        // 暂时去掉
        // {
        //   title:'编号',
        //   align:"center",
        //   dataIndex: 'code'
        // },
        {
          title: '名称',
          align: 'center',
          dataIndex: 'name',
        },
        {
          title: '所属菜单',
          align: 'center',
          dataIndex: 'memuId_dictText',
        },
        {
          title: '标签',
          align: 'center',
          dataIndex: 'labels_dictText',
        },
        {
          title: '排序',
          align: 'center',
          dataIndex: 'sortNo',
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
        list: '/toolbox/toolboxClassify/list',
        delete: '/toolbox/toolboxClassify/delete',
        deleteBatch: '/toolbox/toolboxClassify/deleteBatch',
        exportXlsUrl: '/toolbox/toolboxClassify/exportXls',
        importExcelUrl: 'toolbox/toolboxClassify/importExcel',
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
      return `${window._CONFIG.domianURL}/${this.url.importExcelUrl}`
    },
  },
  methods: {
    getSuperFieldList() {
      let fieldList = []
      fieldList.push({ type: 'string', value: 'code', text: '编号', dictCode: '' })
      fieldList.push({ type: 'string', value: 'name', text: '名称', dictCode: '' })
      fieldList.push({
        type: 'sel_search',
        value: 'memuId',
        text: '所属菜单',
        dictTable: 'toolbox_menu',
        dictText: 'name',
        dictCode: 'id',
      })
      fieldList.push({
        type: 'list_multi',
        value: 'labels',
        text: '标签',
        dictTable: '',
        dictText: '',
        dictCode: 'toolbox_bqlx',
      })
      fieldList.push({ type: 'double', value: 'sortNo', text: '排序', dictCode: '' })
      this.superFieldList = fieldList
    },
  },
}
</script>
<style scoped>
@import '~@assets/less/common.less';
</style>
