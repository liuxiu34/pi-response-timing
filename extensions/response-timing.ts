import type { ExtensionAPI, ExtensionContext } from "@earendil-works/pi-coding-agent";

/**
 * Response Timing
 *
 * Shows, for every user prompt:
 *   - time to first output (TTFT, 首字延迟)
 *   - total time until the agent has fully settled (总耗时)
 *
 * While the model is working the footer shows a live counter; when the run
 * settles a notification reports the final numbers. `/timing` re-displays the
 * most recent measurement.
 */

const STATUS_KEY = "response-timing";
const TICK_MS = 100;

function formatSeconds(milliseconds: number): string {
  return `${(milliseconds / 1000).toFixed(2)} 秒`;
}

export default function responseTiming(pi: ExtensionAPI) {
  let startedAt = 0;
  let firstOutputAt: number | undefined;
  let active = false;
  let timer: ReturnType<typeof setInterval> | undefined;
  let lastReport: string | undefined;

  const setStatus = (text: string | undefined, ctx: ExtensionContext) => {
    // setStatus is a terminal footer feature; other modes have no footer.
    if (ctx.mode === "tui") ctx.ui.setStatus(STATUS_KEY, text);
  };

  const stopTimer = () => {
    if (timer !== undefined) {
      clearInterval(timer);
      timer = undefined;
    }
  };

  pi.on("before_agent_start", async (_event, ctx) => {
    // performance.now() is monotonic, so it is safe against clock changes.
    stopTimer();
    startedAt = performance.now();
    firstOutputAt = undefined;
    active = true;

    const render = () => {
      if (!active) return;
      const elapsed = performance.now() - startedAt;
      const ttft =
        firstOutputAt === undefined
          ? "等待首字"
          : `首字 ${formatSeconds(firstOutputAt - startedAt)}`;
      setStatus(`${ttft} · 已用 ${formatSeconds(elapsed)}`, ctx);
    };

    render();
    timer = setInterval(render, TICK_MS);
  });

  pi.on("message_update", async (event, ctx) => {
    if (!active || firstOutputAt !== undefined) return;
    if (event.message.role !== "assistant") return;

    firstOutputAt = performance.now();
    setStatus(`首字延迟：${formatSeconds(firstOutputAt - startedAt)}`, ctx);
  });

  pi.on("agent_settled", async (_event, ctx) => {
    if (!active) return;

    const finishedAt = performance.now();
    stopTimer();
    active = false;

    const ttft = firstOutputAt === undefined ? undefined : firstOutputAt - startedAt;
    const total = finishedAt - startedAt;
    lastReport =
      ttft === undefined
        ? `本题耗时：${formatSeconds(total)}（未收到可计时的文本输出）`
        : `首字延迟：${formatSeconds(ttft)} · 本题总耗时：${formatSeconds(total)}`;

    setStatus(lastReport, ctx);
    if (ctx.hasUI) ctx.ui.notify(lastReport, "info");
  });

  pi.on("session_shutdown", async () => {
    stopTimer();
    active = false;
  });

  pi.registerCommand("timing", {
    description: "显示上一次提问的首字延迟与总耗时",
    handler: async (_args, ctx) => {
      if (ctx.hasUI) {
        ctx.ui.notify(lastReport ?? "本次会话还没有计时记录。", "info");
      }
    },
  });
}
