/* eslint-disable prettier/prettier */
/* eslint-disable react/prop-types */
import React, { useEffect, useState } from 'react'
import { Input, Select, Checkbox, Button, Row, Col, Typography } from 'antd'
import { SearchOutlined } from '@ant-design/icons'
import { getRequest } from '../../Helpers'

const { Title } = Typography

const Filter = ({
  tempFilters,
  setTempFilters,
  searchTerm,
  setSearchTerm,
  applyFilters,
  resetFilters,
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

      {/* Filters Row - single line on large screens */}
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
              <Select.Option key={type.id} value={type.name}>
                {type.name}
              </Select.Option>
            ))}
          </Select>
        </Col>

        {/* Property Status */}
        <Col xs={24} sm={12} md={8} lg={6}>
          <label style={{ fontWeight: 600 }}>Property Status</label>
          <Select
            style={{ width: '100%' }}
            value={tempFilters.status || 'select'}
            onChange={(value) => handleFilterChange('status', value === 'select' ? '' : value)}
          >
            <Select.Option value="select">Select Status</Select.Option>
            <Select.Option value="Available">Available</Select.Option>
            <Select.Option value="Sold">Sold</Select.Option>
            <Select.Option value="Registered">Registered</Select.Option>
            <Select.Option value="Booked">Booked</Select.Option>
          </Select>
        </Col>

        {/* Approval Status */}
        <Col xs={24} sm={12} md={8} lg={6}>
          <label style={{ fontWeight: 600 }}>Approval Status</label>
          <Select
            style={{ width: '100%' }}
            value={tempFilters.approvalStatus || 'select'}
            onChange={(value) =>
              handleFilterChange('approvalStatus', value === 'select' ? '' : value)
            }
          >
            <Select.Option value="select">Select Approval Status</Select.Option>
            <Select.Option value="Pending">Pending</Select.Option>
            <Select.Option value="Published">Published</Select.Option>
            <Select.Option value="Rejected">Rejected</Select.Option>
          </Select>
        </Col>

        {/* Verified + Adopted together */}
        <Col
          xs={24}
          sm={12}
          md={8}
          lg={4}
          style={{ display: 'flex', alignItems: 'center', gap: '16px', marginTop: 16 }}
        >
          <Checkbox
            checked={tempFilters.isVerified || false}
            onChange={(e) => handleFilterChange('isVerified', e.target.checked)}
          >
            Verified
          </Checkbox>
          <Checkbox
            checked={tempFilters.isAdopted || false}
            onChange={(e) => handleFilterChange('isAdopted', e.target.checked)}
          >
            Adopted
          </Checkbox>
        </Col>
      </Row>

      {/* Search + Buttons Row */}
      <Row gutter={[16, 16]} align="middle">
        <Col xs={24} sm={12} md={12} lg={12}>
          <Input
            prefix={<SearchOutlined />}
            placeholder="Search properties..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
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

export default Filter
