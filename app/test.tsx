export default function TestPage() {
  return (
    <div className="p-8 bg-background text-foreground">
      <h1 className="text-2xl font-bold mb-4">Tailwind CSS 测试页面</h1>

      <div className="grid grid-cols-2 gap-4 mb-8">
        <div className="p-4 bg-primary text-primary-foreground rounded-lg">
          Primary 背景色和文字
        </div>
        <div className="p-4 bg-secondary text-secondary-foreground rounded-lg">
          Secondary 背景色和文字
        </div>
        <div className="p-4 bg-accent text-accent-foreground rounded-lg">
          Accent 背景色和文字
        </div>
        <div className="p-4 bg-muted text-muted-foreground rounded-lg">
          Muted 背景色和文字
        </div>
      </div>

      <div className="flex flex-col gap-2 mb-8">
        <button className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/80">
          Primary 按钮
        </button>
        <button className="px-4 py-2 bg-secondary text-secondary-foreground rounded-md hover:bg-secondary/80">
          Secondary 按钮
        </button>
        <button className="px-4 py-2 bg-destructive text-destructive-foreground rounded-md hover:bg-destructive/80">
          Destructive 按钮
        </button>
      </div>

      <div className="border border-border p-4 rounded-lg">
        <p className="text-lg mb-2">这是一个带边框的容器</p>
        <p className="text-muted-foreground">这是一些次要文本</p>
      </div>
    </div>
  );
}
