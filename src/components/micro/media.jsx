export function Image({ src }){
    return <img src={src} style={{
        width:"100%",
        height:"100%",
        aspectRatio:"16 / 9"
    }}/>
}