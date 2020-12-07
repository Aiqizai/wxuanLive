// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
})

let db = cloud.database();

let _ = db.command;

// 引入联表查询
let $ = db.command.aggregate;

// 云函数入口函数
exports.main = async (event, context) => {
  //console.log('event ==> ', event);
  //根据 _id 集合查询, _id: ['a1', 'a2', 'a3'] 等同于 _id: _eq('a1').or(_eq('a2')).or(_eq('a2'))
  //当不确定 _id 的数量时, 应使用 _id: []操作, 不应使用 _id: _eq(xx).or(...)操作

  // 方式一：

  return await db.collection('shopcart').where({
    _id: _.in(event._ids),
    userInfo: event.userInfo
  }).get().then(async (res) => {
    console.log('查询购物车数据 res ==> ', res);
    // 当商品pid(数据库中商品的_id) == 商品集合的_id, 就能获取到对应商品的信息
    let pids = [];
    // 存好商品_id, 再通过查询_id进行获取到对应商品的信息
    res.data.map(v => {
      pids.push(v.pid)
    })

    console.log('购物车pid集合数组 pids ==> ', pids);

    // 根据pids查询商品集合数据
    return await db.collection('products').where({
      _id: _.in(pids)
    }).get().then(async (result) => {
      console.log('根据pids查询商品集合数据 result ==> ', result);

      // 将购物车的数据和数据库中的商品数据合并

      // res 购物车数据           
      // result 数据库中商品数据集合

      res.data.map(v => {

        // 根据商品pid查找商品数据
        for (let i = 0; i < result.data.length; i++) {
          if (v.pid == result.data[i]._id) {
            // product 存放数据库中商品的信息
            v.product = result.data[i];
            break
          }
        }
      })

      // 返回合并后的数据 (购物车数据)
      return res;
    })
  })

  // 方式二：
/*
  //主动集合 products
  //被动集合 shopcart
  return db.collection('products').aggregate().lookup({
    //被连接的集合
    from: 'shopcart',

    //流水线指令使用的变量, 关联主动集合products的字段
    let: {
      //商品集合的商品_id
      product_id: '$_id'
    },

    //流水线操作, 当shopcart.pid = products._id
    //当shopcart._id 在 event._ids 里面
    //$.and([主动集合的字段, 被动集合的字段])
    pipeline: $.pipeline().match(_.expr($.and([
      $.eq(['$pid', '$$product_id'])
    ]))).match({
      //被动集合的_id, event._ids是shopcart的_id
      _id: _.in(event._ids)
    }).done(),

    //查询被动集合的数据名称
    as: 'cart'
  }).end().then(async (result) => {
    // console.log('result ==> ', result);
    //排除cart = []
    let data = [];
    result.list.map(v => {
      if (v.cart.length > 0) {
        data.push(v);
      }
    })

    return await data;
  })
*/

}