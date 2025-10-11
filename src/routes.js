import React from 'react'
import Banners from './views/Banners/Banners'
import Category from './views/Category/Category'
import Properties from './views/Properties/Properties'
import Services from './views/Services/Services'
import Facilities from './views/Facilities/Facilities'
import Bhk from './views/Bhk/Bhk'
import Documents from './views/Documents/Documents'
import Enquiry from './views/Enquiry/Enquiry'
import Subscription from './views/Subscription/Subscription'
import Contacts from './views/Contacts/Contacts'
import { element } from 'prop-types'
import Testimonials from './views/Testimonials/Testimonials'
import Gallery from './views/Gallery/Gallery'
import BridgeHouseDetails from './views/BridgeHouseDetails/BridgeHouseDetails'
import Auth from './views/Users/Auth'
const Dashboard = React.lazy(() => import('./views/dashboard/Dashboard'))

const routes = [
  { path: '/Dashboard', exact: true, name: 'Dashboard', element: Dashboard },
  { path: '/banner', name: 'Banners ', element: Banners },
  { path: '/enquiry', name: 'Enquiry ', element: Enquiry },
  { path: '/subscription', name: 'Subscription', element: Subscription },
  { path: '/contacts', name: 'Contacts', element: Contacts },
  { path: '/properties', name: 'Properties', element: Properties },
  { path: '/propertyType', name: 'Category', element: Category },
  { path: '/bhk', name: 'Bhk', element: Bhk },
  { path: '/services', name: 'Services', element: Services },
  { path: '/facilities', name: 'Facilities', element: Facilities },
  { path: '/documents', name: 'ELM Profile', element: Documents },
  { path: '/testimonials', name: 'Testimonials', element: Testimonials },
  { path: '/gallery', name: 'Gallery', element: Gallery },
  { path: '/bridgehouse-details', name: 'Bridge House Details', element: BridgeHouseDetails },
  { path: '/users', name: 'Users', element: Auth },
]

export default routes
