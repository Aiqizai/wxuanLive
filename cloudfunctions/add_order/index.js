// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
})

let db = cloud.database();

let _ = db.command;

// 云函数入口函数
exports.main = async (event, context) => {
  console.log('event ==> ', event);

  // 查询地址数据，查询购物车的数据

  // 保存查询的promise
  let pm = [];

  // 查询地址
  pm.push(db.collection('address').where({
    _id: event.aid,
    userInfo: event.userInfo
  }).get())

  // 查询购物车的数据
  pm.push(db.collection('shopcart').where({
    _id: _.in(event.sid),
    userInfo: event.userInfo
  }).get())

  return await Promise.all(pm).then(async (result) => {
    // 第一个数组是地址信息，第二个是购物车数据信息，(此时还需要商品数据，因为商品信息要从后台获取，不能直接从前端页面获取)
    console.log('result ==> ', result);

    // 购物车的_id
    let sids = [];

    // 获取商品的pid
    let pids = [];

    result[1].data.map(v => {
      pids.push(v.pid);
      sids.push(v._id)
    })

    // 根据商品_id查询商品信息
    return await db.collection('products').where({
      _id: _.in(pids)
    }).get().then(async (res) => {
      // console.log('res ==> ', res);
      //  把商品数据添加到购物车数据中
      res.data.map(v => {
        for (let i = 0; i < result[1].data.length; i++) {
          if (result[1].data[i].pid == v._id) {
            result[1].data[i].product = v;
            break;
          }
        }
      })

      // 订单时间
      let date = new Date();

      // 生成订单编号
      let orderNo = 'NO' + date.getTime();

      // 订单状态 0 ==> 准备中, 1 ==> 配送中, 2 ==> 已完成
      let status = 0;

      // console.log('result ==> ', result);

       //订单总数据 (构造订单数据)
       let orderData = {
        orderNo,
        date,
        status,
        address: result[0].data[0],
        products: result[1].data
      };

      //写入订单信息
      return await db.collection('order').add({
        data: orderData
      }).then(async (value) => {
        //根据购物车的_id删除购物车的数据
        if (value && value._id) {

          //如果订单添加成功, 删除购物车数据
          return await db.collection('shopcart').where({
            _id: _.in(sids),
            userInfo: event.userInfo
          }).remove();
        }
      })

    }).catch(err => {
      console.log('err ==> ', err);
    })
  })
}