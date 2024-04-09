<template>
	<a-card :bordered="false">
		<!-- 查询区域 -->
		<div class="table-page-search-wrapper">
			<a-form class='flex-between' layout="inline">

				<a-row :gutter="24">
					<a-col :span="24">
						<a-form-item label="表达式名称">
							<a-input placeholder="请输入表达式名称" v-model="queryParam.name"></a-input>
						</a-form-item>
						<a-form-item label="表达式">
							<a-input placeholder="请输入表达式" v-model="queryParam.expression"></a-input>
						</a-form-item>
						<span class="btn-left">
							<a-button style="background-color: #2c66f4" type="primary" @click="searchQuery"
								icon="search">查询</a-button>
							<a-button style="background-color: #2c66f4" type="primary" @click="searchReset"
								icon="reload">重置</a-button>
						</span>
					</a-col>
				</a-row>
				<!-- 操作按钮区域 -->
				<div class="btn-left">
					<a-button style="background-color: #2c66f4" @click="handleAdd" type="primary" icon="plus">新增
					</a-button>
					<a-dropdown v-if="selectedRowKeys.length > 0">
						<a-menu slot="overlay">
							<a-menu-item key="1" @click="batchDel">
								<a-icon type="delete" />删除
							</a-menu-item>
						</a-menu>
						<a-button style="margin-left: 8px"> 批量操作
							<a-icon type="down" />
						</a-button>
					</a-dropdown>
				</div>

			</a-form>
		</div>



		<!-- table区域-begin -->
		<div>
			<div class="ant-alert ant-alert-info" style="margin-bottom: 16px">
				<i class="anticon anticon-info-circle ant-alert-icon"></i> 已选择
				<a style="font-weight: 600">{{ selectedRowKeys.length }}</a>项
				<a style="margin-left: 24px" @click="onClearSelected">清空</a>
			</div>

			<a-table ref="table" size="middle" bordered :scroll="{ y: 500 }" rowKey="id" :columns="columns"
				:dataSource="dataSource" :pagination="ipagination" :loading="loading"
				:rowSelection="{ selectedRowKeys: selectedRowKeys, onChange: onSelectChange }"
				@change="handleTableChange">
				<span slot="action" slot-scope="text, record">
					<a @click="handleEdit(record)">编辑</a>

					<a-divider type="vertical" />
					<a-dropdown>
						<a class="ant-dropdown-link">更多
							<a-icon type="down" />
						</a>
						<a-menu slot="overlay">
							<a-menu-item>
								<a-popconfirm title="确定删除吗?" @confirm="() => handleDelete(record.id)">
									<a>删除</a>
								</a-popconfirm>
							</a-menu-item>
						</a-menu>
					</a-dropdown>
				</span>
			</a-table>
		</div>
		<!-- table区域-end -->

		<!-- 表单区域 -->
		<extActExpression-modal ref="modalForm" @ok="modalFormOk"></extActExpression-modal>
	</a-card>
</template>

<script>
	import ExtActExpressionModal from './modules/ExtActExpressionModal'
	import {
		filterObj
	} from '@/utils/util'
	import {
		deleteAction,
		getAction
	} from '@/api/manage'
	import {
		JeecgListMixin
	} from '@/mixins/JeecgListMixin'

	export default {
		name: 'ExtActExpressionList',
		mixins: [JeecgListMixin],
		components: {
			ExtActExpressionModal,
		},
		data() {
			return {
				description: '流程表达式表管理页面',
				// 查询条件
				queryParam: {},
				// 表头
				columns: [{
						title: '表达式名称',
						align: 'center',
						dataIndex: 'name',
						ellipsis: true,
					},
					{
						title: '表达式',
						align: 'center',
						dataIndex: 'expression',
						ellipsis: true,
					},
					{
						title: '操作',
						dataIndex: 'action',
						width: 150,
						align: 'center',
						scopedSlots: {
							customRender: 'action'
						},
					},
				],
				url: {
					list: '/act/process/extActExpression/list',
					delete: '/act/process/extActExpression/delete',
					deleteBatch: '/act/process/extActExpression/deleteBatch',
				},
			}
		},
		methods: {},
	}
</script>
<style lang="less" scoped>
	::v-deep .ant-card-body {
		height: 46.875rem !important;
		// border: 10px solid #000080;
		background-color: #fff !important;
	}
</style>
