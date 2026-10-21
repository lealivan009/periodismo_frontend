import { useEffect, useRef, type ReactNode } from "react";

interface RichTextEditorProps {
  id: string;
  initialValue: string;
  onChange: (html: string) => void;
}

function run(command: string, value?: string) {
  document.execCommand(command, false, value);
}

export function RichTextEditor({ id, initialValue, onChange }: RichTextEditorProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (ref.current) {
      ref.current.innerHTML = initialValue;
    }
    // El padre remonta el editor cuando cambia la nota.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function emit() {
    onChange(ref.current?.innerHTML ?? "");
  }

  function apply(command: string, argument?: string) {
    ref.current?.focus();
    run(command, argument);
    emit();
  }

  function addLink() {
    const url = window.prompt("Enlace (https://)");
    if (!url) {
      return;
    }
    if (!/^https?:\/\//i.test(url.trim())) {
      window.alert("El enlace tiene que empezar con http:// o https://");
      return;
    }
    apply("createLink", url.trim());
  }

  return (
    <div className="editor">
      <div className="editor-toolbar" role="toolbar" aria-label="Formato">
        <ToolbarButton onClick={() => apply("bold")}>Negrita</ToolbarButton>
        <ToolbarButton onClick={() => apply("italic")}>Cursiva</ToolbarButton>
        <ToolbarButton onClick={() => apply("formatBlock", "h2")}>Título</ToolbarButton>
        <ToolbarButton onClick={() => apply("insertUnorderedList")}>Lista</ToolbarButton>
        <ToolbarButton onClick={() => apply("insertOrderedList")}>Numerada</ToolbarButton>
        <ToolbarButton onClick={() => apply("formatBlock", "blockquote")}>Cita</ToolbarButton>
        <ToolbarButton onClick={addLink}>Enlace</ToolbarButton>
      </div>
      <div
        id={id}
        ref={ref}
        className="editor-surface"
        contentEditable
        role="textbox"
        aria-multiline
        onInput={emit}
        data-placeholder="Escribí la nota…"
      />
    </div>
  );
}

function ToolbarButton({ children, onClick }: { children: ReactNode; onClick: () => void }) {
  return (
    <button
      type="button"
      className="btn-ghost editor-btn"
      onMouseDown={(event) => event.preventDefault()}
      onClick={onClick}
    >
      {children}
    </button>
  );
}
