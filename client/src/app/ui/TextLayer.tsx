import { JSXInternal } from "preact/src/jsx";

type Props = {
    texts: TextDescriptor[];
};

export type TextDescriptor = {
    key: string;
    text: string;
    x: number;
    y: number;
    size: number;
    minWidth?: number;
    color?: string;
    debug?: boolean;
};

export function TextLayer(props: Readonly<Props>): JSXInternal.Element {
    return (
        <>
            {props.texts.map((td) => {
                let styles = `top:${td.y}px;left:${td.x}px;color:${td.color};`;
                if (td.minWidth) {
                    styles += `min-width:${td.minWidth};`;
                }
                if (td.color) {
                    styles += `color:${td.color};`;
                }
                return (
                    <div key={td.key} class={td.debug ? "text debug" : "text"} style={styles}>
                        {td.text}
                    </div>
                );
            })}
        </>
    );
}
