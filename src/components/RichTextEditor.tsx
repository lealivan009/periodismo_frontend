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

  function addVideo() {
    const selection = window.getSelection();
    const saved = selection && selection.rangeCount > 0 ? selection.getRangeAt(0).cloneRange() : null;
    const url = window.prompt("Pegá el enlace de YouTube");
    if (!url) {
      return;
    }
    const id = youtubeId(url.trim());
    if (!id) {
      window.alert("Ese enlace no es de un video de YouTube.");
      return;
    }
    ref.current?.focus();
    if (saved && ref.current?.contains(saved.startContainer) && selection) {
      selection.removeAllRanges();
      selection.addRange(saved);
    }
    const html = `<figure class="article-video" contenteditable="false"><iframe src="https://www.youtube-nocookie.com/embed/${id}" title="Video de YouTube" loading="lazy" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen></iframe></figure><p><br></p>`;
    run("insertHTML", html);
    emit();
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
        <ToolbarButton onClick={addVideo}>Video</ToolbarButton>
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

function youtubeId(raw: string) {
  let url: URL;
  try {
    url = new URL(raw);
  } catch {
    return null;
  }
  if (url.protocol !== "https:" && url.protocol !== "http:") {
    return null;
  }
  const host = url.hostname.toLowerCase().replace(/^www\./, "");
  const valid = (id: string) => (/^[A-Za-z0-9_-]{11}$/.test(id) ? id : null);
  if (host === "youtu.be") {
    return valid(url.pathname.slice(1).split("/")[0] ?? "");
  }
  if (host !== "youtube.com" && host !== "m.youtube.com" && host !== "youtube-nocookie.com") {
    return null;
  }
  const path = url.pathname.match(/^\/(?:embed|shorts|live)\/([A-Za-z0-9_-]{11})(?:\/|$)/);
  if (path) {
    return path[1];
  }
  return valid(url.searchParams.get("v") ?? "");
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
