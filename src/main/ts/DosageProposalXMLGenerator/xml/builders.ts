import {
    Namespace,
    XmlAttr,
    XmlElement,
    XmlText,
    XmlComment,
    XmlCData,
    XmlEmpty,
    XmlNode
} from "./types";

export const element = (
    name: string,
    options: {
        ns?: Namespace;
        attrs?: XmlAttr[];
        children?: XmlNode[];
    } = {}
): XmlElement => ({
    type: "element",
    name,
    ns: options.ns,
    attrs: options.attrs ?? [],
    children: options.children ?? []
});

export const text = (value: string): XmlText => ({
    type: "text",
    value
});

export const attr = (
    name: string,
    value: string,
    ns?: Namespace
): XmlAttr => ({
    name,
    value,
    ns
});

export const comment = (value: string): XmlComment => ({
    type: "comment",
    value
});

export const cdata = (value: string): XmlCData => ({
    type: "cdata",
    value
});

export const empty: XmlEmpty = {
    type: "empty"
};


export const maybe = (condition: boolean, node: () => XmlNode): XmlNode[] =>
  condition ? [node()] : [];