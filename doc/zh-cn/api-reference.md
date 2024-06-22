# API 参考

## 机器人

构建可调用模型和聊天对话的机器人。

### 机器人列表

`GET /bots`

返回机器人列表。

#### 返回

机器人对象列表。

### 查看机器人

`GET /bots/:name`

查看单个机器人。

#### Returns

与名称匹配的机器人对象。

## 运行对象

创建基于可与木偶互动的机器人的运行对象。

相关指南: [机器人](#机器人) 和 Wechaty Puppets.

### 创建木偶并运行

`GET /bots/:name/runs/create`

创建一个傀儡，并在这次请求中运行它。

#### 返回

一个运行对象。

### 取消运行

取消傀儡运行。

`GET /bots/:name/runs/cancel`

> [!TIP]
> 一个傀儡只创建一个运行对象，不会重复创建

#### 返回

与名称相符的已修改运行对象。

## 日志

Listen to bot event logs

相关指南: [Bots](#bots)

### 监听所有机器人日志

`GET /bots/logs`

#### 返回

返回日志对象列表。

### 监听指定机器人日志

`GET /bots/:name/logs`

#### Returns

返回日志对象列表。
