import { IDictionary, isNotEmptyArray, isNotEmptyString } from "@kwiz/common";
import { Editor, loader } from '@monaco-editor/react';

export interface iCodeEditorProps {
    value: string;
    onChange: (newValue: string) => void;
    defaultLanguage: "apex" | "azcli" | "bat" | "c" | "clojure" | "coffeescript" | "cpp" | "csharp" | "csp" | "css" | "dockerfile" | "fsharp" | "go" | "graphql" | "handlebars" | "html" | "ini" | "java" | "javascript" | "json" | "kotlin" | "less" | "lua" | "markdown" | "msdax" | "mysql" | "objective-c" | "pascal" | "perl" | "pgsql" | "php" | "plaintext" | "postiats" | "powerquery" | "powershell" | "pug" | "python" | "r" | "razor" | "redis" | "redshift" | "ruby" | "rust" | "sb" | "scheme" | "scss" | "shell" | "sol" | "sql" | "st" | "swift" | "tcl" | "typescript" | "vb" | "xml" | "yaml" | "Default Themes" | "vs-dark" | "light" | "hc-black" | "Custom Themes" | "active4d" | "all-hallows-eve" | "amy" | "birds-of-paradise" | "blackboard" | "brilliance-black" | "brilliance-dull" | "chrome-devtools" | "clouds-midnight" | "clouds" | "cobalt" | "cobalt2" | "dawn" | "dracula" | "dreamweaver" | "eiffel" | "espresso-libre" | "github-dark" | "github-light" | "github" | "idle" | "katzenmilch" | "kuroir-theme" | "lazy" | "magicwb--amiga-" | "merbivore-soft" | "merbivore" | "monokai-bright" | "monokai" | "night-owl" | "nord" | "oceanic-next" | "pastels-on-dark" | "slush-and-poppies" | "solarized-dark" | "solarized-light" | "spacecadet" | "sunburst" | "textmate--mac-classic-" | "tomorrow-night-blue" | "tomorrow-night-bright" | "tomorrow-night-eighties" | "tomorrow-night" | "tomorrow" | "twilight" | "upstream-sunburst" | "vibrant-ink" | "xcode-default" | "zenburnesque" | "iplastic" | "idlefingers" | "krtheme" | "monoindustrial";
    /** key: name of library/module, value: types, enums, interfaces and declare global variables */
    extraLibs?: IDictionary<string>;
    hideLineNumbers?: boolean;
    jsonSchemaValidations?: {
        /** https://your-app/license-blob-schema.json */
        uri: string;
        /** ["*"], // Apply to all JSON models or use a specific model URI */
        fileMatch: string[];
        /** json schema */
        schema: Object
    }[];
    /** pass in the CDN to use, like: https://apps.kwizcom.com/libs/monaco-editor/4.7.0/min/vs */
    overrideCdn?: string;
}

/** it is recommended to lazy load this control into its own chunk */
export function CodeEditor(props: iCodeEditorProps) {
    if (isNotEmptyString(props.overrideCdn))//load from our build do not load from cdn
        loader.config({
            paths: {
                vs: props.overrideCdn//'https://apps.kwizcom.com/libs/monaco-editor/4.7.0/min/vs',
            },
        });

    return <>
        <style>{`.force-ltr{direction:ltr;}`}</style>
        <Editor className="force-ltr" defaultLanguage={props.defaultLanguage}
            options={{
                minimap: { enabled: false },
                lineNumbers: props.hideLineNumbers ? "off" : undefined
            }}
            value={props.value}
            beforeMount={monaco => {
                // extra libraries
                if (props.extraLibs)
                    Object.keys(props.extraLibs).forEach(key =>
                        monaco.languages.typescript.javascriptDefaults.addExtraLib(props.extraLibs[key], key)
                    );

                if (isNotEmptyArray(props.jsonSchemaValidations))
                    monaco.languages.json.jsonDefaults.setDiagnosticsOptions({
                        validate: true,
                        schemas: props.jsonSchemaValidations
                    });
            }}
            onChange={(value, ev) => {
                props.onChange(value);
            }}
        /></>;
}