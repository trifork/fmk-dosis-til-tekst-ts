// test/utils/xmlPretty.ts
import format from "xml-formatter";

/**
 * Pretty prints an XML string.
 * @param xml Raw XML string
 * @param indent Optional indentation string (default: two spaces)
 * @returns Formatted XML string
 */
export function formatXml(xml: string, indent: string = "    "): string {
    return format(xml, {
        indentation: indent,
        collapseContent: true,  // keeps text nodes on one line
        lineSeparator: "\n",
    });
}