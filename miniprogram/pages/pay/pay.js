//获取小程序实例
let app = getApp();

Page({

  /**
   * 页面的初始数据
   */
  data: {
    loading: true,

    //地址信息
    addressInfo: {},

    //商品数据
    productData: [],

    //购物车的_id
    _ids: [],

    //商品总数量, 总价
    proInfo: {
      count: 0,
      total: 0
    }
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    console.log('options ==> ', options);

    if (app.globalData._ids) {
      console.log('globalData');
      this.data._ids = app.globalData._ids.split('-');
    } else {
      console.log('pages');
      this.data._ids = options._ids.split('-');
    }

    console.log('this.data._ids ==> ', this.data._ids);

    if (options.aid) {
      //根据地址_id查询地址信息
      this.getDefaultAddress('_id', options.aid);
    } else {
      //获取默认地址
      this.getDefaultAddress('isDefault', true);
    }


    //获取需要购买的商品
    this.getShopcartData();

    console.log('app.globalData ==> ', app.globalData);

    console.log('onLoad');
  },

  onShow() {
    console.log('onShow');

    //删除全局_ids
    delete app.globalData._ids;
  },

  //跳转到地址列表页面
  goPage() {
    app.globalData._ids = this.data._ids.join('-');

    wx.navigateTo({
      url: '../address/address'
    })
  },

  // 获取默认地址
  getDefaultAddress(key, value) {
    //启动加载提示
    wx.showLoading({
      title: '加载中...',
      mask: true
    })
    //调用云函数 get_address_by_key
    wx.cloud.callFunction({
      //云函数名称
      name: 'get_address_by_key',

      data: {
        key,
        value
      },

      //成功执行
      success: result => {

        //关闭加载提示
        wx.hideLoading();

        // console.log('getDefaultAddress result ==> ', result);

        //如果存在默认地址
        let data = result.result.data;
        if (data.length > 0) {
          data[0].detailAddress = data[0].area.join('') + data[0].detail;
        }

        this.setData({
          addressInfo: result.result.data[0]
        })

        // console.log(this.data.addressInfo);
      },

      // 失败
      fail: err => {
        //关闭加载提示
        wx.hideLoading();

        console.log('err ==> ', err);
      }
    })
  },

  // 获取购买的商品数据
  getShopcartData() {
    //启动加载提示
    wx.showLoading({
      title: '加载中...',
      mask: true
    })
    //调用云函数【get_shopcart_by_id】
    wx.cloud.callFunction({
      //云函数名称
      name: 'get_shopcart_by_id',

      // 通过从首页传过来的_ids数组进行查找购买的商品
      data: {
        _ids: this.data._ids
      },

      //成功执行
      success: result => {

        //关闭加载提示
        wx.hideLoading();

        this.setData({
          loading: false
        })

        // console.log('getShopcartData result ==> ', result);
        this.setData({
          productData: result.result.data
        })

        console.log('this.data.productData ==> ', this.data.productData);
        this.sum();
      },

      // 失败
      fail: err => {
        //关闭加载提示
        wx.hideLoading();

        console.log('err ==> ', err);
      }
    })
  },

  // 增加数量
  increase(e) {
    let index = e.currentTarget.dataset.index;
    let data = this.data.productData[index];
    data.count += 1;

    //发起修改数量请求
    this.updateCount(data._id, data.count);
  },

  // 减少数量
  decrease(e) {
    let index = e.currentTarget.dataset.index;

    let data = this.data.productData[index];
    data.count -= 1;

    console.log(' data.count ==> ', index, data.count);

    if (data.count == 0) {
      //删除该商品
      this.removeShopcart(data._id, index);

    } else {
      //发起修改数量请求
      this.updateCount(data._id, data.count);
    }
  },

  // 统计商品总数量和总价
  sum() {
    // 重置数量和价格，不然会在之前的基础上进行累加
    this.data.proInfo.count = 0;
    this.data.proInfo.total = 0;

    //统计商品数量, 总价
    this.data.productData.map(v => {
      this.data.proInfo.count += v.count;
      this.data.proInfo.total += v.count * v.product.price;
    })

    this.setData({
      proInfo: this.data.proInfo
    })
  },

  // 修改商品数量
  updateCount(_id, count) {
    //_id: shopcart集合的记录_id
    //启动加载提示
    wx.showLoading({
      title: '加载中...',
      mask: true
    })
    //调用云函数【update_shopcart】
    wx.cloud.callFunction({
      //云函数名称
      name: 'update_shopcart',

      data: {
        _id,
        //修改的数量
        data: {
          count
        }
      },

      //成功执行
      success: result => {

        //关闭加载提示
        wx.hideLoading();

        console.log('updateCount result ==> ', result);

        this.setData({
          productData: this.data.productData
        })

        //统计商品总数量、总价
        this.sum();

      },

      // 失败
      fail: err => {
        //关闭加载提示
        wx.hideLoading();

        console.log('err ==> ', err);
      }
    })
  },

  //删除购物车的记录
  removeShopcart(_id, index) {
    //_id: shopcart集合的记录_id
    //启动加载提示
    wx.showLoading({
      title: '加载中...',
      mask: true
    })
    //调用云函数【remove_shopcart】
    wx.cloud.callFunction({
      //云函数名称
      name: 'remove_shopcart',

      data: {
        _id
      },

      //成功执行
      success: result => {

        //关闭加载提示
        wx.hideLoading();

        console.log('调用云函数成功');
        console.log('removeShopcart result ==> ', result);

        this.data.productData.splice(index, 1);

        this.setData({
          productData: this.data.productData
        })

        //统计商品总数量、总价
        this.sum();

      },

      // 失败
      fail: err => {
        //关闭加载提示
        wx.hideLoading();

        console.log('err ==> ', err);
      }
    })
  },

  // 去支付
  pay() {
    // 获取地址_id
    let aid = this.data.addressInfo._id;

    // 获取购物车的id集合
    let sid = this.data._ids;

    //启动加载提示
    wx.showLoading({
      title: '加载中...',
      mask: true
    })
    //调用云函数 add_order
    wx.cloud.callFunction({
      //云函数名称
      name: 'add_order',

      data: {
        aid,
        sid
      },

      //成功执行
      success: result => {

        //关闭加载提示
        wx.hideLoading();

        console.log('pay result ==> ', result);

        if (result.result.stats.removed > 0) {
          //添加订单成功
          wx.switchTab({
            url: '../order/order'
          })
        } else {
          wx.showToast({
            title: '结算失败',
            mask: true,
            icon: 'none',
            duration: 2000
          })
        }

      },

      // 失败
      fail: err => {
        //关闭加载提示
        wx.hideLoading();

        console.log('err ==> ', err);
      }
    })
  }

})