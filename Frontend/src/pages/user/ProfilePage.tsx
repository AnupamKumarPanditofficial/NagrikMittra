import React, { useState, ChangeEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import './ProfilePage.css';

const ProfilePage = () => {
  const navigate = useNavigate();
  const [profilePic, setProfilePic] = useState<File | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: 'Nagrik User',
    mobile: '9876543210',
    address: {
      currentLocation: '123, Main Street',
      policeStation: 'Central Police Station',
      wardNo: '10',
      pinCode: '110001',
      district: 'New Delhi',
      state: 'Delhi',
    },
    aadharNo: '123456789012',
    panNo: 'ABCDE1234F',
    parentDetails: 'Mr. & Mrs. User',
  });

  const handleInputChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    if (name.startsWith('address.')) {
      const key = name.split('.')[1];
      setFormData((prev) => ({
        ...prev,
        address: {
          ...prev.address,
          [key]: value,
        },
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handleProfilePicChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setProfilePic(e.target.files[0]);
    }
  };

  const handleLogout = () => {
    // Clear user session/tokens here if needed
    console.log('User logged out');
    navigate('/');
  };

  const handleGoBack = () => {
    navigate(-1);
  };

  // Calculate completion percentage with required fields checked
  const calculateCompletion = () => {
    let completed = 0;
    const requiredFieldsCount = 12;
    if (formData.name) completed++;
    if (formData.mobile) completed++;
    if (formData.address.currentLocation) completed++;
    if (formData.address.policeStation) completed++;
    if (formData.address.wardNo) completed++;
    if (formData.address.pinCode) completed++;
    if (formData.address.district) completed++;
    if (formData.address.state) completed++;
    if (formData.aadharNo) completed++;
    if (formData.panNo) completed++;
    if (formData.parentDetails) completed++;
    if (profilePic) completed++;
    return Math.round((completed / requiredFieldsCount) * 100);
  };

  const progress = calculateCompletion();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Check all required fill
    if (progress < 100) {
      alert('Please fill in all required fields to complete your profile.');
      return;
    }
    alert('Profile updated successfully!');
    setIsEditing(false);
  };

  return (
    <div className="profile-page-container">
      {/* Top Navigation Bar */}
      <div className="top-navigation">
        <button className="back-button" onClick={handleGoBack} aria-label="Go back">
          ← Back
        </button>
        <button className="logout-button" onClick={handleLogout} aria-label="Logout">
          Logout
        </button>
      </div>

      {/* Profile Header */}
      <div className="profile-header-section">
        <div className="profile-pic-container">
          {profilePic ? (
            <img src={URL.createObjectURL(profilePic)} alt="Profile" className="profile-pic" />
          ) : (
            <div className="profile-pic-placeholder">N</div>
          )}
          <input
            type="file"
            accept="image/*"
            onChange={handleProfilePicChange}
            className="profile-pic-input"
            aria-label="Upload profile picture"
          />
        </div>
        <div className="user-basic-info">
          <h2>{formData.name}</h2>
          <p>Active Citizen</p>
          <div className="profile-completion">
            <progress value={progress} max="100" />
            <span>{progress}% Complete</span>
          </div>
          {!isEditing && (
            <button className="edit-profile-btn" onClick={() => setIsEditing(true)}>
              Edit Profile
            </button>
          )}
        </div>
      </div>

      {/* Profile Information or Form */}
      {isEditing ? (
        <form className="profile-form" onSubmit={handleSubmit} noValidate>
          <h3>Edit Your Profile</h3>

          <label>
            Name *
            <input
              type="text"
              name="name"
              placeholder="Enter full name"
              value={formData.name}
              onChange={handleInputChange}
              required
            />
          </label>

          <label>
            Mobile No *
            <input
              type="tel"
              name="mobile"
              placeholder="Enter 10-digit mobile number"
              value={formData.mobile}
              onChange={handleInputChange}
              required
              pattern="\d{10}"
              title="Enter 10 digit mobile number"
            />
          </label>

          <fieldset className="address-section" aria-label="Address details">
            <legend>Complete Address *</legend>

            <label>
              Current Location *
              <input
                type="text"
                name="address.currentLocation"
                placeholder="Current location or area"
                value={formData.address.currentLocation}
                onChange={handleInputChange}
                required
              />
            </label>

            <label>
              Police Station *
              <input
                type="text"
                name="address.policeStation"
                placeholder="Nearest police station"
                value={formData.address.policeStation}
                onChange={handleInputChange}
                required
              />
            </label>

            <label>
              Ward No *
              <input
                type="text"
                name="address.wardNo"
                placeholder="Ward number"
                value={formData.address.wardNo}
                onChange={handleInputChange}
                required
              />
            </label>

            <label>
              Pin Code *
              <input
                type="text"
                name="address.pinCode"
                placeholder="6-digit postal/zip code"
                value={formData.address.pinCode}
                onChange={handleInputChange}
                required
                pattern="\d{6}"
                title="Enter a 6 digit pin code"
              />
            </label>

            <label>
              District *
              <input
                type="text"
                name="address.district"
                placeholder="District name"
                value={formData.address.district}
                onChange={handleInputChange}
                required
              />
            </label>

            <label>
              State *
              <input
                type="text"
                name="address.state"
                placeholder="State name"
                value={formData.address.state}
                onChange={handleInputChange}
                required
              />
            </label>
          </fieldset>

          <label>
            Aadhar No *
            <input
              type="text"
              name="aadharNo"
              placeholder="12-digit Aadhar number"
              value={formData.aadharNo}
              onChange={handleInputChange}
              required
              pattern="\d{12}"
              title="Enter 12 digit Aadhar number"
            />
          </label>

          <label>
            PAN No *
            <input
              type="text"
              name="panNo"
              placeholder="Permanent Account Number"
              value={formData.panNo}
              onChange={handleInputChange}
              required
              pattern="[A-Z]{5}[0-9]{4}[A-Z]{1}"
              title="Enter valid PAN number (e.g. ABCDE1234F)"
            />
          </label>

          <label>
            Parent Details *
            <textarea
              name="parentDetails"
              placeholder="Enter parental information"
              value={formData.parentDetails}
              onChange={handleInputChange}
              required
              rows={4}
            />
          </label>

          <button type="submit" className="submit-profile-btn">
            Save Changes
          </button>
        </form>
      ) : (
        <div className="profile-details">
          <h3>Your Information</h3>
          <div className="info-grid">
            <div className="info-item">
              <strong>Name</strong>
              <p>{formData.name}</p>
            </div>
            <div className="info-item">
              <strong>Mobile No</strong>
              <p>{formData.mobile}</p>
            </div>
            <div className="info-item">
              <strong>Aadhar No</strong>
              <p>{formData.aadharNo}</p>
            </div>
            <div className="info-item">
              <strong>PAN No</strong>
              <p>{formData.panNo}</p>
            </div>
            <div className="info-item full-width">
              <strong>Address</strong>
              <p>{`${formData.address.currentLocation}, ${formData.address.policeStation}, Ward ${formData.address.wardNo}, ${formData.address.district}, ${formData.address.state} - ${formData.address.pinCode}`}</p>
            </div>
            <div className="info-item full-width">
              <strong>Parent Details</strong>
              <p>{formData.parentDetails}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfilePage;
