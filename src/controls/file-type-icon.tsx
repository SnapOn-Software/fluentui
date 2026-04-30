import { getFileTypeIconAsUrl, initializeFileTypeIcons } from "@fluentui/react-file-type-icons";

export type FileTypeIconSize = 16 | 20 | 24 | 32 | 40 | 48 | 64 | 96;//import { FileTypeIconSize } from "@fluentui/react-file-type-icons";

export function FileTypeIcon({ ext, size, forwardProps }: { ext: string; className?: string; size?: FileTypeIconSize; forwardProps?: React.DetailedHTMLProps<React.ImgHTMLAttributes<HTMLImageElement>, HTMLImageElement> }) {
    if (!globalThis.kwiz_fluentui_initializeFileTypeIcons) {
        initializeFileTypeIcons();
        globalThis.kwiz_fluentui_initializeFileTypeIcons = true;
    }
    const height = size > 0 ? size : 16;
    const iconUrl = getFileTypeIconAsUrl({ extension: ext, size: height });
    return <img {...(forwardProps || {})} src={iconUrl} alt={`${ext} file icon`} height={height} />;
}