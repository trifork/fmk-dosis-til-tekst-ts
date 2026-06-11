import { DosageRenderer } from "./DosageRenderer";

export type DosageFormatterOptions = {
    oneLine?: boolean;
    html?: boolean;
    maxLength?: number;
};

export interface DosageRendererFactory {
    getDosageRenderer(rendererOptions: DosageFormatterOptions): DosageRenderer;
}