import Groq from "groq-sdk";
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
async function main() {
  try {
    const res = await groq.chat.completions.create({
      messages: [{role: "user", content: "কেমন আছো?"}],
      model: "qwen/qwen3.8-27b"
    });
    console.log("Qwen27b:", res.choices[0].message.content);
  } catch (e) {
    console.error("Qwen failed", e.message);
  }
}
main();
