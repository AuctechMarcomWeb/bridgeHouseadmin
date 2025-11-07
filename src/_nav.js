/* eslint-disable prettier/prettier */
/* eslint-disable react/react-in-jsx-scope */
import { CNavGroup, CNavItem } from '@coreui/react'
import { FaRegAddressCard } from 'react-icons/fa'
import { MdOutlineDashboard } from 'react-icons/md'
import {
  AppstoreOutlined,
  UserOutlined,
  ProfileOutlined,
  HomeOutlined,
  PictureOutlined,
  MessageOutlined,
  ShoppingOutlined,
  ContactsOutlined,
  CameraOutlined,
  CommentOutlined,
  BuildOutlined,
  CreditCardOutlined,
} from '@ant-design/icons'

const useNav = () => {
  const navItems = [
    {
      component: CNavItem,
      name: 'Dashboard',
      to: '/dashboard',
      icon: <AppstoreOutlined className="me-3" />,
    },
    {
      component: CNavItem,
      name: 'Users',
      to: '/users',
      icon: <UserOutlined className="me-3" />,
    },
    {
      component: CNavGroup,
      name: 'Masters',
      to: '/Customer-Profile',
      icon: <ProfileOutlined className="me-3" />,
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
      icon: <HomeOutlined className="me-3" />,
    },

    {
      component: CNavItem,
      name: 'Banner',
      to: '/banner',
      icon: <PictureOutlined className="me-3" />,
    },
    {
      component: CNavItem,
      name: 'Enquiry',
      to: '/enquiry',
      icon: <MessageOutlined className="me-3" />,
    },
    {
      component: CNavItem,
      name: 'Subscription',
      to: '/subscription',
      icon: <ShoppingOutlined className="me-3" />,
    },
    {
      component: CNavItem,
      name: 'Contacts',
      to: '/contacts',
      icon: <ContactsOutlined className="me-3" />,
    },
    {
      component: CNavItem,
      name: 'Gallery',
      to: '/gallery',
      icon: <CameraOutlined className="me-3" />,
    },
    {
      component: CNavItem,
      name: 'Testimonials',
      to: '/testimonials',
      icon: <CommentOutlined className="me-3" />,
    },
    {
      component: CNavItem,
      name: 'Bridge House Details',
      to: '/bridgehouse-details',
      icon: <BuildOutlined className="me-3" />,
    },
    {
      component: CNavItem,
      name: 'Payment List',
      to: '/payment-history',
      icon: <CreditCardOutlined className="me-3" />,
    },
  ]

  return navItems
}

export default useNav
