// models/product.js

class ProductError extends Error {
    constructor(message) {
        super(message);
        this.name = "ProductError";
    }
}

const str = (v, d = "") =>
    typeof v === "string"
        ? v.trim()
        : d;

const num = (v, d = 0) => {
    v = Number(v);
    return Number.isFinite(v) ? v : d;
};

const bool = (v, d = false) =>
    typeof v === "boolean"
        ? v
        : d;

const arr = v =>
    Array.isArray(v)
        ? v
        : [];

const obj = v =>
    v && typeof v === "object"
        ? v
        : {};

const freeze = o => {
    Object.freeze(o);

    Object.values(o).forEach(v => {
        if (
            v &&
            typeof v === "object" &&
            !Object.isFrozen(v)
        ) freeze(v);
    });

    return o;
};

class Price {
    constructor(data = {}) {
        data = obj(data);

        this.currency = str(data.currency, "INR");
        this.mrp = num(data.mrp);

        this.sellingPrice = num(
            data.sellingPrice,
            this.mrp
        );

        this.discountPercent = num(
            data.discountPercent,
            this.mrp
                ? Math.round(
                    100 -
                    (this.sellingPrice / this.mrp) * 100
                )
                : 0
        );

        this.taxIncluded = bool(
            data.taxIncluded,
            true
        );

        freeze(this);
    }
}

export default class Product {

    #meta;

    constructor(data = {}) {
        data = obj(data);

        if (!data.id)
            throw new ProductError(
                "Product ID missing"
            );

        this.#meta = freeze(
            this.#normalize(data)
        );
    }

    #normalize(data) {

        const pricing = new Price(data.pricing);
        const stock = obj(data.stock);
        const media = obj(data.media);

        return {

            id: str(data.id),

            type: str(data.type, "product"),

            brand: {
                name: str(data.brand?.name),
                country: str(data.brand?.country)
            },

            title: str(data.title),

            shortTitle: str(
                data.shortTitle,
                data.title
            ),

            description: {
                short: str(
                    data.description?.short
                ),

                full: str(
                    data.description?.full
                ),

                bulletPoints: arr(
                    data.description?.bulletPoints
                ).map(v => str(v))
            },

            pricing,

            stock: {
                available: bool(
                    stock.available,
                    pricing.sellingPrice > 0
                )
            },

            media: {
                base:`/data/products/${str(data.id)}`,
                thumbnail: {
                    src: str(
                        media.thumbnail?.src,
                        "/placeholder.webp"
                    ),
                    alt: str(
                        media.thumbnail?.alt,
                        "thumbnail"
                    )
                },

                wide: {
                    src: str(
                        media.wide?.src,
                        media.thumbnail?.src
                    ),

                    alt: str(
                        media.wide?.alt,
                        "wide image"
                    )
                },

                gallery: arr(
                    media.gallery
                ).map(v => ({
                    type: str(v.type, "image"),
                    src: str(v.src),
                    alt: str(v.alt)
                }))
            },

            shipping: {

                weight: str(
                    data.shipping?.weight
                ),

                dimensions: {
                    length: str(
                        data.shipping?.dimensions?.length
                    ),

                    width: str(
                        data.shipping?.dimensions?.width
                    ),

                    height: str(
                        data.shipping?.dimensions?.height
                    )
                },

                returnable: bool(
                    data.shipping?.returnable
                ),

                returnWindowDays: num(
                    data.shipping?.returnWindowDays
                )
            },

            timestamps: {

                createdAt: str(
                    data.timestamps?.createdAt
                ),

                updatedAt: str(
                    data.timestamps?.updatedAt
                )
            },

            attributes: arr(
                data.Attribute
            ).map(v => ({
                label: str(v.label),
                value: str(v.value),
                priority: num(v.priority)
            }))
        };
    }

    get data() {
        return this.#meta;
    }

    get id() {
        return this.#meta.id;
    }

    get title() {
        return this.#meta.title;
    }

    get shortTitle() {
        return this.#meta.shortTitle;
    }

    get price() {
        return this.#meta.pricing.sellingPrice;
    }

    get mrp() {
        return this.#meta.pricing.mrp;
    }

    get discount() {
        return this.#meta.pricing.discountPercent;
    }

    get thumbnail() {
        return this.#meta.media.thumbnail.src;
    }

    get inStock() {
        return this.#meta.stock.available;
    }

    get formattedPrice() {
        return `₹${this.price}`;
    }

    get formattedMRP() {
        return `₹${this.mrp}`;
    }

    get isDiscounted() {
        return this.mrp > this.price;
    }

    get savings() {
        return this.mrp - this.price;
    }

    get media(){
        return this.#meta.media;
    }

    toJSON() {
        return this.#meta;
    }
}