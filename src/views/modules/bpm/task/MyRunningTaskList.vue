<template>
  <div>
    <!-- 查询区域 -->
    <div class="table-page-search-wrapper">
      <a-form layout="inline">
        <a-row :gutter="24">
          <a-col :span="24">
            <a-form-item label="任务发起人">
              <a-input-search placeholder="选择任务发起人" readOnly @search="handleSelect" v-model="model.userName">
                <a-button slot="enterButton" icon="search">选择</a-button>
              </a-input-search>
            </a-form-item>
            <span style="float: left; overflow: hidden" class="table-page-search-submitButtons">
              <a-button style="background-color: #2c66f4" type="primary" @click="searchQuery" icon="search"
                >查询</a-button
              >
              <a-button
                style="background-color: #2c66f4; margin-left: 8px"
                type="primary"
                @click="searchReset"
                icon="reload"
                >刷新</a-button
              >
            </span>
          </a-col>
        </a-row>
      </a-form>
    </div>

    <!-- table区域-begin -->
    <div>
      <a-table
        :scroll="{ y: 574 }"
        ref="table"
        size="middle"
        bordered
        rowKey="id"
        :columns="columns"
        :dataSource="dataSource"
        :pagination="ipagination"
        :loading="loading"
        @change="handleTableChange"
      >
        <span slot="action" slot-scope="text, record">
          <template>
            <a @click="handleProcess(record)"> 办理 </a>
            <!-- <a-divider type="vertical" />
            <a @click="selectEntruster(record)"> 委托 </a> -->
          </template>
        </span>
        <!-- 字符串超长截取省略号显示-->
        <span slot="bpmBizTitle" slot-scope="text, record">
          <a-icon
            title="催办提醒"
            v-if="record.taskUrge"
            theme="twoTone"
            twoToneColor="#eb2f96"
            @click="taskNotify(record)"
            type="notification"
          />
          <j-ellipsis :value="text" :length="15" />
        </span>
        <span slot="processDefinitionId" slot-scope="text, record">
          <j-ellipsis :value="text" :length="18" />
        </span>
        <span slot="processDefinitionName" slot-scope="text, record">
          <j-ellipsis :value="text" :length="15" />
        </span>
      </a-table>
    </div>
    <!-- 弹出框 -->
    <task-deal-modal
      ref="taskDealModal"
      :processInstanceIds="processInstanceIds"
      :path="path"
      :formData="formData"
      @ok="handleOk"
    ></task-deal-modal>
    <select-entruster-modal ref="selectEntrusterModal" @selectFinished="handleEntruster"></select-entruster-modal>
    <task-notify-me-modal ref="taskNotifyMeModal"></task-notify-me-modal>
    <select-single-user-modal ref="selectSingleUserModal" @selectFinished="selectUserOK"></select-single-user-modal>
  </div>
</template>

<script>
import { filterObj } from '@/utils/util'
import { deleteAction, getAction, postAction, putAction } from '@/api/manage'
import TaskDealModal from './TaskDealModal'
import SelectEntrusterModal from './form/SelectEntrusterModal'
import JEllipsis from '@/components/jeecg/JEllipsis'
import { JeecgListMixin } from '@/mixins/JeecgListMixin'
import { BpmNodeInfoMixin } from '@/views/modules/bpm/mixins/BpmNodeInfoMixin'
import TaskNotifyMeModal from '../../extbpm/process/TaskNotifyMeModal.vue'
import SelectSingleUserModal from './form/SelectSingleUserModal.vue'

