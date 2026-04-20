import { XmlAttr, XmlElement, XmlNode } from "./types";

export function render(node: XmlNode, pretty = false): string {
    const ctx = new Map<string | "", string>();
    return renderNode(node, ctx, pretty ? 0 : -1);
}


function escapeText(value: string): string {
    return value
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;");
}

function escapeAttr(value: string): string {
    return value
        .replace(/&/g, "&amp;")
        .replace(/"/g, "&quot;");
}

function indent(level: number): string {
    return level >= 0 ? "  ".repeat(level) : "";
}

type NamespaceContext = Map<string | "", string>;

function renderNode(
    node: XmlNode,
    ctx: NamespaceContext,
    level: number
): string {
    switch (node.type) {
        case "text":
            return escapeText(node.value);

        case "cdata":
            return `<![CDATA[${node.value}]]>`;

        case "comment":
            return `${indent(level)}<!-- ${node.value} -->`;

        case "empty":
            return "";

        case "element":
            return renderElement(node, ctx, level);
    }
}

function renderElement(
    el: XmlElement,
    parentCtx: NamespaceContext,
    level: number
): string {
    const ctx = new Map(parentCtx);

    const prefix = el.ns?.prefix ?? "";
    const uri = el.ns?.uri;

    const tagName = prefix ? `${prefix}:${el.name}` : el.name;

    let nsDecl = "";

    if (uri) {
        const existing = ctx.get(prefix);

        if (existing !== uri) {
            ctx.set(prefix, uri);

            nsDecl = prefix
                ? ` xmlns:${prefix}="${uri}"`
                : ` xmlns="${uri}"`;
        }
    }

    const attrString = renderAttrs(el.attrs, ctx);

    const openTag = `<${tagName}${nsDecl}${attrString}>`;

    if (el.children.length === 0) {
        return `${indent(level)}<${tagName}${nsDecl}${attrString}/>`;
    }

    const children = el.children
        .map(child => renderNode(child, ctx, level >= 0 ? level + 1 : level))
        .filter(Boolean)
        .join(level >= 0 ? "\n" : "");

    const childBlock =
        level >= 0
            ? `\n${children}\n${indent(level)}`
            : children;

    return `${indent(level)}${openTag}${childBlock}</${tagName}>`;
}

function renderAttrs(
    attrs: readonly XmlAttr[],
    ctx: NamespaceContext
): string {
    if (attrs.length === 0) return "";

    const parts: string[] = [];

    for (const a of attrs) {
        let name = a.name;

        if (a.ns) {
            const prefix = a.ns.prefix;

            if (!prefix) {
                throw new Error(
                    `Attribute ${a.name} cannot use default namespace`
                );
            }

            const existing = ctx.get(prefix);

            if (existing !== a.ns.uri) {
                ctx.set(prefix, a.ns.uri);

                parts.push(`xmlns:${prefix}="${a.ns.uri}"`);
            }

            name = `${prefix}:${a.name}`;
        }

        parts.push(`${name}="${escapeAttr(a.value)}"`);
    }

    return parts.length ? " " + parts.join(" ") : "";
}
