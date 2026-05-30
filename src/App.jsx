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

function App() {

  return (
    <AppLayout>
      <Route path='/' element={<Home />} />
      <Route path='/product/:id' element={<ProductPage />} />
    </AppLayout>
  )
}

function AppLayout({ children }) {
  return (
    <DOMContextProvider>
      <div className="app dark">
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
    </DOMContextProvider>
  )
}



export default App
