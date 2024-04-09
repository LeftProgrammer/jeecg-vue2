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
        v-has="accessControl.tablename + accessControl.add"
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
        :pagination="ipagination"
        :loading="loading"
        :expandedRowKeys="expandedRowKeys"
        @change="handleTableChange"
        @expand="handleExpand"
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
            icon="download"
            size="small"
            @click="downloadFile(text)"
          >
            下载
          </a-button>
        </template>

        <span
          slot="action"
          slot-scope="text, record"
        >
          <a @click="moveUp(record)">上移</a>
          <a @click="moveDown(record)">下移</a>
          <a
            @click="handleEdit(record)"
            v-has="accessControl.tablename + accessControl.edit"
          >
            编辑
          </a>
          <a-divider type="vertical" />
          <a
            @click="handleAddChild(record)"
            v-has="accessControl.tablename + accessControl.add"
            v-if="record.type == '菜单' ? true : false"
          >
            新增分类
          </a>
          <a-popconfirm
            title="确定删除吗?"
            @confirm="() => handleDeleteNode(record.id)"
            placement="topRight"
          >
            <a>删除</a>
          </a-popconfirm>
        </span>
      </a-table>
    </div>

    <toolboxClass-modal
      ref="modalForm"
      @ok="modalFormOk"
    />
  </a-card>
</template>

<script>
import { getAction, postAction, deleteAction } from '@/api/manage'
import { JeecgListMixin } from '@/mixins/JeecgListMixin'
import ToolboxClassModal from './modules/ToolboxClassModal'
import { filterMultiDictText } from '@/components/dict/JDictSelectUtil'
import { filterObj } from '@/utils/util'

