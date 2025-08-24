import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { UserCircleIcon, PencilIcon, CheckIcon, XMarkIcon } from '@heroicons/react/24/outline';

const Profile: React.FC = () => {
  const { user, updateProfile } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    profile_photo: user?.profile_photo || ''
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await updateProfile(formData);
      setIsEditing(false);
    } catch (error) {
      // Error is handled by the auth context
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      name: user?.name || '',
      email: user?.email || '',
      profile_photo: user?.profile_photo || ''
    });
    setIsEditing(false);
  };

  if (!user) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center py-12">
          <p className="text-secondary-600">Please log in to view your profile.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-secondary-900 mb-2">Profile</h1>
        <p className="text-secondary-600">Manage your account information</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Profile Picture Section */}
        <div className="lg:col-span-1">
          <div className="card p-6 text-center">
            <div className="mb-4">
              {user.profile_photo ? (
                <img
                  src={user.profile_photo}
                  alt={user.name}
                  className="w-32 h-32 rounded-full mx-auto object-cover border-4 border-secondary-200"
                />
              ) : (
                <UserCircleIcon className="w-32 h-32 text-secondary-400 mx-auto" />
              )}
            </div>
            
            <h2 className="text-xl font-semibold text-secondary-900 mb-1">{user.name}</h2>
            <p className="text-secondary-600 mb-2">{user.email}</p>
            <span className={`inline-block px-3 py-1 text-sm font-medium rounded-full ${
              user.role === 'organizer' 
                ? 'bg-purple-100 text-purple-800' 
                : 'bg-blue-100 text-blue-800'
            }`}>
              {user.role === 'organizer' ? 'Event Organizer' : 'Student'}
            </span>
          </div>
        </div>

        {/* Profile Information */}
        <div className="lg:col-span-2">
          <div className="card p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-secondary-900">Profile Information</h3>
              {!isEditing && (
                <button
                  onClick={() => setIsEditing(true)}
                  className="flex items-center text-primary-600 hover:text-primary-700"
                >
                  <PencilIcon className="h-4 w-4 mr-1" />
                  Edit
                </button>
              )}
            </div>

            {isEditing ? (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-secondary-700 mb-2">
                    Full Name
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className="input-field"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-secondary-700 mb-2">
                    Email Address
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="input-field"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="profile_photo" className="block text-sm font-medium text-secondary-700 mb-2">
                    Profile Photo URL (Optional)
                  </label>
                  <input
                    type="url"
                    id="profile_photo"
                    name="profile_photo"
                    value={formData.profile_photo}
                    onChange={handleChange}
                    className="input-field"
                    placeholder="https://example.com/photo.jpg"
                  />
                  <p className="text-sm text-secondary-500 mt-1">
                    Provide a URL to your profile picture
                  </p>
                </div>

                {/* Preview */}
                {formData.profile_photo && (
                  <div>
                    <label className="block text-sm font-medium text-secondary-700 mb-2">
                      Photo Preview
                    </label>
                    <div className="border border-secondary-200 rounded-lg overflow-hidden w-24 h-24">
                      <img
                        src={formData.profile_photo}
                        alt="Profile photo preview"
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                        }}
                      />
                    </div>
                  </div>
                )}

                <div className="flex items-center space-x-4 pt-4">
                  <button
                    type="submit"
                    disabled={loading}
                    className="btn-primary flex items-center"
                  >
                    {loading ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    ) : (
                      <CheckIcon className="h-4 w-4 mr-2" />
                    )}
                    Save Changes
                  </button>
                  <button
                    type="button"
                    onClick={handleCancel}
                    className="btn-secondary flex items-center"
                  >
                    <XMarkIcon className="h-4 w-4 mr-2" />
                    Cancel
                  </button>
                </div>
              </form>
            ) : (
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-secondary-700 mb-2">
                    Full Name
                  </label>
                  <p className="text-secondary-900">{user.name}</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-secondary-700 mb-2">
                    Email Address
                  </label>
                  <p className="text-secondary-900">{user.email}</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-secondary-700 mb-2">
                    Role
                  </label>
                  <p className="text-secondary-900 capitalize">{user.role}</p>
                </div>

                {user.profile_photo && (
                  <div>
                    <label className="block text-sm font-medium text-secondary-700 mb-2">
                      Profile Photo
                    </label>
                    <img
                      src={user.profile_photo}
                      alt={user.name}
                      className="w-24 h-24 rounded-lg object-cover border border-secondary-200"
                    />
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Account Statistics */}
          <div className="card p-6 mt-6">
            <h3 className="text-lg font-semibold text-secondary-900 mb-4">Account Statistics</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-secondary-50 rounded-lg p-4">
                <p className="text-sm font-medium text-secondary-600">Member Since</p>
                <p className="text-lg font-semibold text-secondary-900">
                  {new Date().toLocaleDateString('en-US', { 
                    year: 'numeric', 
                    month: 'long' 
                  })}
                </p>
              </div>
              <div className="bg-secondary-50 rounded-lg p-4">
                <p className="text-sm font-medium text-secondary-600">Account Type</p>
                <p className="text-lg font-semibold text-secondary-900 capitalize">
                  {user.role}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;