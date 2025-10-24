import { Modal } from 'antd'
import React, { useState } from 'react'
import toast from 'react-hot-toast'
import { fileUpload, postRequest, putRequest } from '../../Helpers' // <-- apka helper

const BhkModal = ({ setUpdateStatus, setModalData, modalData, isModalOpen, setIsModalOpen }) => {
  const [formData, setFormData] = useState(
    modalData
      ? {
          ...modalData,
        }
      : {
          name: '',

          isActive: true,
        },
  )

  const [loading, setLoading] = useState(false)

  console.log('formData', formData)

  const [errors, setErrors] = useState({})

  // 🔹 Close modal
  const handleCancel = () => {
    setFormData({ name: '', isActive: true })
    setErrors({})
    setModalData(null)
    setIsModalOpen(false)
  }

  const handleChangeImage = (e) => {
    const file = e.target.files[0]
    setLoading(true)
    fileUpload({
      url: `upload/uploadImage`,
      cred: {
        file,
      },
    })
      .then((res) => {
        setFormData((prev) => ({ ...prev, image: res.data?.data?.imageUrl }))
        console.log('res data pic ', res?.data)
        setLoading(false)
      })
      .catch((error) => {
        console.error('Image upload failed:', error)
        setLoading(false)
      })
  }

  // 🔹 Handle input change
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
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

  // 🔹 Validate form
  const validateForm = () => {
    let newErrors = {}
    if (!formData.name.trim()) newErrors.name = 'Name is required'
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  // 🔹 Submit handler
  const handleEdit = (e) => {
    e.preventDefault()
    if (!validateForm()) return

    putRequest({ url: `bhk/${modalData?._id}`, cred: formData })
      .then((res) => {
        toast.success(res?.data?.message || 'BHK updated successfully')
        setUpdateStatus((prev) => !prev)
        handleCancel()
      })
      .catch((error) => {
        console.log('error', error)
        toast.error(error?.response?.data?.message)
      })
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!validateForm()) return

    postRequest({ url: `bhk`, cred: formData })
      .then((res) => {
        toast.success(res?.data?.message || 'BHK added successfully')
        setUpdateStatus((prev) => !prev)
        handleCancel()
      })
      .catch((error) => {
        console.log('error', error)
        toast.error(error?.response?.data?.message)
      })
  }

  return (
    <Modal
      title={modalData ? `Edit BHK` : `Add BHK`}
      open={isModalOpen}
      footer={null}
      onCancel={handleCancel}
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
          />
          {errors?.name && <div className="invalid-feedback">{errors.name}</div>}
        </div>

        {/* Active Status */}
        <div className="form-check mb-3">
          <input
            type="checkbox"
            className="form-check-input"
            name="isActive"
            checked={formData.isActive}
            onChange={handleChange}
            id="isActive"
          />
          <label className="form-check-label" htmlFor="isActive">
            Active
          </label>
        </div>

        {/* Buttons */}
        <div className="d-flex justify-content-end gap-2">
          <button type="button" className="btn btn-secondary" onClick={handleCancel}>
            Cancel
          </button>
          <button type="submit" className="btn btn-primary">
            {loading ? 'Uploading...' : 'Save BHK'}
          </button>
        </div>
      </form>
    </Modal>
  )
}

export default BhkModal
