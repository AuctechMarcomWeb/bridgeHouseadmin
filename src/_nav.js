
import { CNavGroup, CNavItem } from '@coreui/react'
import {  FaRegAddressCard } from 'react-icons/fa'
import {
  MdOutlineDashboard,
} from 'react-icons/md'
const useNav = () => {

  const navItems = [
   {
      component: CNavItem,
      name: 'Dashboard',
      to: '/dashboard',
      icon: <MdOutlineDashboard className="me-3" />,
      
    },
     {
      component: CNavGroup,
      name: 'Masters',
      to: '/Customer-Profile',
      icon: <FaRegAddressCard className="me-3" />,
      items: [
      
       

      ],
    },
     {
      component: CNavGroup,
      name: 'Customer Profile',
      to: '/Customer-Profile',
      icon: <FaRegAddressCard className="me-3" />,
      items: [     
      ],
    },
 
    {
      component: CNavItem,
      name: 'Banner',
      to: '/banner',
      icon: <MdOutlineDashboard className="me-3" />,
      
    },
    {
      component: CNavItem,
      name: 'Category',
      to: '/category',
      icon: <MdOutlineDashboard className="me-3" />,
      
    },
     {
      component: CNavItem,
      name: 'Properties',
      to: '/properties',
      icon: <MdOutlineDashboard className="me-3" />,
      
    },

  
  ]

  return navItems
}

export default useNav
