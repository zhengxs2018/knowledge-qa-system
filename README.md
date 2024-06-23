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

4. 创建傀儡并运行

   通过请求创建后，需要通过启动时的终端使用微信扫码

   ```sh
   $ curl -X POST http://localhost:3000/bots/ade/runs
   ```

### 启动本地调试

默认支持 VS Code 的 [调试](https://code.visualstudio.com/docs/editor/debugging) 功能：

1. 打开 `Run And DEBUG` 启动程序
2. 选择 `Run Program` 配置
3. 在希望调试的代码行添加断点或使用 `debugger` 关键字。

## 文档

- [API Reference](./doc/zh-cn/api-reference/index.md)

## 线路图

详见 [开发线路图](https://github.com/zhengxs2018/knowledge-qa-system/issues/1)

## License

MIT
