// miniprogram/pages/home/home.js
Page({

  /** 
   * 页面的初始数据 
   */
  data: {
    // 菜单分类
    menuList: [],

    // 激活下标
    activeMenuIndex: 0,

    // 骨架屏
    loading: true,

    // 商品数据
    products: [],

    // 购物车数量
    shopcartCount: 0,

    //购物车的_ids集合
    _ids: [],

    isAdd: false
  },

  /**
   * 生命周期函数--监听页面加载，一般用于初始化数据
   */
  onLoad: function (options) {
    // console.log('初始化数据');

    this.getMenuList();

    this.getProductByType('hot');
  },

  // 页面显示执行, 每次都会刷新购物车的数据信息
  onShow() {
    this.getShopcartData()
  },

  // 获取菜单列表数据
  getMenuList() {
    //开启加载提示
    wx.showLoading({
      title: '加载中...',
      mask: true
    })

    // 小程序端发起对云函数 get_menu_list 的调用
    wx.cloud.callFunction({
      // 要调用云函数的名称
      name: 'get_menu_list',

      // 成功的执行函数
      success: res => {
        // console.log('调用云函数成功');
        // console.log('res ==> ', res);
        //关闭加载提示
        wx.hideLoading();

        this.setData({
          menuList: res.result.data,
          // 关闭骨架屏
          loading: false
        })
        // console.log('this.data.menuList ==> ', this.data.menuList);
      },

      // 失败执行的函数
      fail: err => {
        //关闭加载提示
        wx.hideLoading();

        console.log('err =>', err);
      }
    })
  },

  // 切换菜单栏列表
  toggleMenuList(e) {
    // e 事件对象
    // console.log('e ==> ', e);
    let currentIndex = e.currentTarget.dataset.index;
    if (currentIndex === this.data.activeMenuIndex) {
      return;
    }

    this.setData({
      activeMenuIndex: currentIndex
    })

    // console.log(e.currentTarget.dataset.type);

    this.getProductByType(e.currentTarget.dataset.type)
  },

  // 根据商品类型获取商品数据
  getProductByType(type) {
    // type  商品类型
    wx.showLoading({
      title: '加载中...',
      mask: true
    })

    // 调用云函数 get_product
    wx.cloud.callFunction({
      name: 'get_products',

      //携带参数
      data: {
        type
      },

      success: result => {
        wx.hideLoading();

        result.result.data.map(v => {
          v.rules.map(item => {
            item.currentIndex = -1;
          })
        })

        this.setData({
          loading: false,
          products: result.result.data
        })

        // console.log('result ==> ', result);
        // console.log('products ==> ', this.data.products);
      },
      fail: err => {
        wx.hideLoading();
        console.log('err ==> ', err);
      }
    })
  },

  //修改currentIndex
  modifyCurrentIndex(e) {
    console.log('modifyCurrentIndex e ==> ', e);
    console.log('modifyCurrentIndex e.detail ==> ', e.detail);

    let index = e.currentTarget.dataset.index;
    console.log('modifyCurrentIndex index ==> ', index);

    // 给商品添加 currentIndex 属性, 用于显示高亮选择的规格
    this.data.products[index].rules[e.detail.rulesIndex].currentIndex = e.detail.index;

    this.setData({
      products: this.data.products
    })
  },

  //添加购物车成功后，累加数量
  modifyShopcartCount(e) {
    console.log('modifyShopcartCount e.detail ==> ', e.detail);

    // 商品id，根据商品id查询
    this.data._ids.push(e.detail._id);

    this.setData({
      shopcartCount: ++this.data.shopcartCount,
      isAdd: true
    })

    setTimeout(() => {
      this.setData({
        isAdd: false
      })
    }, 600)
  },

  // 获取购物车数据
  getShopcartData() {
    //调用云函数 get_shopcart
    wx.cloud.callFunction({
      name: 'get_shopcart',
      success: res => {
        console.log('getShopcartData res ==> ', res);

        let data = res.result.data;
        // 判断获取的数据是不是数组，因为有可能会 null
        if (Array.isArray(data)) {

          data.map(v => {
            this.data._ids.push(v._id);
          })

          this.setData({
            shopcartCount: data.length
          })

        }
      },

      fail: err => {
        console.log("err ==> ", err);
      }
    })
  },

  // 跳转至支付页面
  goPay() {
    
    if (this.data._ids.length == 0) {
      wx.showToast({
        title: '请添加商品',
        mask: true,
        duration: 2000,
        icon: 'none'
      })
      return;
    }

    //跳转到非tabbar页面
    wx.navigateTo({
      url: '../pay/pay?_ids=' + this.data._ids.join('-')
    })
  },

})