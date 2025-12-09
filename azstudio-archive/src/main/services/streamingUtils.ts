export interface StreamChunk { text: string; metadata?: any; partial?: boolean }

export class StreamingAssembler {
  private buffer = '';
  private lastEmitted = '';
  private dedupeWindow = 3; // last N strings to check duplicates
  private lastChunks: string[] = [];

  constructor(private options?: { dedupe?: boolean, trim?: boolean }) {
    this.options = { dedupe: true, trim: true, ...(options || {}) };
  }

  private isDuplicate(s: string) {
    if (!this.options?.dedupe) return false;
    return this.lastChunks.includes(s);
  }

  private pushLast(s: string) {
    this.lastChunks.push(s);
    if (this.lastChunks.length > this.dedupeWindow) this.lastChunks.shift();
  }

  // Accept incoming raw chunk; return array of assembled text fragments to emit (0..n)
  accept(chunk: string): StreamChunk[] {
    const out: StreamChunk[] = [];
    const c = this.options?.trim ? chunk.trimStart() : chunk;

    // If the input is whitespace or duplicate of last few, ignore
    if (!c || this.isDuplicate(c)) return out;

    this.pushLast(c);

    // Append to buffer
    this.buffer += c;

    // If buffer contains a complete code block, emit entire code block as a single chunk
    const codeBlockRegex = /```(\w+)?[\s\S]*?```/g;
    let m;
    while ((m = codeBlockRegex.exec(this.buffer)) !== null) {
      const start = m.index;
      const end = codeBlockRegex.lastIndex;
      const codeText = this.buffer.slice(start, end);
      // Emit any text before code block as separate chunk
      const before = this.buffer.slice(0, start).trim();
      if (before) out.push({ text: before });
      out.push({ text: codeText });
      // reset buffer to text after code block
      this.buffer = this.buffer.slice(end);
      codeBlockRegex.lastIndex = 0; // reset regex
    }

    // Attempt to check for balanced JSON object or array at buffer end; if so, return
    try {
      const trimmed = this.buffer.trim();
      if (trimmed.startsWith('{') || trimmed.startsWith('[')) {
        // try to parse; we need to find a parseable substring
        for (let i = trimmed.length; i > 0; i--) {
          const candidate = trimmed.slice(0, i);
          try { JSON.parse(candidate); out.push({ text: candidate }); this.buffer = trimmed.slice(i); break; } catch { /* ignore parse error */ }
        }
        // If we couldn't parse yet but we have some new characters, emit a partial JSON fragment to help UI
        if (!out.length && trimmed.length > 0) {
          out.push({ text: trimmed, partial: true });
          this.buffer = '';
        }
      }
    } catch { /* Ignore parse timing errors */ }

    // If we still have a clean sentence (ending with punctuation), emit it
    const sentenceEndRegex = /([^\.!?\n]+[\.!?\n]+)/g;
    let sMatch;
    while ((sMatch = sentenceEndRegex.exec(this.buffer)) !== null) {
      const sentence = sMatch[0].trim();
      if (sentence) { out.push({ text: sentence }); }
      this.buffer = this.buffer.slice(sentenceEndRegex.lastIndex);
      sentenceEndRegex.lastIndex = 0;
    }

    // If nothing emitted and buffer grows too large, emit partial buffer
    if (out.length === 0 && this.buffer.length > 400) {
      out.push({ text: this.buffer.slice(0, 400) });
      this.buffer = this.buffer.slice(400);
    }
    // Mark any emitted fragments as partial if they came from buffer that may still change
    for (let i = 0; i < out.length; i++) { if (out[i].text && out[i].text.length < 400 && out[i].text.includes('\n')) out[i].partial = true; }

    return out;
  }

  // Flush any remainder
  flush(): StreamChunk[] {
    const out: StreamChunk[] = [];
    const b = this.buffer.trim();
    if (b) out.push({ text: b });
    this.buffer = '';
    return out;
  }
}

export default StreamingAssembler;
