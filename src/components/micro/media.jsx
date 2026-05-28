export function Image({ src, style }){
    return <img src={src} style={{
        width:"100%",
        height:"100%",
        ...style
    }}/>
}