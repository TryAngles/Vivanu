import NavbarStyles from "./navbar.module.css"

function Navbar() {
  const SpaceStyles = {
    width: "100%",
    height: "50px"
  }
  const headingStyles={
    opacity: 0.5
  }
  return (<>
  {/* <div style={SpaceStyles}></div> */}
  <div className={NavbarStyles.navbar}>
    <div style={headingStyles}>
      vivanu
    </div>
  </div>
  </>
  )
}

export default Navbar