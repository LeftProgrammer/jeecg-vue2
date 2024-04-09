<template>
  <a-card :bordered="false">
    <a-row>
      <a-col :span="3">
        <a-directory-tree
          show-icon
          :tree-data="treeData" 
          :load-data="onLoadData"
          :autoExpandParent='false'
          :replaceFields="{ children: 'children', title: 'name', key: 'id' }"
          @select="onSelect"
        >
          <a-icon
            slot="switcherIcon"
            type="down"
          />

        </a-directory-tree>
      </a-col>
      <a-col :span="21">
        <a-form
          layout="inline"
          @keyup.enter.native="onQuery"
        >
          <a-row :gutter="24">
            <a-col :span="24">
              <a-form-item label="项目名称">
                <a-input
                  placeholder="输入项目名称搜索"
                  v-model="queryParam.title"
                />
              </a-form-item>
              <a-form-item label="资料类型">
                <!-- dict="toolbox_zylx" -->
                <!-- dict-code="toolbox_zylx" -->
                <!-- <j-search-select-tag
                  type="list"
                  :value="queryParam.dataType"
                  dict="toolbox_zylx"
                  placeholder="请选择资料类型"
                  style="width: 170px"
                  @change="(val) => $set(queryParam, 'dataType', val)"
                /> -->
                <j-dict-select-tag
                  type="list"
                  :value="queryParam.dataType"
                  dict-code="toolbox_zylx"
                  :dict="zltype"
                  :trigger-change="true"
                  placeholder="请选择资料类型"
                  style="width: 170px"
                  @change="(val) => $set(queryParam, 'dataType', val)"
                />
              </a-form-item>
              <span class="table-page-search-submitButtons">
                <a-button
                  type="primary"
                  @click="onQuery(3)"
                  icon="search"
                >
                  查询
                </a-button>
                <a-button
                  type="primary"
                  @click="searchReset"
                  icon="reload"
                  style="margin-left: 8px"
                >
                  刷新
                </a-button>
              </span>
            </a-col>
          </a-row>
        </a-form>
        <div style="margin: 20px 0; display: flex; justify-content: space-between">
          <span>项目列表</span>
          <a-button
            type="primary"
            @click="handleAddproject('新增项目')"
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
            :pagination="false"
            :loading="loading"
            :rowSelection="{ selectedRowKeys: selectedRowKeys, onChange: onSelectChange }"
            @change="handleTableChange"
          >
            <template
              slot="isEnabled_dictText"
              slot-scope="text"
            >
              <span>{{ text == '是' ? '√' : '' }}</span>
            </template>
            <template
              slot="icoUrl"
              slot-scope="text"
            >
              <img
                v-if="text"
                style="height: 100px; cursor: pointer"
                :src="API_BASE_URL + '/' + text"
                alt=""
                @click="viewImg(text)"
              />
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
          <div style="margin-top: 20px; float: right">
            <a-pagination
              size="small"
              :total="pageParams.total"
              show-size-changer
              show-quick-jumper
              :value="pageParams.pageNo"
              :page-size="pageParams.pageSize"
              @change="onPageNoChange"
              @showSizeChange="onShowSizeChange"
            />
          </div>
        </div>
      </a-col>
    </a-row>
    <toolbox-resource-modal
      ref="modalForm"
      @ok="onQuery"
      :dataType="dataType"
      :dataRef="dataRef"
    />
    <a-modal
      :visible="ImgVisible"
      :footer="null"
      @cancel="ImgVisible = false"
    >
      <img
        style="width: 100%"
        :src="imgUrl"
        alt=""
      />
    </a-modal>
  </a-card>
</template>

<script>
import { getAction } from '@/api/manage'
import '@/assets/less/TableExpand.less'
import { mixinDevice } from '@/utils/mixin'
import { JeecgListMixin } from '@/mixins/JeecgListMixin'
import ToolboxResourceModal from './modules/ToolboxResourceModal'

