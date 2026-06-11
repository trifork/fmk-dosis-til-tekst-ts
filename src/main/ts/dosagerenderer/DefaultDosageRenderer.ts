import { DosageV2 } from "./Dosage";
import { DosageRenderer } from "./DosageRenderer";
import { DosageFormatterOptions } from "./DosageRendererFactory";
import { DosageRenderingTreeBuilder } from "./DosageRenderingTreeBuilder";
import { HtmlVisitor, RenderingContext, MultiLineTextVisitor, OneLineTextVisitor } from "./RenderingContext";


export class DefaultDosageRenderer implements DosageRenderer {
    constructor(private options: DosageFormatterOptions) {
    }

    render(dosage: DosageV2): string {
        const ctx = RenderingContext.createRoot();

        const builder = new DosageRenderingTreeBuilder(dosage, this.options.oneLine);

        builder.render(ctx);

        const visitor = this.options.html
            ? new HtmlVisitor()
            : this.options.oneLine
                ? new OneLineTextVisitor()
                : new MultiLineTextVisitor();

        return ctx.accept(visitor);
    }
}