/* =========================================================
 * Node Model
 * ========================================================= */


type RenderNode = TextNode | ContainerNode | ParagraphNode | HeaderNode | TableNode | DefinitionListNode;

interface BaseNode {
    kind: string;
    display?: "inline" | "block";
}

export interface TextNode extends BaseNode {
    kind: "text";
    text: string;
}

export interface ContainerNode extends BaseNode {
    kind: "container";
    children: RenderNode[];
    options: ContainerOptions;
}

export interface ParagraphNode extends BaseNode {
    kind: "paragraph";
    children: RenderNode[];
    options: ContainerOptions;
}

export interface HeaderNode extends BaseNode {
    kind: "header";
    children: RenderNode[];
    options: BaseOptions;
}

export interface TableNode extends BaseNode {
    kind: "table";
    head: ContainerNode;
    rows: ContainerNode[];
    options: ContainerOptions;
}

export interface DefinitionListNode extends BaseNode {
    kind: "definition-list";
    tuples: { term: string, data: ContainerNode }[];
    options: ContainerOptions;
}

type EditableContainerNode =
    | ContainerNode
    | ParagraphNode
    | HeaderNode;

type JoinStyle =
    | "none"
    | "space"
    | "comma"
    | "dot"
    | "newline"
    | "capitalize-newline"
    | "comma-and";

export interface BaseOptions {
    name?: string;
}

export interface ContainerOptions extends BaseOptions {
    join?: JoinStyle;
}

export interface DefinitionListOptions extends BaseOptions {
    term: string;
}

/* =========================================================
 * Visitor
 * ========================================================= */

export interface RenderVisitor<T = void> {
    visitText(node: TextNode): T;
    visitContainer(node: ContainerNode): T;
    visitParagraph(node: ParagraphNode): T;
    visitHeader(node: HeaderNode): T;
    visitTable(node: TableNode): T;
    visitDefinitionList(node: DefinitionListNode): T;
}

/* =========================================================
 * Base Context
 * ========================================================= */

abstract class Context<TNode extends RenderNode> {
    protected readonly node: TNode;
    protected readonly parent?: Context<RenderNode>;

    protected constructor(
        node: TNode,
        parent?: Context<RenderNode>
    ) {
        this.node = node;
        this.parent = parent;
    }

    getNode(): TNode {
        return this.node;
    }

    accept<T>(visitor: RenderVisitor<T>): T {
        return visitNode(this.node, visitor);
    }
}

/* =========================================================
 * RenderingContext
 * ========================================================= */

export class RenderingContext extends Context<EditableContainerNode> {

    constructor(
        node?: EditableContainerNode,
        parent?: Context<RenderNode>
    ) {
        super(
            node ?? {
                kind: "container",
                children: [],
                options: {},
            },
            parent
        );
    }

    static createRoot(name?: string): RenderingContext {
        const root = new RenderingContext({
            kind: "container",
            children: [],
            options: { name },
        });

        return root;
    }

    append(text: string): this {
        this.node.children.push({
            kind: "text",
            text,
        });

        return this;
    }

    begin(options?: ContainerOptions): RenderingContext {
        const child: ContainerNode = {
            kind: "container",
            children: [],
            options
        };

        this.node.children.push(child);

        return new RenderingContext(child, this);
    }

    beginParagraph(options?: ContainerOptions): RenderingContext {
        const child: ParagraphNode = {
            kind: "paragraph",
            children: [],
            options
        };

        this.node.children.push(child);

        return new RenderingContext(child, this);
    }

    beginHeader(options?: BaseOptions): RenderingContext {
        const child: HeaderNode = {
            kind: "header",
            children: [],
            options
        };

        this.node.children.push(child);

        return new RenderingContext(child, this);
    }

    beginTable(options?: BaseOptions): TableContext {
        const table: TableNode = {
            kind: "table",
            options,
            head: undefined,
            rows: []
        };

        this.node.children.push(table);

        return new TableContext(table, this);
    }

    beginDefinitionList(options?: DefinitionListOptions): DefinitionListContext {
        const definitionList: DefinitionListNode = {
            kind: "definition-list",
            options,
            tuples: []
        };

        this.node.children.push(definitionList);

        return new DefinitionListContext(definitionList, this);
    }
}

/* =========================================================
 * TableContext
 * ========================================================= */
export class TableContext extends Context<TableNode> {
    constructor(
        node: TableNode,
        parent: Context<RenderNode>
    ) {
        super(node, parent);
    }

    beginTableHead(options?: ContainerOptions): RenderingContext {
        const head: ContainerNode = {
            kind: "container",
            children: [],
            options
        };

        this.node.head = head;

        return new RenderingContext(head, this);
    }

    beginTableRow(options?: ContainerOptions): RenderingContext {
        const rowContainer: ContainerNode = {
            kind: "container",
            children: [],
            options
        };

        this.node.rows.push(rowContainer);

        return new RenderingContext(rowContainer, this);
    }
}

/* =========================================================
 * DefinitionListContext
 * ========================================================= */

