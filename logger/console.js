/**
 * Aifang Javascript Framework.
 * Copyright 2014 ANJUKE Inc. All rights reserved.
 *
 * @path: logger/console.js
 * @author: Jock
 * @version: 1.0.0
 * @date: 2013/07/31
 *
 */

try {
    var cl = console;
    if (cl && cl.log) {
        cl.log("%c路有多远，只有心知道，\n最美的旅程，是不断的经历，\n坚持走下去，与梦想者同行！\n", "color:#f60");
        cl.log("请将简历发送至%c jockhu@anjukeinc.com（ 邮件标题：“姓名-应聘XX职位-来自console” ）\n\n", "color:red");
    }
} catch (e) {
};