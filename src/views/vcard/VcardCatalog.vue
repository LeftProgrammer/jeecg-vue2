<template>
  <a-card :bordered="false">
    <!-- 查询区域 -->
    <!-- <div class="table-page-search-wrapper">
      <a-form layout="inline" @keyup.enter.native="searchQuery">
        <a-row :gutter="24">
           <a-col :span="24">
          </a-col>
        </a-row>
      </a-form>
    </div> -->
    <!-- 查询区域-END -->

    <!-- 操作按钮区域 -->
    <div class="table-operator">
      <a-button
        @click="handleAdd"
        type="primary"
      >
        新增
      </a-button>
    </div>

    <!-- table区域-begin -->
    <div>
      <!-- <div class="ant-alert ant-alert-info" style="margin-bottom: 16px;">
        <i class="anticon anticon-info-circle ant-alert-icon"></i> 已选择 <a style="font-weight: 600">{{ selectedRowKeys.length }}</a>项
        <a style="margin-left: 24px" @click="onClearSelected">清空</a>
      </div> -->

      <a-table
        ref="table"
        size="middle"
        rowKey="id"
        :scroll="{ x: true }"
        :columns="columns"
        :dataSource="dataSource"
        :loading="loading"
        :expandedRowKeys="expandedRowKeys"
        @change="handleTableChange"
        v-bind="tableProps"
      >
        <template
          slot="htmlSlot"
          slot-scope="text"
        >
          <div v-html="text"></div>
        </template>
        <template
          slot="isVisible_dictText"
          slot-scope="text"
        >
          {{ text == '是' ? '√' : '' }}
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
        

        <span
          slot="action"
          slot-scope="text, record"
        >
          <a @click="moveUp(record)">上移</a>
          <a @click="moveDown(record)">下移</a>
          <a
            @click="handleEdit(record)"
          >
            编辑
          </a>
          <a-divider type="vertical" />
          <a
            @click="handleAddChild(record)"
            v-if="record.catalogId == 0 ? true : false"
          >
            新增分类
          </a>
          <a-popconfirm
            title="确定删除吗?"
            @confirm="() => handleDeleteNode(record.id,record.catalogId)"
            placement="topRight"
          >
            <a>删除</a>
          </a-popconfirm>
        </span>
      </a-table>
    </div>

    <vcard-catalog-modal
      ref="modalForm"
      @ok="modalFormOk"
    />
  </a-card>
</template>

<script>
import { getAction, postAction, deleteAction } from '@/api/manage'
import { JeecgListMixin } from '@/mixins/JeecgListMixin'
import VcardCatalogModal from './modules/VcardCatalogModal'
import { filterMultiDictText } from '@/components/dict/JDictSelectUtil'
import { filterObj } from '@/utils/util'

export default {
  name: 'VcardCatalog',
  mixins: [JeecgListMixin],
  components: {
    VcardCatalogModal,
  },
  data() {
    return {
      key: '0',
      description: '目录管理页面',
      tablename: 'vcard_catalog',
      // 表头
      columns: [
        {
          title: '序号',
          dataIndex: '',
          key: 'rowIndex',
          width: 60,
          align: 'center',
          customRender: function (t, r, index) {
            return parseInt(index) + 1
          },
        },
        {
          title: '名称',
          align: 'left',
          dataIndex: 'name',
        },
        {
          title: '副标题',
          align: 'left',
          dataIndex: 'subTitle',
        },

        {
          title: '操作',
          dataIndex: 'action',
          align: 'center',
          width: 247,
          scopedSlots: { customRender: 'action' },
        },
      ],
      url: {
        list: '/vcard/catalog/all',
        delete: '/vcard/catalog/delete',
        move: '/vcard/catalog/move',
      },
      expandedRowKeys: [],
      hasChildrenField: 'hasChild',
      pidField: 'catalogId',
      loadParent: false,
      superFieldList: [],
    }
  },
  created() {
    this.getSuperFieldList()
  },
  computed: {
    importExcelUrl() {
      return `${window._CONFIG.domianURL}/${this.url.importExcelUrl}`
    },
    tableProps() {
      let _this = this
      return {
        // 列表项是否可选择
        rowSelection: {
          selectedRowKeys: _this.selectedRowKeys,
          onChange: (selectedRowKeys) => (_this.selectedRowKeys = selectedRowKeys),
        },
      }
    },
  },
  methods: {
    moveUp(record) {
      debugger
      let key = 1
      let id = record.id
      let pid = record.catalogId
      let params = { id, pid, key }
      debugger
      getAction(this.url.move, params).then((res) => {
        debugger
        if (res.success) {
          this.$message.info(res.message)
          this.loadData()
        } else {
          this.$message.warning(res.message)
        }
      })
    },
    moveDown(record) {
      let key = 2
      let id = record.id
      let pid = record.catalogId
      let params = { id, pid, key }
      getAction(this.url.move, params).then((res) => {
        if (res.success) {
          this.$message.info(res.message)
          this.loadData()
        } else {
          this.$message.warning(res.message)
        }
      })
    },
    loadData() {
      this.loading = true
      getAction(this.url.list)
        .then((res) => {
          if (res.success) {
            this.dataSource = res.result
          } else {
            this.$message.warning(res.message)
          }
        })
        .finally(() => {
          this.loading = false
        })
    },
    getDataByResult(result) {
      if (result) {
        return result.map((item) => {
          //判断是否标记了带有子节点
          if (item[this.hasChildrenField] == '1') {
            let loadChild = { id: item.id + '_loadChild', name: 'loading...', isLoading: true }
            item.children = [loadChild]
          }
          return item
        })
      }
    },
    handleExpand(expanded, record) {
      // 判断是否是展开状态
      if (expanded) {
        this.expandedRowKeys.push(record.id)
        if (record.children.length > 0 && record.children[0].isLoading === true) {
          let params = this.getQueryParams(1) //查询条件
          params[this.pidField] = record.id
          params.hasQuery = 'false'
          params.superQueryParams = ''
          getAction(this.url.childList, params).then((res) => {
            if (res.success) {
              if (res.result.records) {
                record.children = this.getDataByResult(res.result.records)
                this.dataSource = [...this.dataSource]
              } else {
                record.children = ''
                record.hasChildrenField = '0'
              }
            } else {
              this.$message.warning(res.message)
            }
          })
        }
      } else {
        let keyIndex = this.expandedRowKeys.indexOf(record.id)
        if (keyIndex >= 0) {
          this.expandedRowKeys.splice(keyIndex, 1)
        }
      }
    },
    handleAddChild(record) {
      this.loadParent = true
      let obj = {}
      obj[this.pidField] = record['id']
      this.$refs.modalForm.add(obj)
    },
    handleDeleteNode(id, pid) {
      if (!this.url.delete) {
        this.$message.error('请设置url.delete属性!')
        return
      }
      var that = this
      console.log(pid)
      postAction(that.url.delete, { id: id , catalogId: pid}).then((res) => {
        if (res.success) {
          that.loadData()
        } else {
          that.$message.warning(res.message)
        }
      })
    },
    
    getSuperFieldList() {
      let fieldList = []
      fieldList.push({ type: 'int', value: 'code', text: '序号', dictCode: '' })
      fieldList.push({ type: 'string', value: 'name', text: '名称', dictCode: '' })
      fieldList.push({ type: 'string', value: 'subTitle', text: '副标题', dictCode: '' })
      this.superFieldList = fieldList
    },
  },
}
</script>
<style scoped>
@import '~@assets/less/common.less';

</style>