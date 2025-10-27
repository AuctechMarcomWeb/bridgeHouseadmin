/* eslint-disable prettier/prettier */
/* eslint-disable react/prop-types */
import { Modal } from 'antd'
import React, { useState, useEffect } from 'react'
import toast from 'react-hot-toast'
import { fileUpload, postRequest, putRequest } from '../../Helpers'
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
    status: false,
  })

  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState({})

  // ✅ Prefill data in Edit mode
  useEffect(() => {
    if (modalData) {
      setFormData({
        name: modalData.name || '',
        email: modalData.email || '',
        phone: modalData.phone || '',
        profile: modalData.profile || '',
        notes: modalData.notes || '',
        status: modalData.status ?? false,
      })
    } else {
      setFormData({
        name: '',
        email: '',
        phone: '',
        profile: '',
        notes: '',
        status: false,
      })
    }
  }, [modalData])

  // ✅ Close modal and reset state
  const handleCancel = () => {
    setFormData({
      name: '',
      email: '',
      phone: '',
      profile: '',
      notes: '',
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

    setFormData((prev) => ({
      ...prev,
      [name]: newValue,
    }))

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
          toast.error('Image URL not received')
        }
      })
      .catch((error) => {
        console.error('Image upload failed:', error)
        toast.error('Image upload failed')
      })
      .finally(() => setLoading(false))
  }

  // ✅ Remove image
  const handleRemoveImage = () => {
    setFormData((prev) => ({ ...prev, profile: '' }))
  }

  // ✅ Validate form fields
  const validateForm = () => {
    const newErrors = {}
    if (!formData.name.trim()) newErrors.name = 'Name is required'
    if (!formData.email.trim()) newErrors.email = 'Email is required'
    if (!formData.phone.trim()) newErrors.phone = 'Phone number is required'
    if (!formData.notes.trim()) newErrors.notes = 'Notes are required'
    if (!formData.profile) newErrors.profile = 'Profile image is required'

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

          {/* Notes */}
          <div className="col-md-6 mb-3">
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
        </div>

        {/* Profile Image */}
        <div className="mb-3">
          <label className="form-label fw-bold">Profile Image</label>
          <input
            type="file"
            accept="image/*"
            className={`form-control ${errors.profile ? 'is-invalid' : ''}`}
            disabled={loading}
            onChange={handleChangeImage}
          />
          {errors.profile && <div className="invalid-feedback">{errors.profile}</div>}

          {formData.profile && (
            <div className="mt-2" style={{ position: 'relative', display: 'inline-block' }}>
              <img
                src={formData.profile}
                alt="Preview"
                style={{
                  width: '60px',
                  height: '60px',
                  objectFit: 'cover',
                  borderRadius: '6px',
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
          )}
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
