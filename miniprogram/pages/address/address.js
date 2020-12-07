// miniprogram/pages/address/address.js
Page({
 
  /**
   * 页面的初始数据
   */
  data: {
    loading: true, // 骨架屏
    addressList: [], // 地址列表信息
    url: '../edit_address/edit_address' // 编辑/新增地址 url
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.getAddressList()
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */

  //获取地址列表数据
  getAddressList() {
    //启动加载提示
    wx.showLoading({
      title: '加载中...',
      mask: true
    })
    //调用云函数 get_address
    wx.cloud.callFunction({
      name: 'get_address',
      //成功执行
      success: result => {

        //关闭加载提示
        wx.hideLoading();

        // console.log('result ==> ', result);

        // 地址信息由地区和详细地址组成，这里要进行一个拼接
        result.result.data.map(v => {
          v.detailAddress = `${v.area.join('')}${v.detail}`;
        })

        this.setData({
          loading: false,
          addressList: result.result.data
        })

        console.log('this.data.addressList ==> ', this.data.addressList);

      },

      // 失败
      fail: err => {
        //关闭加载提示
        wx.hideLoading();

        console.log('err ==> ', err);
      }
    })
  },

  // 跳转编辑地址页面或者新增地址
  goPage(e) {
    // 如果有携带_id说明是编辑地址，否则就是新增地址，通过data-自定义属性做标记进行判断
    // data-_id = {{ item._id }}
    // data-url: '../edit_address/edit_address'

    // console.log(e);
    let dataset = e.currentTarget.dataset;

    if (dataset._id) {
      // 编辑地址的路由
      dataset.url += '?_id=' + dataset._id;
    }
    // 否则就是新增地址的路由
    wx.navigateTo({
      url: dataset.url
    })
  },

   //选择地址
   selectAddress(e) {
    console.log('e ==> ', e);
    //获取地址_id
    let _id = e.currentTarget.dataset._id;

    wx.navigateTo({
      url: '../pay/pay?aid=' + _id
    })

  }
})