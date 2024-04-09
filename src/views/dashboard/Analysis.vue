<!-- 首页 -->
<template>
 <div class="flex w-100pre h-100pre ">

  <div class="content" >
    <img src="../../assets/firstPage.jpg" style="height: 92%;width: 100%;">
    <div class="content2">欢迎进入鲸禾JMC后台管理系统</div>
  </div>
  
 </div>
</template>

<script>
import axios from 'axios'

import * as echarts from 'echarts'
import { getAction, postAction, getFileAccessHttpUrl, getThreeData } from '@/api/manage'
import { getImageThumbnailUrl } from '@/utils/util'
import PortalHeader from './components/PortalHeader'
import store from '@/store/'
export default {
  name: 'Analysis',
  components: {
    PortalHeader,
  },
  data() {
    return {
      percent: 0,
      progressData: '',
      startTime: '',
      planTime: '',
      safeRunTime: '',

      safetotal: '',
      rectification: '',
      url: {
        progress: '/basic/basicEngInft/list',
        safetime: '/basic/basicAccInft/list',
        safeProduct: '/safesite/safesiteHidDanRecNot/querySubList',
        list: '/project/projectHonor/list',
        SafeDay: '/basic/basicEngInft/querySecurityDays',
      },
    }
  },

  mounted() {
    // 安全生产
    this.getToken()
    // this.getsafeProduct()
    this.getEch()
    this.getEch2()
    this.getSafeDay()
  },

  methods: {
    // 安全运行天数
    getSafeDay() {
      getAction(this.url.SafeDay).then((res) => {
        if (res.code == 200) {
          this.safeRunTime = res.result
        }
      })
    },
    // 给后面的使用 别删了
    getToken() {
      let params = {
        username: 'admin',
        password: 'jh@12345',
      }
      getThreeData('/sys/login', params, 'post').then((res) => {
        sessionStorage.threeToken = res.data.result.token
        this.getEch3()
      })
    },
    getsafeProduct() {
      getAction(this.url.safeProduct).then((res) => {
        if (res.code == 200) {
          this.rectification = res.result.sum
          this.safetotal = res.result.pageList.total
          if (this.safetotal == 0) {
            this.percent = 0
          } else {
            this.percent = (this.rectification / this.safetotal).toFixed(2) * 100
          }
        }
      })
    },

    // 第一个 echarts
    getEch() {
      let a = document.documentElement.style
      let chartDom = document.getElementById('main1')
      let myChart = echarts.init(chartDom)
      let option
      // data: ['闸室主体工程', '引航道及导航建筑', '金结及电器安装工程', '地面发电厂房工程', '左岸10孔泄洪闸工程', '右岸10孔泄洪闸工程'],
      option = {
        tooltip: {
          trigger: 'axis',
          axisPointer: {
            // Use axis to trigger tooltip
            type: 'shadow', // 'shadow' as default; can also be 'line' or 'shadow'
          },
        },
        legend: {
          show: false,
        },
        grid: {
          top: '2%',
          left: '3%',
          right: '4%',
          bottom: '3%',
          containLabel: true,
        },
        xAxis: {
          type: 'value',
        },
        yAxis: {
          type: 'category',
          data: [
            '闸室主体工程',
            '引航道及导航建筑',
            '金结及电器安装工程',
            '地面发电厂房工程',
            // '鱼道工程',
            // '监测工程',
            '左岸泄洪闸工程',
            '右岸泄洪闸工程',
          ],
        },
        series: [
          {
            color: '#0096ff',
            name: '合格率',
            itemStyle: {
              normal: {
                barBorderRadius: [4, 4, 4, 4],
              },
            },
            barWidth: 10, //设置每个柱形宽度为40
            type: 'bar',
            barGap: '-100%', //重叠效果(可放在任意一个组中)
            data: [100, 100, 100, 100, 100, 100],
            label: {
              normal: {
                show: false,
                position: 'insideRight',
              },
            },
          },
          {
            itemStyle: {
              normal: {
                barBorderRadius: [4, 4, 4, 4],
              },
            },
            barWidth: 10, //设置每个柱形宽度为40
            color: '#19d995',
            name: '优良率',
            type: 'bar',
            data: [98, 90, 95, 90, 96, 96],
            label: {
              normal: {
                show: true,
                position: 'insideRight',
              },
            },
          },
        ],
      }
      option && myChart.setOption(option)
      window.addEventListener('resize', function () {
        myChart.resize()
      })
    },
    // 第二个echarts
    getEch2() {
      let chartDom = document.getElementById('main2')
      let myChart = echarts.init(chartDom)
      let option

      option = {
        tooltip: {
          trigger: 'axis',
        },
        grid: {
          left: '3%',
          right: '4%',
          top: '4%',
          bottom: '12%',
          containLabel: true,
        },
        // toolbox: {
        //   feature: {
        //     saveAsImage: {}
        //   }
        // },
        xAxis: {
          type: 'category',
          boundaryGap: false,
          data: ['3月', '6月', '9月', '12月'],
        },
        yAxis: {
          type: 'value',
          min: 60,
          max: 100,
          // y轴最大值
          // max: function(value) {
          //   return value.max + 50;
          // },
          // max:100
        },
        series: [
          {
            name: '某航电开发有限责任公司',
            type: 'line',
            data: [90, 92, 93.5, 95],
          },
          {
            name: '某水利水电工程监理公司',
            type: 'line',
            data: [85, 86.2, 91.8, 93.6],
          },
          {
            name: '某工程咨询有限公司',
            type: 'line',
            data: [86, 88.2, 91.8, 92.6],
          },
          {
            name: '某省勘查设计院',
            type: 'line',
            color: '#0096ff',
            data: [83.5, 84, 83.2, 90],
          },
          {
            name: '某勘查设计公司',
            type: 'line',
            color: '#00FFFF',
            data: [85, 86, 86.2, 87],
          },
          {
            name: '中国水利水电第X工程局',
            type: 'line',
            color: '#90EE90',
            data: [70.2, 77, 80, 90],
          },
          {
            name: '中交第X航务工程局',
            type: 'line',
            stack: '',
            color: '#FFE4C4',
            data: [80, 81.2, 85, 88.9],
          },
          {
            name: '某港航建设工程有限公司',
            type: 'line',
            stack: '',
            color: '#99FFCC',
            data: [80, 82.5, 80.5, 85],
          },
          {
            name: '某航电枢纽工程',
            type: 'line',
            color: '#99CCFF',
            data: [81.1, 82.2, 84.6, 89.1],
          },
        ],
      }

      option && myChart.setOption(option)
      window.addEventListener('resize', function () {
        myChart.resize()
      })
    },

    // 第三个echarts
    async getEch3() {
      // 请求2021年的数据
      let param = {
        engineering: 0,
      }
      // 只获取陇西口的数据
      let data = await getThreeData(this.url.list, param)
      let res = data.data
      if (res.success) {
        // this.dataSource = res.result.records
        let data = res.result.records
        // 这里做数据处理  后端没办法该接口 只能苦逼的修改数据结构
        // 先过滤到年份
        let arr2021 = data.filter((item) => {
          let newstring = item.createTime.substring(0, 4)
          if (newstring == '2021') {
            return true
          }
          return false
        })
        //  1、奖项awards  	2	、工法construction  	3、标准standard 	4、论文paper 	5、QC成果result 	6、专利patent
        let awards = arr2021.filter((item) => {
          if (item.resultTyoe == '1') {
            return true
          }
          return false
        })
        let construction = arr2021.filter((item) => {
          if (item.resultTyoe == '2') {
            return true
          }
          return false
        })
        let standard = arr2021.filter((item) => {
          if (item.resultTyoe == '3') {
            return true
          }
          return false
        })
        let paper = arr2021.filter((item) => {
          if (item.resultTyoe == '4') {
            return true
          }
          return false
        })
        let result = arr2021.filter((item) => {
          if (item.resultTyoe == '5') {
            return true
          }
          return false
        })
        let patent = arr2021.filter((item) => {
          if (item.resultTyoe == '6') {
            return true
          }
          return false
        })

        // 需要得到下面的结构
        var dataSource = {
          awards: awards.length, //奖项
          patent: patent.length, //专利
          construction: construction.length, //工法
          result: result.length, //QC成果,
          // paper: paper.length, //论文
          // standard: standard.length, //标准
          // resultTotal: arr2021.length, //成果总数
          // year: '2021', //年度
        }

        let arr = []
        for (const key in dataSource) {
          arr.push(dataSource[key])
        }
        dataSource = arr
        console.log('dataSource', dataSource)
      }

      let chartDom = document.getElementById('main3')
      let myChart = echarts.init(chartDom)
      let option

      option = {
        legend: {
          // data: ['2022年', '2021年', '2020年', '2019年'],
          data: ['2021年', '2020年'],
          orient: 'vertical',
          x: 'left',
          y: 'bottom',
          itemWidth: 25,
          itemHeight: 5,
          itemGap: 10,
          textStyle: {
            fontSize: 14,
          },
        },
        radar: {
          nameGap: 5, //指示器名称和指示器轴的距离。
          splitNumber: 10, // 雷达图圈数设置
          center: ['60%', '50%'],
          shape: 'polygon', //雷达图绘制类型，支持 'polygon'(多边形) 和 'circle'(圆)
          indicator: [
            {
              name: '奖项',
              // max: 20,
              color: '#000000',
              // axisLabel: {
              // 	show: true,
              // 	color: '#000000'
              // }
            },
            {
              name: '专利',
              color: '#000000',
              // max: 20,
            },
            {
              name: '工法',
              color: '#000000',
              // max: 20,
            },
            {
              name: 'QC成果',
              color: '#000000',
              // max: 20,
            },
          ],
          splitLine: {
            show: true,
            lineStyle: {
              width: 1,
              color: '#D2F4FC',
              // 图表背景网格线的颜色
            },
          },
        },
        series: [
          {
            // 覆盖区域
            areaStyle: {
              color: '#E7F8FF',
              opacity: 0.2,
            },

            name: 'Budget vs spending',
            type: 'radar',
            symbolSize: 4, //拐点的大小
            emphasis: {
              label: {
                show: true,
                color: '#fff',
                fontSize: 10,
                formatter: '{c}', // 鼠标悬浮时展示数据加上单位
                backgroundColor: '#0D1B42',
                borderRadius: 5,
                padding: 2,
                shadowBlur: 2,
              },
            },
            data: [
              // {
              // 	value: [14, 14, 15, 16],
              // 	name: '2022年',
              // 	itemStyle: {
              // 		color: '#F5E03C',
              // 	},
              // },
              {
                value: dataSource,
                // value: [14, 13, 15, 15],
                name: '2021年',
                itemStyle: {
                  color: '#0164DB',
                },
              },
              {
                value: [2, 5, 8, 4],
                name: '2020年',
                itemStyle: {
                  color: '#26EA94',
                },
              },
              // {
              // 	value: [1, 3, 2, 1],
              // 	name: '2019年',
              // 	itemStyle: {
              // 		color: '#10B694',
              // 	},
              // },
            ],
          },
        ],
      }

      option && myChart.setOption(option)
      window.addEventListener('resize', function () {
        myChart.resize()
      })
    },
  },
}
</script>

<style scoped lang="less">
// ::v-deep .layout-container .layout-container {
// 	height: 100px !;
// }

.content {
  // border: 1px solid #0096ff;
  width: 45%;
  height: 50%;
  margin: auto;
  margin-bottom: 22%;
  // background: url('../../assets/firstPage.jpg') no-repeat ;
  // background-size:contain;
  // background-position:center
  
}

.content2 {
  font-size: 3.2rem;
  // border: 1px solid #0096ff;
  text-align: center;
  margin: auto;
}

::v-deep .ant-progress-circle-trail {
  stroke: #e1f4ff !important;
}

.transform {
  transform: translate(-65px, -65px);
}

.gutter-box {
  height: 15.3125rem;
  padding: 1.25rem;
  background-color: #ffffff;
  border-radius: 0.625rem;
  // font-weight: 900;
  color: #000000;
}

.center-box1 {
  border-radius: 0.625rem;
  background-color: #ffffff;
  height: 490px;
  margin-bottom: 0.625rem;
}

ul li:nth-child(1) {
  color: #f1db3a;
}

ul li:nth-child(2) {
  color: red;
}
</style>
