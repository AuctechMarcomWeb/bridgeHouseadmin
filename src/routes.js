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

const Dashboard = React.lazy(() => import('./views/dashboard/Dashboard'))

const routes = [
  { path: '/Dashboard', exact: true, name: 'Dashboard', element: Dashboard }, // ✅ use Dashboard here
  { path: '/banner', name: 'Banners ', element: Banners },
  { path: '/enquiry', name: 'Enquiry ', element: Enquiry },
  { path: '/subscription', name: 'Subscription', element: Subscription },

  { path: '/properties', name: 'Properties', element: Properties },
  { path: '/propertyType', name: 'Category', element: Category },
  { path: '/bhk', name: 'Bhk', element: Bhk },
  { path: '/services', name: 'Services', element: Services },
  { path: '/facilities', name: 'Facilities', element: Facilities },
  { path: '/documents', name: 'ELM Profile', element: Documents },
]

export default routes
