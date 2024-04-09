<template>
	<a-card :bordered="false">
		<!-- 查询区域 -->
		<div class="table-page-search-wrapper ">
			<a-form class='flex-between' layout="inline" @keyup.enter.native="searchQuery">

				<a-row :gutter="18">
					<a-col :span="24">
						<a-form-item label="岗位编码">
							<a-input placeholder="请输入岗位编码" v-model="queryParam.code"></a-input>
						</a-form-item>

						<a-form-item label="岗位名称">
							<a-input placeholder="请输入岗位名称" v-model="queryParam.name"></a-input>
						</a-form-item>

						<!-- <template v-if="toggleSearchStatus">
            <a-col :md="6" :sm="8">
              <a-form-item label="职级">
                <j-dict-select-tag v-model="queryParam.postRank" placeholder="请选择职级" dictCode="position_rank"/>
              </a-form-item>
            </a-col>

          </template> -->

						<span class="btn-left">
							<a-button style="background-color: #2c66f4" type="primary" @click="searchQuery"
								icon="search">查询</a-button>
							<a-button style="background-color: #2c66f4" type="primary" @click="searchReset"
								icon="reload">重置</a-button>
							<!-- <a @click="handleToggleSearch" style="margin-left: 8px">
                {{ toggleSearchStatus ? '收起' : '展开' }}
                <a-icon :type="toggleSearchStatus ? 'up' : 'down'"/>
              </a> -->
						</span>
					</a-col>
				</a-row>

				<!-- 操作按钮区域 -->
				<div class="btn-left">
					<a-button style="background-color: #2c66f4" @click="handleAdd" type="primary" icon="plus">新增
					</a-button>
					<a-button style="background-color: #2c66f4" type="primary" icon="download"
						@click="handleExportXls('职务表')">导出</a-button>
					<a-upload name="file" :showUploadList="false" :multiple="false" :headers="tokenHeader"
						:action="importExcelUrl" @change="handleImportExcel">
						<a-button style="background-color: #2c66f4" type="primary" icon="import">导入</a-button>
					</a-upload>
					<a-dropdown v-if="selectedRowKeys.length > 0">
						<a-menu slot="overlay">
							<a-menu-item key="1" @click="batchDel">
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
			</a-form>
		</div>

		<div class="ant-alert ant-alert-info" style="margin: 16px 0">
			<i class="anticon anticon-info-circle ant-alert-icon"></i> 已选择
			<a style="font-weight: 600">{{ selectedRowKeys.length }}</a>项
			<a style="margin-left: 24px" @click="onClearSelected">清空</a>
		</div>


		<!-- table区域-begin -->
		<div>
			<a-table :scroll='{y:500}' ref="table" size="middle" bordered rowKey="id" :columns="columns"
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
		<sysPosition-modal ref="modalForm" @ok="modalFormOk"></sysPosition-modal>
	</a-card>
</template>

<script>
	import SysPositionModal from './modules/SysPositionModal'
	import {
		JeecgListMixin
	} from '@/mixins/JeecgListMixin'
	import JDictSelectTag from '@/components/dict/JDictSelectTag'

	export default {
		name: 'SysPositionList',
		mixins: [JeecgListMixin],
		components: {
			SysPositionModal,
			JDictSelectTag,
		},
		data() {
			return {
				description: '职务表管理页面',
				// 表头
				columns: [{
						title: '岗位编码',
						align: 'center',
						dataIndex: 'code',
						ellipsis: true,
					},
					{
						title: '岗位名称',
						align: 'center',
						dataIndex: 'name',
						ellipsis: true,
					},
					// {
					//   title: '职级',
					//   align: 'center',
					//   dataIndex: 'postRank_dictText'
					// },
					// {
					//   title: '公司id',
					//   align: 'center',
					//   dataIndex: 'companyId'
					// },
					{
						title: '操作',
						dataIndex: 'action',
						align: 'center',
						width: 150,
						scopedSlots: {
							customRender: 'action'
						},
					},
				],
				url: {
					list: '/sys/position/list',
					delete: '/sys/position/delete',
					deleteBatch: '/sys/position/deleteBatch',
					exportXlsUrl: '/sys/position/exportXls',
					importExcelUrl: '/sys/position/importExcel',
				},
			}
		},
		computed: {
			importExcelUrl: function() {
				return `${window._CONFIG['domianURL']}/${this.url.importExcelUrl}`
			},
		},
	}
</script>
<style lang="less" scoped>
	@import '~@assets/less/common.less';

	::v-deep .ant-card-body {
		height: calc(100vh - 135px - 24px) !important;
		background-color: #fff !important;
	}
</style>
