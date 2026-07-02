const fs = require("fs")
const path = require("path")
const pdfjs = require("pdfjs-dist")

const dir = "C:\\Users\\jivan\\Downloads"
const files = ["Lista 1º Médio.pdf", "Lista 2º Médio.pdf", "Lista 3º Médio.pdf"]

async function main() {
  for (const file of files) {
    const buffer = fs.readFileSync(path.join(dir, file))
    const pdf = await pdfjs.getDocument({ data: buffer }).promise
    console.log("\n=== " + file.replace(".pdf","") + " ===")
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i)
      const content = await page.getTextContent()
      const text = content.items.map(function(item) { return item.str }).join(" ")
      console.log(text)
    }
  }
}
main().catch(console.error)
