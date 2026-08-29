declare module 'react-quill' {
  import * as React from 'react';
  export interface QuillOptions {
    theme?: string;
    modules?: any;
    formats?: string[];
    bounds?: string | HTMLElement;
    scrollingContainer?: string | HTMLElement;
    readOnly?: boolean;
    placeholder?: string;
    tabIndex?: number;
    value?: string | any;
    defaultValue?: string | any;
    onChange?: (content: string, delta: any, source: string, editor: any) => void;
    onChangeSelection?: (selection: any, source: string, editor: any) => void;
    onFocus?: (selection: any, source: string, editor: any) => void;
    onBlur?: (previousSelection: any, source: string, editor: any) => void;
    onKeyDown?: React.EventHandler<any>;
    onKeyPress?: React.EventHandler<any>;
    onKeyUp?: React.EventHandler<any>;
    preserveWhitespace?: boolean;
    className?: string;
    style?: React.CSSProperties;
  }
  export default class ReactQuill extends React.Component<QuillOptions> {}
}
