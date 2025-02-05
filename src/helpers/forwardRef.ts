import React from 'react';
//need to redeclare to support forward ref with generic types
declare module "react" {
    function forwardRef<T, P = {}>(
        render: (props: P, ref: React.Ref<T>) => React.JSX.Element | null
    ): (props: P & React.RefAttributes<T>) => React.JSX.Element | null;
}
