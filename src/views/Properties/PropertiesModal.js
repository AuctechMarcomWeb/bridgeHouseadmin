import { Modal } from 'antd'
import React, { useState, useContext } from 'react'
import toast from 'react-hot-toast'
import axios from 'axios'
import { fileUpload, postRequest, putRequest, getRequest } from '../../Helpers'
import { AppContext } from '../../Context/AppContext'

const PropertiesModal = ({
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
          coordinates: modalData?.location?.coordinates || [77.5946, 12.9716],
          facilities: modalData?.facilities || [],
          services: modalData?.services || [],
          nearby: modalData?.nearby || [],
          gallery: modalData?.gallery || [],
          documents: modalData?.documents || [],
        }
      : {
          name: '',
          address: '',
          coordinates: [77.5946, 12.9716], // [longitude, latitude]
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
        },
  )

console.log('formData===>',formData)

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
  console.log("user details from context Provider", user)

  // 🔹 Handle location search
  const handleLocationSearch = async (e) => {
    const value = e.target.value
    setAddressSearchTerm(value)
    setShowPlacesSuggestions(true)

    // Update formData address
    setFormData(prev => ({
      ...prev,
      address: value
    }))

    if (value.trim().length < 3) {
      setPlaces([])
      return
    }

    try {
      const response = await axios.post(
        placesUrl,
        { textQuery: value },
        {
          headers: {
            'Content-Type': 'application/json',
            'X-Goog-Api-Key': apiKey,
            'X-Goog-FieldMask': 'places.displayName,places.formattedAddress,places.priceLevel,places.location',
          },
        }
      )

      if (response.data?.places) {
        setPlaces(response.data.places)
      } else {
        setPlaces([])
      }
    } catch (error) {
      console.error('Error fetching places:', error)
      setPlaces([])
    }
  }

  // 🔹 Handle place selection
  const handlePlaceSelect = (place) => {
    setFormData(prev => ({
      ...prev,
      address: place.formattedAddress,
      coordinates: [place.location.longitude, place.location.latitude]
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
      coordinates:'',
      propertyType: '',
      actualPrice: '',
      sellingPrice: '',
      description: '',
      facilities: [],
      services: [],
      nearby: [],
      gallery: [],
      documents: [],
      isActive: true 
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

  // 🔹 Handle gallery images upload
  const handleGalleryUpload = (e) => {
    const files = Array.from(e.target.files)
    setGalleryLoading(true)
    
    const uploadPromises = files.map(file => 
      fileUpload({
        url: `upload/uploadImage`,
        cred: { file },
      })
    )

    Promise.all(uploadPromises)
      .then((responses) => {
        const imageUrls = responses.map(res => res.data?.data?.imageUrl)
        setFormData((prev) => ({ 
          ...prev, 
          gallery: [...prev.gallery, ...imageUrls] 
        }))
        setGalleryLoading(false)
        toast.success(`${imageUrls.length} images uploaded successfully`)
      })
      .catch((error) => {
        console.error('Gallery upload failed:', error)
        toast.error('Gallery upload failed')
        setGalleryLoading(false)
      })
  }

  // 🔹 Handle document upload
  const handleDocumentUpload = (e) => {
    const file = e.target.files[0]
    if (!docName.trim() || !docNumber.trim()) {
      toast.error('Please enter document name and number first')
      e.target.value = '' // Reset file input
      return
    }
    
    setDocumentLoading(true)
    fileUpload({
      url: `upload/uploadImage`,
      cred: { file },
    })
      .then((res) => {
        const newDoc = {
          name: docName.trim(),
          number: docNumber.trim(),
          image: res.data?.data?.imageUrl
        }
        setFormData((prev) => ({ 
          ...prev, 
          documents: [...prev.documents, newDoc] 
        }))
        setDocName('')
        setDocNumber('')
        setDocumentLoading(false)
        toast.success('Document uploaded successfully')
        e.target.value = '' // Reset file input
      })
      .catch((error) => {
        console.error('Document upload failed:', error)
        toast.error('Document upload failed')
        setDocumentLoading(false)
        e.target.value = '' // Reset file input
      })
  }

  // 🔹 Remove gallery image
  const removeGalleryImage = (indexToRemove) => {
    setFormData((prev) => ({
      ...prev,
      gallery: prev.gallery.filter((_, index) => index !== indexToRemove)
    }))
  }

  // 🔹 Remove document
  const removeDocument = (indexToRemove) => {
    setFormData((prev) => ({
      ...prev,
      documents: prev.documents.filter((_, index) => index !== indexToRemove)
    }))
  }

  // 🔹 Add facility
  const addFacility = () => {
    if (facilityInput.trim() && !formData.facilities.includes(facilityInput.trim())) {
      setFormData(prev => ({
        ...prev,
        facilities: [...prev.facilities, facilityInput.trim()]
      }))
      setFacilityInput('')
    } else if (formData.facilities.includes(facilityInput.trim())) {
      toast.error('Facility already exists')
    }
  }

  // 🔹 Remove facility
  const removeFacility = (indexToRemove) => {
    setFormData(prev => ({
      ...prev,
      facilities: prev.facilities.filter((_, index) => index !== indexToRemove)
    }))
  }

  // 🔹 Add service
  const addService = () => {
    if (serviceInput.trim() && !formData.services.includes(serviceInput.trim())) {
      setFormData(prev => ({
        ...prev,
        services: [...prev.services, serviceInput.trim()]
      }))
      setServiceInput('')
    } else if (formData.services.includes(serviceInput.trim())) {
      toast.error('Service already exists')
    }
  }

  // 🔹 Remove service
  const removeService = (indexToRemove) => {
    setFormData(prev => ({
      ...prev,
      services: prev.services.filter((_, index) => index !== indexToRemove)
    }))
  }

  // 🔹 Add nearby place
  const addNearby = () => {
    if (nearbyName.trim() && nearbyDistance.trim()) {
      const newNearby = {
        name: nearbyName.trim(),
        distance: nearbyDistance.trim()
      }
      setFormData(prev => ({
        ...prev,
        nearby: [...prev.nearby, newNearby]
      }))
      setNearbyName('')
      setNearbyDistance('')
    } else {
      toast.error('Please enter both place name and distance')
    }
  }

  // 🔹 Remove nearby place
  const removeNearby = (indexToRemove) => {
    setFormData(prev => ({
      ...prev,
      nearby: prev.nearby.filter((_, index) => index !== indexToRemove)
    }))
  }

  // 🔹 Handle input change
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    
    if (name === 'longitude' || name === 'latitude') {
      const coordIndex = name === 'longitude' ? 0 : 1
      setFormData(prev => ({
        ...prev,
        coordinates: prev.coordinates.map((coord, index) => 
          index === coordIndex ? (value ? parseFloat(value) : 0) : coord
        )
      }))
    } else {
      setFormData({
        ...formData,
        [name]: type === 'checkbox' ? checked : value,
      })
    }
  }

  // 🔹 Validate form
  const validateForm = () => {
    let newErrors = {}
    
    if (!formData.name.trim()) newErrors.name = 'Property name is required'
    if (!formData.address.trim()) newErrors.address = 'Address is required'
    if (!formData.propertyType.trim()) newErrors.propertyType = 'Property type is required'
    if (!formData.actualPrice || formData.actualPrice <= 0) newErrors.actualPrice = 'Valid actual price is required'
    if (!formData.sellingPrice || formData.sellingPrice <= 0) newErrors.sellingPrice = 'Valid selling price is required'
    if (!formData.description.trim()) newErrors.description = 'Description is required'
    
    // Validate coordinates
    if (!formData.coordinates[0] || !formData.coordinates[1]) {
      newErrors.coordinates = 'Valid coordinates are required'
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  // 🔹 Prepare data for submission
  const prepareSubmissionData = () => {
    return {
      name: formData.name.trim(),
      address: formData.address.trim(),
      location: {
        type: 'Point',
        coordinates: formData.coordinates
      },
      propertyType: formData.propertyType,
      actualPrice: parseFloat(formData.actualPrice),
      sellingPrice: parseFloat(formData.sellingPrice),
      description: formData.description.trim(),
      facilities: formData.facilities,
      services: formData.services,
      nearby: formData.nearby,
      gallery: formData.gallery,
      documents: formData.documents,
      isActive: formData.isActive,
      addedBy: addedBy
    }
  }

  // 🔹 Submit handler for edit
  const handleEdit = (e) => {
    e.preventDefault()
    if (!validateForm()) return

    setLoading(true)
    const submissionData = prepareSubmissionData()
    putRequest({ url: `properties/${modalData?._id}`, cred: submissionData })
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
    const submissionData = prepareSubmissionData()
    postRequest({ url: `properties`, cred: submissionData })
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
      <div style={{ maxHeight: '80vh', overflowY: 'auto', paddingRight: '50px', marginBottom:"50px"}}>
        <form
          onSubmit={modalData ? handleEdit : handleSubmit}
          className="needs-validation"
          noValidate
        >
          {/* Property Name */}
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

          {/* Address with Location Search */}
          <div className="mb-3">
            <label className="form-label fw-bold">Address *</label>
            <div className="position-relative">
              <textarea
                className={`form-control ${errors.address ? 'is-invalid' : ''}`}
                name="address"
                value={addressSearchTerm}
                onChange={handleLocationSearch}
                placeholder="Search for location or enter complete address"
                rows="2"
                onFocus={() => setShowPlacesSuggestions(true)}
              />
              
              {/* Places Suggestions Dropdown */}
              {showPlacesSuggestions && places.length > 0 && (
                <div 
                  className="bg-white border rounded shadow position-absolute w-100 mt-1 p-2" 
                  style={{ 
                    zIndex: 1050, 
                    maxHeight: '200px', 
                    overflowY: 'auto',
                    top: '100%'
                  }}
                >
                  {places.map((place, idx) => (
                    <div
                      key={idx}
                      onClick={() => handlePlaceSelect(place)}
                      className="cursor-pointer py-2 px-2 border-bottom"
                      style={{ 
                        cursor: 'pointer',
                        fontSize: '14px'
                      }}
                      onMouseEnter={(e) => e.target.style.backgroundColor = '#f8f9fa'}
                      onMouseLeave={(e) => e.target.style.backgroundColor = 'white'}
                    >
                      <p className="m-0 fw-bold">
                        {place.displayName?.text}
                      </p>
                      <p className="m-0 text-muted">
                        {place.formattedAddress}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
            {errors?.address && <div className="invalid-feedback">{errors.address}</div>}
          </div>

          {/* Coordinates (Auto-filled from location search) */}
          <div className="row mb-3">
            <div className="col-md-6">
              <label className="form-label fw-bold">Longitude *</label>
              <input
                type="number"
                step="any"
                className={`form-control ${errors.coordinates ? 'is-invalid' : ''}`}
                name="longitude"
                value={formData?.coordinates[0] || ''}
                onChange={handleChange}
                placeholder="77.5946"
              />
            </div>
            <div className="col-md-6">
              <label className="form-label fw-bold">Latitude *</label>
              <input
                type="number"
                step="any"
                className={`form-control ${errors.coordinates ? 'is-invalid' : ''}`}
                name="latitude"
                value={formData?.coordinates[1] || ''}
                onChange={handleChange}
                placeholder="12.9716"
              />
            </div>
            {errors.coordinates && <div className="invalid-feedback d-block">{errors.coordinates}</div>}
            <small className="text-muted mt-1">
              💡 Tip: Coordinates are automatically filled when you select a location from the address search
            </small>
          </div>

          {/* Property Type */}
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
            {errors.propertyType && <div className="invalid-feedback">{errors.propertyType}</div>}
          </div>

          {/* Prices */}
          <div className="row mb-3">
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
          </div>

          {/* Description */}
          <div className="mb-3">
            <label className="form-label fw-bold">Description *</label>
            <textarea
              className={`form-control ${errors.description ? 'is-invalid' : ''}`}
              name="description"
              value={formData?.description}
              onChange={handleChange}
              placeholder="Beautiful villa with swimming pool and garden..."
              rows="3"
            />
            {errors.description && <div className="invalid-feedback">{errors.description}</div>}
          </div>

          {/* Facilities */}
          <div className="mb-3">
            <label className="form-label fw-bold">Facilities</label>
            <div className="input-group mb-2">
              <input
                type="text"
                className="form-control"
                value={facilityInput}
                onChange={(e) => setFacilityInput(e.target.value)}
                placeholder="Enter facility (e.g., Parking, Lift, Power Backup)"
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addFacility())}
              />
              <button type="button" className="btn btn-outline-primary" onClick={addFacility}>
                Add
              </button>
            </div>
            <div className="d-flex flex-wrap gap-2">
              {formData.facilities.map((facility, index) => (
                <span key={index} className="badge bg-primary d-flex align-items-center">
                  {facility}
                  <button
                    type="button"
                    className="btn-close btn-close-white ms-2"
                    style={{ fontSize: '10px' }}
                    onClick={() => removeFacility(index)}
                  />
                </span>
              ))}
            </div>
          </div>

          {/* Services */}
          <div className="mb-3">
            <label className="form-label fw-bold">Services</label>
            <div className="input-group mb-2">
              <input
                type="text"
                className="form-control"
                value={serviceInput}
                onChange={(e) => setServiceInput(e.target.value)}
                placeholder="Enter service (e.g., Water Supply, Maintenance)"
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addService())}
              />
              <button type="button" className="btn btn-outline-success" onClick={addService}>
                Add
              </button>
            </div>
            <div className="d-flex flex-wrap gap-2">
              {formData.services.map((service, index) => (
                <span key={index} className="badge bg-success d-flex align-items-center">
                  {service}
                  <button
                    type="button"
                    className="btn-close btn-close-white ms-2"
                    style={{ fontSize: '10px' }}
                    onClick={() => removeService(index)}
                  />
                </span>
              ))}
            </div>
          </div>

          {/* Nearby Places */}
          <div className="mb-3">
            <label className="form-label fw-bold">Nearby Places</label>
            <div className="row mb-2">
              <div className="col-md-5">
                <input
                  type="text"
                  className="form-control"
                  value={nearbyName}
                  onChange={(e) => setNearbyName(e.target.value)}
                  placeholder="Place name (e.g., School, Hospital)"
                />
              </div>
              <div className="col-md-4">
                <input
                  type="text"
                  className="form-control"
                  value={nearbyDistance}
                  onChange={(e) => setNearbyDistance(e.target.value)}
                  placeholder="Distance (e.g., 1 km, 500 m)"
                />
              </div>
              <div className="col-md-3">
                <button type="button" className="btn btn-outline-info w-100" onClick={addNearby}>
                  Add Place
                </button>
              </div>
            </div>
            <div className="row">
              {formData.nearby.map((place, index) => (
                <div key={index} className="col-md-6 mb-2">
                  <div className="border p-2 rounded d-flex justify-content-between align-items-center">
                    <span><strong>{place.name}</strong> - {place.distance}</span>
                    <button
                      type="button"
                      className="btn btn-sm btn-outline-danger"
                      onClick={() => removeNearby(index)}
                    >
                      ×
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Gallery Images */}
          <div className="mb-3">
            <label className="form-label fw-bold">Gallery Images</label>
            <input
              type="file"
              className="form-control"
              onChange={handleGalleryUpload}
              accept="image/*"
              multiple
            />
            {galleryLoading && <small className="text-info">Uploading images...</small>}
            
            {formData.gallery && formData.gallery.length > 0 && (
              <div className="mt-2">
                <small className="text-muted">Total images: {formData.gallery.length}</small>
                <div className="row">
                  {formData.gallery.map((imageUrl, index) => (
                    <div key={index} className="col-md-3 mb-2">
                      <div className="position-relative">
                        <img 
                          src={imageUrl} 
                          alt={`Gallery ${index + 1}`} 
                          style={{ width: '100%', height: '80px', objectFit: 'cover' }}
                          className="rounded"
                        />
                        <button
                          type="button"
                          className="btn btn-danger btn-sm position-absolute top-0 end-0"
                          style={{ fontSize: '10px', padding: '2px 6px' }}
                          onClick={() => removeGalleryImage(index)}
                        >
                          ×
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Documents */}
          <div className="mb-3">
            <label className="form-label fw-bold">Property Documents</label>
            <div className="row mb-2">
              <div className="col-md-4">
                <input
                  type="text"
                  className="form-control"
                  value={docName}
                  onChange={(e) => setDocName(e.target.value)}
                  placeholder="Document name (e.g., Registry, NOC)"
                />
              </div>
              <div className="col-md-4">
                <input
                  type="text"
                  className="form-control"
                  value={docNumber}
                  onChange={(e) => setDocNumber(e.target.value)}
                  placeholder="Document number"
                />
              </div>
              <div className="col-md-4">
                <input
                  type="file"
                  className="form-control"
                  onChange={handleDocumentUpload}
                  accept="image/*,.pdf,.doc,.docx"
                />
              </div>
            </div>
            {documentLoading && <small className="text-info">Uploading document...</small>}
            
            {formData.documents && formData.documents.length > 0 && (
              <div className="mt-2">
                <small className="text-muted">Total documents: {formData.documents.length}</small>
                {formData.documents.map((doc, index) => (
                  <div key={index} className="border p-2 rounded mb-2 d-flex justify-content-between align-items-center">
                    <div className="d-flex align-items-center">
                      <div>
                        <strong>{doc.name}</strong> - {doc.number}
                      </div>
                      {doc.image && (
                        <img 
                          src={doc.image} 
                          alt="Document" 
                          className="ms-2 rounded" 
                          style={{width: '40px', height: '30px', objectFit: 'cover'}} 
                        />
                      )}
                    </div>
                    <button
                      type="button"
                      className="btn btn-sm btn-outline-danger"
                      onClick={() => removeDocument(index)}
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Active Status */}
          <div className="form-check mb-4">
            <input
              type="checkbox"
              className="form-check-input"
              name="isActive"
              checked={formData.isActive}
              onChange={handleChange}
              id="isActive"
            />
            <label className="form-check-label" htmlFor="isActive">
              <strong>Active Property</strong>
            </label>
          </div>

          {/* Buttons */}
          <div className="d-flex justify-content-end gap-2 pt-3 border-top">
            <button type="button" className="btn btn-secondary" onClick={handleCancel}>
              Cancel
            </button>
            <button 
              type="submit" 
              className="btn btn-primary" 
              disabled={loading || galleryLoading || documentLoading}
            >
              {loading ? 'Saving...' : modalData ? 'Update Property' : 'Create Property'}
            </button>
          </div>
        </form>
      </div>
    </Modal>
  )
}

export default PropertiesModal