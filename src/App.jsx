import Navbar from './components/navbar'
import Home from './pages/home/home'
import './App.css'
import { BottomBar } from './components/bottombar/bottombar'
import ProductPage from './pages/productPage/productpage'
import { Route, Routes } from 'react-router'
import ErrPage from './pages/fallback/ErrPage'
import ErrorBoundary from './components/errorBoundary/errorBoundary'
import { Footer } from './components/Footer/footer'
import { DOMContextProvider } from './components/domProvider'
import { useRef, useEffect } from 'react'
import { useLocation } from 'react-router-dom';

function App() {

  return (
    <AppLayout>
      <Route path='/' element={<Home />} />
      <Route path='/product/:id' element={<ProductPage />} />
    </AppLayout>
  )
}

function AppLayout({ children }) {
  const wrapperRef = useRef(null);
  const appRef = useRef(null);
  const { pathname } = useLocation(); // Tracks what route the user is looking at

  // FIXED: Forces your internal scrolling layer container straight back to the top on page changes
  useEffect(() => {
    if (wrapperRef.current) {
      wrapperRef.current.scrollTop = 0;
    }
  }, [pathname]); // Fires instantly every single time a path changes

  return (
    <DOMContextProvider scrollRef={wrapperRef} appRef={appRef}>
      <div id='DOM' className='dark'>
        <div id='AppWapper' ref={wrapperRef}>
          <div className="app section" ref={appRef}>
            <ErrorBoundary>
              <Navbar />
              <Routes>
                {children}
                <Route path="*" element={<ErrPage status={404} message={"Page Not Found"} />} />
              </Routes>
              <BottomBar />
              <Footer />
            </ErrorBoundary>
          </div>
        </div>
      </div>
    </DOMContextProvider>
  )
}



export default App
