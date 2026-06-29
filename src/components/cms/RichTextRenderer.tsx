"use client";

import { useEffect, useMemo, useRef } from "react";
import { createLowlight, common } from "lowlight";
import { toHtml } from "hast-util-to-html";

const lowlight = createLowlight(common);

function sanitizeHTML(html: string): string {
  let s = html;
  s = s.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "");
  s = s.replace(/\s+on\w+\s*=\s*"[^"]*"/gi, "");
  s = s.replace(/\s+on\w+\s*=\s*'[^']*'/gi, "");
  s = s.replace(/\s+on\w+\s*=\s*\S+/gi, "");
  s = s.replace(/href="javascript:[^"]*"/gi, 'href="#');
  s = s.replace(/href='javascript:[^']*'/gi, "href='#'");
  return s;
}

function processTableColgroup(html: string): string {
  return html.replace(/<table\b[^>]*>([\s\S]*?)<\/table>/gi, (tableMatch) => {
    const maxWidths: number[] = [];

    const rowRegex = /<tr\b[^>]*>([\s\S]*?)<\/tr>/gi;
    let rowMatch: RegExpExecArray | null;
    while ((rowMatch = rowRegex.exec(tableMatch)) !== null) {
      const rowContent = rowMatch[1];
      let colIdx = 0;

      const cellRegex = /<t[dh]\b([^>]*)>/gi;
      let cellMatch: RegExpExecArray | null;
      while ((cellMatch = cellRegex.exec(rowContent)) !== null) {
        const attrs = cellMatch[1];

        const colspan = parseInt(
          attrs.match(/colspan\s*=\s*["']?(\d+)["']?/i)?.[1] || "1",
          10,
        );
        const colwidthAttr = attrs.match(
          /data-colwidth\s*=\s*["']([^"']*)["']/i,
        )?.[1];

        if (colwidthAttr) {
          const widths = colwidthAttr.split(",").map(Number);
          for (let i = 0; i < colspan && i < widths.length; i++) {
            const w = widths[i];
            if (!Number.isNaN(w) && w > (maxWidths[colIdx + i] || 0)) {
              maxWidths[colIdx + i] = w;
            }
          }
        }
        colIdx += colspan;
      }
    }

    if (maxWidths.length === 0) return tableMatch;

    const colgroup = maxWidths
      .map((w) =>
        w && !Number.isNaN(w) ? `<col style="width:${w}px">` : "<col>",
      )
      .join("");

    // Strip data-colwidth from cells
    const cleaned = tableMatch.replace(
      /\s+data-colwidth\s*=\s*["'][^"']*["']/gi,
      "",
    );

    return cleaned.replace(/(<table\b[^>]*>)/, `$1<colgroup>${colgroup}</colgroup>`);
  });
}

function processVideoWrappers(html: string): string {
  let result = html;

  // Step 1: Extract YouTube extension divs and store them
  const videoBlocks: string[] = [];
  let placeholderIdx = 0;

  // YouTube: <div data-youtube-video="">...
  result = result.replace(
    /<div\b[^>]*?data-youtube-video\b[^>]*>[\s\S]*?<\/div>/gi,
    (match) => {
      const ph = `%%VIDEO_${placeholderIdx}%%`;
      videoBlocks.push(match);
      placeholderIdx++;
      return ph;
    },
  );

  // Vimeo: <figure class="video-container">...
  result = result.replace(
    /<figure\b[^>]*?video-container[^>]*>[\s\S]*?<\/figure>/gi,
    (match) => {
      const ph = `%%VIDEO_${placeholderIdx}%%`;
      videoBlocks.push(match);
      placeholderIdx++;
      return ph;
    },
  );

  // Step 2: Wrap remaining standalone iframes in responsive container
  result = result.replace(
    /<iframe\b([^>]*?)<\/iframe>/gi,
    (match) => `<div class="cms-video-wrapper">${match}</div>`,
  );

  // Step 3: Restore video blocks with responsive wrapper
  videoBlocks.forEach((block, i) => {
    const stripped = block
      .replace(/style\s*=\s*["'][^"']*["']/gi, "")
      .replace(/width\s*=\s*["']\d+["']/gi, "")
      .replace(/height\s*=\s*["']\d+["']/gi, "");
    result = result.replace(
      `%%VIDEO_${i}%%`,
      `<div class="cms-video-wrapper">${stripped}</div>`,
    );
  });

  return result;
}

function processHTML(html: string): string {
  if (!html) return "";

  let result = html;

  // 1. Process tables: add colgroup from data-colwidth + clean attrs
  result = processTableColgroup(result);

  // 2. Wrap tables in responsive container
  result = result.replace(/<table/gi, '<div class="cms-table-wrapper"><table');
  result = result.replace(/<\/table>/gi, "</table></div>");

  // 3. Process video wrappers (YouTube + Vimeo + standalone iframes)
  result = processVideoWrappers(result);

  // 4. Make images responsive (preserve width, height, style)
  result = result.replace(/<img\b([^>]*?)>/gi, (match) => {
    if (match.includes(' loading=')) return match;
    return match.replace("<img", '<img loading="lazy"');
  });

  // 5. Ensure links have target and rel (skip anchors)
  result = result.replace(/<a\b([^>]*?)>/gi, (match, attrs) => {
    if (match.includes(' target=')) return match;
    if (attrs.includes('href="#') || attrs.match(/href\s*=\s*["']#/)) return match;
    return match.replace("<a", '<a target="_blank" rel="noopener noreferrer"');
  });

  return result;
}

export default function RichTextRenderer({
  html,
  className = "",
}: {
  html: string;
  className?: string;
}) {
  const contentRef = useRef<HTMLDivElement>(null);

  const processedHtml = useMemo(() => {
    if (!html) return "";
    const sanitized = sanitizeHTML(html);
    return processHTML(sanitized);
  }, [html]);

  useEffect(() => {
    if (!contentRef.current) return;

    contentRef.current.querySelectorAll("pre > code").forEach((block) => {
      const pre = block.parentElement;
      if (!pre || block.getAttribute("data-highlighted")) return;

      const code = block.textContent || "";
      const langMatch = block.className.match(/language-(\w+)/);
      const lang = langMatch?.[1] || "text";

      try {
        const root = lowlight.highlightAuto(code);
        const lang = root.data?.language;
        if (lang && lang !== "text") {
          block.innerHTML = toHtml(root);
          block.setAttribute("data-highlighted", "yes");
          if (lang) pre.setAttribute("data-language", lang);
        }
      } catch {
        // fallback
      }
    });
  }, [processedHtml]);

  if (!html) return null;

  return (
    <div
      ref={contentRef}
      className={`cms-rich-text ${className}`}
      dangerouslySetInnerHTML={{ __html: processedHtml }}
    />
  );
}
