# pi-response-timing

一个 Pi 扩展：每次提问后，在底部状态栏实时显示**首字延迟（TTFT）**和**总耗时**，回答结束时弹出一条汇总通知。

> 适合用来对比不同模型 / 服务商（中转站）的响应速度。

```
等待首字 · 已用 2.31 秒
首字 0.84 秒 · 已用 6.52 秒
首字延迟：0.84 秒 · 本题总耗时：12.07 秒
```

## 功能

- ⏱️ **实时计时**：提交问题后，状态栏每 100ms 刷新一次「首字 / 已用」。
- 🚀 **首字延迟（TTFT）**：从提交到收到第一个 assistant 输出（含思考内容）的时间。
- ✅ **总耗时**：直到本轮 Agent 完全结束（含工具调用、重试、自动续写、压缩）的时间。
- 🔔 **结果通知**：结束后弹出汇总。
- `/timing`：随时重新查看上一次的计时结果。

## 安装

从 npm 安装：

```bash
pi install npm:pi-response-timing
```

从 Git 安装：

```bash
pi install git:github.com/liuxiu34/pi-response-timing
```

本地路径安装（开发时）：

```bash
pi install ./pi-response-timing
```

或者只试用一次、不写入配置：

```bash
pi -e ./pi-response-timing
```

> **注意**：如果你之前把脚本直接放在 `~/.pi/agent/extensions/response-timing.ts`，安装本包后请删除那个文件，否则会加载两次、重复弹出通知。

## 使用

安装后无需配置，正常提问即可。状态栏会出现计时，结束后弹出结果。

手动查看上次结果：

```
/timing
```

## 工作原理

| 事件 | 行为 |
| --- | --- |
| `before_agent_start` | 记录起始时间，启动刷新定时器 |
| `message_update` | 第一条 assistant 输出到达时记录首字时间 |
| `agent_settled` | Agent 完全结束后停止计时，输出汇总 |
| `session_shutdown` | 清理定时器 |

时间使用 `performance.now()`（单调时钟），不受系统时间调整影响。

## 发布到 Pi 官网（Package Gallery）

Pi 官网的插件页 **https://pi.dev/packages** 是**自动从 npm 索引**的，不需要单独投稿。

### 收录条件

1. 包已**公开发布到 npm**；
2. `package.json` 的 `keywords` 里包含 **`pi-package`**；
3. 有有效的资源声明：`pi` 清单（本包已有）或约定的 `extensions/`、`skills/`、`prompts/`、`themes/` 目录。

满足后会被自动抓取并按类型（extension / skill / theme / prompt）归类展示。

### 发布步骤

```bash
# 1. 先确保仓库已推到 GitHub（repository/homepage 字段要和它一致）
git remote add origin https://github.com/liuxiu34/pi-response-timing.git
git push -u origin main

# 2. 登录 npm（首次需要去 npmjs.com 注册并验证邮箱）
npm login

# 3. 发布
npm publish
```

版本更新时改 `version` 再 `npm publish` 即可。

### 加预览图 / 视频（可选）

在 `package.json` 的 `pi` 字段里加公开可访问的 URL（推荐用 GitHub raw 链接）：

```json
{
  "pi": {
    "extensions": ["./extensions/response-timing.ts"],
    "image": "https://raw.githubusercontent.com/liuxiu34/pi-response-timing/main/assets/screenshot.png",
    "video": "https://raw.githubusercontent.com/liuxiu34/pi-response-timing/main/assets/demo.mp4"
  }
}
```

### 生效时间

npm 发布成功后，官网索引有缓存，通常**几小时内**出现；可以直接在官网搜索包名确认。

## 开发

扩展是纯 TypeScript，Pi 通过 jiti 直接加载，无需编译：

```bash
pi -e ./pi-response-timing
```

## License

MIT
