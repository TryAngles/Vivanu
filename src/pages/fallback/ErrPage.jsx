import { useNavigate } from "react-router"
import { BackIcon, WarningIcon } from "../../components/icon"
import Styles from "./ErrPage.module.css"
export default function ErrPage({status,message}) {
    const navigate = useNavigate()
    return (
        <div className={`container ${Styles.container}`}
            style={{
                height: "100dvh"
            }}>
            <div className={`container ${Styles.box}`}>
                <h1 className={Styles.icon}><WarningIcon/></h1>
                <h1>{status}</h1>
                <h2>{message}</h2>
                <br/>
                <button className={Styles.btn} onClick={()=>navigate("/")}>
                    <span className={Styles.icon}><BackIcon/></span>
                    Go back to Home</button> 
            </div>

        </div>
    )
}