export default {
  name: 'MyRunningTaskList',
  mixins: [JeecgListMixin, BpmNodeInfoMixin],
  props: {
    isportal: {
      type: Boolean,
      default: false,
    },
  },
  components: {
    SelectSingleUserModal,
    TaskNotifyMeModal,
    SelectEntrusterModal,
    TaskDealModal,
    JEllipsis,
  },
  data() {
    return {
      auto: { x: true, y: true },
      description: '我的任务',
      // 查询条件
      queryParam: {},
      processInstanceIds: '',
      model: {
        userName: '',
      },
      // 表头
      columns: [
        {
          title: '任务标题',
          align: 'center',
          width: '40%',
          dataIndex: 'bpmBizTitle',
          // scopedSlots: { customRender: 'bpmBizTitle' },
        },
        // {
        //   title: '流程编号',
        //   align: 'center',
        //   dataIndex: 'processDefinitionId',
        //   scopedSlots: { customRender: 'processDefinitionId' },
        // },
        // {
        //   title: '任务ID',
        //   align: 'center',
        //   dataIndex: 'taskId',
        // },
        // {
        //   title: '流程名称',
        //   align: 'center',
        //   dataIndex: 'processDefinitionName',
        //   scopedSlots: { customRender: 'processDefinitionName' },
        // },
        // {
        //   title: '流程实例',
        //   width: 100,
        //   align: 'center',
        //   dataIndex: 'processInstanceId',
        // },
        {
          title: '发起人',
          width: '8%',
          align: 'center',
          dataIndex: 'processApplyUserName',
        },
        {
          title: '提交时间',
          align: 'center',
          width: '12%',
          dataIndex: 'taskBeginTime',
        },
        {
          title: '当前环节',
          align: 'center',
          width: '12%',
          dataIndex: 'taskName',
        },
        {
          title: '操作',
          align: 'center',
          dataIndex: 'action',
          //     fixed: 'right',
          width: '20%',
          scopedSlots: { customRender: 'action' },
        },
      ],
      path: 'modules/bpm/task/form/FormLoading',
      formData: {},
      url: {
        list: '/act/task/list',
        claim: '/act/task/claim',
        taskEntrust: '/act/task/taskEntrust',
      },
      taskId: '',
    }
  },
  methods: {
    searchReset() {
      this.queryParam = {}
      this.model.userName = ''
      this.loadData(1)
    },
    selectUserOK: function (data) {
      this.model.userName = data.realname
      this.queryParam.userName = data.username
    },
    handleSelect: function () {
      this.$refs.selectSingleUserModal.select()
    },
    async handleProcess(record) {
      var that = this
      this.processInstanceIds = record.processInstanceId
      if (record.taskAssigneeId && record.taskAssigneeId != '') {
        that.getProcessNodeInfo(record)
      } else {
        //先签收，再办理
        var params = { taskId: record.id } //查询条件
        var res = await putAction(that.url.claim, params)
        if (res.success) {
          that.getProcessNodeInfo(record)
        } else {
          that.$message.warning(res.message)
        }
      }
    },
    handleClaim(record) {
      var that = this
      var params = { taskId: record.id } //查询条件
      this.$confirm({
        title: '确认签收吗',
        content: '是否签收该任务?',
        onOk: function () {
          putAction(that.url.claim, params).then((res) => {
            if (res.success) {
              that.$message.success(res.message)
              that.loadData()
            } else {
              that.$message.warning(res.message)
              that.loadData()
            }
          })
        },
      })
    },
    handleOk() {
      this.searchReset()
    },
    selectEntruster(record) {
      this.taskId = record.id
      this.$refs.selectEntrusterModal.select(record)
      this.$refs.selectEntrusterModal.title = '选择委托人'
    },
    handleEntruster(data) {
      var that = this
      var params = {
        taskId: this.taskId,
        taskAssignee: data.username,
      } //查询条件
      console.log('委托', params)
      putAction(that.url.taskEntrust, params).then((res) => {
        if (res.success) {
          that.$message.success(res.message)
          that.loadData()
        } else {
          that.$message.warning(res.message)
          that.loadData()
        }
      })
    },
    //催办
    taskNotify(record) {
      this.$refs.taskNotifyMeModal.notify(record)
      this.$refs.taskNotifyMeModal.title = '催办提醒'
    },
  },
}
</script>
<style lang="less" scoped>
/** Button按钮间距 */
.ant-btn {
  margin-left: 3px;
}
</style>