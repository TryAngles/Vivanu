import Styles from "./loading.module.css";

export default function LoadingPage({
    status = "Loading",
    message = "Please wait..."
}) {
    return (
        <div
            className={`container ${Styles.container}`}
            style={{ height: "100dvh" }}
        >
            <div className={`container ${Styles.box}`}>

                <div className={Styles.loader}>
                    <span></span>
                    <span></span>
                    <span></span>
                </div>

                <h1 className={Styles.status}>
                    {status}
                </h1>

                <h2 className={Styles.message}>
                    {message}
                </h2>

            </div>

        </div>
    );
}