let app = getApp();

Page({

  /**
   * 页面的初始数据
   */
  data: {
    // 选项数据
    optionsData: [{
        title: "收货地址",
        icon: 'location-o',
        url: '../address/address'
      },
      {
        title: "客服服务",
        icon: 'service-o'
      },
      {
        title: "设置",
        icon: 'setting-o'
      }
    ],

    //用户是有授权
    isAuth: false,

    //用户信息
    userInfo: {
      img: '',
      nickname: ''
    }
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.setData({
      isAuth: app.globalData.isAuth
    })

    if (this.data.isAuth) {
      // 必须是在用户已经授权的情况下调用
      wx.getUserInfo({
        success: res => {
          console.log('获取授权信息 res ==> ', res);
          this.setData({
            userInfo: {
              img: res.userInfo.avatarUrl,
              nickname: res.userInfo.nickName
            }
          })
        }
      })
    }
  },

  goPage(e) {
    wx.navigateTo({
      url: e.currentTarget.dataset.url
    })
  },

  //获取用户授权
  getUserAuthInfo(res) {
    console.log('用户授权 res ==> ', res);
    if (res.detail.userInfo) {
      app.globalData.isAuth = true;
      this.setData({
        isAuth: true,
        userInfo: {
          img: res.detail.userInfo.avatarUrl,
          nickname: res.detail.userInfo.nickName
        }
      })
    }
  }
})