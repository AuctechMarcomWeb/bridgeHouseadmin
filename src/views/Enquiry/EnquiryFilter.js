/* eslint-disable prettier/prettier */
/* eslint-disable react/prop-types */
import React from 'react'
import { Row, Col, Input, Select, Button } from 'antd'
import { SearchOutlined } from '@ant-design/icons'

const { Option } = Select

const EnquiryFilter = ({
  searchTerm,
  setSearchTerm,
  tempFilters,
  setTempFilters,
  applyFilters,
  resetFilters,
  page,
}) => {
  return (
    <div style={{ padding: '16px', borderBottom: '1px solid #eee' }}>
      <h3 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '16px' }}>Filters</h3>

      <Row gutter={[16, 16]} align="bottom">
        {/* Search */}
        <Col xs={24} sm={12} md={8}>
          <label style={{ display: 'block', fontWeight: 500, marginBottom: 6 }}>Search</label>
          <Input
            prefix={<SearchOutlined />}
            placeholder="Search ..."
            value={searchTerm}
            onChange={(e) => {
              page(1)
              setSearchTerm(e.target.value)
            }}
          />
        </Col>

        {/* Type */}
        <Col xs={24} sm={12} md={8}>
          <label style={{ display: 'block', fontWeight: 500, marginBottom: 6 }}>Status</label>
          <Select
            value={tempFilters.status}
            onChange={(value) => setTempFilters((prev) => ({ ...prev, status: value }))}
            placeholder="Select Status"
            style={{ width: '100%' }}
          >
            <option value="">Select Status</option>
            <option value="new">New</option>
            <option value="viewed">Viewed</option>
            <option value="contacted">Contacted</option>
            <option value="closed">Closed</option>
          </Select>
        </Col>

        {/* Buttons */}
        <Col xs={24} sm={24} md={8}>
          <div
            style={{
              display: 'flex',
              gap: '10px',
              justifyContent: 'flex-start',
              flexWrap: 'wrap',
            }}
          >
            <Button type="primary" onClick={applyFilters}>
              Apply
            </Button>
            <Button onClick={resetFilters}>Reset</Button>
          </div>
        </Col>
      </Row>
    </div>
  )
}

export default EnquiryFilter