export default {
  name: 'ToolboxResourceList',
  mixins: [JeecgListMixin, mixinDevice],
  components: {
    ToolboxResourceModal,
  },
  data() {
    return {
      description: '资料管理记录表管理页面',
      dataType: null,
      tablename: 'toolbox_resource',
      accessControl: {
        tablename: 'ToolboxResource',
      },
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
          title: '项目名称',
          align: 'left',
          dataIndex: 'title',
          width: 180,
        },
        {
          title: '资料类型',
          align: 'center',
          width: 100,
          dataIndex: 'dataType_dictText',
        },
        {
          title: '封面图片',
          align: 'center',
          width: 500,
          dataIndex: 'icoUrl',
          scopedSlots: { customRender: 'icoUrl' },
        },
        {
          title: '显示顺序',
          align: 'center',
          width: 350,
          dataIndex: 'sortNo',
        },
        {
          title: '显示',
          align: 'center',
          dataIndex: 'isEnabled_dictText',
          scopedSlots: { customRender: 'isEnabled_dictText' },
        },
        {
          title: '操作',
          dataIndex: 'action',
          align: 'center',
          width: 100,
          scopedSlots: { customRender: 'action' },
        },
      ],
      url: {
        list: '/toolbox/toolboxResource/list',
        delete: '/toolbox/toolboxResource/delete',
        treeChild: '/toolbox/toolboxClass/childList',
        deleteBatch: '/toolbox/toolboxResource/deleteBatch',
        exportXlsUrl: '/toolbox/toolboxResource/exportXls',
        importExcelUrl: 'toolbox/toolboxResource/importExcel',
        menuList: '/toolbox/toolboxClass/rootList',
        getChildListBatch: '/toolbox/toolboxClass/getChildListBatch',
      },
      dictOptions: {},
      superFieldList: [],
      menuList: [],
      disableMixinCreated: true,
      treeData: [],
      directoryId: '',
      memuId: '',
      pageParams: {
        total: 0,
        pageSize: 10,
        pageNo: 1,
      },
      dataRef: {},
      ImgVisible: false,
      zltype: 'toolbox_zylx,name,id' + ',data_type !=2',
      imgUrl: '',
      temp: 0,
    }
  },
  created() {
    // this.getSuperFieldList()
    this.loadMenuData()
    this.onQuery()
  },
  computed: {
    importExcelUrl: function () {
      return `${window._CONFIG['domianURL']}/${this.url.importExcelUrl}`
    },
  },
  methods: {
    onSelect(selectedKeys, info) {
      let dataRef = info.node.dataRef
      const { type, id, pid } = dataRef
      if (type == '分类') {
        this.directoryId = id
        this.memuId = pid
        this.dataRef = dataRef
        this.onQuery(1)
      } else if (type == '菜单') {
        //支持点击一级菜单查询
        // this.directoryId = id
        // this.dataRef = dataRef
        // this.onQuery(2)
        this.directoryId = ''
        this.memuId = id
        this.dataRef = dataRef
        this.onQuery(2)
      } else {
        this.dataRef = {}
      }
    },
    /**
     * @description 数组转化树结构
     * @param {*} list 数组
     * @param {*} rootValue
     * @param {*} leavl
     */
    initTreeData(list, rootValue, leavl = 0) {
      let arr = []
      leavl++
      list.forEach((item) => {
        // item.title = item.name
        if (item.id === rootValue) {
          const children = this.initTreeData(list, item.id, leavl)
          if (children.length) {
            item.children = children
          }
          item.leavl = leavl
          // if (item.name && item.name.length > 10) {
          //   item.name = item.name.substring(0, 10) + '...'
          // }
          arr.push(item)
        }
        return arr
      })
    },
    /**
     * @description 表格查询
     */
    onQuery(number) {
      let params
      //传1的时候查二级菜单 2的时候查一级菜单
      if (number == 1) {
        params = Object.assign(this.getQueryParams(), {
          directoryId: this.directoryId,
          pageSize: this.pageParams.pageSize,
          pageNo: this.pageParams.pageNo,
        })
      } else if (number == 2) {
        params = Object.assign(this.getQueryParams(), {
          memuId: this.memuId,
          pageSize: this.pageParams.pageSize,
          pageNo: this.pageParams.pageNo,
        })
      } else if (number == 3) {
        params = Object.assign(this.getQueryParams(), {
          pageSize: this.pageParams.pageSize,
          pageNo: this.pageParams.pageNo,
        })

        // if (temp=1) {
        //   params = Object.assign(this.getQueryParams(), { directoryId: this.directoryId, pageSize:this.pageParams.pageSize,pageNo:this.pageParams.pageNo})
        // }else if (temp=2) {
        //   params = Object.assign(this.getQueryParams(), { memuId: this.directoryId, pageSize:this.pageParams.pageSize,pageNo:this.pageParams.pageNo })
        // }else{
        //   params = Object.assign(this.getQueryParams(), { pageSize:this.pageParams.pageSize,pageNo:this.pageParams.pageNo})
        // }
      } else {
        params = Object.assign(this.getQueryParams(), {
          directoryId: this.directoryId,
          memuId: this.memuId,
          pageSize: this.pageParams.pageSize,
          pageNo: this.pageParams.pageNo,
        })
      }
      getAction(this.url.list, params).then((res) => {
        this.dataSource = res.result.records
        this.pageParams.total = res.result.total
      })
    },
    onPageNoChange(pageNumber) {
      this.pageParams.pageNo = pageNumber
      this.onQuery()
    },
    onShowSizeChange(current, pageSize) {
      this.pageParams.pageNo = 1
      this.pageParams.pageSize = pageSize
      this.onQuery()
    },
    viewImg(text) {
      this.imgUrl = this.API_BASE_URL + '/' + text
      this.ImgVisible = true
    },
    /**
     * @description 获取树节点数据
     * @param {*} treeNode
     */
    onLoadData(treeNode) {
      return new Promise((resolve) => {
        if (treeNode.dataRef.children) {
          resolve()
          return
        }
        // let params = this.getQueryParams(1) //查询条件
        let params = {} //查询条件
        params.pid = treeNode.dataRef.id
        params.hasQuery = 'false'
        getAction(this.url.treeChild, params).then((res) => {
          treeNode.dataRef.children = res.result.records
          // treeNode.dataRef.children.forEach((item) => {
          //   item.title = item.name
          //   if (item.name && item.name.length > 10) {
          //     item.name = item.name.substring(0, 10) + '...'
          //   }
          // })
          this.treeData = [...this.treeData]


          resolve()
        })
      })
    },
    /**
     * @description 获取树数据
     */
    loadMenuData() {
      getAction(this.url.menuList)
        .then((res) => {
          if (res.success) {
            this.treeData = res.result.records

          } else {
            this.$message.warning(res.message)
          }
        })
        .finally(() => {
          this.loading = false
        })
    },
    // handleAddData(title) {
    //   if (typeof title == 'string') {
    //     this.$refs.modalForm.title = title || '新增'
    //   } else {
    //     this.$refs.modalForm.title = '新增'
    //   }
    //   // this.$store.commit('toolboxResoureList', 2)
    //   this.dataType = '2'
    //   this.$refs.modalForm.add()
    //   this.$refs.modalForm.disableSubmit = false
    // },

    handleAddproject(title) {
      if (!this.dataRef.id) {
        this.$message.info('请选择分类')
        return
      }
      if (typeof title === 'string') {
        this.$refs.modalForm.title = title || '新增'
      } else {
        this.$refs.modalForm.title = '新增'
      }
      // this.$store.commit('toolboxResoureList', 1)
      this.dataType = '1'
      // this.$refs.modalForm.add();
      if (this.dataRef.pid == 0) {
        var Object = {
          memuId: this.dataRef.id,
        }
      } else {
        var Object = {
          memuId: this.dataRef.pid,
          directoryId: this.dataRef.id,
        }
      }

      console.log(Object)
      this.$refs.modalForm.edit(Object)
      this.$refs.modalForm.disableSubmit = false
    },

    getSuperFieldList() {
      let fieldList = []
      fieldList.push({ type: 'string', value: 'code', text: '编号', dictCode: '' })
      fieldList.push({ type: 'string', value: 'title', text: '标题', dictCode: '' })
      fieldList.push({ type: 'double', value: 'sortNo', text: '排序', dictCode: '' })
      fieldList.push({
        type: 'sel_search',
        value: 'memuId',
        text: '所属菜单',
        dictTable: 'toolbox_menu',
        dictText: 'name',
        dictCode: 'id',
      })
      fieldList.push({
        type: 'sel_search',
        value: 'classifyId',
        text: '所属分类',
        dictTable: 'toolbox_classify',
        dictText: 'name',
        dictCode: 'id',
      })
      fieldList.push({
        type: 'string',
        value: 'projectId',
        text: '所属项目',
        dictTable: 'toolbox_resource',
        dictText: 'title',
        dictCode: 'id',
      })
      fieldList.push({
        type: 'string',
        value: 'directoryId',
        text: '所属目录',
        dictTable: 'toolbox_directory',
        dictText: 'name',
        dictCode: 'id',
      })
      fieldList.push({ type: 'string', value: 'dataType', text: '资料类型', dictCode: 'toolbox_zylx' })
      fieldList.push({ type: 'string', value: 'dataUrl', text: '资料链接', dictCode: '' })
      fieldList.push({ type: 'string', value: 'icoUrl', text: '图标链接', dictCode: '' })
      fieldList.push({
        type: 'list_multi',
        value: 'labels',
        text: '标签',
        dictTable: '',
        dictText: '',
        dictCode: 'toolbox_bqlx',
      })
      fieldList.push({
        type: 'string',
        value: 'uploadFile',
        text: '相关附件',
        dictCode: '',
      })
      fieldList.push({ type: 'string', value: 'subAddress', text: '子级页面地址', dictCode: '' })
      fieldList.push({ type: 'string', value: 'passParameter', text: '传递参数', dictCode: '' })
      fieldList.push({ type: 'int', value: 'isEnabled', text: '是否可用', dictCode: 'toolbox_xs' })
      fieldList.push({ type: 'int', value: 'isUpDate', text: '是否更新', dictCode: 'toolbox_xs' })
      fieldList.push({ type: 'int', value: 'dataUrlId', text: '视频id', dictCode: '' })
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
