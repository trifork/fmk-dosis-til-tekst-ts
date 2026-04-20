export type Namespace = {
    uri: string;
    prefix?: string;
};

export type XmlAttr = {
    name: string;
    value: string;
    ns?: Namespace;
};

export type XmlElement = {
    type: "element";
    name: string;
    ns?: Namespace;
    attrs: readonly XmlAttr[];
    children: readonly XmlNode[];
};

export type XmlText = {
    type: "text";
    value: string;
};

export type XmlComment = {
    type: "comment";
    value: string;
};

export type XmlCData = {
    type: "cdata";
    value: string;
};

export type XmlEmpty = {
    type: "empty";
};

export type XmlNode =
    | XmlElement
    | XmlText
    | XmlComment
    | XmlCData
    | XmlEmpty;