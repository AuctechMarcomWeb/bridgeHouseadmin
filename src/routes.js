import React from 'react'
import Banners from './views/Banners/Banners'
import Category from './views/Category/Category'
import Properties from './views/Properties/Properties'
const Dashboard = React.lazy(() => import('./views/dashboard/Dashboard'))

const routes = [
  { path: '/', exact: true, name: 'Home' },
  { path: '/category', name: 'ELM Profile', element: Category },
  { path: '/banner', name: 'ELM Profile', element: Banners },
  { path: '/properties', name: 'ELM Profile', element: Properties },

]

export default routes
