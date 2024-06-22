# 内网知识快速问答系统

通过内网知识库结合 RAG 技术，利用机器人的便捷性，提升信息的获取和分享效率。同时开放 Web 服务以满足不同用户的使用场景，方便进行定制开发。

> [!WARNING]
> 此项目仅用于学习新技术，不保证一定开发完成，请勿用于生产环境。

我们的目标是使信息交流变得更加简单和高效 🙈。

## 启动项目

克隆本仓库后：

1. 拷贝 `.env.example` 为 `.env` 后，根据注释进行修改
2. 安装 `node>=18` 和 `pnpm`，然后运行

   ```sh
   # 安装依赖
   $ pnpm install

   # 创建并初始化本地数据库
   $ pnpm db:init
   ```

3. 运行服务

   ```sh
   $ pnpm start
   ```

4. 创建傀儡比运行

   通过请求创建后，需要通过启动时的终端使用微信扫码

   ```sh
   $ curl -X POST http://localhost:3000/bots/ade/runs
   ```

如果希望进行调试，可以使用 vscode 的 `Run And DEBUG` 启动程序。

## 文档

- [API Reference](./doc/api-reference.md)

## 线路图

- **Web 服务**
  - **机器人**
    - [x] [列表](./doc/zh-cn/api-reference.md#机器人列表)
    - [x] [查找单个机器人](./doc/zh-cn/api-reference.md#查看机器人)
    - **运行**
      - [ ] 查看运行状态
      - [x] [创建木偶并运行](./doc/zh-cn/api-reference.md#创建木偶并运行)
        - [ ] 支持 stream 模式，以便客户端实现扫码登录功能
      - [x] [取消运行](./doc/zh-cn/api-reference.md#取消运行)
        - [ ] 支持 stream 模式，以便显示停止过程
    - **日志**
      - [监听所有机器人日志](./doc/zh-cn/api-reference.md#监听所有机器人日志)
        - [x] 实时监听
        - [ ] 分页获取
      - [监听指定机器人日志](./doc/zh-cn/api-reference.md#监听指定机器人日志)
        - [x] 实时监听
        - [ ] 分页获取
    - **消息**
      - [ ] 查看好友消息
      - [ ] 通过机器人发送消息给好友
      - [ ] 查看群消息
      - [ ] 通过机器人发送消息给群
      - [ ] 通过机器人发送消息给群成员
  - **语言模型**
    - [ ] Chat
    - [ ] Completions
    - [ ] Images
    - [ ] Embeddings
  - **AI Agent**
    - [ ] QA Agent
    - [ ] RAG Agent
  - **知识库**
    - [ ] 知识库列表
    - [ ] 知识问答 (QA Agent)
    - [ ] 检索知识 (RAG Agent)
    - **文档**
      - [ ] 列表
      - [ ] 检索
- **知识库服务**
  - [ ] 列表
  - [ ] 创建
  - [ ] 查找
  - [ ] 删除
    - **文档**
      - [ ] 列表
      - [ ] 创建
      - [ ] 查找
      - [ ] 删除
    - **文档片段**
      - [ ] 列表
      - [ ] 创建
      - [ ] 查找
      - [ ] 删除
- **机器人服务**
  - [x] 列表
  - [ ] 创建
  - [x] 查找
  - [ ] 删除
  - **运行**
    - [x] 创建傀儡并运行
    - [x] 取消运行
  - **消息**
    - [ ] 记录消息
    - [ ] 查看好友消息
    - [ ] 查看群消息
    - [ ] 发送消息给好友
    - [ ] 发送消息给群成员
    - [ ] 发送消息到群
    - [ ] 根据内容决定是否调用语言模型
  - **事件**
    - [x] 支持 `'start | stop | error | scan | login | logout | message`
    - [ ] 如果出现 `error | login | logout` 事件，自动发送消息给管理员
- **傀儡服务**
  - **傀儡服务商**
    - **Wechaty**
    - [钉钉 Stream 模式](https://open.dingtalk.com/document/resourcedownload/introduction-to-stream-mode)
  - **傀儡类型**
    - [x] 个人微信 [wechaty-puppet-wechat4u](https://github.com/wechaty/puppet-wechat4u)
    - [ ] ~~企业微信~~ 暂不支持
    - [ ] ~~企业公众号~~ 暂不支持
    - [ ] 钉钉 [@zhengxs/wechaty-puppet-dingtalk](https://github.com/zhengxs2018/dingtalk-sdk-for-js)
- **语言模型**
  - **模型服务供应商**
    - [ ] Anthropic
    - [ ] OpenAI
    - [ ] 百度云 文心千帆
    - [ ] 阿里云 DashScope 灵积模型服务
    - [ ] [Ollama](https://github.com/ollama/ollama)
    - [ ] `@xenova/transformers` only local embeedings
  - **模型类型**
    - [ ] Chat
    - [ ] Completions
    - [ ] Images
    - [ ] Embeddings
  - **AI Agents**
    - [ ] QA Agent
    - [ ] RAG Agent
- **存储**
  - **数据库**
    - [ ] ~~MYSQL~~ 暂不支持
    - [ ] ~~PostgreSQL~~ 暂不支持
    - [x] SQLite `libsql`

## License

MIT
