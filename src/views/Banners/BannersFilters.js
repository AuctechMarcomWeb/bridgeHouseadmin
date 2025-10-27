/* eslint-disable prettier/prettier */
/* eslint-disable react/prop-types */
import React, { useEffect, useState } from 'react'
import { Input, Select, Checkbox, Button, Row, Col, Typography, Divider } from 'antd'
import { SearchOutlined } from '@ant-design/icons'
import { getRequest } from '../../Helpers'

const { Title } = Typography

const BannersFilters = ({
  tempFilters,
  setTempFilters,
  searchTerm,
  setSearchTerm,
  applyFilters,
  resetFilters,
  page,
}) => {
  const [typeOptions, setTypeOptions] = useState([])

  useEffect(() => {
    getRequest(`category?isPagination=false`)
      .then((res) => setTypeOptions(res?.data?.data?.categories || []))
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

      <Row gutter={[16, 16]}>
        {/* Search */}
        <Col xs={24} sm={12} md={8} lg={6}>
          <label style={{ fontWeight: 600 }}>Search</label>
          <Input
            prefix={<SearchOutlined />}
            placeholder="Search..."
            value={searchTerm}
            onChange={(e) => {
              page(1)
              setSearchTerm(e.target.value)
            }}
            allowClear
          />
        </Col>

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
            <Select.Option value="select" disabled>
              Select Property Type
            </Select.Option>
            {typeOptions.map((type) => (
              <Select.Option key={type.id} value={type.name}>
                {type.name}
              </Select.Option>
            ))}
          </Select>
        </Col>

        {/* Banner Type */}
        <Col xs={24} sm={12} md={8} lg={6}>
          <label style={{ fontWeight: 600 }}>Banner Type</label>
          <Select
            style={{ width: '100%' }}
            value={tempFilters.bannerType || 'select'}
            onChange={(value) => handleFilterChange('bannerType', value === 'select' ? '' : value)}
          >
            <Select.Option value="select" disabled>
              Select Banner Type
            </Select.Option>
            <Select.Option value="leftside">Left Side</Select.Option>
            <Select.Option value="rightside">Right Side</Select.Option>
            <Select.Option value="top">Top</Select.Option>
            <Select.Option value="bottom">Bottom</Select.Option>
          </Select>
        </Col>

        {/* Active Checkbox */}
        <Col
          xs={24}
          sm={12}
          md={8}
          lg={6}
          style={{ display: 'flex', alignItems: 'center', marginTop: 16 }}
        >
          <Checkbox
            checked={tempFilters.isActive}
            onChange={(e) => handleFilterChange('isActive', e.target.checked)}
          >
            Active
          </Checkbox>
        </Col>

        {/* Buttons */}
        <Col span={24} style={{ textAlign: 'center' }}>
          <Button type="primary" onClick={applyFilters} style={{ marginRight: 8, minWidth: 100 }}>
            Apply
          </Button>
          <Button onClick={resetFilters} style={{ minWidth: 100 }}>
            Reset
          </Button>
        </Col>
      </Row>
    </div>
  )
}

export default BannersFilters
