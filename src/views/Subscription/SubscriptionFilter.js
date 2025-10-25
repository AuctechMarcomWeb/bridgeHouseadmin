/* eslint-disable prettier/prettier */
/* eslint-disable react/prop-types */
/* eslint-disable prettier/prettier */
/* eslint-disable prettier/prettier */
/* eslint-disable react/prop-types */
import React, { useEffect, useState } from 'react'
import { Search } from 'lucide-react'
import { getRequest } from '../../Helpers'

const SubscriptionFilter = ({
  tempFilters,
  setTempFilters,
  searchTerm,
  setSearchTerm,
  applyFilters,
  resetFilters,
}) => {
  //   const [typeOptions, setTypeOptions] = useState([])

  //   useEffect(() => {
  //     getRequest(`category?isPagination=false`)
  //       .then((res) => setTypeOptions(res?.data?.data?.categories || []))
  //       .catch(console.error)
  //   }, [])

  const handleFilterChange = (e) => {
    const { name, value, type, checked } = e.target
    setTempFilters((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }))
  }
  return (
    <div className="p-4 border-b border-gray-200">
      {/* Filters Heading */}
      <h3 className="text-lg font-semibold mb-4">Filters</h3>

      {/* Filters + Search + Buttons */}
      <div className="flex flex-wrap gap-4">
        {/* Search */}
        <div className="flex-1 min-w-[250px]">
          <label className="form-label fw-bold mb-1 block">Search</label>
          <div className="relative w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search properties..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Banner Type */}
        <div className="flex-1 min-w-[200px]">
          <label className="form-label fw-bold mb-1 block">Type</label>
          <select
            className="form-select w-full border border-gray-300 rounded px-2 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            name="bannerType"
            value={tempFilters.type}
            onChange={(e) => setTempFilters((prev) => ({ ...prev, type: e.target.value }))}
          >
            <option value="">Select Type</option>
            <option value="PropertyListing">PropertyListing</option>
            <option value="VerifiedListing">VerifiedListing</option>
          </select>
        </div>

        {/* Active Checkbox */}
        <div className="flex items-center gap-2 min-w-[150px] mt-4">
          <input
            type="checkbox"
            name="isActive"
            checked={tempFilters.isActive}
            onChange={handleFilterChange}
            className="w-4 h-4"
          />
          <label className="form-label fw-bold">Active</label>
        </div>

        {/* Buttons - centered on next line */}
        <div className="w-full flex justify-center gap-4 mt-3">
          <button
            onClick={applyFilters}
            className="px-6 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition"
          >
            Apply
          </button>
          <button
            onClick={resetFilters}
            className="px-6 py-2 bg-gray-300 rounded hover:bg-gray-400 transition"
          >
            Reset
          </button>
        </div>
      </div>
    </div>
  )
}

export default SubscriptionFilter
