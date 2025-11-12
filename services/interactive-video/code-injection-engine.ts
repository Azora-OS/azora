interface CodeFrame {
  timestamp: number;
  code: string;
  language: string;
}

export class CodeInjectionEngine {
  private video: HTMLVideoElement;
  private codeFrames: Map<number, CodeFrame> = new Map();
  private editor: any;

  constructor(videoElement: HTMLVideoElement, editorInstance: any) {
    this.video = videoElement;
    this.editor = editorInstance;
    this.initSync();
  }

  addCodeFrame(timestamp: number, code: string, language: string) {
    this.codeFrames.set(Math.floor(timestamp), { timestamp, code, language });
  }

  private initSync() {
    this.video.addEventListener('timeupdate', () => {
      const currentTime = Math.floor(this.video.currentTime);
      const frame = this.codeFrames.get(currentTime);
      
      if (frame && this.editor.getValue() !== frame.code) {
        this.editor.setValue(frame.code);
      }
    });

    this.editor.onDidChangeModelContent(() => {
      const currentTime = Math.floor(this.video.currentTime);
      this.codeFrames.set(currentTime, {
        timestamp: currentTime,
        code: this.editor.getValue(),
        language: this.editor.getModel().getLanguageId()
      });
    });
  }

  seekToCode(searchTerm: string) {
    for (const [time, frame] of this.codeFrames) {
      if (frame.code.includes(searchTerm)) {
        this.video.currentTime = time;
        return;
      }
    }
  }
}
