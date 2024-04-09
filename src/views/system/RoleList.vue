<template>
	<a-card :bordered="false" class="card-area">

		<!-- 查询区域 -->
		<div class="table-page-search-wrapper ">
			<!-- 搜索区域 -->
			<a-form class='flex-between' layout="inline" @keyup.enter.native="searchQuery">
				<a-row :gutter="24">
					<a-col >
						<a-form-item label="名称" >
							<a-input placeholder="请输入名称查询" v-model="queryParam.roleName"></a-input>
						</a-form-item>
						<a-form-item label="创建时间" >
							<j-date v-model="queryParam.createTime_begin" :showTime="true"
								date-format="YYYY-MM-DD HH:mm:ss" style="width:45%" placeholder="请选择开始时间"></j-date>
							<span style="width: 10px;">~</span>
							<j-date v-model="queryParam.createTime_end" :showTime="true"
								date-format="YYYY-MM-DD HH:mm:ss" style="width:45%" placeholder="请选择结束时间"></j-date>
						</a-form-item>
						<span class="btn-left">
							<a-button style="background-color: #2c66f4" type="primary" @click="searchQuery">查询
							</a-button>
							<a-button style="background-color: #2c66f4;color: #fff;" @click="searchReset">重置</a-button>
						</span>
					</a-col>
				</a-row>

				<!-- 操作按钮区域 -->
				<div class="btn-left" style="margin-top: 5px">
					<a-button style="background-color: #2c66f4" @click="handleAdd" type="primary" icon="plus">新增
					</a-button>
					<a-button style="background-color: #2c66f4" type="primary" icon="download"
						@click="handleExportXls('角色信息')">导出</a-button>
					<a-upload name="file" :showUploadList="false" :multiple="false" :headers="tokenHeader"
						:action="importExcelUrl" @change="handleImportExcel">
						<a-button style="background-color: #2c66f4" type="primary" icon="import">导入</a-button>
					</a-upload>

					<a-dropdown v-if="selectedRowKeys.length > 0">
						<a-menu slot="overlay">
							<a-menu-item key="1" @click="batchDel">
								<a-icon type="delete" />删除
							</a-menu-item>
						</a-menu>
						<a-button style="margin-left: 8px">
							批量操作
							<a-icon type="down" />
						</a-button>
					</a-dropdown>
				</div>
			</a-form>
		</div>


		<div class="ant-alert ant-alert-info" style="margin-bottom: 16px;">
			<i class="anticon anticon-info-circle ant-alert-icon"></i> 已选择&nbsp;<a
				style="font-weight: 600">{{ selectedRowKeys.length }}</a>项&nbsp;&nbsp;
			<a style="margin-left: 24px" @click="onClearSelected">清空</a>
		</div>
		<!-- table区域-begin -->
		<div>
			<a-table :scroll='{y:520}' bordered ref="table" size="middle" bordered rowKey="id" :columns="columns"
				:dataSource="dataSource" :pagination="ipagination" :loading="loading"
				:rowSelection="{selectedRowKeys: selectedRowKeys, onChange: onSelectChange}"
				@change="handleTableChange">

				<span slot="action" slot-scope="text, record">
					<a @click="handleEdit(record)">编辑</a>
					<a-divider type="vertical" />

					<a @click="handleDesign(record.id)">工单授权</a>
					<a-divider type="vertical" />

					<a-dropdown>
						<a class="ant-dropdown-link">
							更多
							<a-icon type="down" />
						</a>
						<a-menu slot="overlay">
							<a-menu-item>
								<a @click="handlePerssion(record.id)">授权</a>
							</a-menu-item>
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
		<role-modal ref="modalForm" @ok="modalFormOk"></role-modal>
		<user-role-modal ref="modalUserRole"></user-role-modal>
		<sys-role-design-modal ref="roleDesignModal"></sys-role-design-modal>
	</a-card>
</template>

<script>
	import RoleModal from './modules/RoleModal'
	import UserRoleModal from './modules/UserRoleModal'
	import {
		JeecgListMixin
	} from '@/mixins/JeecgListMixin'
	import JDate from '@/components/jeecg/JDate'
	import SysRoleDesignModal from './modules/SysRoleDesignModal'

	export default {
		name: "RoleList",
		mixins: [JeecgListMixin],
		components: {
			SysRoleDesignModal,
			RoleModal,
			UserRoleModal,
			JDate
		},
		data() {
			return {

				description: '角色管理页面',
				// 查询条件
				queryParam: {
					roleName: '',
				},
				// 表头
				columns: [{
						title: '#',
						dataIndex: '',
						key: 'rowIndex',
						width: 60,
						align: "center",
						customRender: function(t, r, index) {
							return parseInt(index) + 1;
						}
					},
					{
						title: '角色名称',
						align: "center",
						dataIndex: 'roleName'
					},
					{
						title: '角色编码',
						align: "center",
						dataIndex: 'roleCode'
					},
					{
						title: '备注',
						align: "center",
						dataIndex: 'description'
					},
					{
						title: '创建时间',
						dataIndex: 'createTime',
						align: "center",
						sorter: true
					},
					{
						title: '更新时间',
						dataIndex: 'updateTime',
						align: "center",
						sorter: true
					},
					{
						title: '操作',
						dataIndex: 'action',
						align: "center",
						scopedSlots: {
							customRender: 'action'
						},
					}
				],
				url: {
					list: "/sys/role/list",
					delete: "/sys/role/delete",
					deleteBatch: "/sys/role/deleteBatch",
					exportXlsUrl: "/sys/role/exportXls",
					importExcelUrl: "/sys/role/importExcel",
				},
			}
		},
		computed: {
			importExcelUrl: function() {
				return `${window._CONFIG['domianURL']}/${this.url.importExcelUrl}`;
			}
		},
		methods: {
			handlePerssion: function(roleId) {
				// alert(roleId);
				this.$refs.modalUserRole.show(roleId);
			},
			onChangeDate(date, dateString) {
				console.log(date, dateString);
			},
			handleDesign: function(id) {
				this.$refs.roleDesignModal.edit(id);
			},
		}
	}
</script>
<style lang="less" scoped>
	@import '~@assets/less/common.less';

	::v-deep .ant-card-body {
		height: calc(100vh - 135px - 24px) !important;
		background-color: #fff !important;
	}
</style>
