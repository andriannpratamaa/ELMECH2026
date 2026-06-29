import Image from "@tiptap/extension-image";
import { ResizableNodeView, mergeAttributes } from "@tiptap/core";
import type { ResizableNodeViewDirection } from "@tiptap/core";

const CustomImage = Image.extend({
  addAttributes() {
    return {
      ...this.parent?.(),
      align: {
        default: null,
        parseHTML: (el) => {
          const align = el.getAttribute("data-align");
          if (align) return align;
          const textAlign = el.style.textAlign;
          if (textAlign && ["left", "center", "right"].includes(textAlign)) {
            return textAlign;
          }
          const float = el.style.float;
          if (float === "left") return "left";
          if (float === "right") return "right";
          return null;
        },
        renderHTML: (attrs) => {
          if (!attrs.align) return {};
          const styles: string[] = [];
          if (attrs.align === "left") {
            styles.push("float: left");
            styles.push("margin-right: 1em");
          } else if (attrs.align === "right") {
            styles.push("float: right");
            styles.push("margin-left: 1em");
          } else if (attrs.align === "center") {
            styles.push("display: block");
            styles.push("margin-left: auto");
            styles.push("margin-right: auto");
          }
          return {
            "data-align": attrs.align,
            style: styles.join("; "),
          };
        },
      },
    };
  },

  renderHTML({ HTMLAttributes }) {
    const { align, style, ...rest } = HTMLAttributes;
    const imgAttrs: Record<string, any> = { ...rest };
    const styles: string[] = [];
    if (style) styles.push(style);

    if (align === "left") {
      if (!styles.some((s) => s.includes("float"))) styles.push("float: left; margin-right: 1em");
    } else if (align === "right") {
      if (!styles.some((s) => s.includes("float"))) styles.push("float: right; margin-left: 1em");
    } else if (align === "center") {
      if (!styles.some((s) => s.includes("margin"))) styles.push("display: block; margin-left: auto; margin-right: auto");
    }

    if (styles.length > 0) {
      imgAttrs.style = styles.join("; ");
    }

    return ["img", mergeAttributes(this.options.HTMLAttributes, imgAttrs)];
  },

  addNodeView() {
    if (!this.options.resize || !this.options.resize.enabled || typeof document === "undefined") {
      return null;
    }

    const { directions, minWidth, minHeight, alwaysPreserveAspectRatio } = this.options
      .resize as {
      directions: ResizableNodeViewDirection[];
      minWidth: number;
      minHeight: number;
      alwaysPreserveAspectRatio?: boolean;
    };

    return ({ node, getPos, HTMLAttributes, editor }) => {
      const el = document.createElement("img");
      el.draggable = false;

      const mergedAttributes = mergeAttributes(
        this.options.HTMLAttributes,
        HTMLAttributes,
      );

      Object.entries(mergedAttributes).forEach(([key, value]) => {
        if (value != null) {
          switch (key) {
            case "width":
            case "height":
            case "align":
              break;
            default:
              el.setAttribute(key, value);
              break;
          }
        }
      });

      if (node.attrs.width) {
        el.style.width = `${node.attrs.width}px`;
      }
      if (node.attrs.height) {
        el.style.height = `${node.attrs.height}px`;
      }

      const nodeView = new ResizableNodeView({
        element: el,
        editor,
        node,
        getPos,
        onResize: (width, height) => {
          el.style.width = `${width}px`;
          el.style.height = `${height}px`;
        },
        onCommit: (width, height) => {
          const pos = getPos();
          if (pos === undefined) return;
          editor
            .chain()
            .setNodeSelection(pos)
            .updateAttributes("image", { width, height })
            .run();
        },
        onUpdate: (updatedNode) => {
          if (updatedNode.type !== node.type) return false;
          applyAlignStyle(updatedNode.attrs.align);
          return true;
        },
        options: {
          directions,
          min: { width: minWidth, height: minHeight },
          preserveAspectRatio: alwaysPreserveAspectRatio === true,
        },
      });

      const container = nodeView.dom;
      container.style.visibility = "hidden";
      container.style.pointerEvents = "none";

      const applyAlignStyle = (align: string | null) => {
        const s = container.style;
        s.float = "";
        s.margin = "";
        s.display = "";
        if (align === "left") {
          s.float = "left";
          s.marginRight = "1em";
        } else if (align === "right") {
          s.float = "right";
          s.marginLeft = "1em";
        } else if (align === "center") {
          s.display = "block";
          s.marginLeft = "auto";
          s.marginRight = "auto";
        }
      };
      applyAlignStyle(node.attrs.align);

      const showContainer = () => {
        container.style.visibility = "";
        container.style.pointerEvents = "";
      };

      el.onload = showContainer;
      if (mergedAttributes.src) {
        el.src = mergedAttributes.src;
      }
      if (el.complete) {
        showContainer();
      }

      container.draggable = true;
      container.dataset.dragImage = "true";

      return nodeView;
    };
  },
});

export default CustomImage;
