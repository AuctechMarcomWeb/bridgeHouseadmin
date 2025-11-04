/* eslint-disable prettier/prettier */
/* eslint-disable react/prop-types */
import React, { useState } from 'react'
import axios from 'axios'

const CurrentLocationField = ({ formData, setFormData }) => {
  const [searchTerm, setSearchTerm] = useState(formData?.propertyLocation || '')
  const [places, setPlaces] = useState([])
  const [detailsVisible, setDetailsVisible] = useState(false)
  const [loading, setLoading] = useState(false)

  const apiKey = 'AIzaSyAQqh6qd0umyH9zAmfsfbVHuMvFcN_m3kQ' // ⚠️ Hide in .env
  const placesUrl = 'https://places.googleapis.com/v1/places:searchText'

  // 🔍 Search for typed text
  const handleSearch = async (e) => {
    const value = e.target.value
    setSearchTerm(value)
    setDetailsVisible(true)

    if (value.trim().length < 3) {
      setPlaces([])
      return
    }

    try {
      const res = await axios.post(
        placesUrl,
        { textQuery: value },
        {
          headers: {
            'Content-Type': 'application/json',
            'X-Goog-Api-Key': apiKey,
            'X-Goog-FieldMask': 'places.displayName,places.formattedAddress,places.location',
          },
        },
      )
      setPlaces(res.data?.places || [])
    } catch (err) {
      console.error('Error fetching places:', err)
      setPlaces([])
    }
  }

  // 📍 Select place from search list
  const handlePlaceSelect = (place) => {
    const location = {
      type: 'Point',
      coordinates: [place.location.longitude, place.location.latitude],
    }

    setFormData({
      ...formData,
      propertyLocation: place.formattedAddress,
      location,
    })
    setSearchTerm(place.formattedAddress)
    setDetailsVisible(false)
  }

  // 🧭 Use current lat/lng → get address
  const handleCurrentLocation = async () => {
    setLoading(true)
    try {
      if (!navigator.geolocation) {
        alert('Your browser does not support location access.')
        setLoading(false)
        return
      }

      // Get coordinates from device
      const position = await new Promise((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 60000,
        })
      })
      console.log('position', position)

      const { latitude, longitude } = position.coords
      console.log('Current coords:', latitude, longitude)

      // 🔁 Reverse Geocode (convert lat/lng → readable address)
      const geoRes = await axios.get(
        `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=${apiKey}`,
      )
      console.log('geoRes', geoRes)

      let currentAddress = `${latitude}, ${longitude}`
      if (geoRes.data?.results?.length > 0) {
        currentAddress = geoRes.data.results[0].formatted_address
      }
      console.log('currentAddress', currentAddress)

      // ✅ Update state and formData
      setSearchTerm(currentAddress)
      setFormData({
        ...formData,
        propertyLocation: currentAddress,
        location: {
          type: 'Point',
          coordinates: [longitude, latitude],
        },
      })

      setDetailsVisible(false)
    } catch (err) {
      console.error('Location fetch failed:', err)
      alert('Unable to get current location — please allow location access.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="location-container position-relative">
      <div className="d-flex gap-2">
        <input
          type="text"
          value={searchTerm}
          onChange={handleSearch}
          placeholder="Search or use current location"
          className="form-control"
        />
        <button
          type="button"
          onClick={handleCurrentLocation}
          disabled={loading}
          className="btn btn-success whitespace-nowrap"
        >
          {loading ? 'Fetching...' : 'Current Location'}
        </button>
      </div>

      {/* 📍 Suggestions dropdown */}
      {/* {detailsVisible && places.length > 0 && (
        <div className="bg-white border rounded shadow position-absolute w-100 z-10 mt-1 p-2 max-h-60 overflow-auto">
          {places.map((place, idx) => (
            <div
              key={idx}
              onClick={() => handlePlaceSelect(place)}
              className="cursor-pointer py-1 px-2 hover:bg-light border-bottom"
            >
              <strong>{place.displayName?.text}</strong>
              <div className="text-muted small">{place.formattedAddress}</div>
            </div>
          ))}
        </div>
      )} */}
    </div>
  )
}

export default CurrentLocationField
