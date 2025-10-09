/* eslint-disable react/react-in-jsx-scope */
import { CNavGroup, CNavItem } from '@coreui/react'
import { FaRegAddressCard } from 'react-icons/fa'
import { MdOutlineDashboard } from 'react-icons/md'
const useNav = () => {
  const navItems = [
    {
      component: CNavItem,
      name: 'Dashboard',
      to: '/dashboard',
      icon: <MdOutlineDashboard className="me-3" />,
    },
    {
      component: CNavItem,
      name: 'Users',
      to: '/users',
      icon: <MdOutlineDashboard className="me-3" />,
    },
    {
      component: CNavGroup,
      name: 'Masters',
      to: '/Customer-Profile',
      icon: <FaRegAddressCard className="me-3" />,
      items: [
        {
          component: CNavItem,
          name: 'Property Type',
          to: '/propertyType',
          icon: <MdOutlineDashboard className="me-3" />,
        },
        {
          component: CNavItem,
          name: 'BHK',
          to: '/bhk',
          icon: <MdOutlineDashboard className="me-3" />,
        },
        {
          component: CNavItem,
          name: 'Services',
          to: '/services',
          icon: <MdOutlineDashboard className="me-3" />,
        },
        {
          component: CNavItem,
          name: 'Facilities',
          to: '/facilities',
          icon: <MdOutlineDashboard className="me-3" />,
        },
        {
          component: CNavItem,
          name: 'Documents',
          to: '/documents',
          icon: <MdOutlineDashboard className="me-3" />,
        },
      ],
    },
    {
      component: CNavItem,
      name: 'Properties',
      to: '/properties',
      icon: <MdOutlineDashboard className="me-3" />,
    },

    {
      component: CNavItem,
      name: 'Banner',
      to: '/banner',
      icon: <MdOutlineDashboard className="me-3" />,
    },
    {
      component: CNavItem,
      name: 'Enquiry',
      to: '/enquiry',
      icon: <MdOutlineDashboard className="me-3" />,
    },
    {
      component: CNavItem,
      name: 'Subscription',
      to: '/subscription',
      icon: <MdOutlineDashboard className="me-3" />,
    },
    {
      component: CNavItem,
      name: 'Contacts',
      to: '/contacts',
      icon: <MdOutlineDashboard className="me-3" />,
    },
    {
      component: CNavItem,
      name: 'Gallery',
      to: '/gallery',
      icon: <MdOutlineDashboard className="me-3" />,
    },
    {
      component: CNavItem,
      name: 'Testimonials',
      to: '/testimonials',
      icon: <MdOutlineDashboard className="me-3" />,
    },
    {
      component: CNavItem,
      name: 'Bridge House Details',
      to: '/bridgehouse-details',
      icon: <MdOutlineDashboard className="me-3" />,
    },
  ]

  return navItems
}

export default useNav
