import { visibleWidth } from "@earendil-works/pi-tui";
import { separator } from "./colors.ts";
import { renderSegment } from "./segments.ts";
import type { SegmentContext, StatusLineSegmentId, StickybarConfig } from "./types.ts";

const SEP = separator(" | ");

function renderLine(ids: readonly StatusLineSegmentId[], context: SegmentContext, width: number): { fitting: string[]; overflow: string[] } {
  const fitting: string[] = [];
  const overflow: string[] = [];
  let used = 2;
  let overflowing = false;

  for (const id of ids) {
    const rendered = renderSegment(id, context);
    if (!rendered.visible) continue;

    const required = visibleWidth(rendered.content) + (fitting.length ? visibleWidth(SEP) : 0);
    if (!overflowing && used + required <= width) {
      fitting.push(rendered.content);
      used += required;
    } else {
      overflowing = true;
      overflow.push(rendered.content);
    }
  }

  return { fitting, overflow };
}

/** Top overflow moves to the front of bottom; remaining bottom overflow is dropped. */
export function renderStatusLayout(config: StickybarConfig, context: SegmentContext, width: number): { top: string; bottom: string } {
  const top = renderLine(config.top, context, width);
  const configuredBottom = config.bottom.flatMap((id) => {
    const rendered = renderSegment(id, context);
    return rendered.visible ? [rendered.content] : [];
  });

  const bottom: string[] = [];
  let used = 2;
  for (const content of [...top.overflow, ...configuredBottom]) {
    const required = visibleWidth(content) + (bottom.length ? visibleWidth(SEP) : 0);
    if (used + required > width) break;
    bottom.push(content);
    used += required;
  }

  return { top: top.fitting.join(SEP), bottom: bottom.join(SEP) };
}
