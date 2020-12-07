import {
  utils
} from '../../js/utils'

Page({

  /**
   * 页面的初始数据
   */
  data: {
    loading: true,

    // 订单数量偏移量
    offset: 0,

    // 每次查询的订单数量
    count: 5,

    // 订单数据
    orderData: [],

    // 是否需要数据触底加载
    isHas: true
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {

  },

  onShow() {
    this.setData({
      loading: true,

      //订单数量偏移量
      offset: 0,

      //订单数据
      orderData: [],

      //是否存在数据加载
      isHas: true
    })

     this.getOrderData();
  },

  // 获取订单数据
  getOrderData() {
    //启动加载提示
    wx.showLoading({
      title: '加载中...',
      mask: true
    })
    //调用云函数【get_order】
    wx.cloud.callFunction({
      //云函数名称
      name: 'get_order',

      data: {
        offset: this.data.offset,
        count: this.data.count
      },

      //成功执行
      success: result => {

        if (this.data.loading) {
          this.setData({
            loading: false
          })
        }

        //关闭加载提示
        wx.hideLoading();


        // 处理订单时间，详细地址，商品数量和总价
        result.result.data.map(v => {
          // 处理时间
          v.date = utils.formatDate(v.date, 'yyyy-MM-dd hh:mm:ss');
          // 处理详细地址
          v.address.detailAddress = v.address.area.join('') + v.address.detail;
          // 记录商品数量和总价
          v.productCount = 0;
          v.totalPrice = 0;
          v.products.map(item => {
            v.productCount += item.count;
            v.totalPrice += item.count * item.product.price;
          })
        })

        console.log('getOrderData result ==> ', result);

        //如果本次请求获取的订单数据不足条，下次无需请求
        if (result.result.data.length < 5) {
          this.setData({
            isHas: false
          })
        }

        this.data.orderData.push(...result.result.data);
        
        this.setData({
          orderData: this.data.orderData,
          offset: this.data.offset + this.data.count
        })

        console.log('orderData result ==> ', this.data.orderData);

      },

      // 失败
      fail: err => {
        //关闭加载提示
        wx.hideLoading();

        console.log('err ==> ', err);
      }
    })
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
    if (!this.data.isHas) {
      return;
    }

    this.getOrderData();
  },

})