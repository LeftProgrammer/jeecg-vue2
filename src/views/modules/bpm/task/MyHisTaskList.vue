<template>
	<div>
		<!-- 查询区域 -->
		<div class="table-page-search-wrapper">
			<a-form layout="inline">
				<a-row :gutter="24">
					<a-col :span="24">
						<a-form-item label="任务标题">
							<a-input placeholder="请输入任务标题" v-model="queryParam.processDefinitionName"></a-input>
						</a-form-item>

						<span class="btn-left">
							<a-button style="background-color: #2c66f4" type="primary" @click="searchQuery"
								icon="search">查询</a-button>
							<a-button style="background-color: #2c66f4; " type="primary" @click="searchReset"
								icon="reload">刷新</a-button>
						</span>

					</a-col>
				</a-row>
			</a-form>
		</div>

		<!-- 操作按钮区域 -->

		<!-- table区域-begin -->
		<div>
			<a-table :scroll="{ y: 574 }" ref="table" size="middle" bordered rowKey="id" :columns="columns"
				:dataSource="dataSource" :pagination="ipagination" :loading="loading" @change="handleTableChange">
				<span slot="action" slot-scope="text, record">
					<a @click="handleProcess(record)"> 历史 </a>
				</span>

				<!-- 字符串超长截取省略号显示-->
				<span slot="bpmBizTitle" slot-scope="text, record">
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
		<!-- table区域-end -->

		<!-- 弹出框 -->
		<his-task-deal-modal ref="taskDealModal" :path="path" :formData="formData"></his-task-deal-modal>
	</div>
</template>

<script>
	import {
		filterObj
	} from '@/utils/util'
	import {
		deleteAction,
		getAction,
		postAction
	} from '@/api/manage'
	import HisTaskDealModal from './HisTaskDealModal'
	import JEllipsis from '@/components/jeecg/JEllipsis'
	import {
		JeecgListMixin
	} from '@/mixins/JeecgListMixin'
	import {
		BpmNodeInfoMixin
	} from '@/views/modules/bpm/mixins/BpmNodeInfoMixin'

	export default {
		name: 'MyHisTaskList',
		mixins: [JeecgListMixin, BpmNodeInfoMixin],
		components: {
			HisTaskDealModal,
			JEllipsis,
		},
		data() {
			return {
				description: '我的历史任务',
				// 查询条件
				queryParam: {},
				// 表头
				columns: [
					{
						title: '任务标题',
						align: 'center',
						width: '30%',
						dataIndex: 'bpmBizTitle',
						// scopedSlots: { customRender: 'bpmBizTitle' },
					},
					//  {
					//   title: '流程编号',
					//   align: 'center',
					//   dataIndex: 'processDefinitionId',
					//   scopedSlots: { customRender: 'processDefinitionId' }
					// },{
					//   title: '流程名称',
					//   align: 'center',
					//   dataIndex: 'processDefinitionName',
					//   scopedSlots: { customRender: 'processDefinitionName' }
					// },
					// {
					//   title: '流程实例',
					//   align: 'center',
					//   width:100,
					//   dataIndex: 'processInstanceId'
					// },
					// {
					//   title: '任务ID',
					//   align: 'center',
					//   dataIndex: 'taskId'
					// },
					{
						title: '发起人',
						align: 'center',
						width: '8%',
						dataIndex: 'processApplyUserName',
					},
					{
						title: '办理人',
						align: 'center',
						width: '8%',
						dataIndex: 'taskAssigneeName',
					},
					{
						title: '提交时间',
						align: 'center',
						width: '12%',
						dataIndex: 'taskBeginTime',
					},
					{
						title: '结束时间',
						align: 'center',
						width: '12%',
						dataIndex: 'taskEndTime',
					},
					{
						title: '耗时',
						align: 'center',
						width: '10%',
						dataIndex: 'durationStr',
					},
					{
						title: '当前环节',
						align: 'center',
						width: '10%',
						dataIndex: 'taskName',
					},
					{
						title: '操作',
						dataIndex: 'action',
						// fixed: 'right',
						align: 'center',
						scopedSlots: {
							customRender: 'action',
						},
					},
				],
				path: 'modules/bpm/task/form/FormLoading',
				formData: {},
				url: {
					list: '/act/task/taskHistoryList',
				},
			}
		},
		methods: {
			handleProcess(record) {
				this.getHisProcessNodeInfo(record)
			},
			handleOk() {
				this.loadData()
			},
		},
	}
</script>
<style lang="less" scoped>
</style>
