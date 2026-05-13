# About @kwiz/fluentui

@kwiz/fluentui is a set of enhanced controls built for and on top of `@fluentui/react-components` (https://storybooks.fluentui.dev/react)

It adds a few key components, some very powerful and some simple wrappers to make the library easier to render in rapid dev.



# Key components

### Containers

#### Section

Renders a simple div with ease.

Properties:

1. **main**: make this grow to fill space in a stackable component
2. **css**: pass a string array of a makeStyles/useStyles classes

#### Vertical

A simple vertical flex box stackable

#### Horizontal

A simple horizontal flex box stackable

#### Stack

A simple vertical/horizontal flex box stackable

### Data viewers

#### Table

A powerful strongly typed table control with sort, filter, sticky headers and sticker left 1/2 columns.

Provide an item level menu, and easy selection controls.

#### ListEx

Display items using a list control

#### AccordionEX

Display data in a collapsible accordion

### QRCodeEX

Render a QR code for a specific string value (usually, a URL)

### KWIZOverflowV2

A much better, more stable implementation of the overflow concept in the original library.

Render items horizontally or vertically in an overflow hidden zone to automatically collapse overflow items in a menu.

### Inputs

#### InputEx

enhanced input control

#### InputNumberEx

enhanced input number control with built in validations

#### TextAreaEx

enhanced text area input control

#### FileUpload

Render a file upload button with a drop file option

#### DatePickerEx

A date picker wrapped nicely

#### CodeEditor

An implementation wrapper of `monaco-editor`

### FileTypeIcon

Render an icon for a file type

### DropdownEX

Strongly typed dropdown control

### Buttons

A collection of `ButtonEX` controls and `CompoundButtonEX` controls wrapping and enhancing the original button control.

ButtonEX, ButtonEXSecondary, ButtonEXMessageBarAction, ButtonEXPrimary, ButtonEXDanger, ButtonEXSuccess, ButtonEXPrimarySubtle, ButtonEXDangerSubtle

CompoundButtonEX, CompoundButtonEXSecondary, CompoundButtonEXPrimary, CompoundButtonEXDanger

#### DrawPad

A canvas control



# Key hooks

## useDraggable

create a drag / drop context on an element, provide the element ref via dragDropRef like this:

```jsx
const dropContext = useDragDropContext<..., ...>({...});
...
<Vertical main ref={(v) => {
    dropContext.dragDropRef(v);
}}>
```

Next, you can show "drop here" UI using markers like this:

```tsx
{dropContext.drop.isOver && <div>drop here!</div>}
```

a useDragDropContext must be added to all draggable items (or files), and to all droppable zones, explaining what they allow to drag / drop.

## useTrackFocus

## useWindowSize

## useElementSize

## useIsInPrint

## useKeyDown

## useStateEX

set state on steroids. provide promise callback after render, onChange transformer and automatic skip-set when value not change

## useRefWithState

use a ref, that can be tracked as useEffect dependency

## useClickableDiv

return props to make div appear as clickable, and accept enter key as click

## useAlerts

Easily prompt, confirm or alert the user. To use this you must render the alertPrompt in your element.
## useAutoFocusEX

better auto-focus that actually works. use the ref on the element you wish to focus.

focus set initially, and then again on a timeout - default is 200ms timeout. send 0 to skip the timeout

## **useControlledStateTracker**

track an input control if it was changed from a managed to unmanaged (controlled / uncontrolled) state between renders.

for example, if you pass a value on first render, but a defaultValue on a following render.

## **useHighlight**

returns a function you can call to make an element glow momentarily

## useIsConcurrent

 Call at the beginning of a useEffect, check after all your promises finished before applying results to state.
 You must keep the same name for each useEffect

```jsx
const {getConcurrency} = useIsConcurrent();
useEffect(()=>{
     const c = getConcurrency('loading data');
     const result = await someSlowPromise();
     if( c.isCurrent() ) setData(result);
},[]);
```

## useReloadTracker

A simple reload marker, can be used as a dependency, and called as a function

Powerful load/reload/progress management with multiple scopes

## useShowOnHover

Easily show content only on hover

## useToast

## useTrackChanges

Provides useful helpers for tracking if control has changes, and handling the save changes with progress bar and on success/fail messages.

# Usage details

## Debugging

For local debugging, use `yalc-link` to register the project, and `watch` to build and push.

Caller projects should use `yalc add @kwiz/fluentui` to link up your local project.

This will make sure both projects use the same instance of react.

## Using the project controls

To successfully use these controls you should create a context, and wrap it in a drag/drop provider.

We recommend using the provider control:

```tsx
<KWIZFluentProvider ctx={{ buttonShape: "rounded" }}>
    <IdPrefixProvider value="my-project">
    <FluentProvider theme={webLightTheme}>
      {content}
    </FluentProvider>
    </IdPrefixProvider>
</KWIZFluentProvider>

```


