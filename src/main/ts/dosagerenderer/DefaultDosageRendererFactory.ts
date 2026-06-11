import { DefaultDosageRenderer } from "./DefaultDosageRenderer";
import { DosageRenderer } from "./DosageRenderer";
import { DosageFormatterOptions, DosageRendererFactory } from "./DosageRendererFactory";


export class DefaultDosageRendererFactory implements DosageRendererFactory {
    getDosageRenderer(options: DosageFormatterOptions = {}): DosageRenderer {
        return new DefaultDosageRenderer(options);
    }
}