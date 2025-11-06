/* eslint-disable prettier/prettier */
/* eslint-disable react/prop-types */
import React, { useEffect, useState } from 'react'
import { Row, Col, Input, Checkbox, Button, Select, Typography } from 'antd'
import { SearchOutlined } from '@ant-design/icons'
import { getRequest } from '../../Helpers'

const { Title } = Typography

const DetailsFilter = ({
  searchTerm,
  setSearchTerm,
  tempFilters,
  setTempFilters,
  applyFilters,
  resetFilters,
  setPage,
}) => {
  const [typeOptions, setTypeOptions] = useState([])
  const [propertyOptions, setPropertyOptions] = useState([])

  useEffect(() => {
    // Fetch categories for Property Type
    getRequest(`category?isPagination=false`)
      .then((res) => setTypeOptions(res?.data?.data?.categories || []))
      .catch(console.error)

    // Fetch properties list for Property dropdown
    getRequest(`properties?isPagination=false`)
      .then((res) => setPropertyOptions(res?.data?.data?.properties || []))
      .catch(console.error)
  }, [])

  const handleFilterChange = (name, value) => {
    setTempFilters((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  return (
    <div style={{ padding: 16, borderBottom: '1px solid #f0f0f0' }}>
      {/* Filters Heading */}
      <Title level={5} style={{ marginBottom: 16 }}>
        Filters
      </Title>

      {/* Filters Row */}
      <Row gutter={[16, 16]} wrap={true} style={{ marginBottom: 16 }}>
        {/* Property Type */}
        <Col xs={24} sm={12} md={8} lg={6}>
          <label style={{ fontWeight: 600 }}>Property Type</label>
          <Select
            style={{ width: '100%' }}
            value={tempFilters.propertyType || 'select'}
            onChange={(value) =>
              handleFilterChange('propertyType', value === 'select' ? '' : value)
            }
          >
            <Select.Option value="select">Select Property Type</Select.Option>
            {typeOptions.map((type) => (
              <Select.Option key={type._id || type.id} value={type._id || type.id || ''}>
                {type.name || 'Unnamed Type'}
              </Select.Option>
            ))}
          </Select>
        </Col>

        {/* Property */}
        <Col xs={24} sm={12} md={8} lg={6}>
          <label style={{ fontWeight: 600 }}>Property</label>
          <Select
            style={{ width: '100%' }}
            value={tempFilters.property || 'select'}
            onChange={(value) => handleFilterChange('property', value === 'select' ? '' : value)}
          >
            <Select.Option value="select">Select Property</Select.Option>
            {propertyOptions.map((property) => (
              <Select.Option
                key={property._id || property.id}
                value={property._id || property.id || ''}
              >
                {property.name || 'Unnamed Property'}
              </Select.Option>
            ))}
          </Select>
        </Col>

        {/* Active Checkbox */}
        <Col
          xs={24}
          sm={12}
          md={8}
          lg={4}
          style={{ display: 'flex', alignItems: 'center', marginTop: 16 }}
        >
          <Checkbox
            checked={tempFilters.status || false}
            onChange={(e) => handleFilterChange('status', e.target.checked)}
          >
            Active
          </Checkbox>
        </Col>
      </Row>

      {/* Search + Buttons */}
      <Row gutter={[16, 16]} align="middle">
        <Col xs={24} sm={12} md={12} lg={12}>
          <Input
            prefix={<SearchOutlined />}
            placeholder="Search details..."
            value={searchTerm}
            onChange={(e) => {
              setPage(1)
              setSearchTerm(e.target.value)
            }}
            allowClear
          />
        </Col>
        <Col>
          <Button type="primary" onClick={applyFilters} style={{ minWidth: 100 }}>
            Apply
          </Button>
        </Col>
        <Col>
          <Button onClick={resetFilters} style={{ minWidth: 100 }}>
            Reset
          </Button>
        </Col>
      </Row>
    </div>
  )
}

export default DetailsFilter
