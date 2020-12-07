let app = getApp();

Component({
  /** 
   * 组件的属性列表
   */
  properties: {
    productData: {
      type: Object,
      value: {}
    }
  },

  /**
   * 组件的初始数据
   */
  data: {
    // 控制弹出层
    showPopup: false,

    // 选择的规格
    rules: '',

    // 商品数量
    currentProduct: {
      count: 1
    },

    // 是否授权
    isAuth: false
  },

  lifetimes: {
    created() {
      //  获取用户授权信息
      wx.getSetting({
        success: res => {
          // console.log('获取用户授权信息 res ==> ', res);

          //isAuth: 是否授权
          app.globalData.isAuth = res.authSetting['scope.userInfo'];

          this.setData({
            isAuth: res.authSetting['scope.userInfo']
          })
        }
      })
    }
  },

  /**
   * 组件的方法列表
   */
  methods: {
    // 展示弹出层
    showPopup() {
      this.setData({
        showPopup: true
      })
    },

    // 关闭弹出层
    closePopup() {
      this.setData({
        showPopup: false
      })
    },

    //改变数量
    modifyCount(e) {

      let count = this.data.currentProduct.count + Number(e.currentTarget.dataset.count);

      this.data.currentProduct.count = count <= 0 ? 1 : count;

      this.setData({
        currentProduct: this.data.currentProduct
      })
    },

    // 选择商品规格
    selectRule(e) {
      console.log('selectRule e ==> ', e);

      let dataset = e.currentTarget.dataset;

      //点击的当前规格下标
      let index = dataset.index;

      //当选中的下标
      let currentIndex = dataset.currentIndex;

      //rules数组元素的下表
      let rulesIndex = dataset.rulesIndex;


      console.log('currentIndex ==> ', currentIndex);
      console.log('index ==> ', index);
      if (currentIndex == index) {
        console.log('相同的规格');
        return;
      }

      //子组件通过触发自定义事件通知父组件(home页面), 并且携带参数{index}
      this.triggerEvent('currentIndexEvent', {
        index,
        rulesIndex
      });

      //获取选择规格
      console.log('productData ==> ', this.properties.productData);
      let rules = [];
      this.properties.productData.rules.map(v => {
        if (v.currentIndex > -1) {
          let rule = v.rule[v.currentIndex];
          rules.push(rule);
        }
      })

      this.setData({
        rules: rules.join(' / ')
      })

    },

    // 加入购物车
    addShopcart() {
      //判断是否选择规格
      let rules = this.properties.productData.rules;
      console.log(rules);
      for (let i = 0; i < rules.length; i++) {
        if (rules[i].currentIndex == -1) {
          //提示用户选择规格
          wx.showToast({
            title: '请选择规格',
            icon: 'none',
            duration: 1500,
            mask: true
          })
          return;
        }
      }

      // 执行加入购物车
      //获取商品id, 选择的规格, 商品数量
      let _id = this.properties.productData._id;
      console.log('_id ==> ', _id);
      let rule = this.data.rules;
      console.log('rule ==> ', rule);
      let count = this.data.currentProduct.count;
      console.log('count ==> ', count);

      wx.showLoading({
        title: '加载中...',
        mask: true
      })

      //调用云函数 add_shopcart
      wx.cloud.callFunction({
        name: 'add_shopcart',
        data: {
          pid: _id,
          rule,
          count
        },

        success: res => {
          wx.hideLoading();
          console.log('addShopcart res ==> ', res);

          // 关闭选择面板
          this.setData({
            showPopup: false
          })

          if (res.result._id) {
            wx.showToast({
              title: '加入购物成功',
              icon: 'none',
              duration: 1500,
              mask: true
            })

            //触发自定义事件 （类似vue的$emit事件）
            this.triggerEvent('addShopcart', {
              count: 1,
              _id: res.result._id
            });
          } else {
            wx.showToast({
              title: '加入购物失败',
              icon: 'none',
              duration: 1500,
              mask: true
            })
          }
        },
        fail: err => {
          wx.hideLoading();
          console.log('err ==> ', err);
        }
      })
    },

    //获取用户授权
    getUserAuthInfo(res) {
      console.log('用户授权 res ==> ', res);
      if (res.detail.userInfo) {
        app.globalData.isAuth = true;
        this.setData({
          isAuth: true
        })
      }
    }
  }
})