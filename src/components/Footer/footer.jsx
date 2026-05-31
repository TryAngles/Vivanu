import Styles from "./footer.module.css";

export function Footer() {
    return (
        <footer className={`${Styles.footer} ${Styles.section}`}>
            <div className={Styles.container}>
                {/* Brand Branding Section */}
                <div className={Styles.brandZone}>
                    <h2 className={Styles.brandName}>VIVANU</h2>
                    <p className={Styles.tagline}>Premium Crafted Hardware & Lifestyle Products.</p>
                </div>

                {/* Micro-Link Directory Grid */}
                <div className={Styles.linkGrid}>
                    <div className={Styles.linkColumn}>
                        <h3>Shop</h3>
                        <a href="#new">New Arrivals</a>
                        <a href="#best">Best Sellers</a>
                        <a href="#offers">Special Offers</a>
                    </div>
                    <div className={Styles.linkColumn}>
                        <h3>Support</h3>
                        <a href="#orders">Track Order</a>
                        <a href="#shipping">Shipping & Returns</a>
                        <a href="#contact">Help Center</a>
                    </div>
                </div>

                {/* Base Bottom Decorative Stack */}
                <div className={Styles.baseLine}>
                    <span className={Styles.copyright}>
                        © {new Date().getFullYear()} VIVANU. All rights reserved.
                    </span>
                    <div className={Styles.legalLinks}>
                        <a href="#privacy">Privacy</a>
                        <a href="#terms">Terms</a>
                    </div>
                </div>
            </div>
        </footer>
    );
}
