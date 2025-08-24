import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import { CalendarIcon, MapPinIcon, CurrencyDollarIcon } from '@heroicons/react/24/outline';

const CreateEvent: React.FC = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    date: '',
    time: '',
    location: '',
    price: '',
    banner: ''
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title || !formData.description || !formData.date || !formData.time || !formData.location) {
      toast.error('Please fill in all required fields');
      return;
    }

    const eventDate = new Date(`${formData.date}T${formData.time}`);
    if (eventDate <= new Date()) {
      toast.error('Event date must be in the future');
      return;
    }

    setLoading(true);
    try {
      const eventData = {
        title: formData.title,
        description: formData.description,
        date: eventDate.toISOString(),
        location: formData.location,
        price: parseFloat(formData.price) || 0,
        banner: formData.banner || undefined
      };

      await axios.post('/events', eventData);
      toast.success('Event created successfully!');
      navigate('/dashboard');
    } catch (error: any) {
      const message = error.response?.data?.error || 'Failed to create event';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const getMinDate = () => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-secondary-900 mb-2">Create New Event</h1>
        <p className="text-secondary-600">Fill in the details below to create your event</p>
      </div>

      <div className="card p-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Event Title */}
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-secondary-700 mb-2">
              Event Title *
            </label>
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleChange}
              className="input-field"
              placeholder="Enter event title"
              required
            />
          </div>

          {/* Event Description */}
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-secondary-700 mb-2">
              Event Description *
            </label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={4}
              className="input-field resize-none"
              placeholder="Describe your event in detail..."
              required
            />
          </div>

          {/* Date and Time */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="date" className="block text-sm font-medium text-secondary-700 mb-2">
                Event Date *
              </label>
              <div className="relative">
                <CalendarIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-secondary-400" />
                <input
                  type="date"
                  id="date"
                  name="date"
                  value={formData.date}
                  onChange={handleChange}
                  min={getMinDate()}
                  className="input-field pl-10"
                  required
                />
              </div>
            </div>

            <div>
              <label htmlFor="time" className="block text-sm font-medium text-secondary-700 mb-2">
                Event Time *
              </label>
              <input
                type="time"
                id="time"
                name="time"
                value={formData.time}
                onChange={handleChange}
                className="input-field"
                required
              />
            </div>
          </div>

          {/* Location */}
          <div>
            <label htmlFor="location" className="block text-sm font-medium text-secondary-700 mb-2">
              Event Location *
            </label>
            <div className="relative">
              <MapPinIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-secondary-400" />
              <input
                type="text"
                id="location"
                name="location"
                value={formData.location}
                onChange={handleChange}
                className="input-field pl-10"
                placeholder="Enter event location"
                required
              />
            </div>
          </div>

          {/* Price */}
          <div>
            <label htmlFor="price" className="block text-sm font-medium text-secondary-700 mb-2">
              Event Price
            </label>
            <div className="relative">
              <CurrencyDollarIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-secondary-400" />
              <input
                type="number"
                id="price"
                name="price"
                value={formData.price}
                onChange={handleChange}
                min="0"
                step="0.01"
                className="input-field pl-10"
                placeholder="0.00 (Free event)"
              />
            </div>
            <p className="text-sm text-secondary-500 mt-1">
              Leave empty or set to 0 for free events
            </p>
          </div>

          {/* Banner Image URL */}
          <div>
            <label htmlFor="banner" className="block text-sm font-medium text-secondary-700 mb-2">
              Banner Image URL (Optional)
            </label>
            <input
              type="url"
              id="banner"
              name="banner"
              value={formData.banner}
              onChange={handleChange}
              className="input-field"
              placeholder="https://example.com/image.jpg"
            />
            <p className="text-sm text-secondary-500 mt-1">
              Provide a URL to an image for your event banner
            </p>
          </div>

          {/* Preview */}
          {formData.banner && (
            <div>
              <label className="block text-sm font-medium text-secondary-700 mb-2">
                Banner Preview
              </label>
              <div className="border border-secondary-200 rounded-lg overflow-hidden">
                <img
                  src={formData.banner}
                  alt="Event banner preview"
                  className="w-full h-48 object-cover"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                  }}
                />
              </div>
            </div>
          )}

          {/* Form Actions */}
          <div className="flex items-center justify-end space-x-4 pt-6 border-t border-secondary-200">
            <button
              type="button"
              onClick={() => navigate('/dashboard')}
              className="btn-secondary"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="btn-primary"
            >
              {loading ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Creating Event...
                </div>
              ) : (
                'Create Event'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateEvent;