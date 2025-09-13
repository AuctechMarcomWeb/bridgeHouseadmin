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
  const [formData, setFormData] = useState({
    address: '123 Main Street, New Delhi',
    location: {
      type: 'Point',
      coordinates: [77.1025, 28.7041],
    },
    addedBy: '66e1f7c0a13b8c7e9f3d1234',
    name: 'Luxury Apartment12',
    propertyType: 'Residential',
    documents: [
      {
        name: 'Registry',
        number: 'DOC-12345',
        image: 'https://example.com/docs/registry.pdf',
      },
      {
        name: 'Agreement',
        number: 'AGR-98765',
        image: 'https://example.com/docs/agreement.pdf',
      },
    ],
    description: 'A beautiful 3BHK apartment with park view and all modern amenities.',
    propertyDetails: {
      area: '1500 sqft',
      bedrooms: 3,
      bathrooms: 2,
      floors: 1,
      facing: 'East',
      builtYear: 2020,
    },
    status: 'Available',
    approvalStatus: 'Pending',
    isVerified: true,
    isAdopted: false,
    actualPrice: 5000000,
    sellingPrice: 4800000,
    facilities: ['Parking', 'Lift', 'Power Backup'],
    services: ['Maintenance', 'Water Supply'],
    nearby: [
      { name: 'School', distance: '1 km' },
      { name: 'Hospital', distance: '2 km' },
    ],
    gallery: [
      'https://example.com/images/property1.jpg',
      'https://example.com/images/property2.jpg',
    ],
    propertyCode: 'PROP-2025-001',
  })

  console.log('formData===>', formData)

  const [loading, setLoading] = useState(false)
  const [galleryLoading, setGalleryLoading] = useState(false)
  const [documentLoading, setDocumentLoading] = useState(false)
  const [errors, setErrors] = useState({})

  // Location search states
  const [addressSearchTerm, setAddressSearchTerm] = useState(modalData?.address || '')
  const [places, setPlaces] = useState([])
  const [showPlacesSuggestions, setShowPlacesSuggestions] = useState(false)

  // Form inputs for dynamic arrays
  const [facilityInput, setFacilityInput] = useState('')
  const [serviceInput, setServiceInput] = useState('')
  const [nearbyName, setNearbyName] = useState('')
  const [nearbyDistance, setNearbyDistance] = useState('')
  const [docName, setDocName] = useState('')
  const [docNumber, setDocNumber] = useState('')
  const { user, setUser } = useContext(AppContext)
  const [addedBy, setAddBy] = useState(null)

  // Google Places API configuration
  const apiKey = 'AIzaSyAQqh6qd0umyH9zAmfsfbVHuMvFcN_m3kQ' // Secure this key in production
  const placesUrl = 'https://places.googleapis.com/v1/places:searchText'

  React.useEffect(() => {
    if (user?._id) {
      setAddBy(user._id)
    }
  }, [user])

  React.useEffect(() => {
    if (modalData?.address) {
      setAddressSearchTerm(modalData.address)
    }
  }, [modalData])

  console.log('formData', formData, addedBy)
  console.log('user details from context Provider', user)

  // 🔹 Handle place selection
  const handlePlaceSelect = (place) => {
    setFormData((prev) => ({
      ...prev,
      address: place.formattedAddress,
      coordinates: [place.location.longitude, place.location.latitude],
    }))

    setAddressSearchTerm(place.formattedAddress)
    setShowPlacesSuggestions(false)
    setPlaces([])
  }

  // 🔹 Close modal
  const handleCancel = () => {
    setFormData({
      name: '',
      address: '',
      coordinates: '',
      propertyType: '',
      actualPrice: '',
      sellingPrice: '',
      description: '',
      facilities: [],
      services: [],
      nearby: [],
      gallery: [],
      documents: [],
      isActive: true,
    })
    setErrors({})
    setFacilityInput('')
    setServiceInput('')
    setNearbyName('')
    setNearbyDistance('')
    setDocName('')
    setDocNumber('')
    setAddressSearchTerm('')
    setPlaces([])
    setShowPlacesSuggestions(false)
    setModalData(null)
    setIsModalOpen(false)
  }

  // 🔹 Handle input change
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target

    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value,
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

  const addDocument = () => {
    setFormData((prev) => ({
      ...prev,
      documents: [...prev.nearby, { name: '', number: '' }],
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
    if (!validateForm()) return

    setLoading(true)

    putRequest({ url: `properties/${modalData?._id}`, cred: formData })
      .then((res) => {
        toast.success(res?.data?.message || 'Property updated successfully')
        setUpdateStatus((prev) => !prev)
        handleCancel()
      })
      .catch((error) => {
        console.log('error', error)
        toast.error(error?.response?.data?.message || 'Update failed')
      })
      .finally(() => {
        setLoading(false)
      })
  }

  // 🔹 Submit handler for create
  const handleSubmit = (e) => {
    e.preventDefault()
    if (!validateForm()) return

    setLoading(true)
    postRequest({ url: `properties`, cred: formData })
      .then((res) => {
        toast.success(res?.data?.message || 'Property added successfully')
        setUpdateStatus((prev) => !prev)
        handleCancel()
      })
      .catch((error) => {
        console.log('error', error)
        toast.error(error?.response?.data?.message || 'Creation failed')
      })
      .finally(() => {
        setLoading(false)
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
        <form
          onSubmit={modalData ? handleEdit : handleSubmit}
          className="needs-validation"
          noValidate
        >
          <div className="row">
            <div className="col-md-6">
              <div className="mb-3">
                <label className="form-label fw-bold">Property Name *</label>
                <input
                  type="text"
                  className={`form-control ${errors.name ? 'is-invalid' : ''}`}
                  name="name"
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
                  className={`form-select ${errors.propertyType ? 'is-invalid' : ''}`}
                  name="propertyType"
                  value={formData.propertyType}
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
                {errors.propertyType && (
                  <div className="invalid-feedback">{errors.propertyType}</div>
                )}
              </div>
            </div>
            <div className="col-md-6">
              <label className="form-label fw-bold">Actual Price (₹) *</label>
              <input
                type="number"
                className={`form-control ${errors.actualPrice ? 'is-invalid' : ''}`}
                name="actualPrice"
                value={formData?.actualPrice}
                onChange={handleChange}
                placeholder="5000000"
                min="0"
              />
              {errors.actualPrice && <div className="invalid-feedback">{errors.actualPrice}</div>}
            </div>
            <div className="col-md-6">
              <label className="form-label fw-bold">Selling Price (₹) *</label>
              <input
                type="number"
                className={`form-control ${errors.sellingPrice ? 'is-invalid' : ''}`}
                name="sellingPrice"
                value={formData?.sellingPrice}
                onChange={handleChange}
                placeholder="4500000"
                min="0"
              />
              {errors.sellingPrice && <div className="invalid-feedback">{errors.sellingPrice}</div>}
            </div>
            <div className="col-md-12">
              <label className="form-label fw-bold">Description *</label>
              <textarea
                type="text"
                className={`form-control ${errors.description ? 'is-invalid' : ''}`}
                name="description"
                rows={3}
                value={formData?.description}
                onChange={handleChange}
              />
              {errors.sellingPrice && <div className="invalid-feedback">{errors.sellingPrice}</div>}
            </div>
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
                onChange={handleChange}
              />
            </div>
            <div className="col-md-6">
              <label className="form-label fw-bold">Facilities *</label>

              <Select
                value={formData?.facilities}
                mode="tags"
                size="large"
                style={{ width: '100%' }}
                placeholder="Tags Mode"
                onChange={(value) => {
                  setFormData({
                    ...formData,
                    facilities: value,
                  })
                }}
              />
            </div>
            <div className="col-md-6">
              <label className="form-label fw-bold">Services *</label>

              <Select
                value={formData?.services}
                mode="tags"
                size="large"
                style={{ width: '100%' }}
                placeholder="Tags Mode"
                onChange={(value) => {
                  setFormData({
                    ...formData,
                    services: value,
                  })
                }}
              />
            </div>

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
                      onChange={(e) => handleNearByChange(e, index)}
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
                      name={`facilityDistance_${index}`}
                      value={facility?.distance}
                      onChange={(e) => handleDocumentChange(e, index)}
                      className="form-control"
                    />
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
