/* eslint-disable react/prop-types */
/* eslint-disable react/jsx-no-undef */
/* eslint-disable prettier/prettier */
import { Modal } from 'antd'
import React, { useState, useEffect } from 'react'
import toast from 'react-hot-toast'
import { getRequest, postRequest, putRequest } from '../../Helpers'

const EnquiryModal = ({
  setUpdateStatus,
  setModalData,
  modalData,
  isModalOpen,
  setIsModalOpen,
}) => {
  const [formData, setFormData] = useState(
    modalData
      ? {
          ...modalData,
          propertyId:
            typeof modalData.propertyId === 'object'
              ? modalData.propertyId._id
              : modalData.propertyId,
        }
      : {
          name: '',
          propertyId: '',
          email: '',
          phone: '',
          message: '',
        },
  )
  const [loading, setLoading] = useState(false)
  const [page, setPage] = useState(1)
  const [limit] = useState(10)
  const [allProperties, setAllProperties] = useState([])
  const [errors, setErrors] = useState({})
  console.log('formData', formData)

  useEffect(() => {
    if (modalData) {
      setFormData({
        ...modalData,
        propertyId:
          typeof modalData.propertyId === 'object'
            ? modalData.propertyId._id
            : modalData.propertyId,
      })
    } else {
      setFormData({
        name: '',
        propertyId: '',
        email: '',
        phone: '',
        message: '',
      })
    }
  }, [modalData])

  const handleCancel = () => {
    setFormData({
      name: '',
      propertyId: '',
      email: '',
      phone: '',
      message: '',
    })
    setErrors({})
    setModalData(null)
    setIsModalOpen(false)
  }

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value,
    })
  }

  // 🔹 Get Properties details
  useEffect(() => {
    getRequest(`properties?isPagination=false`)
      .then((res) => {
        const responseData = res?.data?.data
        setAllProperties(responseData.properties)
        console.log('Properties', responseData)
      })
      .catch((error) => {
        console.log('error', error)
      })
  }, [page, limit])

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!validateForm()) return

    postRequest({ url: `enquiry`, cred: formData })
      .then((res) => {
        toast.success(res?.data?.message || 'Enquiry added successfully')
        setUpdateStatus((prev) => !prev)
        handleCancel()
      })
      .catch((error) => {
        console.log('error', error)
        toast.error(error?.response?.data?.message)
      })
  }

  const handleEdit = (e) => {
    e.preventDefault()
    if (!validateForm()) return

    putRequest({ url: `enquiry/${modalData?._id}`, cred: formData })
      .then((res) => {
        toast.success(res?.data?.message || 'Enquiry updated successfully')
        setUpdateStatus((prev) => !prev)
        handleCancel()
      })
      .catch((error) => {
        console.log('error', error)
        toast.error(error?.response?.data?.message)
      })
  }

  const validateForm = () => {
    let newErrors = {}
    if (!formData.name.trim()) newErrors.name = 'Name is required'
    if (!formData.phone.trim()) newErrors.phone = 'Phone is required'
    if (!formData.email.trim()) newErrors.Email = 'Email  is required'
    if (!formData.message.trim()) newErrors.message = 'Message  is required'
    if (!formData.propertyId.trim()) newErrors.propertyId = 'Property selection is required'

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  return (
    <Modal
      title={modalData ? `Edit Enquiry` : `Add Enquiry`}
      open={isModalOpen}
      footer={null}
      onCancel={handleCancel}
      width={800}
    >
      <form
        onSubmit={modalData ? handleEdit : handleSubmit}
        className="needs-validation"
        noValidate
      >
        {/* Name */}
        <div className="mb-3">
          <label className="form-label fw-bold">Name</label>
          <input
            type="text"
            className={`form-control ${errors.name ? 'is-invalid' : ''}`}
            name="name"
            value={formData?.name}
            onChange={handleChange}
            placeholder="Enter name"
          />
          {errors?.name && <div className="invalid-feedback">{errors.name}</div>}
        </div>
        {/* Phone */}
        <div className="mb-3">
          <label className="form-label fw-bold">Phone</label>
          <input
            type="number"
            className={`form-control ${errors.phone ? 'is-invalid' : ''}`}
            name="phone"
            value={formData?.phone}
            onChange={handleChange}
            placeholder="Enter phone"
          />
          {errors?.phone && <div className="invalid-feedback">{errors.phone}</div>}
        </div>

        {/* E-mail */}
        <div className="mb-3">
          <label className="form-label fw-bold">E-mail </label>
          <input
            type="email"
            className={`form-control ${errors.email ? 'is-invalid' : ''}`}
            name="email"
            value={formData?.email}
            onChange={handleChange}
            placeholder="Enter email"
          />
          {errors?.email && <div className="invalid-feedback">{errors.email}</div>}
        </div>

        {/* Message */}
        <div className="mb-3">
          <label className="form-label fw-bold">Message </label>
          <input
            type="message"
            className={`form-control ${errors.message ? 'is-invalid' : ''}`}
            name="message"
            value={formData?.message}
            onChange={handleChange}
            placeholder="Enter message"
          />
          {errors?.message && <div className="invalid-feedback">{errors.message}</div>}
        </div>

        {/* Property Selection */}
        <div className="mb-3">
          <label className="form-label fw-bold">Property</label>
          <select
            className={`form-select ${errors.propertyId ? 'is-invalid' : ''}`}
            name="propertyId"
            value={formData?.propertyId}
            onChange={handleChange}
          >
            <option value="">Select Property</option>
            {allProperties?.map((property) => (
              <option key={property._id} value={property._id}>
                {property.name || property.title}
              </option>
            ))}
          </select>
          {errors.propertyId && <div className="invalid-feedback">{errors.propertyId}</div>}
        </div>

        {/* Active Status */}
        {/* <div className="form-check mb-3">
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
        </div> */}

        {/* Buttons */}
        <div className="d-flex justify-content-end gap-2">
          <button type="button" className="btn btn-secondary" onClick={handleCancel}>
            Cancel
          </button>
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? 'Saving...' : 'Save Banner'}
          </button>
        </div>
      </form>
    </Modal>
  )
}

export default EnquiryModal
