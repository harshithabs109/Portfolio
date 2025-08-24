import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import { 
  MagnifyingGlassIcon, 
  FunnelIcon,
  CalendarIcon,
  MapPinIcon,
  CurrencyDollarIcon,
  UserGroupIcon
} from '@heroicons/react/24/outline';
import LoadingError from '../components/LoadingError';

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

const Events: React.FC = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [filteredEvents, setFilteredEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('date');
  const [priceFilter, setPriceFilter] = useState('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  useEffect(() => {
    fetchEvents();
  }, []);

  useEffect(() => {
    filterAndSortEvents();
  }, [events, searchTerm, sortBy, priceFilter]);

  const fetchEvents = async () => {
    try {
      const response = await axios.get('/events');
      setEvents(response.data);
    } catch (error: any) {
      setError(error.response?.data?.error || 'Failed to fetch events');
      toast.error('Failed to load events');
    } finally {
      setLoading(false);
    }
  };

  const filterAndSortEvents = () => {
    let filtered = events.filter(event => {
      const matchesSearch = event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           event.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           event.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           event.organizer_name.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesPrice = priceFilter === 'all' ||
                          (priceFilter === 'free' && event.price === 0) ||
                          (priceFilter === 'paid' && event.price > 0);
      
      return matchesSearch && matchesPrice;
    });

    // Sort events
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'date':
          return new Date(a.date).getTime() - new Date(b.date).getTime();
        case 'price':
          return a.price - b.price;
        case 'title':
          return a.title.localeCompare(b.title);
        case 'popularity':
          return b.rsvp_count - a.rsvp_count;
        default:
          return 0;
      }
    });

    setFilteredEvents(filtered);
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

  if (loading) {
    return <LoadingError loading={true} />;
  }

  if (error) {
    return <LoadingError error={error} />;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-secondary-900 mb-2">Events</h1>
        <p className="text-secondary-600">Discover and join amazing events in your area</p>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-secondary-200 p-6 mb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Search */}
          <div className="relative">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-secondary-400" />
            <input
              type="text"
              placeholder="Search events..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input-field pl-10"
            />
          </div>

          {/* Sort */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="input-field"
          >
            <option value="date">Sort by Date</option>
            <option value="price">Sort by Price</option>
            <option value="title">Sort by Title</option>
            <option value="popularity">Sort by Popularity</option>
          </select>

          {/* Price Filter */}
          <select
            value={priceFilter}
            onChange={(e) => setPriceFilter(e.target.value)}
            className="input-field"
          >
            <option value="all">All Prices</option>
            <option value="free">Free Events</option>
            <option value="paid">Paid Events</option>
          </select>

          {/* View Mode */}
          <div className="flex space-x-2">
            <button
              onClick={() => setViewMode('grid')}
              className={`px-3 py-2 rounded-lg border ${
                viewMode === 'grid'
                  ? 'bg-primary-600 text-white border-primary-600'
                  : 'bg-white text-secondary-700 border-secondary-300 hover:bg-secondary-50'
              }`}
            >
              Grid
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`px-3 py-2 rounded-lg border ${
                viewMode === 'list'
                  ? 'bg-primary-600 text-white border-primary-600'
                  : 'bg-white text-secondary-700 border-secondary-300 hover:bg-secondary-50'
              }`}
            >
              List
            </button>
          </div>
        </div>
      </div>

      {/* Results Count */}
      <div className="mb-6">
        <p className="text-secondary-600">
          Showing {filteredEvents.length} of {events.length} events
        </p>
      </div>

      {/* Events Grid/List */}
      {filteredEvents.length === 0 ? (
        <div className="text-center py-12">
          <CalendarIcon className="mx-auto h-12 w-12 text-secondary-400" />
          <h3 className="mt-2 text-sm font-medium text-secondary-900">No events found</h3>
          <p className="mt-1 text-sm text-secondary-500">
            Try adjusting your search or filter criteria.
          </p>
        </div>
      ) : (
        <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6' : 'space-y-4'}>
          {filteredEvents.map((event) => (
            <div key={event.id} className="card overflow-hidden hover:shadow-lg transition-shadow duration-200">
              {event.banner && (
                <div className="aspect-w-16 aspect-h-9">
                  <img
                    src={event.banner}
                    alt={event.title}
                    className="w-full h-48 object-cover"
                  />
                </div>
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
                  <span className="text-sm text-secondary-500">
                    by {event.organizer_name}
                  </span>
                  
                  <Link
                    to={`/events/${event.id}`}
                    className="btn-primary text-sm"
                  >
                    View Details
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Events;