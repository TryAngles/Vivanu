import { useEffect, useMemo, useState } from "react";

const joinPath = (...parts) => {

    parts = parts
        .flat()
        .filter(v => v != null)
        .map(v => String(v).trim())
        .filter(Boolean);

    if (!parts.length)
        return "";

    // absolute url override
    const last = parts.at(-1);

    if (/^(https?:|data:|blob:)/i.test(last))
        return last;

    let protocol = "";

    parts = parts.map((p, i) => {

        // preserve protocol/domain
        if (/^[a-z]+:\/\//i.test(p)) {

            const url = new URL(p);

            protocol =
                url.protocol + "//" +
                url.host;

            p = url.pathname;
        }

        // preserve root
        if (i === 0 && p === "/")
            return "/";

        // first part
        if (i === 0)
            return p.replace(/\/+$/g, "");

        // other parts
        return p
            .replace(/^\/+/g, "")
            .replace(/\/+$/g, "");
    });

    let path = parts.join("/");

    // remove duplicate slashes
    path = path.replace(
        /(?<!:)\/{2,}/g,
        "/"
    );

    // restore protocol
    return protocol
        ? protocol + path
        : path;
};

export function Image({
    src,
    fallback = "/fallback.png",
    style,
    alt = "",
    base = "/",
    ...props
}) {
    console.log("got req", base, src)

    const resolved = useMemo(
        () => joinPath(base, src),
        [base, src]);

    const [img, setImg] = useState(resolved);

    useEffect(() => {
        setImg(resolved);
        console.log("got resolved--", resolved)
    }, [resolved]);

    return (
        <img
            {...props}

            src={img}

            alt={alt}

            style={{
                width: "100%",
                height: "100%",
                ...style
            }}

            onError={e => {

                console.error(
                    "Image Failed:",
                    img
                );

                if (img !== fallback)
                    setImg(fallback);

                else
                    e.currentTarget.style.display =
                        "none";
            }}
        />
    );
}