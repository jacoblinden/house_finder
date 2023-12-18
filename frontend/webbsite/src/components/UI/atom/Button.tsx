
import * as React from 'react';

export interface IButtonProps {
    text: string;
    onClick: () => void;
}

export function Button(props: IButtonProps) {
    return (
        <button onClick={props.onClick} title={props.text}>
            dw
        </button>
    );
}
