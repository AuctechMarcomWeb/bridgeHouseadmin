/* eslint-disable prettier/prettier */
/* eslint-disable react/prop-types */
import { Modal } from 'antd'
import React, { useState } from 'react'
import toast from 'react-hot-toast'
import { postRequest, putRequest } from '../../Helpers'
import LocationSearchInput from '../../components/LocationSearchInput/LocationSearchInput'
import { validateMobile } from '../../Utils'

const ContactsModal = ({
  setUpdateStatus,
  setModalData,
  modalData,
  isModalOpen,
  setIsModalOpen,
}) => {
  const isEditMode = !!modalData

  const [formData, setFormData] = useState(
    modalData ? { ...modalData } : { name: '', email: '', phone: '', address: '', notes: '' },
  )

  const [loading, setLoading] = useState(false)

  const handleCancel = () => {
    setFormData({ name: '', email: '', phone: '', address: '', notes: '' })
    setModalData(null)
    setIsModalOpen(false)
  }

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target

    let newValue = value

    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value,
    })
    // ✅ Clear error for that field when user starts typing
    setErrors((prevErrors) => ({
      ...prevErrors,
      [name]: '',
    }))
  }

  const handleEdit = (e) => {
    e.preventDefault()
    setLoading(true)

    putRequest({ url: `bridgeHouseConatct/${modalData?._id}`, cred: formData })
      .then((res) => {
        toast.success(res?.data?.message || 'Contact updated successfully')
        setUpdateStatus((prev) => !prev)
        handleCancel()
      })
      .catch((error) => {
        console.log('error', error)
        toast.error(error?.response?.message)
      })
      .finally(() => setLoading(false))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    setLoading(true)

    postRequest({ url: `bridgeHouseConatct`, cred: formData })
      .then((res) => {
        toast.success(res?.data?.message || 'Contact added successfully')
        setUpdateStatus((prev) => !prev)
        handleCancel()
      })
      .catch((error) => {
        console.log('error', error)
        toast.error(error?.response?.message)
      })
      .finally(() => setLoading(false))
  }

  return (
    <Modal
      title={isEditMode ? 'Edit Contact' : 'Add Contact'}
      open={isModalOpen}
      footer={null}
      onCancel={handleCancel}
    >
      <form onSubmit={isEditMode ? handleEdit : handleSubmit}>
        <div className="container-fluid">
          <div className="row">
            {/* Name */}
            <div className="col-md-6 mb-3">
              <label className="form-label fw-bold">Name</label>
              <input
                type="text"
                className="form-control"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Enter name..."
                required
                disabled={isEditMode}
              />
            </div>

            {/* Email */}
            <div className="col-md-6 mb-3">
              <label className="form-label fw-bold">Email</label>
              <input
                type="email"
                className="form-control"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Enter email..."
                required
                disabled={isEditMode}
              />
            </div>

            {/* Phone */}
            <div className="col-md-6 mb-3">
              <label className="form-label fw-bold">Phone</label>
              <input
                type="text"
                className="form-control"
                name="phone"
                value={formData.phone}
                onChange={(e) => {
                  const value = e.target.value
                  // Allow only numbers and up to 10 digits
                  if (/^\d{0,10}$/.test(value)) {
                    setFormData({ ...formData, phone: value })
                  }
                }}
                placeholder="Enter phone..."
                required
                disabled={isEditMode}
              />
            </div>

            {/* Address */}
            <div className="col-md-6 mb-3">
              <label className="form-label fw-bold">Address</label>
              <LocationSearchInput
                formData={formData}
                setFormData={setFormData}
                required
                disabled={false}
              />
            </div>

            {/* Notes */}
            <div className="col-12 mb-3">
              <label className="form-label fw-bold">Notes</label>
              <textarea
                className="form-control"
                name="notes"
                value={formData.notes}
                onChange={handleChange}
                rows={2}
                placeholder="Enter notes..."
                required
              />
            </div>
          </div>

          {/* Buttons */}
          <div className="d-flex justify-content-end gap-2">
            <button type="button" className="btn btn-secondary" onClick={handleCancel}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Saving...' : 'Save Contact'}
            </button>
          </div>
        </div>
      </form>
    </Modal>
  )
}

export default ContactsModal
