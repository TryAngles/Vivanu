import { CartIcon } from "../micro/icon"
import bottomStyles from "./bottombar.module.css"
export function BottomBar(){
    return (
        <div className={bottomStyles.bottomBar}>
            <div className={bottomStyles.item}>
                <CartIcon/>
                Cart
            </div>
            <div className={`${bottomStyles.active} ${bottomStyles.item}`}>
                <CartIcon/>
                Cart
            </div>
            <div className={bottomStyles.item}>
                <CartIcon/>
                Cart
            </div>
        </div>
    )
}