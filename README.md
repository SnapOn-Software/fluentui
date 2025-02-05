# fluentui

For local debugging, if you plan to use `npm link` - there is a known issue with react that will potentially break your application.

To fix that, you must mark react and fluentui imports as external.
The best way of doing it is using webpack to build your app, and adding this:
```json
resolve: {
    ...
    modules: [path.resolve(__dirname, 'node_modules'), 'node_modules']//important! needed for @kwiz/fluentui to work correctly when linked
}
```

Otherwise during dev, you'll have to link the react package in this project to load the react from node_modules in your caller application. For example:

```
npm link ..\\test-project\\node_modules\\react\\  ..\\..test-project\\node_modules\\@types\\react\\
```

To successfully use these controls you should create a context, and wrapt it in a drag/drop provider.

We recommend using the provider control:

```ts
<KWIZFluentProvider ctx={{ buttonShape: "rounded" }}>
    <FluentProvider theme={webLightTheme}>
      {content}
    </FluentProvider>
</KWIZFluentProvider>

```

Or you can use the following code:

```ts
// it is no longer needed to send in a root node const root = React.useRef<HTMLDivElement>(null);
const { KWIZFluentContext, value: kwizFluentContext } =
  useKWIZFluentContextProvider({
    ctx: {
      buttonShape: "rounded",
    },
    //root,
  });

//...
<KWIZFluentContext.Provider value={kwizFluentContext}>
  <DragDropContextProvider>
    <FluentProvider theme={webLightTheme} /*ref={root}*/>
      {content}
    </FluentProvider>
  </DragDropContextProvider>
</KWIZFluentContext.Provider>;
```
