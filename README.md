# fluentui

For local debugging, if you plan to use `npm link` - there is a known issue with react that will potentially break your application.

To fix that, during dev, you'll have to link the react package in this project to load the react from node_modules in your caller application. For example:
```
npm link ..\\test-project\\node_modules\\react\\  ..\\..test-project\\node_modules\\@types\\react\\
```

To successfully use these controls you should create a context:

```ts
const root = React.useRef<HTMLDivElement>(null);
const kwizFluentContext = useKWIZFluentContextProvider({
    ctx: {
        buttonShape: "rounded"
    },
    root
});

//...
<KWIZFluentContext.Provider value={kwizFluentContext}>
    <FluentProvider theme={webLightTheme} ref={root}>
        {content}
    </FluentProvider>
</KWIZFluentContext.Provider>
```