export default {
  name: 'ToolboxClassList',
  mixins: [JeecgListMixin],
  components: {
    ToolboxClassModal,
  },
  data() {
    return {
      key: '0',
      description: '菜单分类表管理页面',
      tablename: 'toolbox_class',
      accessControl: {
        tablename: 'ToolboxClass',
      },
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
        // {
        //     title:'序号',
        //     align:"left",
        //     sorter: true,
        //     dataIndex: 'code'
        //   },
        {
          title: '名称',
          align: 'left',
          dataIndex: 'name',
        },
        {
          title: '类型',
          align: 'left',
          dataIndex: 'type',
        },
        {
          title: '是否显示',
          align: 'left',
          dataIndex: 'isVisible_dictText',
          scopedSlots: { customRender: 'isVisible_dictText' },
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
        list: '/toolbox/toolboxClass/rootList',
        childList: '/toolbox/toolboxClass/childList',
        getChildListBatch: '/toolbox/toolboxClass/getChildListBatch',
        delete: '/toolbox/toolboxClass/delete',
        deleteBatch: '/toolbox/toolboxClass/deleteBatch',
        exportXlsUrl: '/toolbox/toolboxClass/exportXls',
        importExcelUrl: 'toolbox/toolboxClass/importExcel',
        move: '/toolbox/toolboxClass/move',
      },
      expandedRowKeys: [],
      hasChildrenField: 'hasChild',
      pidField: 'pid',
      dictOptions: {},
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
      this.key = 1
      let key = this.key
      let id = record.id
      let params = { id, key }
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
      this.key = 2
      let key = this.key
      let id = record.id
      let params = { id, key }
      getAction(this.url.move, params).then((res) => {
        if (res.success) {
          this.$message.info(res.message)
          this.loadData()
        } else {
          this.$message.warning(res.message)
        }
      })
    },
    loadData(arg) {
      if (arg == 1) {
        this.ipagination.current = 1
      }
      this.loading = true
      let params = this.getQueryParams()
      params.hasQuery = 'true'
      getAction(this.url.list, params)
        .then((res) => {
          if (res.success) {
            let result = res.result
            if (Number(result.total) > 0) {
              this.ipagination.total = Number(result.total)
              this.dataSource = this.getDataByResult(res.result.records)
              return this.loadDataByExpandedRows(this.dataSource)
            } else {
              this.ipagination.total = 0
              this.dataSource = []
            }
          } else {
            this.$message.warning(res.message)
          }
        })
        .finally(() => {
          this.loading = false
        })
    },
    // 根据已展开的行查询数据（用于保存后刷新时异步加载子级的数据）
    loadDataByExpandedRows(dataList) {
      if (this.expandedRowKeys.length > 0) {
        return getAction(this.url.getChildListBatch, { parentIds: this.expandedRowKeys.join(',') }).then((res) => {
          if (res.success && res.result.records.length > 0) {
            //已展开的数据批量子节点
            let records = res.result.records
            const listMap = new Map()
            for (let item of records) {
              let pid = item[this.pidField]
              if (this.expandedRowKeys.join(',').includes(pid)) {
                let mapList = listMap.get(pid)
                if (mapList == null) {
                  mapList = []
                }
                mapList.push(item)
                listMap.set(pid, mapList)
              }
            }
            let childrenMap = listMap
            let fn = (list) => {
              if (list) {
                list.forEach((data) => {
                  if (this.expandedRowKeys.includes(data.id)) {
                    data.children = this.getDataByResult(childrenMap.get(data.id))
                    fn(data.children)
                  }
                })
              }
            }
            fn(dataList)
          }
        })
      } else {
        return Promise.resolve()
      }
    },
    getQueryParams(arg) {
      //获取查询条件
      let sqp = {}
      let param = {}
      if (this.superQueryParams) {
        sqp['superQueryParams'] = encodeURI(this.superQueryParams)
        sqp['superQueryMatchType'] = this.superQueryMatchType
      }
      if (arg) {
        param = Object.assign(sqp, this.isorter, this.filters)
      } else {
        param = Object.assign(sqp, this.queryParam, this.isorter, this.filters)
      }
      if (JSON.stringify(this.queryParam) === '{}' || arg) {
        param.hasQuery = 'false'
      } else {
        param.hasQuery = 'true'
      }
      param.field = this.getQueryField()
      param.pageNo = this.ipagination.current
      param.pageSize = this.ipagination.pageSize
      return filterObj(param)
    },
    searchReset() {
      //重置
      this.expandedRowKeys = []
      this.queryParam = {}
      this.loadData(1)
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
    handleDeleteNode(id) {
      if (!this.url.delete) {
        this.$message.error('请设置url.delete属性!')
        return
      }
      var that = this
      deleteAction(that.url.delete, { id: id }).then((res) => {
        if (res.success) {
          that.loadData(1)
        } else {
          that.$message.warning(res.message)
        }
      })
    },
    batchDel() {
      if (this.selectedRowKeys.length <= 0) {
        this.$message.warning('请选择一条记录！')
        return false
      } else {
        let ids = ''
        let that = this
        that.selectedRowKeys.forEach(function (val) {
          ids += val + ','
        })
        that.$confirm({
          title: '确认删除',
          content: '是否删除选中数据?',
          onOk: function () {
            that.handleDeleteNode(ids)
            that.onClearSelected()
          },
        })
      }
    },
    getSuperFieldList() {
      let fieldList = []
      fieldList.push({ type: 'string', value: 'pid', text: '父级节点', dictCode: '' })
      fieldList.push({ type: 'int', value: 'code', text: '序号', dictCode: '' })
      fieldList.push({ type: 'string', value: 'name', text: '名称', dictCode: '' })
      fieldList.push({ type: 'string', value: 'type', text: '类型（菜单、分类）', dictCode: '' })
      fieldList.push({ type: 'string', value: 'isVisible', text: '是否显示', dictCode: 'toolbox_xs' })
      this.superFieldList = fieldList
    },
  },
}
</script>
<style scoped>
@import '~@assets/less/common.less';

</style>