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
pi install git:github.com/<your-name>/pi-response-timing
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

## 开发

扩展是纯 TypeScript，Pi 通过 jiti 直接加载，无需编译：

```bash
pi -e ./pi-response-timing
```

## License

MIT