export class DefinitionListContext extends Context<DefinitionListNode> {
    constructor(
        node: DefinitionListNode,
        parent: Context<RenderNode>
    ) {
        super(node, parent);
    }

    beginDefinition(options?: DefinitionListOptions): RenderingContext {
        const data: ContainerNode = {
            kind: "container",
            children: [],
            options
        };

        this.node.tuples.push({ term: options.term, data });

        return new RenderingContext(data, this);
    }

}

/* =========================================================
 * Traversal
 * ========================================================= */

function visitNode<T>(
    node: RenderNode,
    visitor: RenderVisitor<T>
): T {
    switch (node.kind) {
        case "text":
            return visitor.visitText(node);

        case "container":
            return visitor.visitContainer(node);

        case "paragraph":
            return visitor.visitParagraph(node);

        case "header":
            return visitor.visitHeader(node);

        case "table":
            return visitor.visitTable(node);

        case "definition-list":
            return visitor.visitDefinitionList(node);

        default: {
            const exhaustive: never = node;
            throw new Error(`Unhandled node: ${exhaustive}`);
        }
    }
}

/* =========================================================
 * Example HTML Visitor
 * ========================================================= */

export class HtmlVisitor
    implements RenderVisitor<string> {
    visitText(node: TextNode): string {
        return escapeHtml(node.text);
    }

    visitContainer(node: ContainerNode): string {
        const chunks = node.children
            .map((c) => visitNode(c, this));

        const body = joinChunks(chunks, node.options?.join);

        return node.options?.name
            ? `<div class="${node.options.name}">${body}</div>`
            : body;
    }

    visitParagraph(node: ParagraphNode): string {
        const chunks = node.children
            .map((c) => visitNode(c, this));

        const body = joinChunks(chunks, node.options?.join);

        return node.options?.name
            ? `<p class="${node.options.name}">${body}</p>`
            : `<p>${body}</p>`;
    }

    visitHeader(node: HeaderNode): string {
        const chunks = node.children
            .map((c) => visitNode(c, this));

        const body = capitalize(chunks.join(" "));

        return node.options?.name
            ? `<h3 class="${node.options.name}">${body}</h3>`
            : `<h3>${body}</h3>`;
    }

    visitTable(node: TableNode): string {
        let html = "<table>";

        if (node.head) {
            html += "<thead><th>";
            html += this.wrapInTD(node.head);
            html += "</th></thead>";
        }

        html += "<tbody>";
        for (const rowContainers of node.rows) {
            html += "<tr>";
            html += this.wrapInTD(rowContainers);
            html += "</tr>";
        }

        html += "</tbody>";
        html += "</table";

        return html;
    }

    visitDefinitionList(node: DefinitionListNode): string {
        let html = "<dl>";
        html += node.tuples.map(({ term, data }) => `<dt>${term}</dt><dd>${visitNode(data, this)}</dd>`).join("")
        html += "</dl>";
        return html;
    }

    wrapInTD(node: ContainerNode) {
        const html = node.children
            .map((c) => visitNode(c, this))
            .map(c => `<td>${c}</td>`)
            .join("");

        return html;
    }
}

export class MultiLineTextVisitor
    implements RenderVisitor<string> {
    visitText(node: TextNode): string {
        return node.text;
    }

    visitContainer(node: ContainerNode): string {
        const body = this.joinChildren(node);

        return body;
    }

    private joinChildren(node: ContainerNode | ParagraphNode) {
        if (node.options?.join) {
            const chunks = node.children
                .map((c) => visitNode(c, this));

            return joinChunks(chunks, node.options?.join);
        }
        return joinRenderedNodes(
            node.children,
            child => visitNode(child, this),
            (left, right) => {
                if (right.kind === "header" || right.kind === "table") {
                    return "\n\n";
                }
                if (this.isBlockStyleNode(left) || this.isBlockStyleNode(right)) {
                    return "\n";
                }

                return " ";
            }
        );
    }

    private isBlockStyleNode(node: RenderNode) {
        return node.kind !== "text" && node.kind !== "container";
    }

    visitParagraph(node: ParagraphNode): string {
        // const chunks = node.children
        //     .map((c) => visitNode(c, this));

        // const body = joinChunks(chunks, node.options?.join);
        const body = this.joinChildren(node);

        return body;
    }

    visitHeader(node: HeaderNode): string {
        const chunks = node.children
            .map((c) => visitNode(c, this));

        const body = capitalize(chunks.join(" "));

        return body.length ? `${body}:` : undefined;
    }

    visitTable(node: TableNode): string {
        let text = "";

        let headerCellTexts: string[];
        const maxCellWidths: number[] = [];

        if (node.head) {
            headerCellTexts = this.getCellTexts(node.head);
            this.updateMaxWidths(maxCellWidths, headerCellTexts);
        }

        const bodyCellTexts: string[][] = [];

        for (const rowContainers of node.rows) {
            const cellTexts = this.getCellTexts(rowContainers);
            this.updateMaxWidths(maxCellWidths, headerCellTexts);
            bodyCellTexts.push(cellTexts);
        }

        if (headerCellTexts) {
            text += this.printCellsWithPadding(headerCellTexts, maxCellWidths);
            text += "\n";
        }

        text += bodyCellTexts.map(cellTextsForRow => this.printCellsWithPadding(cellTextsForRow, maxCellWidths)).join("\n");

        return text;
    }

    visitDefinitionList(node: DefinitionListNode): string {
        const texts = node.tuples
            .map(({ term, data }) => `${capitalize(term)}: ${visitNode(data, this)}`)

        const text = texts.join("\n");

        return text;
    }

    printCellsWithPadding(cellTexts: string[], maxCellWidths: number[]) {
        return cellTexts.map((text, index) => {
            const paddingLength = maxCellWidths[index] - text.length + 1;
            const padding = " ".repeat(paddingLength);
            return `${padding}${text} `;
        }).join("");
    }

    updateMaxWidths(maxWidths: number[], values: string[]): void {
        values.forEach((value, i) => {
            maxWidths[i] = Math.max(maxWidths[i] ?? 0, value.length);
        });
    }

    getCellTexts(node: ContainerNode) {
        return node.children
            .map((c) => visitNode(c, this));
    }

}

