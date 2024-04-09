<template>
  <a-card :bordered="false">
    <a-row>
      <a-col :span="21">
        <a-form
          layout="inline"
        >
          <a-row :gutter="24">
            <a-col :span="24">
              <a-form-item label="客户端">
                <a-select
                  :value="queryParam.clientId"
                  placeholder="请选择客户端"
                  style="width: 170px"
                  @change="(val) => $set(queryParam, 'clientId', val)"
                >
                  <a-select-option
                    v-for="client in clientList"
                    :key="client.id"
                    :value="client.id"
                  >
                  {{ client.name }}
                  </a-select-option>
                </a-select>
              </a-form-item>
              <span class="table-page-search-submitButtons">
                <a-button type="primary" @click="searchQuery" icon="search">查询</a-button>
                <a-button type="primary" @click="searchReset" icon="reload" style="margin-left: 8px">刷新</a-button>
              </span>
            </a-col>
          </a-row>
        </a-form>
        <div style="margin: 20px 0; display: flex; justify-content: space-between">
          <span>版本列表</span>
          <a-button
            type="primary"
            @click="handleAdd('新增')"
            icon="plus"
          >
            新增
          </a-button>
        </div>
        <div>
          <a-table
            ref="table"
            size="middle"
            :scroll="{ x: true, y: 800 }"
            bordered
            rowKey="id"
            :columns="columns"
            :dataSource="dataSource"
            :pagination="ipagination"
            :loading="loading"
            :rowSelection="{ selectedRowKeys: selectedRowKeys, onChange: onSelectChange }"
            @change="handleTableChange"
          >
            
            <template
              slot="action"
              slot-scope="text, record"
            >
              <span>
                <a @click="handleUpdate(record)">编辑</a>
                <a-divider type="vertical" />
                <a-popconfirm
                  title="确定删除吗?"
                  @confirm="() => handleDelete(record.id)"
                >
                  <a>删除</a>
                </a-popconfirm>
              </span>
            </template>
          </a-table>
        </div>
      </a-col>
    </a-row>
    <app-client-version-modal
      ref="modalForm"
      @ok="searchQuery"
    />
  </a-card>
</template>

<script>
import { getAction } from '@/api/manage'
import '@/assets/less/TableExpand.less'
import { mixinDevice } from '@/utils/mixin'
import { JeecgListMixin } from '@/mixins/JeecgListMixin'
import AppClientVersionModal from './modules/AppClientVersionModal'

export default {
  name: 'AppClientVersionList',
  mixins: [JeecgListMixin, mixinDevice],
  components: {
    AppClientVersionModal,
  },
  data() {
    return {
      description: '客户端版本管理',
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
          title: '客户端',
          width: 120,
          align: 'left',
          dataIndex: 'clientName',
        },
        {
          title: '版本',
          width: 80,
          align: 'center',
          dataIndex: 'version',
        },
        {
          title: '状态',
          width: 60,
          align: 'center',
          dataIndex: 'activeTime',
        },
        {
          title: '创建时间',
          width: 200,
          align: 'center',
          dataIndex: 'createTime',
        },
        {
          title: '更新信息',
          width: 260,
          align: 'left',
          dataIndex: 'note',
        },

        {
          title: '操作',
          dataIndex: 'action',
          align: 'center',
          width: 150,
          scopedSlots: { customRender: 'action' },
        },
      ],
      url: {
        list: '/appClient/version/list',
        delete: '/appClient/version/delete',
        clientList: '/appClient/version/clientList',
      },
      superFieldList: [],
      disableMixinCreated: true,
      clientList: [],
      loading:false,
      temp: 0,
    }
  },
  provide() {
    return {
      globalData:this.clientList
    }
  },
  created() {
    // this.getSuperFieldList()
    this.loadClientList()
    this.searchQuery()
  },
  methods: {
    /**
     * @description 获取客户端类型列表
     */
     loadClientList() {
      getAction(this.url.clientList, {pageNo:1,pageSize:50})
        .then((res) => {
          if (res.success) {
            this.clientList = res.result.records
            // this.treeData = res.result.records

          } else {
            this.$message.warning(res.message)
          }
        })
        .finally(() => {
          this.loading = false
        })
    },

    handleAdd(title) {
      this.$refs.modalForm.title = title
      this.$refs.modalForm.edit({},this.clientList)
    },

    handleUpdate(record) {
      console.log(record)
      this.$refs.modalForm.title = '修改'
      this.$refs.modalForm.edit(record,this.clientList)
    },

    getSuperFieldList() {
      let fieldList = []
      fieldList.push({ type: 'int', value: 'code', text: '序号', dictCode: '' })
      fieldList.push({ type: 'string', value: 'clientName', text: '客户端', dictCode: '' })
      fieldList.push({ type: 'string', value: 'version', text: '版本', dictCode: '' })
      fieldList.push({ type: 'string', value: 'activeName', text: '状态', dictCode: '' })
      fieldList.push({ type: 'string', value: 'createTime', text: '创建时间', dictCode: '' })
      fieldList.push({ type: 'string', value: 'note', text: '更新说明', dictCode: '' })
      this.superFieldList = fieldList
    },
  },
}
</script>
<style lang='less' scoped>
@import '~@assets/less/common.less';
/* 单行文本溢出 */
::v-deep.ant-tree-node-content-wrapper {
	overflow: hidden;
	text-overflow: ellipsis;
	lines: 1;
	white-space: nowrap;
	word-break: break-all;
  width: 140px;
}
</style>
