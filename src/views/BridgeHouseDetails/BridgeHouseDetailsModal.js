/* eslint-disable prettier/prettier */
/* eslint-disable react/prop-types */
import { Modal, Select } from 'antd'
import React, { useState, useEffect, useRef } from 'react'
import toast from 'react-hot-toast'
import { fileUpload, getRequest, postRequest, putRequest } from '../../Helpers'
import { validateMobile } from '../../Utils'

const BridgeHouseDetailsModal = ({
  setUpdateStatus,
  setModalData,
  modalData,
  isModalOpen,
  setIsModalOpen,
}) => {
  // ✅ State for form data
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    profile: '',
    notes: '',
    propertyType: [],
    property: [],
    status: false,
  })
  console.log('formData', formData)

  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState({})
  const profileInputRef = useRef(null)
  const [type12, setType] = useState([])
  const [property, setProperty] = useState([])
  const [properyTypeName, setProperyTypeName] = useState('')

  console.log('properyTypeName', properyTypeName)

  // ✅ Prefill data in Edit mode
  useEffect(() => {
    if (modalData) {
      setFormData({
        name: modalData.name || '',
        email: modalData.email || '',
        phone: modalData.phone || '',
        profile: modalData.profile || '',
        notes: modalData.notes || '',
        propertyType: modalData.propertyType || [],
        property: modalData.property || [],
        status: modalData.status ?? false,
      })
    } else {
      setFormData({
        name: '',
        email: '',
        phone: '',
        profile: '',
        notes: '',
        propertyType: [],
        property: [],
        status: false,
      })
    }
  }, [modalData])

  // console.log('property', modalData.property)

  // ✅ Fetch property types
  useEffect(() => {
    getRequest(`category?isPagination=false`)
      .then((res) => {
        const responseData = res?.data?.data
        setType(responseData?.categories || [])
      })
      .catch((error) => console.log('error', error))
  }, [])

  // ✅ Fetch properties based on selected property type ID
  useEffect(() => {
    if (!formData.propertyType?.length) return

    getRequest(`properties?isPagination=false&propertyType=${properyTypeName}`)
      .then((res) => {
        const responseData = res?.data?.data
        setProperty(responseData?.properties || [])
      })
      .catch((error) => console.log('error', error))
  }, [formData.propertyType])

  const typeOption = type12?.map((item, index) => {
    return (
      <>
        <option value={item?._id}>{item?.name}</option>
      </>
    )
  })
  // ✅ Close modal and reset state
  const handleCancel = () => {
    setFormData({
      name: '',
      email: '',
      phone: '',
      profile: '',
      notes: '',
      propertyType: [],
      property: [],
      status: false,
    })
    setErrors({})
    setModalData(null)
    setIsModalOpen(false)
  }

  // ✅ Handle input changes
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    let newValue = type === 'checkbox' ? checked : value

    if (name === 'phone') {
      newValue = validateMobile(value)
    }
    if (name === 'propertyType') {
      setFormData((prev) => ({ ...prev, [name]: [newValue] }))

      const properyname = type12.filter((item) => item._id == newValue)

      setProperyTypeName(properyname[0]?.name)
    } else {
      setFormData((prev) => ({ ...prev, [name]: newValue }))
    }

    // Clear field-specific error
    setErrors((prev) => ({ ...prev, [name]: '' }))
  }

  // ✅ Handle image upload
  const handleChangeImage = (e) => {
    const file = e.target.files[0]
    if (!file) return

    setLoading(true)

    fileUpload({
      url: 'upload/uploadImage',
      cred: { file },
    })
      .then((res) => {
        const uploadedUrl = res?.data?.data?.imageUrl
        if (uploadedUrl) {
          setFormData((prev) => ({ ...prev, profile: uploadedUrl }))
          toast.success('Profile image uploaded successfully')
        } else {
          toast.error('Upload failed — no URL returned')
        }
      })
      .catch((error) => {
        console.error('Profile upload failed:', error)
        toast.error('Image upload failed')
      })
      .finally(() => setLoading(false))
  }

  const handleRemoveImage = () => {
    setFormData((prev) => ({ ...prev, profile: '' }))
    if (profileInputRef.current) profileInputRef.current.value = '' // clear input
  }

  // ✅ Validate form fields
  const validateForm = () => {
    const newErrors = {}
    if (!formData.name.trim()) newErrors.name = 'Name is required'
    if (!formData.email.trim()) newErrors.email = 'Email is required'
    if (!formData.phone.trim()) newErrors.phone = 'Phone number is required'
    if (!formData.notes.trim()) newErrors.notes = 'Notes are required'
    if (!formData.profile) newErrors.profile = 'Profile image is required'
    if (!formData.propertyType?.length) newErrors.propertyType = 'Property Type is required'
    if (!formData.property?.length) newErrors.property = 'At least one Property is required'

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  // ✅ Add new Bridge House record
  const handleSubmit = (e) => {
    e.preventDefault()
    if (!validateForm()) return

    setLoading(true)
    postRequest({
      url: 'bridgehouseDetails',
      cred: formData,
    })
      .then((res) => {
        toast.success(res?.data?.message || 'Bridge House added successfully')
        setUpdateStatus((prev) => !prev)
        handleCancel()
      })
      .catch((error) => {
        toast.error(error?.response?.data?.message || 'Something went wrong')
      })
      .finally(() => setLoading(false))
  }

  // ✅ Update existing Bridge House record
  const handleEdit = (e) => {
    e.preventDefault()
    if (!validateForm()) return

    setLoading(true)
    putRequest({
      url: `bridgehouseDetails/${modalData?._id}`,
      cred: formData,
    })
      .then((res) => {
        toast.success(res?.data?.message || 'Bridge House updated successfully')
        setUpdateStatus((prev) => !prev)
        handleCancel()
      })
      .catch((error) => {
        toast.error(error?.response?.data?.message || 'Something went wrong')
      })
      .finally(() => setLoading(false))
  }

  return (
    <Modal
      title={modalData ? 'Edit Bridge House' : 'Add Bridge House'}
      open={isModalOpen}
      footer={null}
      onCancel={handleCancel}
      destroyOnClose
    >
      <form onSubmit={modalData ? handleEdit : handleSubmit} noValidate>
        <div className="row">
          {/* Name */}
          <div className="col-md-6 mb-3">
            <label className="form-label fw-bold">Name</label>
            <input
              type="text"
              name="name"
              className={`form-control ${errors.name ? 'is-invalid' : ''}`}
              value={formData.name}
              onChange={handleChange}
              placeholder="Enter Name"
            />
            {errors.name && <div className="invalid-feedback">{errors.name}</div>}
          </div>

          {/* Email */}
          <div className="col-md-6 mb-3">
            <label className="form-label fw-bold">Email</label>
            <input
              type="email"
              name="email"
              className={`form-control ${errors.email ? 'is-invalid' : ''}`}
              value={formData.email}
              onChange={handleChange}
              placeholder="Enter Email"
            />
            {errors.email && <div className="invalid-feedback">{errors.email}</div>}
          </div>
        </div>

        <div className="row">
          {/* Phone */}
          <div className="col-md-6 mb-3">
            <label className="form-label fw-bold">Phone</label>
            <input
              type="text"
              name="phone"
              className={`form-control ${errors.phone ? 'is-invalid' : ''}`}
              value={formData.phone}
              onChange={handleChange}
              placeholder="Enter Phone Number"
            />
            {errors.phone && <div className="invalid-feedback">{errors.phone}</div>}
          </div>
          {/* Profile Image */}
          <div className="col-md-6 mb-3">
            <label className="form-label fw-bold">Profile Image</label>

            <div className="d-flex align-items-center" style={{ gap: '10px' }}>
              {/* 🔹 File Input */}
              <input
                type="file"
                accept="image/*"
                className={`form-control ${errors.profile ? 'is-invalid' : ''}`}
                disabled={loading}
                onChange={handleChangeImage}
                ref={profileInputRef}
                style={{ flex: '1 1 auto', maxWidth: '250px' }}
              />
              {errors.profile && <div className="invalid-feedback">{errors.profile}</div>}

              {/* 🔹 Loader / Preview */}
              {loading ? (
                <div
                  style={{
                    width: '60px',
                    height: '60px',
                    background: '#f3f3f3',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderRadius: '6px',
                    border: '1px solid #ddd',
                  }}
                >
                  <div
                    className="spinner-border text-primary"
                    role="status"
                    style={{ width: '20px', height: '20px' }}
                  >
                    <span className="visually-hidden">Loading...</span>
                  </div>
                </div>
              ) : formData.profile ? (
                <div style={{ position: 'relative', display: 'inline-block' }}>
                  <img
                    src={formData.profile}
                    alt="Preview"
                    style={{
                      width: '60px',
                      height: '60px',
                      objectFit: 'cover',
                      borderRadius: '6px',
                      border: '1px solid #ddd',
                    }}
                  />
                  <button
                    type="button"
                    onClick={handleRemoveImage}
                    style={{
                      position: 'absolute',
                      top: '-6px',
                      right: '-6px',
                      background: 'red',
                      color: 'white',
                      border: 'none',
                      borderRadius: '50%',
                      width: '18px',
                      height: '18px',
                      fontSize: '12px',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    ✕
                  </button>
                </div>
              ) : null}
            </div>
          </div>
        </div>

        <div className="row">
          {/* Property Type */}
          <div className="col-md-6 mb-3">
            <label className="form-label fw-bold">Property Type </label>
            <select
              className={`form-select ${errors.propertyType ? 'is-invalid' : ''}`}
              name="propertyType"
              value={formData?.propertyType?.[0] || ''}
              required
              onChange={handleChange}
            >
              <option value="">Select Property Type</option>
              {typeOption}
            </select>
            {errors.propertyType && <div className="invalid-feedback">{errors.propertyType}</div>}
          </div>

          {/* Property */}
          <div className="col-md-6 mb-3">
            <label className="form-label fw-bold">Property</label>
            <Select
              mode="multiple"
              allowClear
              size="large"
              showSearch
              optionFilterProp="label"
              filterOption={(input, option) =>
                (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
              }
              style={{ width: '100%' }}
              placeholder="Select Properties"
              value={formData.property}
              onChange={(selectedIds) =>
                setFormData((prev) => ({
                  ...prev,
                  property: selectedIds,
                }))
              }
              options={property?.map((prop) => ({
                label: prop?.name,
                value: prop?._id,
              }))}
            />

            {errors.property && <div className="text-danger small">{errors.property}</div>}
          </div>
        </div>

        {/* Notes */}
        <div className=" mb-3">
          <label className="form-label fw-bold">Notes</label>
          <textarea
            name="notes"
            rows="1"
            className={`form-control ${errors.notes ? 'is-invalid' : ''}`}
            value={formData.notes}
            onChange={handleChange}
            placeholder="Enter Notes"
          ></textarea>
          {errors.notes && <div className="invalid-feedback">{errors.notes}</div>}
        </div>

        {/* Active Checkbox */}
        <div className="col-md-8 d-flex align-items-center">
          <div className="form-check">
            <input
              type="checkbox"
              className="form-check-input"
              name="status"
              checked={formData.status}
              onChange={handleChange}
              id="status"
            />
            <label className="form-check-label" htmlFor="status">
              Active
            </label>
          </div>
        </div>

        {/* Buttons */}
        <div className="d-flex justify-content-end gap-2 mt-3">
          <button type="button" className="btn btn-secondary" onClick={handleCancel}>
            Cancel
          </button>
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {modalData
              ? loading
                ? 'Updating...'
                : 'Update Bridge House'
              : loading
                ? 'Uploading...'
                : 'Save Bridge House'}
          </button>
        </div>
      </form>
    </Modal>
  )
}

export default BridgeHouseDetailsModal
