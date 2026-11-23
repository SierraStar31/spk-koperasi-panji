import katex from "katex";
import React from "react";

interface TexProps {
  tex?: string;
  display?: boolean;
  className?: string;
  children?: React.ReactNode;
}

export function Tex({ tex, display = false, className = "", children }: TexProps) {
  let text = tex;
  if (!text) {
    if (typeof children === "string") {
      text = children;
    } else if (Array.isArray(children)) {
      text = children
        .map((c) => (typeof c === "string" ? c : ""))
        .join("");
    } else {
      text = "";
    }
  }

  if (!text) {
    return null;
  }

  const html = katex.renderToString(text, {
    displayMode: display,
    throwOnError: false,
  });

  return (
    <span
      className={`inline-block ${display ? "my-2 overflow-x-auto max-w-full print:overflow-visible print:max-w-none" : ""} ${className}`}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
