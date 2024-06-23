# 机器人

构建可调用模型和聊天对话的机器人。

## 机器人列表

`GET /bots`

返回 [机器人](#机器人对象) 列表。

### 返回

[机器人](#机器人对象) 对象列表。

## 查看机器人

`GET /bots/{name}`

查看单个 [机器人](#机器人对象) 。

### 返回

与名称匹配的 [机器人](#机器人对象) 对象。

## 机器人对象

表示一个可以调用模型并可以聊天的机器人对象。

```ts
export interface IBot {
  id: number;

  /**
   * The bot name, which can be referenced in the API endpoints.
   */
  name: string;

  /**
   * Enable or disable bot.
   */
  enabled: boolean;

  /**
   * The object type, which is always "bot".
   */
  object: 'bot';

  /**
   * The Unix timestamp when the model was created.
   */
  created: number;
}
```
