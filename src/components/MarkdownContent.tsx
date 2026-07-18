"use client"

import ReactMarkdown from "react-markdown"
import rehypeRaw from "rehype-raw"

function wrapGabarito(md: string): string {
  const lines = md.split("\n")
  const result: string[] = []
  let inGabarito = false

  for (const line of lines) {
    if (/^###\s+Gabarito/.test(line)) {
      if (inGabarito) result.push("</div>")
      result.push('<div class="gabarito-block">')
      inGabarito = true
    } else if (inGabarito && /^###\s/.test(line)) {
      result.push("</div>")
      inGabarito = false
    }
    result.push(line)
  }
  if (inGabarito) result.push("</div>")

  return result.join("\n")
}

export default function MarkdownContent({ children, className = "" }: { children: string; className?: string }) {
  return (
    <div className={className}>
      <ReactMarkdown rehypePlugins={[rehypeRaw]}>
        {wrapGabarito(children)}
      </ReactMarkdown>
    </div>
  )
}