export class OneLineTextVisitor
    implements RenderVisitor<string> {
    visitText(node: TextNode): string {
        return node.text;
    }

    visitContainer(node: ContainerNode): string {
        const chunks = node.children
            .map((c) => visitNode(c, this));

        const body = joinChunks(chunks, node.options?.join);

        return body;
    }

    visitParagraph(node: ParagraphNode): string {
        const chunks = node.children
            .map((c) => visitNode(c, this));

        const body = joinChunks(chunks, node.options?.join);

        return body;
    }

    visitHeader(node: HeaderNode): string {
        const chunks = node.children
            .map((c) => visitNode(c, this));

        const body = capitalize(chunks.join(" "));

        return body.length ? `${body}:` : undefined;
    }

    visitTable(node: TableNode): string {
        let text = "";

        let headerCellTexts: string[];
        const maxCellWidths: number[] = [];

        if (node.head) {
            headerCellTexts = this.getCellTexts(node.head);
            this.updateMaxWidths(maxCellWidths, headerCellTexts);
        }

        const bodyCellTexts: string[][] = [];

        for (const rowContainers of node.rows) {
            const cellTexts = this.getCellTexts(rowContainers);
            this.updateMaxWidths(maxCellWidths, headerCellTexts);
            bodyCellTexts.push(cellTexts);
        }

        if (headerCellTexts) {
            text += this.printCellsWithPadding(headerCellTexts, maxCellWidths);
            text += "";
        }

        text += bodyCellTexts.map(cellTextsForRow => this.printCellsWithPadding(cellTextsForRow, maxCellWidths)).join(";");

        return text;
    }

    visitDefinitionList(node: DefinitionListNode): string {
        const texts = node.tuples
            .map(({ term, data }) => `${capitalize(term)}: ${visitNode(data, this)}`)

        const text = texts.join(", ");

        return text;
    }

    printCellsWithPadding(cellTexts: string[], maxCellWidths: number[]) {
        return cellTexts.map((text, index) => {
            const paddingLength = maxCellWidths[index] - text.length + 1;
            const padding = " ".repeat(paddingLength);
            return `${padding}${text} `;
        }).join("");
    }

    updateMaxWidths(maxWidths: number[], values: string[]): void {
        values.forEach((value, i) => {
            maxWidths[i] = Math.max(maxWidths[i] ?? 0, value.length);
        });
    }

    getCellTexts(node: ContainerNode) {
        return node.children
            .map((c) => visitNode(c, this));
    }

}

function joinChunks(chunks: string[], joinStyle: JoinStyle = "space") {

    const nonEmptyChunks = chunks.filter(c => c && c.length > 0);

    switch (joinStyle) {
        case "comma":
            return nonEmptyChunks.join(", ");
        case "comma-and":
            return joinTextList(nonEmptyChunks);
        case "dot":
            return nonEmptyChunks.join(". ");
        case "newline":
            return nonEmptyChunks.join("\n");
        case "capitalize-newline":
            return nonEmptyChunks.map(capitalize).join("\n");
        case "none":
            return nonEmptyChunks.join("");
        case "space":
            return nonEmptyChunks.join(" ");
    }
}

function capitalize(s?: string) {
    return s?.length
        ? s[0].toUpperCase() + s.slice(1)
        : s;
}

function joinTextList(items: string[]) {
    if (items.length <= 2) {
        return items.join(" og ");
    }

    return items.slice(0, -1).join(", ") + " og " + items[items.length - 1];
}

/* =========================================================
 * Utility
 * ========================================================= */

function escapeHtml(text: string): string {
    return text
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;");
}

function joinRenderedNodes(
    nodes: RenderNode[],
    render: (node: RenderNode) => string,
    separator: (
        left: RenderNode,
        right: RenderNode
    ) => string
): string {
    if (nodes.length === 0) {
        return "";
    }

    let result = render(nodes[0]);

    for (let i = 1; i < nodes.length; i++) {
        result += separator(nodes[i - 1], nodes[i]);
        result += render(nodes[i]);
    }

    return result;
}