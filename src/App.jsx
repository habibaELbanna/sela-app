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
import Settings from './pages/Settings/Settings'
import MessagesList from './pages/MessagesList/MessagesList'
import Notifications from './pages/Notifications/Notifications'
import SearchFilters from './pages/SearchFilters/SearchFilters'
import MyProposals from './pages/MyProposals/MyProposals'
import MyNeeds from './pages/MyNeeds/MyNeeds'
import { ToastProvider } from './components/Toast/Toast'
import QualityCheck from './pages/QualityCheck/QualityCheck'
import './App.css'

const App = () => {
  return (
    <div className='app-outer'>
      <div className='app-canvas'>
        <ToastProvider>
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
              <Route path='/profile/settings' element={<Settings />} />
              <Route path='/messages' element={<MessagesList />} />
              <Route
                path='/profile/notifications'
                element={<Notifications />}
              />
              <Route path='/search' element={<SearchFilters />} />
              <Route path='/my-proposals' element={<MyProposals />} />
              <Route path='/my-needs' element={<MyNeeds />} />
              <Route path='/quality-check/:id' element={<QualityCheck />} />
            </Routes>
          </BrowserRouter>
        </ToastProvider>
      </div>
    </div>
  )
}

export default App
