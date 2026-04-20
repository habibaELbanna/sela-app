import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Splash from './pages/Splash/Splash'
import Onboarding from './pages/Onboarding/Onboarding'
import Login from './pages/Login/Login'
import ForgotPassword from './pages/ForgotPassword/ForgotPassword'
import SignUp from './pages/SignUp/SignUp'
import BrowseNeeds from './pages/BrowseNeeds/BrowseNeeds'
import NeedDetails from './pages/NeedDetails/NeedDetails'
import ChatThread from './pages/ChatThread/ChatThread'
import Profile from './pages/Profile/Profile'
import EditProfile from './pages/EditProfile/EditProfile'
import DiscoverNeeds from './pages/DiscoverNeeds/DiscoverNeeds'
import BrowseVendors from './pages/BrowseVendors/BrowseVendors'
import DiscoverVendors from './pages/DiscoverVendors/DiscoverVendors'
import VendorProfile from './pages/VendorProfile/VendorProfile'

const App = () => {
  return (
    <div
      style={{
        background: '#0e0e0e',
        height: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <div
        style={{
          position: 'relative',
          width: '390px',
          height: '810px',
          background: '#1a1a1a',
          borderRadius: '56px',
          border: '2px solid #333',
          boxShadow: '0 0 0 8px #111, 0 0 0 10px #333',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          overflow: 'hidden',
        }}
      >
        {/* Side buttons */}
        <div
          style={{
            position: 'absolute',
            left: '-12px',
            top: '140px',
            width: '4px',
            height: '36px',
            background: '#333',
            borderRadius: '2px',
          }}
        />
        <div
          style={{
            position: 'absolute',
            left: '-12px',
            top: '190px',
            width: '4px',
            height: '64px',
            background: '#333',
            borderRadius: '2px',
          }}
        />
        <div
          style={{
            position: 'absolute',
            left: '-12px',
            top: '264px',
            width: '4px',
            height: '64px',
            background: '#333',
            borderRadius: '2px',
          }}
        />
        <div
          style={{
            position: 'absolute',
            right: '-12px',
            top: '190px',
            width: '4px',
            height: '80px',
            background: '#333',
            borderRadius: '2px',
          }}
        />

        {/* Dynamic island */}
        <div
          style={{
            position: 'absolute',
            top: '10px',
            left: '50%',
            transform: 'translateX(-50%)',
            width: '100px',
            height: '28px',
            background: '#000',
            borderRadius: '20px',
            zIndex: 10,
          }}
        />

        {/* Screen */}
        <div
          style={{
            width: '100%',
            height: '100%',
            overflow: 'hidden',
            position: 'relative',
            borderRadius: '48px',
          }}
        >
          <BrowserRouter>
            <Routes>
              <Route path='/' element={<Splash />} />
              <Route path='/onboarding' element={<Onboarding />} />
              <Route path='/login' element={<Login />} />
              <Route path='/forgot-password' element={<ForgotPassword />} />
              <Route path='/signup' element={<SignUp />} />
              <Route path='/browse-needs' element={<BrowseNeeds />} />
              <Route path='/need/:id' element={<NeedDetails />} />
              <Route path='/messages/new' element={<ChatThread />} />
              <Route path='/messages/:id' element={<ChatThread />} />
              <Route path='/profile' element={<Profile />} />
              <Route path='/profile/edit' element={<EditProfile />} />
              <Route path='/discover-needs' element={<DiscoverNeeds />} />
              <Route path='/browse-vendors' element={<BrowseVendors />} />
              <Route path='/discover-vendors' element={<DiscoverVendors />} />
              <Route path='/vendor/:id' element={<VendorProfile />} />
            </Routes>
          </BrowserRouter>
        </div>
      </div>
    </div>
  )
}

export default App
