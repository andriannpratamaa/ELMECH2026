"use client";

import { useCallback, useRef, useState, useMemo, useEffect } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import { TextStyle } from "@tiptap/extension-text-style";
import Color from "@tiptap/extension-color";
import Highlight from "@tiptap/extension-highlight";
import TextAlign from "@tiptap/extension-text-align";
import TaskList from "@tiptap/extension-task-list";
import TaskItem from "@tiptap/extension-task-item";
import Link from "@tiptap/extension-link";
import ImageExt from "@tiptap/extension-image";
import { Table } from "@tiptap/extension-table";
import TableRow from "@tiptap/extension-table-row";
import TableCell from "@tiptap/extension-table-cell";
import TableHeader from "@tiptap/extension-table-header";
import HorizontalRule from "@tiptap/extension-horizontal-rule";
import Placeholder from "@tiptap/extension-placeholder";
import YouTube from "@tiptap/extension-youtube";
import CodeBlockLowlight from "@tiptap/extension-code-block-lowlight";
import { common, createLowlight } from "lowlight";
import { getMedia, mediaUrl, uploadFile } from "@/services/cms";
import type { Media } from "@/types/cms";
import { toast } from "sonner";
import {
  Bold,
  Italic,
  Underline as UnderlineIcon,
  Strikethrough,
  Quote,
  Code,
  Minus,
  Link as LinkIcon,
  Image as ImageIcon,
  Table as TableIcon,
  Video,
  Undo2,
  Redo2,
  RemoveFormatting,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  Palette,
  Highlighter,
  Pilcrow,
  Search,
  Loader2,
  X,
  Copy,
  Check,
  ChevronDown,
  ChevronRight,
  Columns,
  Rows,
  Trash2,
  Merge,
  Split,
  Plus,
  List,
  ListOrdered,
  ListChecks,
  Heading1,
  Heading2,
  Heading3,
  Heading4,
  Heading5,
  Heading6,
  TableProperties,
  Columns2,
} from "lucide-react";

const lowlight = createLowlight(common);

interface TiptapEditorProps {
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
  disabled?: boolean;
}

type ToolbarButton = {
  key: string;
  icon: React.ReactNode;
  label: string;
  action: () => void;
  isActive?: () => boolean;
  isDisabled?: () => boolean;
};

function ToolbarButton({
  icon,
  label,
  action,
  active,
  disabled,
}: {
  icon: React.ReactNode;
  label: string;
  action: () => void;
  active?: boolean;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={action}
      disabled={disabled}
      title={label}
      className={`p-1.5 rounded-lg text-sm transition-all duration-150 ${
        active
          ? "bg-[#FBBF24]/20 text-[#FBBF24] shadow-sm"
          : "text-white/60 hover:text-white hover:bg-white/10"
      } disabled:opacity-30 disabled:cursor-not-allowed`}
    >
      {icon}
    </button>
  );
}

function ToolbarDropdown({
  label,
  icon,
  value,
  options,
  onChange,
  disabled,
}: {
  label: string;
  icon?: React.ReactNode;
  value: string;
  options: { label: string; value: string }[];
  onChange: (value: string) => void;
  disabled?: boolean;
}) {
  return (
    <div className="relative group">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        className="appearance-none bg-transparent text-white/60 hover:text-white border border-white/10 rounded-lg px-2 py-1.5 text-xs cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed outline-none"
        title={label}
      >
        {options.map((opt) => (
          <option
            key={opt.value}
            value={opt.value}
            className="bg-[#1E293B] text-white/80"
          >
            {opt.label}
          </option>
        ))}
      </select>
      <div className="pointer-events-none absolute inset-y-0 right-1 flex items-center">
        <ChevronDown className="w-3 h-3 text-white/40" />
      </div>
    </div>
  );
}

function ToolbarSeparator() {
  return <div className="w-px h-6 bg-white/10 mx-0.5 flex-shrink-0" />;
}

