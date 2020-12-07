# 配色 深 F6686A  浅 FCCFD0

# 项目结构
```txt
cloudfunctions: 云函数

miniprogram: 开发目录
  |- components 公共组件
  |- images 图片
  |- pages 页面目录
  |- style 公共样式
  |- app.js 小程序入口文件
  |- app.json 小程序全局配置
  |- app.wxss 样式, 类似css
  |- sitemap 微信索引(可以标记小程序页面可在微信中搜索)

project.config.json: 项目工程文件, 记录用户偏好(编辑器主题色，字体大小...)
README.md: 描述项目
```


```txt
小程序至少要存在一个页面

小程序页面构成

必须有文件
wxml: 类似html， 定义页面结构
js: javascript，实现动态页面，编写逻辑

可有可无
wxss: 类似css，编写样式，美化页面
json: 页面局部配置
```

```txt
云开发
  数据分析
    数据库读写情况
    存储的文件上传和下载
    云函数的调用次数和错误次数，流量统计

  数据库
    保存数据，以json格式存储

  存储
    上传和下载文件(图片，音频，视频，...)

  云函数
    操作数据库

```

```txt
开通云开发后需要等待10分钟，云环境才生效
```

```txt
小程序屏幕适配
  rpx 类似 rem

  开发微信小程序需要以iphone6为标准屏幕开发
  iphone6的rpx换算: 1px = 2rpx

```

```txt
微信小程序布局
  <view> : 类似html的 <div>
  <text> : 类似html的 <span>
```

```txt
微信小程序设置背景图： 支持网络图片或者base64
小程序大小限制2MB，如果超过2MB无法上线

bindtap: 轻点事件（类似原生的click事件）

事件执行的方法不能传递参数，比如bindtap = toggleMenuList(index) 错误写法
正确写法 bindtap = toggleMenuList, 默认情况下 toggleMenuList函数的第一个参数为事件对象，如果需要传递参数，则需要通过标签的自定义属性关联，即 data-属性名称=属性值

bindTap: 冒泡触发事件
catchTap: 阻止冒泡触发事件


如果小程序页面使用不到的数据，则不需要this.setData, 只需要修改数据即可 this.data.属性

逻辑删除：（假删除）用户查询不到的数据，但是数据库存在该数据
物理删除：（真删除）用户查询不到的数据且数据库不存在该数据


个人实现微信支付
  个人是不支持微信认证的，所以不能直接使用微信支付功能

  可以借助第三方平台实现支付
  01-客户向微信付款
  02-微信收款
  03-微信将款项再转给第三支付平台
  04-第三支付平台转给我


第三方支付
https://bufpay.com/


订单集合数据结构 一对多 (一个订单编号对应多个商品)
  集合id
  订单编号
  订单日期
  用户id
  订单状态 0 ==> 准备中, 1 ==> 配送中, 2 ==> 已完成
  地址信息
  商品集合: [
    {
      商品id,
      商品数量
      商品价格
      商品名称
      商品图片
      商品规格
    }
  ]

```

```txt
云函数操作步骤

创建云函数 ==> 云函数引用数据库 cloud.database() 引用数据库/ await db.collection('products').get() 查询数据 ==> 在使用的页面中调用云函数 wx.cloud.callFunction() 

```


```txt
小程序生命周期(页面，组件)

app.js
  onLaunch: 小程序注册后执行

页面
page
  onLoad： 监听页面加载时(页面未渲染完成)，
  onReady：监听页面初次渲染完成
  onShow： 监听页面显示
  onHide: 监听页面隐藏
  onUnload: 监听页面卸载(从非tabbar页面跳到tabbar页面触发onUnload【非tabbar页面的onUnload执行】)

  注意：如果目前处于tabbar页面且被访问过，再次访问onLoad、onReady不会被触发，只会触发onShow

```

```txt
新增地址

如果新增地址时设置默认地址，首先在添加之前，先查询是否存在默认地址，如果存在默认地址，则先将数据库的默认地址改为非默认地址，然后再添加新地址
```


