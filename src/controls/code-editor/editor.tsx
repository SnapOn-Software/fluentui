import { IDictionary } from "@kwiz/common";
import Editor from '@monaco-editor/react';

export interface iCodeEditorProps {
    value: string;
    onChange: (newValue: string) => void;
    defaultLanguage: "apex" | "azcli" | "bat" | "c" | "clojure" | "coffeescript" | "cpp" | "csharp" | "csp" | "css" | "dockerfile" | "fsharp" | "go" | "graphql" | "handlebars" | "html" | "ini" | "java" | "javascript" | "json" | "kotlin" | "less" | "lua" | "markdown" | "msdax" | "mysql" | "objective-c" | "pascal" | "perl" | "pgsql" | "php" | "plaintext" | "postiats" | "powerquery" | "powershell" | "pug" | "python" | "r" | "razor" | "redis" | "redshift" | "ruby" | "rust" | "sb" | "scheme" | "scss" | "shell" | "sol" | "sql" | "st" | "swift" | "tcl" | "typescript" | "vb" | "xml" | "yaml" | "Default Themes" | "vs-dark" | "light" | "hc-black" | "Custom Themes" | "active4d" | "all-hallows-eve" | "amy" | "birds-of-paradise" | "blackboard" | "brilliance-black" | "brilliance-dull" | "chrome-devtools" | "clouds-midnight" | "clouds" | "cobalt" | "cobalt2" | "dawn" | "dracula" | "dreamweaver" | "eiffel" | "espresso-libre" | "github-dark" | "github-light" | "github" | "idle" | "katzenmilch" | "kuroir-theme" | "lazy" | "magicwb--amiga-" | "merbivore-soft" | "merbivore" | "monokai-bright" | "monokai" | "night-owl" | "nord" | "oceanic-next" | "pastels-on-dark" | "slush-and-poppies" | "solarized-dark" | "solarized-light" | "spacecadet" | "sunburst" | "textmate--mac-classic-" | "tomorrow-night-blue" | "tomorrow-night-bright" | "tomorrow-night-eighties" | "tomorrow-night" | "tomorrow" | "twilight" | "upstream-sunburst" | "vibrant-ink" | "xcode-default" | "zenburnesque" | "iplastic" | "idlefingers" | "krtheme" | "monoindustrial";
    /** key: name of library/module, value: types, enums, interfaces and declare global variables */
    extraLibs?: IDictionary<string>;
    hideLineNumbers?: boolean;
}

/** it is recommended to lazy load this control into its own chunk */
export function CodeEditor(props: iCodeEditorProps) {
    return <Editor defaultLanguage={props.defaultLanguage}
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
        }}
        onChange={(value, ev) => {
            props.onChange(value);
        }}
    />;
}