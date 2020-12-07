// miniprogram/pages/edit_address/edit_address.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    loading: true,

    // 地址信息
    addressInfo: {
      receiver: '', // 收货人
      phone: '',
      area: '选择地区',
      detail: '', // 详细地址
      isDefault: false // 默认地址
    },

    //地址_id(编辑地址需要)
    _id: '',

    //保存编辑地址数据副本, 以便对比用户是否编辑过地址信息
    copyAddressInfo: {}
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    // options 参数对象
    // options 获取到上一个页面标签的属性以及属性值,跳转传递的参数
    console.log("options ==> ", options);

    let _id = options._id;
    console.log('_id ==> ', _id);
    // 存在_id表明就是编辑地址
    if (_id) {

      this.setData({
        _id
      })

      // 更改页面标题
      wx.setNavigationBarTitle({
        title: '编辑地址'
      })

      // 编辑地址时要根据_id查询对应的地址信息
      this.findAddressBy_id(_id)
    } else {
      setTimeout(() => {
        this.setData({
          loading: false
        })
      }, 1500)
    }
  },

  // 修改文本框的数据
  changeIptValue(e) {
    console.log('e ==> ', e);

    // e.currentTarget.dataset  data-自定义值
    let key = e.currentTarget.dataset.key;

    // 重新赋值
    this.data.addressInfo[key] = e.detail.value;

    this.setData({
      addressInfo: this.data.addressInfo
    })

  },

  // 验证地址表单
  verifyAddressForm() {
    //验证表单是否填写
    let addressInfo = this.data.addressInfo;
    for (let key in addressInfo) {
      if (addressInfo[key] === '' || addressInfo[key] == '选择地区') {
        wx.showToast({
          title: '填写地址信息不能为空',
          icon: 'none',
          duration: 2000,
          mask: true
        })
        return false;
      }
    }

    //验证手机号
    if (!/^1[3-9]\d{9}$/.test(addressInfo.phone)) {
      wx.showToast({
        title: '手机号格式不正确',
        icon: 'none',
        duration: 2000,
        mask: true
      })
      return false;
    }

    return true;
  },

  // 提交
  commit() {
    // console.log('this.data.addressInfo ==> ', this.data.addressInfo);

    //如果地址表单验证不通过，则拦截
    if (!this.verifyAddressForm()) {
      return;
    }

    //如果新增地址是设置默认地址，先查询数据库是否存在默认地址，如果存在，则先将数据库的默认地址修改为非默认地址
    if (this.data.addressInfo.isDefault) {
      // 查询默认地址  地址是绑定用户的，根据地址_id查询已有地址信息
      this.findAddress()

    } else {
      // 新增地址
      this.addAddress()
    }
  },

  // 新增地址
  addAddress() {
    //启动加载提示
    wx.showLoading({
      title: '加载中...',
      mask: true
    })
    //调用云函数 add_address
    wx.cloud.callFunction({
      //云函数名称
      name: 'add_address',

      data: this.data.addressInfo,

      //成功执行
      success: result => {

        //关闭加载提示
        wx.hideLoading();

        if (result.result._id) {
          // 回到地址列表页面
          wx.navigateTo({
            url: '../address/address',
          })
        } else {
          wx.showToast({
            title: '添加地址失败',
            icon: 'warn',
            duration: 2000,
            mask: true
          })
        }
        // console.log('调用云函数成功');
        console.log('result ==> ', result);
      },

      // 失败
      fail: err => {
        //关闭加载提示
        wx.hideLoading();

        console.log('err ==> ', err);
      }
    })
  },

  //查询地址 如果已经存在地址就进行修改，否则就新增地址
  findAddress() {
    //启动加载提示
    wx.showLoading({
      title: '加载中...',
      mask: true
    })
    //调用云函数【get_address_by_key】
    wx.cloud.callFunction({
      //云函数名称
      name: 'get_address_by_key',

      // 传递的参数在云函数的event中可以得到，查询默认地址的条件
      data: {
        // 通过isDefault查询
        key: 'isDefault',
        value: true
      },

      //成功执行
      success: result => {

        //关闭加载提示
        wx.hideLoading();

        console.log('result ==> ', result);

        // length > 0 证明添加成功
        if (result.result.data.length > 0) {
          //修改该地址为非默认地址
          console.log('数据库存在默认地址');
          //获取该地址_id
          let _id = result.result.data[0]._id;

          //编辑地址
          this.updateAddress(_id);

        } else {
          //新增地址
          console.log('数据库没有默认地址');
          this.addAddress();
        }
      },

      // 失败
      fail: err => {
        //关闭加载提示
        wx.hideLoading();

        console.log('err ==> ', err);
      }
    })
  },

  // 更新地址 通过地址_id修改对应的地址数据
  updateAddress(_id) {
    //启动加载提示
    wx.showLoading({
      title: '加载中...',
      mask: true
    })
    //调用云函数 update_address_byid
    wx.cloud.callFunction({
      //云函数名称
      name: 'update_address_byid',

      // 传递的参数在云函数的event中可以得到，查询默认地址的条件
      data: {
        _id,

        // 更新数据
        data: {
          isDefault: false
        }
      },

      //成功执行
      success: result => {

        //关闭加载提示
        wx.hideLoading();

        console.log('result ==> ', result);

        if (result.result.stats.updated == 1) {
          //已经成功更新地址数据

          //新增数据
          console.log('修改数据库地址为非默认地址，然后新增地址');
          this.addAddress();
        }

      },

      // 失败
      fail: err => {
        //关闭加载提示
        wx.hideLoading();

        console.log('err ==> ', err);
      }
    })
  },

  //编辑地址时，根据地址_id查询地址信息
  findAddressBy_id(_id) {
    //启动加载提示
    wx.showLoading({
      title: '加载中...',
      mask: true
    })
    //调用云函数 get_address_by_key
    wx.cloud.callFunction({
      name: 'get_address_by_key',

      data: {
        // 通过 _id查询
        key: '_id',
        value: _id
      },

      success: res => {
        //关闭加载提示
        wx.hideLoading();
        console.log('findAddressBy_id res ==> ', res)

        // 绑定地址信息
        let addressInfo = this.data.addressInfo;
        for (let key in addressInfo) {
          addressInfo[key] = res.result.data[0][key];

          // 保存地址副本
          this.data.copyAddressInfo[key] = res.result.data[0][key];
        }

        this.setData({
          addressInfo,
          loading: false
        })
      },
      fail: err => {
        wx.hideLoading();
        console.log('err ==> ', err)
      }
    })
  },

  // 删除地址
  removeAddress() {
    //启动加载提示
    wx.showLoading({
      title: '加载中...',
      mask: true
    })
    //调用云函数 remove_address_byid
    wx.cloud.callFunction({
      //云函数名称
      name: 'remove_address_byid',

      data: {
        _id: this.data._id
      },

      //成功执行
      success: result => {

        //关闭加载提示
        wx.hideLoading();

        console.log('result ==> ', result);

        if (result.result.stats.removed == 1) {
          // wx.navigateBack();  直接返回不会更新数据
          wx.navigateTo({
            url: '../address/address'
          })
        } else {
          wx.showToast({
            title: '删除地址失败',
            duration: 2000,
            mask: true,
            icon: 'none'
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
  },

  // 保存编辑地址
  saveAddress() {
    console.log('this.data.copyAddressInfo ==> ', this.data.copyAddressInfo);
    console.log('this.data.addressInfo ==> ', this.data.addressInfo);

    // 存放用户编辑后的地址信息
    let editAddressData = {};
    //判断用户是否编辑过地址
    for (let key in this.data.addressInfo) {
      // 因为area是数组，所以要转成字符串再进行判断是否相等
      if (key == 'area') {
        let area = this.data.addressInfo[key].join('');
        // 与之前复制的副本数据进行比对
        let copyArea = this.data.copyAddressInfo[key].join('');

        // 不相等说明发生更改
        if (area != copyArea) {
          // 添加被修改过的地址信息
          editAddressData[key] = this.data.addressInfo[key];
        }
        // 跳出本次循环，进行下面的循环
        continue;
      }
      // 判断除了area的其实地址信息是否发生改变
      if (this.data.addressInfo[key] != this.data.copyAddressInfo[key]) {
        editAddressData[key] = this.data.addressInfo[key];
      }
    }
    console.log('editAddressData ==> ', editAddressData);

    //如果没有编辑过地址
    //判断editAddressData是否为空对象
    if (JSON.stringify(editAddressData) == '{}') {
      //直接返回上一级
      console.log('直接返回上一级');
      wx.navigateBack();
    } else {
      console.log('发起编辑地址请求');
    }

    //判断地址表单是否填写正确
    if (!this.verifyAddressForm()) {
      return;
    }

    //发起编辑地址请求
    this.editAddress(editAddressData)
  },

  // 编辑地址
  editAddress(data) {
    //data: 编辑地址数据
    //启动加载提示
    wx.showLoading({
      title: '加载中...',
      mask: true
    })
    //调用云函数 edit_address
    wx.cloud.callFunction({
      //云函数名称
      name: 'edit_address',

      data: {
        _id: this.data._id,

        //编辑地址数据
        data
      },

      //成功执行
      success: result => {

        //关闭加载提示
        wx.hideLoading();

        console.log('调用云函数成功');
        console.log('editAddress result ==> ', result);

        if (result.result.stats.updated == 1) {
          wx.navigateTo({
            url: '../address/address'
          })

        } else {
          wx.showToast({
            title: '修改地址失败',
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