export default function TiptapEditor({
  value,
  onChange,
  placeholder = "",
  disabled = false,
}: TiptapEditorProps) {
  const [mounted, setMounted] = useState(false);
  const [isPickerOpen, setIsPickerOpen] = useState(false);
  const [media, setMedia] = useState<Media[]>([]);
  const [mediaLoading, setMediaLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const filteredMedia = useMemo(() => {
    if (!searchQuery) return media;
    return media.filter((m) =>
      m.filename.toLowerCase().includes(searchQuery.toLowerCase()),
    );
  }, [media, searchQuery]);

  const loadMedia = useCallback(async () => {
    try {
      setMediaLoading(true);
      const data = await getMedia();
      setMedia(data);
    } catch {
      toast.error("Gagal memuat media");
    } finally {
      setMediaLoading(false);
    }
  }, []);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [1, 2, 3, 4, 5, 6] },
      }),
      Underline,
      TextStyle,
      Color,
      Highlight.configure({ multicolor: true }),
      TextAlign.configure({ types: ["heading", "paragraph"] }),
      TaskList,
      TaskItem.configure({ nested: true }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: { rel: "noopener noreferrer", target: "_blank" },
      }),
      ImageExt.configure({
        resize: {
          enabled: true,
          directions: ["left", "right", "top", "bottom"],
          minWidth: 50,
          minHeight: 50,
        },
      }),
      Table.configure({ resizable: true }),
      TableRow,
      TableCell,
      TableHeader,
      HorizontalRule,
      Placeholder.configure({
        placeholder: placeholder || "Mulai menulis...",
      }),
      YouTube.configure({
        controls: true,
        modestBranding: true,
        width: 640,
        height: 480,
      }),
      CodeBlockLowlight.configure({ lowlight }),
    ],
    content: value,
    editable: !disabled,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
  });

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (editor && disabled !== undefined) {
      editor.setEditable(!disabled);
    }
  }, [editor, disabled]);

  useEffect(() => {
    if (editor && value !== editor.getHTML()) {
      editor.commands.setContent(value);
    }
  }, [editor, value]);

  if (!mounted || !editor) {
    return (
      <div className="h-[400px] rounded-xl bg-white/5 border border-white/10 animate-pulse" />
    );
  }

  const handleImageUpload = () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";
    input.onchange = async () => {
      const file = input.files?.[0];
      if (!file) return;
      try {
        const result = await uploadFile(file);
        const url = mediaUrl(result.url);
        editor.chain().focus().setImage({ src: url }).run();
        toast.success("Gambar berhasil diupload");
      } catch {
        toast.error("Gagal mengupload gambar");
      }
    };
    input.click();
  };

  const handleInsertMedia = (m: Media) => {
    const url = mediaUrl(m.url);
    editor.chain().focus().setImage({ src: url, alt: m.filename }).run();
    setIsPickerOpen(false);
    toast.success("Gambar ditambahkan");
  };

  const handleCopyUrl = (m: Media) => {
    const url = mediaUrl(m.url);
    navigator.clipboard.writeText(url);
    toast.success("URL disalin");
  };

  const toggleLink = () => {
    const previousUrl = editor.getAttributes("link").href;
    if (previousUrl) {
      editor.chain().focus().unsetLink().run();
      return;
    }
    const url = prompt("Masukkan URL:", previousUrl || "https://");
    if (url === null) return;
    if (url === "") {
      editor.chain().focus().unsetLink().run();
      return;
    }
    editor.chain().focus().setLink({ href: url }).run();
  };

  const insertYouTube = () => {
    const url = prompt(
      "Masukkan URL YouTube:",
      "https://www.youtube.com/watch?v=",
    );
    if (!url) return;
    editor.chain().focus().setYoutubeVideo({ src: url }).run();
  };

  const insertVimeo = () => {
    const url = prompt("Masukkan URL Vimeo:", "https://vimeo.com/");
    if (!url) return;
    const match = url.match(/vimeo\.com\/(\d+)/);
    if (!match) {
      toast.error("URL Vimeo tidak valid");
      return;
    }
    editor
      .chain()
      .focus()
      .insertContent(
        `<figure class="video-container"><iframe src="https://player.vimeo.com/video/${match[1]}" frameborder="0" allowfullscreen style="width:100%;height:315px;max-width:560px;border-radius:12px;"></iframe></figure>`,
      )
      .run();
  };

  const insertTable = () => {
    const rows = parseInt(prompt("Jumlah baris:", "3") || "3", 10);
    const cols = parseInt(prompt("Jumlah kolom:", "3") || "3", 10);
    editor
      .chain()
      .focus()
      .insertTable({ rows, cols, withHeaderRow: true })
      .run();
  };

  const fontSizeOptions = [
    { label: "Ukuran", value: "default" },
    { label: "12", value: "12px" },
    { label: "14", value: "14px" },
    { label: "16", value: "16px" },
    { label: "18", value: "18px" },
    { label: "20", value: "20px" },
    { label: "24", value: "24px" },
    { label: "28", value: "28px" },
    { label: "32", value: "32px" },
    { label: "36", value: "36px" },
    { label: "48", value: "48px" },
  ];

  const headingOptions = [
    { label: "Paragraph", value: "paragraph" },
    { label: "H1", value: "1" },
    { label: "H2", value: "2" },
    { label: "H3", value: "3" },
    { label: "H4", value: "4" },
    { label: "H5", value: "5" },
    { label: "H6", value: "6" },
  ];

  const isInTable = editor.isActive("table");

  return (
    <div className="tiptap-editor rounded-xl border border-white/10 bg-[#0F172A]/50 overflow-hidden">
      <div className="tiptap-toolbar sticky top-0 z-50 bg-[#1E293B] border-b border-white/10 rounded-t-xl px-3 py-2 flex flex-wrap items-center gap-1 shadow-lg">
        {/* Heading / Paragraph */}
        <ToolbarDropdown
          label="Heading"
          value={
            editor.isActive("paragraph")
              ? "paragraph"
              : [1, 2, 3, 4, 5, 6]
                  .find((l) => editor.isActive("heading", { level: l }))
                  ?.toString() || "paragraph"
          }
          options={headingOptions}
          onChange={(v) => {
            if (v === "paragraph") {
              editor.chain().focus().setParagraph().run();
            } else {
              editor
                .chain()
                .focus()
                .setHeading({ level: parseInt(v) as 1 | 2 | 3 | 4 | 5 | 6 })
                .run();
            }
          }}
        />

        <ToolbarSeparator />

        <ToolbarButton
          icon={<Bold className="w-4 h-4" />}
          label="Bold"
          action={() => editor.chain().focus().toggleBold().run()}
          active={editor.isActive("bold")}
        />
        <ToolbarButton
          icon={<Italic className="w-4 h-4" />}
          label="Italic"
          action={() => editor.chain().focus().toggleItalic().run()}
          active={editor.isActive("italic")}
        />
        <ToolbarButton
          icon={<UnderlineIcon className="w-4 h-4" />}
          label="Underline"
          action={() => editor.chain().focus().toggleUnderline().run()}
          active={editor.isActive("underline")}
        />
        <ToolbarButton
          icon={<Strikethrough className="w-4 h-4" />}
          label="Strikethrough"
          action={() => editor.chain().focus().toggleStrike().run()}
          active={editor.isActive("strike")}
        />

        <ToolbarSeparator />

        {/* Text Color */}
        <div className="relative group">
          <button
            type="button"
            title="Warna Teks"
            className="p-1.5 rounded-lg text-white/60 hover:text-white hover:bg-white/10 transition-all"
            onClick={() => {
              const color = prompt(
                "Masukkan warna (hex, rgb, nama):",
                "#000000",
              );
              if (color) editor.chain().focus().setColor(color).run();
            }}
          >
            <Palette className="w-4 h-4" />
          </button>
        </div>

        {/* Highlight */}
        <ToolbarButton
          icon={<Highlighter className="w-4 h-4" />}
          label="Highlight"
          action={() => editor.chain().focus().toggleHighlight().run()}
          active={editor.isActive("highlight")}
        />

        {/* Font Size */}
        <ToolbarDropdown
          label="Font Size"
          value="default"
          options={fontSizeOptions}
          onChange={(v) => {
            if (v === "default") {
              editor.chain().focus().unsetFontSize().run();
            } else {
              editor.chain().focus().setFontSize(v).run();
            }
          }}
        />

        <ToolbarSeparator />

        {/* Text Align */}
        <ToolbarButton
          icon={<AlignLeft className="w-4 h-4" />}
          label="Align Left"
          action={() => editor.chain().focus().setTextAlign("left").run()}
          active={editor.isActive({ textAlign: "left" })}
        />
        <ToolbarButton
          icon={<AlignCenter className="w-4 h-4" />}
          label="Align Center"
          action={() => editor.chain().focus().setTextAlign("center").run()}
          active={editor.isActive({ textAlign: "center" })}
        />
        <ToolbarButton
          icon={<AlignRight className="w-4 h-4" />}
          label="Align Right"
          action={() => editor.chain().focus().setTextAlign("right").run()}
          active={editor.isActive({ textAlign: "right" })}
        />
        <ToolbarButton
          icon={<AlignJustify className="w-4 h-4" />}
          label="Justify"
          action={() => editor.chain().focus().setTextAlign("justify").run()}
          active={editor.isActive({ textAlign: "justify" })}
        />

        <ToolbarSeparator />

        {/* Lists */}
        <ToolbarButton
          icon={<List className="w-4 h-4" />}
          label="Bullet List"
          action={() => editor.chain().focus().toggleBulletList().run()}
          active={editor.isActive("bulletList")}
        />
        <ToolbarButton
          icon={<ListOrdered className="w-4 h-4" />}
          label="Numbered List"
          action={() => editor.chain().focus().toggleOrderedList().run()}
          active={editor.isActive("orderedList")}
        />
        <ToolbarButton
          icon={<ListChecks className="w-4 h-4" />}
          label="Task List"
          action={() => editor.chain().focus().toggleTaskList().run()}
          active={editor.isActive("taskList")}
        />

        <ToolbarSeparator />

        {/* Block elements */}
        <ToolbarButton
          icon={<Quote className="w-4 h-4" />}
          label="Blockquote"
          action={() => editor.chain().focus().toggleBlockquote().run()}
          active={editor.isActive("blockquote")}
        />
        <ToolbarButton
          icon={<Code className="w-4 h-4" />}
          label="Code Block"
          action={() => editor.chain().focus().toggleCodeBlock().run()}
          active={editor.isActive("codeBlock")}
        />
        <ToolbarButton
          icon={<Minus className="w-4 h-4" />}
          label="Horizontal Line"
          action={() => editor.chain().focus().setHorizontalRule().run()}
        />

        <ToolbarSeparator />

        {/* Links, Images, Media */}
        <ToolbarButton
          icon={<LinkIcon className="w-4 h-4" />}
          label="Link"
          action={toggleLink}
          active={editor.isActive("link")}
        />

        <div className="relative group">
          <button
            type="button"
            title="Image"
            className="p-1.5 rounded-lg text-white/60 hover:text-white hover:bg-white/10 transition-all"
          >
            <ImageIcon className="w-4 h-4" />
          </button>
          <div className="absolute top-full left-0 mt-1 bg-[#1E293B] border border-white/10 rounded-xl shadow-2xl p-2 hidden group-hover:block min-w-[180px] z-[60]">
            <button
              type="button"
              onClick={() => {
                setIsPickerOpen(true);
                loadMedia();
              }}
              className="w-full text-left px-3 py-2 rounded-lg text-sm text-white/70 hover:text-white hover:bg-white/10 transition-all"
            >
              Pilih dari Media Library
            </button>
            <button
              type="button"
              onClick={() => {
                const url = prompt("Masukkan URL gambar:");
                if (url) editor.chain().focus().setImage({ src: url }).run();
              }}
              className="w-full text-left px-3 py-2 rounded-lg text-sm text-white/70 hover:text-white hover:bg-white/10 transition-all"
            >
              URL Gambar
            </button>
            <button
              type="button"
              onClick={handleImageUpload}
              className="w-full text-left px-3 py-2 rounded-lg text-sm text-white/70 hover:text-white hover:bg-white/10 transition-all"
            >
              Upload Gambar
            </button>
          </div>
        </div>

        <ToolbarSeparator />

        {/* Table */}
        <div className="relative group">
          <button
            type="button"
            title="Table"
            className={`p-1.5 rounded-lg text-sm transition-all ${
              isInTable
                ? "bg-[#FBBF24]/20 text-[#FBBF24]"
                : "text-white/60 hover:text-white hover:bg-white/10"
            }`}
          >
            <TableIcon className="w-4 h-4" />
          </button>
          <div className="absolute top-full left-0 mt-1 bg-[#1E293B] border border-white/10 rounded-xl shadow-2xl p-2 hidden group-hover:block min-w-[190px] z-[60]">
            <button
              type="button"
              onClick={insertTable}
              className="w-full text-left px-3 py-2 rounded-lg text-sm text-white/70 hover:text-white hover:bg-white/10 transition-all flex items-center gap-2"
            >
              <Plus className="w-3.5 h-3.5" /> Insert Table
            </button>
            {isInTable && (
              <>
                <div className="h-px bg-white/10 my-1" />
                <button
                  type="button"
                  onClick={() => editor.chain().focus().addRowBefore().run()}
                  className="w-full text-left px-3 py-2 rounded-lg text-sm text-white/70 hover:text-white hover:bg-white/10 transition-all flex items-center gap-2"
                >
                  <Rows className="w-3.5 h-3.5" /> Row Above
                </button>
                <button
                  type="button"
                  onClick={() => editor.chain().focus().addRowAfter().run()}
                  className="w-full text-left px-3 py-2 rounded-lg text-sm text-white/70 hover:text-white hover:bg-white/10 transition-all flex items-center gap-2"
                >
                  <Rows className="w-3.5 h-3.5" /> Row Below
                </button>
                <button
                  type="button"
                  onClick={() => editor.chain().focus().deleteRow().run()}
                  className="w-full text-left px-3 py-2 rounded-lg text-sm text-white/70 hover:text-white hover:bg-white/10 transition-all flex items-center gap-2"
                >
                  <Trash2 className="w-3.5 h-3.5" /> Delete Row
                </button>
                <div className="h-px bg-white/10 my-1" />
                <button
                  type="button"
                  onClick={() => editor.chain().focus().addColumnBefore().run()}
                  className="w-full text-left px-3 py-2 rounded-lg text-sm text-white/70 hover:text-white hover:bg-white/10 transition-all flex items-center gap-2"
                >
                  <Columns className="w-3.5 h-3.5" /> Column Left
                </button>
                <button
                  type="button"
                  onClick={() => editor.chain().focus().addColumnAfter().run()}
                  className="w-full text-left px-3 py-2 rounded-lg text-sm text-white/70 hover:text-white hover:bg-white/10 transition-all flex items-center gap-2"
                >
                  <Columns className="w-3.5 h-3.5" /> Column Right
                </button>
                <button
                  type="button"
                  onClick={() => editor.chain().focus().deleteColumn().run()}
                  className="w-full text-left px-3 py-2 rounded-lg text-sm text-white/70 hover:text-white hover:bg-white/10 transition-all flex items-center gap-2"
                >
                  <Trash2 className="w-3.5 h-3.5" /> Delete Column
                </button>
                <div className="h-px bg-white/10 my-1" />
                <button
                  type="button"
                  onClick={() => editor.chain().focus().mergeCells().run()}
                  className="w-full text-left px-3 py-2 rounded-lg text-sm text-white/70 hover:text-white hover:bg-white/10 transition-all flex items-center gap-2"
                >
                  <Merge className="w-3.5 h-3.5" /> Merge Cells
                </button>
                <button
                  type="button"
                  onClick={() => editor.chain().focus().splitCell().run()}
                  className="w-full text-left px-3 py-2 rounded-lg text-sm text-white/70 hover:text-white hover:bg-white/10 transition-all flex items-center gap-2"
                >
                  <Split className="w-3.5 h-3.5" /> Split Cell
                </button>
                <div className="h-px bg-white/10 my-1" />
                <button
                  type="button"
                  onClick={() => editor.chain().focus().toggleHeaderRow().run()}
                  className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-all flex items-center gap-2 ${
                    editor.isActive("tableHeader")
                      ? "text-[#FBBF24] bg-[#FBBF24]/10"
                      : "text-white/70 hover:text-white hover:bg-white/10"
                  }`}
                >
                  <Heading1 className="w-3.5 h-3.5" /> Header Row
                </button>
                <button
                  type="button"
                  onClick={() =>
                    editor.chain().focus().toggleHeaderColumn().run()
                  }
                  className="w-full text-left px-3 py-2 rounded-lg text-sm text-white/70 hover:text-white hover:bg-white/10 transition-all flex items-center gap-2"
                >
                  <Columns2 className="w-3.5 h-3.5" /> Header Column
                </button>
                <div className="h-px bg-white/10 my-1" />
                <button
                  type="button"
                  onClick={() => editor.chain().focus().deleteTable().run()}
                  className="w-full text-left px-3 py-2 rounded-lg text-sm text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-all flex items-center gap-2"
                >
                  <Trash2 className="w-3.5 h-3.5" /> Delete Table
                </button>
              </>
            )}
          </div>
        </div>

        {/* YouTube */}
        <ToolbarButton
          icon={<Video className="w-4 h-4" />}
          label="YouTube"
          action={insertYouTube}
        />

        {/* Vimeo */}
        <ToolbarButton
          icon={<Video className="w-4 h-4" />}
          label="Vimeo"
          action={insertVimeo}
        />

        <ToolbarSeparator />

        {/* Undo / Redo */}
        <ToolbarButton
          icon={<Undo2 className="w-4 h-4" />}
          label="Undo"
          action={() => editor.chain().focus().undo().run()}
          disabled={!editor.can().undo()}
        />
        <ToolbarButton
          icon={<Redo2 className="w-4 h-4" />}
          label="Redo"
          action={() => editor.chain().focus().redo().run()}
          disabled={!editor.can().redo()}
        />

        <ToolbarSeparator />

        {/* Clear formatting */}
        <ToolbarButton
          icon={<RemoveFormatting className="w-4 h-4" />}
          label="Clear Formatting"
          action={() =>
            editor.chain().focus().clearNodes().unsetAllMarks().run()
          }
        />
      </div>

      {/* Editor content */}
      <div className="tiptap-content px-4 py-3">
        <style>{`
          .tiptap-content .ProseMirror {
            min-height: 350px;
            outline: none;
            color: #e2e8f0;
            font-size: 15px;
            line-height: 1.7;
          }
          .tiptap-content .ProseMirror p.is-editor-empty:first-child::before {
            content: attr(data-placeholder);
            float: left;
            color: rgba(255,255,255,0.25);
            pointer-events: none;
            height: 0;
          }
          .tiptap-content .ProseMirror h1 { font-size: 2em; color: #f1f5f9; font-weight: 700; margin: 0.5em 0 0.3em; }
          .tiptap-content .ProseMirror h2 { font-size: 1.5em; color: #f1f5f9; font-weight: 600; margin: 0.5em 0 0.3em; }
          .tiptap-content .ProseMirror h3 { font-size: 1.25em; color: #f1f5f9; font-weight: 600; margin: 0.4em 0 0.2em; }
          .tiptap-content .ProseMirror h4 { font-size: 1.1em; color: #f1f5f9; font-weight: 600; margin: 0.3em 0 0.2em; }
          .tiptap-content .ProseMirror h5, .tiptap-content .ProseMirror h6 { color: #f1f5f9; font-weight: 600; margin: 0.3em 0 0.2em; }
          .tiptap-content .ProseMirror blockquote {
            border-left: 4px solid #FBBF24;
            padding-left: 16px;
            margin: 12px 0;
            color: rgba(255,255,255,0.6);
            font-style: italic;
          }
          .tiptap-content .ProseMirror pre {
            background: rgba(0,0,0,0.4);
            border: 1px solid rgba(255,255,255,0.08);
            border-radius: 10px;
            padding: 16px;
            overflow-x: auto;
            font-size: 13px;
            line-height: 1.5;
            margin: 12px 0;
          }
          .tiptap-content .ProseMirror pre code {
            background: none;
            color: #e2e8f0;
            padding: 0;
          }
          .tiptap-content .ProseMirror code {
            background: rgba(255,255,255,0.1);
            padding: 2px 6px;
            border-radius: 4px;
            font-size: 0.9em;
            color: #fbbf24;
          }
          .tiptap-content .ProseMirror a {
            color: #60a5fa;
            text-decoration: underline;
            cursor: pointer;
          }
          .tiptap-content .ProseMirror ul,
          .tiptap-content .ProseMirror ol {
            padding-left: 1.5em;
            margin: 0.5em 0;
          }
          .tiptap-content .ProseMirror li {
            margin: 0.2em 0;
          }
          .tiptap-content .ProseMirror ul[data-type="taskList"] {
            list-style: none;
            padding-left: 0;
          }
          .tiptap-content .ProseMirror ul[data-type="taskList"] li {
            display: flex;
            align-items: flex-start;
            gap: 0.5em;
          }
          .tiptap-content .ProseMirror ul[data-type="taskList"] li > label {
            flex-shrink: 0;
            margin-top: 0.25em;
          }
          .tiptap-content .ProseMirror ul[data-type="taskList"] li > label input[type="checkbox"] {
            cursor: pointer;
            accent-color: #FBBF24;
          }
          .tiptap-content .ProseMirror ul[data-type="taskList"] li > div {
            flex: 1;
          }
          .tiptap-content .ProseMirror img {
            max-width: 100%;
            height: auto;
            border-radius: 8px;
            margin: 12px 0;
          }
          .tiptap-content .ProseMirror img.ProseMirror-resizable {
            display: inline-block;
          }
          .tiptap-content .ProseMirror img.ProseMirror-resized {
            cursor: default;
          }
          .tiptap-content .ProseMirror hr {
            border: none;
            border-top: 2px solid rgba(255,255,255,0.1);
            margin: 24px 0;
          }
          .tiptap-content .ProseMirror table {
            border-collapse: collapse;
            width: 100%;
            margin: 12px 0;
            overflow: hidden;
          }
          .tiptap-content .ProseMirror td,
          .tiptap-content .ProseMirror th {
            border: 1px solid rgba(255,255,255,0.2);
            padding: 8px 12px;
            min-width: 60px;
            vertical-align: top;
            position: relative;
          }
          .tiptap-content .ProseMirror th {
            background: rgba(255,255,255,0.06);
            font-weight: 600;
          }
          .tiptap-content .ProseMirror td:not(:last-child)::after,
          .tiptap-content .ProseMirror th:not(:last-child)::after {
            content: "";
            position: absolute;
            right: -1px;
            top: 0;
            bottom: 0;
            width: 3px;
            cursor: col-resize;
            background: transparent;
          }
          .tiptap-content .ProseMirror .selectedCell {
            background: rgba(251,191,36,0.08);
            outline: 2px solid #FBBF24;
            outline-offset: -1px;
          }
          .tiptap-content .ProseMirror .tableWrapper {
            overflow-x: auto;
            margin: 12px 0;
          }
          .tiptap-content .ProseMirror [data-youtube-video] {
            position: relative;
            padding-bottom: 56.25%;
            height: 0;
            overflow: hidden;
            max-width: 100%;
            margin: 16px 0;
            border-radius: 12px;
          }
          .tiptap-content .ProseMirror [data-youtube-video] iframe {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            border: 0;
          }
          .tiptap-content .ProseMirror .video-container {
            position: relative;
            padding-bottom: 56.25%;
            height: 0;
            overflow: hidden;
            max-width: 100%;
            margin: 16px 0;
            border-radius: 12px;
          }
          .tiptap-content .ProseMirror .video-container iframe {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            border: 0;
          }
          .tiptap-content .ProseMirror p {
            margin: 0.5em 0;
          }
        `}</style>
        <EditorContent editor={editor} />
      </div>

      {/* Media Library Modal */}
      {isPickerOpen && (
        <div
          className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/60"
          onClick={() => setIsPickerOpen(false)}
        >
          <div
            className="w-full max-w-3xl max-h-[85vh] bg-[#1E293B] border border-white/10 rounded-2xl shadow-2xl flex flex-col overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-5 py-4 border-b border-white/10">
              <h2 className="text-base font-semibold text-white">
                Pilih dari Media Library
              </h2>
              <button
                onClick={() => setIsPickerOpen(false)}
                className="p-1.5 rounded-lg hover:bg-white/10 text-white/40 hover:text-white transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="px-5 py-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                <input
                  type="text"
                  placeholder="Cari gambar..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-[#FBBF24]/40"
                />
              </div>
            </div>
            <div className="flex-1 overflow-y-auto px-5 pb-4">
              {mediaLoading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="w-6 h-6 text-[#FBBF24] animate-spin" />
                </div>
              ) : filteredMedia.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <ImageIcon className="w-12 h-12 text-white/20 mb-3" />
                  <p className="text-white/40 text-sm">
                    {searchQuery
                      ? "Tidak ada gambar yang cocok"
                      : "Belum ada media"}
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                  {filteredMedia.map((m) => (
                    <div
                      key={m.id}
                      className="group relative rounded-xl overflow-hidden bg-white/5 border border-white/10 hover:border-white/20 transition-all cursor-pointer"
                    >
                      <div className="relative w-full h-28 bg-white/5 overflow-hidden">
                        <img
                          src={mediaUrl(m.url)}
                          alt={m.filename}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          loading="lazy"
                        />
                      </div>
                      <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2 p-2">
                        <button
                          onClick={() => handleInsertMedia(m)}
                          className="px-3 py-1.5 rounded-lg bg-[#FBBF24] text-[#0F172A] text-xs font-semibold hover:bg-[#FCD34D] transition-all w-full"
                        >
                          Gunakan Gambar
                        </button>
                        <button
                          onClick={() => handleCopyUrl(m)}
                          className="px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-all w-full flex items-center justify-center gap-1.5 text-xs"
                        >
                          <Copy className="w-3 h-3" />
                          <span>Salin URL</span>
                        </button>
                      </div>
                      <div className="p-2">
                        <p className="text-white/60 text-[10px] truncate">
                          {m.filename}
                        </p>
                        {m.created_at && (
                          <p className="text-white/40 text-[9px]">
                            {new Date(m.created_at).toLocaleDateString("id-ID")}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            {!mediaLoading && filteredMedia.length > 0 && (
              <div className="px-5 py-3 border-t border-white/10 text-xs text-white/40">
                Menampilkan {filteredMedia.length} dari {media.length} gambar
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
