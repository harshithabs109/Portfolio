import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import { useAuth } from '../contexts/AuthContext';
import LoadingError from '../components/LoadingError';
import { 
  CalendarIcon, 
  MapPinIcon, 
  UserGroupIcon,
  PlusIcon,
  EyeIcon,
  PencilIcon,
  TrashIcon,
  UserIcon
} from '@heroicons/react/24/outline';

interface Event {
  id: number;
  title: string;
  description: string;
  date: string;
  location: string;
  price: number;
  banner?: string;
  organizer_name: string;
  rsvp_count: number;
}

interface RSVP {
  id: number;
  event: Event;
  payment_status: string;
  created_at: string;
}

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const [myEvents, setMyEvents] = useState<Event[]>([]);
  const [myRSVPs, setMyRSVPs] = useState<RSVP[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      if (user?.role === 'organizer') {
        const response = await axios.get('/organizer/events');
        setMyEvents(response.data);
      } else {
        // For students, we'll show their RSVPs
        // This would need a backend endpoint to get user's RSVPs
        // For now, we'll show a message
        setMyRSVPs([]);
      }
    } catch (error: any) {
      setError(error.response?.data?.error || 'Failed to fetch dashboard data');
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteEvent = async (eventId: number) => {
    if (!confirm('Are you sure you want to delete this event?')) {
      return;
    }

    try {
      await axios.delete(`/events/${eventId}`);
      setMyEvents(myEvents.filter(event => event.id !== eventId));
      toast.success('Event deleted successfully');
    } catch (error: any) {
      const message = error.response?.data?.error || 'Failed to delete event';
      toast.error(message);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatPrice = (price: number) => {
    return price === 0 ? 'Free' : `$${price.toFixed(2)}`;
  };

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case 'paid': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'free': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return <LoadingError loading={true} />;
  }

  if (error) {
    return <LoadingError error={error} />;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Welcome Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-secondary-900 mb-2">
          Welcome back, {user?.name}!
        </h1>
        <p className="text-secondary-600">
          {user?.role === 'organizer' 
            ? 'Manage your events and track RSVPs' 
            : 'View your upcoming events and RSVPs'
          }
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="card p-6">
          <div className="flex items-center">
            <div className="p-2 bg-primary-100 rounded-lg">
              <CalendarIcon className="h-6 w-6 text-primary-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-secondary-600">Total Events</p>
              <p className="text-2xl font-bold text-secondary-900">
                {user?.role === 'organizer' ? myEvents.length : myRSVPs.length}
              </p>
            </div>
          </div>
        </div>

        <div className="card p-6">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <UserGroupIcon className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-secondary-600">
                {user?.role === 'organizer' ? 'Total RSVPs' : 'Upcoming Events'}
              </p>
              <p className="text-2xl font-bold text-secondary-900">
                {user?.role === 'organizer' 
                  ? myEvents.reduce((sum, event) => sum + event.rsvp_count, 0)
                  : myRSVPs.filter(rsvp => new Date(rsvp.event.date) > new Date()).length
                }
              </p>
            </div>
          </div>
        </div>

        <div className="card p-6">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <UserIcon className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-secondary-600">Role</p>
              <p className="text-2xl font-bold text-secondary-900 capitalize">
                {user?.role}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      {user?.role === 'organizer' ? (
        /* Organizer Dashboard */
        <div>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-secondary-900">My Events</h2>
            <Link to="/create-event" className="btn-primary flex items-center">
              <PlusIcon className="h-4 w-4 mr-2" />
              Create Event
            </Link>
          </div>

          {myEvents.length === 0 ? (
            <div className="card p-12 text-center">
              <CalendarIcon className="mx-auto h-12 w-12 text-secondary-400 mb-4" />
              <h3 className="text-lg font-medium text-secondary-900 mb-2">No events yet</h3>
              <p className="text-secondary-600 mb-6">
                Start creating events to engage with your audience
              </p>
              <Link to="/create-event" className="btn-primary">
                Create Your First Event
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {myEvents.map((event) => (
                <div key={event.id} className="card overflow-hidden hover:shadow-lg transition-shadow duration-200">
                  {event.banner && (
                    <img
                      src={event.banner}
                      alt={event.title}
                      className="w-full h-48 object-cover"
                    />
                  )}
                  
                  <div className="p-6">
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="text-lg font-semibold text-secondary-900 line-clamp-2">
                        {event.title}
                      </h3>
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                        event.price === 0 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-blue-100 text-blue-800'
                      }`}>
                        {formatPrice(event.price)}
                      </span>
                    </div>
                    
                    <p className="text-secondary-600 text-sm mb-4 line-clamp-3">
                      {event.description}
                    </p>
                    
                    <div className="space-y-2 mb-4">
                      <div className="flex items-center text-sm text-secondary-600">
                        <CalendarIcon className="h-4 w-4 mr-2" />
                        {formatDate(event.date)}
                      </div>
                      
                      <div className="flex items-center text-sm text-secondary-600">
                        <MapPinIcon className="h-4 w-4 mr-2" />
                        {event.location}
                      </div>
                      
                      <div className="flex items-center text-sm text-secondary-600">
                        <UserGroupIcon className="h-4 w-4 mr-2" />
                        {event.rsvp_count} attending
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex space-x-2">
                        <Link
                          to={`/events/${event.id}`}
                          className="text-primary-600 hover:text-primary-700"
                        >
                          <EyeIcon className="h-4 w-4" />
                        </Link>
                        <Link
                          to={`/events/${event.id}/edit`}
                          className="text-secondary-600 hover:text-secondary-700"
                        >
                          <PencilIcon className="h-4 w-4" />
                        </Link>
                        <button
                          onClick={() => handleDeleteEvent(event.id)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <TrashIcon className="h-4 w-4" />
                        </button>
                      </div>
                      
                      <Link
                        to={`/events/${event.id}`}
                        className="btn-primary text-sm"
                      >
                        Manage
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        /* Student Dashboard */
        <div>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-secondary-900">My RSVPs</h2>
            <Link to="/events" className="btn-primary">
              Browse Events
            </Link>
          </div>

          {myRSVPs.length === 0 ? (
            <div className="card p-12 text-center">
              <CalendarIcon className="mx-auto h-12 w-12 text-secondary-400 mb-4" />
              <h3 className="text-lg font-medium text-secondary-900 mb-2">No RSVPs yet</h3>
              <p className="text-secondary-600 mb-6">
                Start exploring events and RSVP to join the fun!
              </p>
              <Link to="/events" className="btn-primary">
                Browse Events
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {myRSVPs.map((rsvp) => (
                <div key={rsvp.id} className="card overflow-hidden hover:shadow-lg transition-shadow duration-200">
                  {rsvp.event.banner && (
                    <img
                      src={rsvp.event.banner}
                      alt={rsvp.event.title}
                      className="w-full h-48 object-cover"
                    />
                  )}
                  
                  <div className="p-6">
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="text-lg font-semibold text-secondary-900 line-clamp-2">
                        {rsvp.event.title}
                      </h3>
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getPaymentStatusColor(rsvp.payment_status)}`}>
                        {rsvp.payment_status === 'free' ? 'Free' : 
                         rsvp.payment_status === 'paid' ? 'Paid' : 'Pending'}
                      </span>
                    </div>
                    
                    <p className="text-secondary-600 text-sm mb-4 line-clamp-3">
                      {rsvp.event.description}
                    </p>
                    
                    <div className="space-y-2 mb-4">
                      <div className="flex items-center text-sm text-secondary-600">
                        <CalendarIcon className="h-4 w-4 mr-2" />
                        {formatDate(rsvp.event.date)}
                      </div>
                      
                      <div className="flex items-center text-sm text-secondary-600">
                        <MapPinIcon className="h-4 w-4 mr-2" />
                        {rsvp.event.location}
                      </div>
                      
                      <div className="flex items-center text-sm text-secondary-600">
                        <UserIcon className="h-4 w-4 mr-2" />
                        by {rsvp.event.organizer_name}
                      </div>
                    </div>
                    
                    <Link
                      to={`/events/${rsvp.event.id}`}
                      className="btn-primary text-sm w-full text-center"
                    >
                      View Event
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Dashboard;