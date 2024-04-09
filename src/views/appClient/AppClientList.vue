<template>
  <a-card :bordered="false">
    <a-row>
      <a-col :span="21">
        
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
    <app-client-modal
      ref="modalForm"
      @ok="searchQuery"
    />
  </a-card>
</template>

<script>
import '@/assets/less/TableExpand.less'
import { mixinDevice } from '@/utils/mixin'
import { JeecgListMixin } from '@/mixins/JeecgListMixin'
import AppClientModal from './modules/AppClientModal'

export default {
  name: 'AppClientList',
  mixins: [JeecgListMixin, mixinDevice],
  components: {
    AppClientModal,
  },
  data() {
    return {
      description: '客户端类型管理',
      // 表头
      columns: [
      {
          title: '序号',
          dataIndex: '',
          key: 'rowIndex',
          width: 40,
          align: 'center',
          customRender: function (t, r, index) {
            return parseInt(index) + 1
          },
        },
        {
          title: '客户端',
          width: 100,
          align: 'left',
          dataIndex: 'name',
        },
        {
          title: 'APPID',
          width: 200,
          align: 'center',
          dataIndex: 'appId',
        },
        {
          title: '描述',
          width: 300,
          align: 'center',
          dataIndex: 'remark',
        },
        {
          title: '操作',
          dataIndex: 'action',
          align: 'center',
          width: 120,
          scopedSlots: { customRender: 'action' },
        },
      ],
      url: {
        list: '/appClient/version/clientList',
        delete: '/appClient/version/deleteClient',
      },
      superFieldList: [],
      loading:false,
      temp: 0,
    }
  },
  created() {
    this.searchQuery()
  },
  methods: {
    handleAdd(title) {
      this.$refs.modalForm.title = title
      this.$refs.modalForm.edit({})
    },

    handleUpdate(record) {
      console.log(record)
      this.$refs.modalForm.title = '修改'
      this.$refs.modalForm.edit(record)
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
