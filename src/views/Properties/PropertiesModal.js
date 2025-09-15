import { Modal, Select } from 'antd'
import React, { useState, useContext } from 'react'
import toast from 'react-hot-toast'
import axios from 'axios'
import { fileUpload, postRequest, putRequest, getRequest } from '../../Helpers'
import { AppContext } from '../../Context/AppContext'
import LocationSearchInput from '../../components/LocationSearchInput/LocationSearchInput'

const PropertiesModal = ({
  setUpdateStatus,
  setModalData,
  modalData,
  isModalOpen,
  setIsModalOpen,
}) => {
  const { user, setUser } = useContext(AppContext)

  console.log('modalData===', modalData)

  const [formData, setFormData] = useState(
    modalData
      ? {
          ...modalData,
        }
      : {
          address: '',
          location: {
            type: 'Point',
            coordinates: [],
          },
          addedBy: user?._id,
          name: '',
          propertyType: '',
          documents: [],
          description: '',
          propertyDetails: {
            area: '',
            bedrooms: '',
            bathrooms: '',
            floors: '',
            facing: '',
            builtYear: '',
          },
          status: 'Available',
          approvalStatus: 'Published',
          isVerified: false,
          isAdopted: false,
          actualPrice: '',
          sellingPrice: '',
          facilities: [],
          services: [],
          nearby: [],
          gallery: [],
          propertyCode: '',
        },
  )

  console.log('formData===>', formData)

  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState({})

  const [addedBy, setAddBy] = useState(null)

  React.useEffect(() => {
    if (user?._id) {
      setAddBy(user._id)
    }
  }, [user])

  console.log('formData', formData, addedBy)
  console.log('user details from context Provider', user)

  // 🔹 Close modal
  const handleCancel = () => {
    setFormData({
      address: '',
      location: {
        type: 'Point',
        coordinates: [],
      },
      addedBy: user?._id,
      name: '',
      propertyType: '',
      documents: [],
      description: '',
      propertyDetails: {
        area: '',
        bedrooms: '',
        bathrooms: '',
        floors: '',
        facing: '',
        builtYear: '',
      },
      status: 'Available',
      approvalStatus: 'Published',
      isVerified: false,
      isAdopted: false,
      actualPrice: '',
      sellingPrice: '',
      facilities: [],
      services: [],
      nearby: [],
      gallery: [],
      propertyCode: '',
    })

    setModalData(null)
    setIsModalOpen(false)
  }

  const handleChange = (e) => {
    const { name, value, type, checked, dataset } = e.target

    // If data-nested is present, update nested object
    if (dataset.nested) {
      const nestedKey = dataset.nested // e.g., "propertyDetails"
      setFormData((prev) => ({
        ...prev,
        [nestedKey]: {
          ...prev[nestedKey],
          [name]: type === 'checkbox' ? checked : value,
        },
      }))
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: type === 'checkbox' ? checked : value,
      }))
    }
  }

  const handleChangeImage = (e) => {
    const files = Array.from(e.target.files) // ✅ Convert FileList to array

    files.forEach((file) => {
      fileUpload({
        url: `upload/uploadImage`,
        cred: { file },
      })
        .then((res) => {
          setFormData((prev) => ({
            ...prev,
            gallery: [...(prev.gallery || []), res.data?.data?.imageUrl], // ✅ Push into gallery array
          }))
          console.log('res data pic ', res?.data)
        })
        .catch((error) => {
          console.error('Image upload failed:', error)
        })
    })
  }

  // 🔹 Validate form
  const validateForm = () => {
    let newErrors = {}

    if (!formData.name.trim()) newErrors.name = 'Property name is required'
    if (!formData.address.trim()) newErrors.address = 'Address is required'
    if (!formData.propertyType.trim()) newErrors.propertyType = 'Property type is required'
    if (!formData.actualPrice || formData.actualPrice <= 0)
      newErrors.actualPrice = 'Valid actual price is required'
    if (!formData.sellingPrice || formData.sellingPrice <= 0)
      newErrors.sellingPrice = 'Valid selling price is required'
    if (!formData.description.trim()) newErrors.description = 'Description is required'

    // Validate coordinates
    if (!formData.coordinates[0] || !formData.coordinates[1]) {
      newErrors.coordinates = 'Valid coordinates are required'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  // nearBY

  const handleNearByChange = (e, index) => {
    const { name, value } = e.target
    const updatedFacilities = [...formData.nearby]

    if (name.includes('Name')) {
      updatedFacilities[index].name = value
    } else if (name.includes('Distance')) {
      updatedFacilities[index].distance = value
    }

    setFormData((prev) => ({
      ...prev,
      nearby: updatedFacilities,
    }))
  }

  const addNearBy = () => {
    setFormData((prev) => ({
      ...prev,
      nearby: [...prev.nearby, { name: '', distance: '' }],
    }))
  }

  const removeNearBy = (index) => {
    const updatedFacilities = formData.nearby.filter((_, i) => i !== index)
    setFormData((prev) => ({
      ...prev,
      nearby: updatedFacilities,
    }))
  }

  // document

  const handleDocumentChange = (e, index) => {
    const { name, value } = e.target
    const updatedFacilities = [...formData.documents]

    if (name.includes('Name')) {
      updatedFacilities[index].name = value
    } else if (name.includes('Number')) {
      updatedFacilities[index].number = value
    }

    setFormData((prev) => ({
      ...prev,
      documents: updatedFacilities,
    }))
  }

  const handleDocumentImageChange = (e, index) => {
    const file = e.target.files[0]
    if (!file) return

    // Upload to server
    fileUpload({
      url: `upload/uploadImage`,
      cred: { file },
    })
      .then((res) => {
        const uploadedUrl = res.data?.data?.imageUrl
        const updatedDocuments = [...formData.documents]
        updatedDocuments[index].image = uploadedUrl

        setFormData((prev) => ({
          ...prev,
          documents: updatedDocuments,
        }))
      })
      .catch((error) => {
        console.error('Document image upload failed:', error)
      })
  }

  const removeDocumentImage = (index) => {
    const updatedDocuments = [...formData.documents]
    updatedDocuments[index].image = '' // clear the image
    setFormData((prev) => ({
      ...prev,
      documents: updatedDocuments,
    }))
  }

  const addDocument = () => {
    setFormData((prev) => ({
      ...prev,
      documents: [...prev.nearby, { name: '', number: '', image: '' }],
    }))
  }

  const removeDocument = (index) => {
    const updatedFacilities = formData.documents.filter((_, i) => i !== index)
    setFormData((prev) => ({
      ...prev,
      documents: updatedFacilities,
    }))
  }

  // 🔹 Submit handler for edit
  const handleEdit = (e) => {
    e.preventDefault()

    setLoading(true)

    putRequest({ url: `properties/${modalData?._id}`, cred: formData })
      .then((res) => {
        toast.success(res?.data?.message || 'Property updated successfully')
        setUpdateStatus((prev) => !prev)
         setLoading(false)
        handleCancel()
      })
      .catch((error) => {
        console.log('error', error)
        setLoading(false)
        toast.error(error?.response?.data?.message || 'Update failed')
      })
     
  }

  // 🔹 Submit handler for create
  const handleSubmit = (e) => {
    e.preventDefault()
   
    setLoading(true)
    postRequest({ url: `properties`, cred: formData })
      .then((res) => {
        toast.success(res?.data?.message || 'Property added successfully')
        setUpdateStatus((prev) => !prev)
         setLoading(false)
        handleCancel()
      })
      .catch((error) => {
        console.log('error', error)
        setLoading(false)
        toast.error(error?.response?.data?.message || 'Creation failed')
      })
     
  }

  return (
    <Modal
      title={modalData ? `Edit Property` : `Add Property`}
      open={isModalOpen}
      footer={null}
      onCancel={handleCancel}
      width={1000}
      style={{ top: 20 }}
    >
      <div
        style={{ maxHeight: '80vh', overflowY: 'auto', paddingRight: '50px', marginBottom: '50px' }}
      >
        <form onSubmit={modalData ? handleEdit : handleSubmit} className="needs-validation">
          <div className="row">
            <div className="col-md-6">
              <div className="mb-3">
                <label className="form-label fw-bold">Property Name *</label>
                <input
                  type="text"
                  className={`form-control ${errors.name ? 'is-invalid' : ''}`}
                  name="name"
                  required
                  value={formData?.name}
                  onChange={handleChange}
                  placeholder="Enter property name (e.g., Luxury Villa)"
                />
                {errors?.name && <div className="invalid-feedback">{errors.name}</div>}
              </div>
            </div>
            <div className="col-md-6">
              {' '}
              <div className="mb-3">
                <label className="form-label fw-bold">Property Type *</label>
                <select
                  className={`form-select `}
                  name="propertyType"
                  value={formData.propertyType}
                  required
                  onChange={handleChange}
                >
                  <option value="">Select Property Type</option>
                  <option value="Villa">Villa</option>
                  <option value="Apartment">Apartment</option>
                  <option value="House">House</option>
                  <option value="Plot">Plot</option>
                  <option value="Commercial">Commercial</option>
                  <option value="Office">Office</option>
                  <option value="Shop">Shop</option>
                </select>
              </div>
            </div>
            <div className="col-md-6">
              <label className="form-label fw-bold">Actual Price (₹) *</label>
              <input
                type="number"
                className={`form-control `}
                name="actualPrice"
                value={formData?.actualPrice}
                required
                onChange={handleChange}
                placeholder=""
                min="0"
              />
            </div>
            <div className="col-md-6">
              <label className="form-label fw-bold">Selling Price (₹) *</label>
              <input
                type="number"
                className={`form-control `}
                name="sellingPrice"
                value={formData?.sellingPrice}
                required
                onChange={handleChange}
                placeholder=""
                min="0"
              />
            </div>
            <div className="col-md-12">
              <label className="form-label fw-bold">Description *</label>
              <textarea
                type="text"
                className={`form-control`}
                name="description"
                rows={3}
                required
                value={formData?.description}
                onChange={handleChange}
              />
            </div>

            {/* =================== */}

            <hr className="m-0 p-0 my-3" />

            <label className="form-label fw-bold">Property Details </label>
            <div className="col-md-6">
              <label className="form-label fw-bold">Area </label>
              <input
                type="text"
                className="form-control"
                name="area"
                data-nested="propertyDetails" // ✅ specify nested object
                value={formData?.propertyDetails?.area}
                onChange={handleChange}
              />
            </div>
            <div className="col-md-6">
              <label className="form-label fw-bold">Bedrooms </label>
              <input
                type="text"
                className="form-control"
                name="bedrooms"
                data-nested="propertyDetails" // ✅ specify nested object
                value={formData?.propertyDetails?.bedrooms}
                onChange={handleChange}
              />
            </div>
            <div className="col-md-6">
              <label className="form-label fw-bold"> Bathrooms </label>
              <input
                type="text"
                className="form-control"
                name="bathrooms"
                data-nested="propertyDetails" // ✅ specify nested object
                value={formData?.propertyDetails?.bathrooms}
                onChange={handleChange}
              />
            </div>
            <div className="col-md-6">
              <label className="form-label fw-bold">Floors </label>
              <input
                type="text"
                className="form-control"
                name="floors"
                data-nested="propertyDetails" // ✅ specify nested object
                value={formData?.propertyDetails?.floors}
                onChange={handleChange}
              />
            </div>
            <div className="col-md-6">
              <label className="form-label fw-bold">Facing </label>
              <input
                type="text"
                className="form-control"
                name="facing"
                data-nested="propertyDetails" // ✅ specify nested object
                value={formData?.propertyDetails?.facing}
                onChange={handleChange}
              />
            </div>
            <div className="col-md-6">
              <label className="form-label fw-bold">BuiltYear </label>
              <input
                type="text"
                className="form-control"
                name="builtYear"
                data-nested="propertyDetails" // ✅ specify nested object
                value={formData?.propertyDetails?.builtYear}
                onChange={handleChange}
              />
            </div>

            <hr className="m-0 p-0 my-3" />

            {/* ======================= */}
            <div className="col-md-6">
              <label className="form-label fw-bold">Address *</label>
              <LocationSearchInput formData={formData} setFormData={setFormData} />
            </div>
            <div className="col-md-6">
              <label className="form-label fw-bold">PropertyCode *</label>
              <input
                type="text"
                className={`form-control ${errors?.propertyCode ? 'is-invalid' : ''}`}
                name="propertyCode"
                value={formData?.propertyCode}
                required
                onChange={handleChange}
              />
            </div>

            {/* Facilities */}

            <div className="col-md-6">
              <label className="form-label fw-bold">Facilities *</label>

              <Select
                value={formData?.facilities}
                mode="tags"
                size="large"
                style={{ width: '100%' }}
                placeholder="Enter/Select Your Facilities"
                onChange={(value) => {
                  setFormData({
                    ...formData,
                    facilities: value,
                  })
                }}
              />
            </div>

            {/* Services */}
            <div className="col-md-6">
              <label className="form-label fw-bold">Services *</label>

              <Select
                value={formData?.services}
                mode="tags"
                size="large"
                style={{ width: '100%' }}
                placeholder="Enter/Select Your Services"
                onChange={(value) => {
                  setFormData({
                    ...formData,
                    services: value,
                  })
                }}
              />
            </div>

            {/* Property Images */}
            <div className="col-md-6">
              <label className="form-label fw-bold">Property Images *</label>
              <input
                type="file"
                className={`form-control `}
                name="propertyCode"
                accept="image/*"
                required={modalData ? false :true}
                multiple
                onChange={handleChangeImage}
              />
            </div>
            {formData?.gallery?.length > 0 && (
              <div className="col-md-6">
                <div className="d-flex gap-2 my-2 flex-wrap">
                  {formData.gallery.map((item, index) => (
                    <div key={index} style={{ position: 'relative', display: 'inline-block' }}>
                      {/* Image */}
                      <img
                        src={item}
                        alt={`gallery-${index}`}
                        style={{
                          width: '50px',
                          height: '50px',
                          objectFit: 'cover',
                          borderRadius: '4px',
                        }}
                      />

                      {/* Cross Button */}
                      <button
                        onClick={() => {
                          setFormData((prev) => ({
                            ...prev,
                            gallery: prev.gallery.filter((_, i) => i !== index),
                          }))
                        }}
                        style={{
                          position: 'absolute',
                          top: '-5px',
                          right: '-5px',
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
                  ))}
                </div>
              </div>
            )}

            <hr className="m-0 p-0 my-3" />

            {/* Nearby */}
            <div className="col-md-12">
              <label className="form-label">
                <strong>Nearby</strong>
              </label>

              {formData?.nearby?.map((facility, index) => (
                <div className="row m-0 p-0 border mb-2" key={index}>
                  <div className="col-md-6 m-0 my-2">
                    <label className="form-label">Name</label>
                    <input
                      type="text"
                      name={`facilityName_${index}`}
                      value={facility?.name}
                      onChange={(e) => handleNearByChange(e, index)}
                      className="form-control"
                    />
                  </div>
                  <div className="col-md-6 m-0 my-2">
                    <label className="form-label">Description</label>
                    <input
                      type="text"
                      name={`facilityDistance_${index}`}
                      value={facility?.distance}
                      onChange={(e) => handleNearByChange(e, index)}
                      className="form-control"
                    />
                  </div>

                  {/* Button to remove a facility */}
                  <div className="col-md-12 d-flex justify-content-end">
                    {formData?.nearby?.length > 1 && (
                      <button
                        type="button"
                        className="btn btn-danger btn-sm mb-2"
                        onClick={() => removeNearBy(index)}
                      >
                        Remove
                      </button>
                    )}
                  </div>
                </div>
              ))}

              {/* Button to add new facility */}
              <div className="col-md-12 mt-2">
                <button type="button" className="btn btn-success btn-sm" onClick={addNearBy}>
                  Add More
                </button>
              </div>
            </div>
            <hr className="m-0 p-0 my-3" />
            {/* Documents */}
            <div className="col-md-12">
              <label className="form-label">
                <strong>Documents</strong>
              </label>

              {formData?.documents?.map((facility, index) => (
                <div className="row m-0 p-0 border mb-2" key={index}>
                  <div className="col-md-6 m-0 my-2">
                    <label className="form-label">Document Name</label>
                    <input
                      type="text"
                      name={`facilityName_${index}`}
                      value={facility?.name}
                      onChange={(e) => handleDocumentChange(e, index)}
                      className="form-control"
                    />
                  </div>
                  <div className="col-md-6 m-0 my-2">
                    <label className="form-label">Document Number</label>
                    <input
                      type="text"
                      name={`facilityNumber_${index}`}
                      value={facility?.number}
                      onChange={(e) => handleDocumentChange(e, index)}
                      className="form-control"
                    />
                  </div>
                  <div className="col-md-6 m-0 my-2">
                    <label className="form-label">Document Image</label>
                    <input
                      type="file"
                      accept="image/*"
                      className="form-control"
                      onChange={(e) => handleDocumentImageChange(e, index)}
                    />
                  </div>
                  <div className="col-md-6 m-0 my-2">
                    {facility?.image && (
                      <div style={{ position: 'relative', display: 'inline-block' }}>
                        <img
                          src={facility.image}
                          alt={`doc-${index}`}
                          style={{
                            width: '60px',
                            height: '60px',
                            marginTop: '5px',
                            borderRadius: '4px',
                            objectFit: 'cover',
                          }}
                        />
                        {/* ❌ Remove button */}
                        <button
                          type="button"
                          onClick={() => removeDocumentImage(index)}
                          style={{
                            position: 'absolute',
                            top: '-5px',
                            right: '-5px',
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
                            padding: 0,
                          }}
                        >
                          ✕
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Button to remove a facility */}
                  <div className="col-md-12 d-flex justify-content-end">
                    {formData?.documents?.length > 1 && (
                      <button
                        type="button"
                        className="btn btn-danger btn-sm mb-2"
                        onClick={() => removeDocument(index)}
                      >
                        Remove
                      </button>
                    )}
                  </div>
                </div>
              ))}

              {/* Button to add new facility */}
              <div className="col-md-12 mt-2">
                <button type="button" className="btn btn-success btn-sm" onClick={addDocument}>
                  Add More
                </button>
              </div>
            </div>
            <hr className="m-0 p-0 my-3" />

            <div className="col-md-6">
              <label className="form-label fw-bold"> Adopted Status *</label>

              <select
                className={`form-control `}
                name="isAdopted"
                value={formData?.isAdopted}
                onChange={handleChange}
              >
                <option value="true">Adopted</option>
                <option value="false"> Not Adopted</option>
              </select>
            </div>
            <div className="col-md-6">
              <label className="form-label fw-bold">Verifyed Status *</label>

              <select
                className={`form-control `}
                name="isVerified"
                value={formData?.isVerified}
                onChange={handleChange}
              >
                <option value="true">Verifyed</option>
                <option value="false"> Not Verifyed</option>
              </select>
            </div>
            <div className="col-md-6">
              <label className="form-label fw-bold">Approval Status *</label>

              <select
                className={`form-control `}
                name="approvalStatus"
                value={formData?.approvalStatus}
                onChange={handleChange}
              >
                <option value="Pending">Pending</option>
                <option value="Published">Published</option>
                <option value="Rejected"> Rejected</option>
              </select>
            </div>
            <div className="col-md-6">
              <label className="form-label fw-bold">Property Status *</label>

              <select
                className={`form-control `}
                name="status"
                value={formData?.status}
                onChange={handleChange}
              >
                <option value="Available">Available</option>
                <option value="Sold">Sold</option>
                <option value="Registered">Registered</option>
                <option value="Booked">Booked</option>
              </select>
            </div>
          </div>

          {/* Buttons */}
          <div className="d-flex justify-content-end gap-2 pt-3 ">
            <button type="button" className="btn btn-secondary" onClick={handleCancel}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Saving...' : modalData ? 'Update Property' : 'Create Property'}
            </button>
          </div>
        </form>
      </div>
    </Modal>
  )
}

export default PropertiesModal
