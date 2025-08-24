import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import { useAuth } from '../contexts/AuthContext';
import LoadingError from '../components/LoadingError';
import { 
  CalendarIcon, 
  MapPinIcon, 
  CurrencyDollarIcon, 
  UserGroupIcon,
  UserIcon,
  ChatBubbleLeftIcon,
  PencilIcon,
  TrashIcon
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

interface Comment {
  id: number;
  content: string;
  timestamp: string;
  user_name: string;
  user_id: number;
}

interface RSVPStatus {
  rsvp_status: 'rsvpd' | 'not_rsvpd';
  payment_status?: 'pending' | 'paid' | 'free';
}

const EventDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [event, setEvent] = useState<Event | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [rsvpStatus, setRsvpStatus] = useState<RSVPStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [newComment, setNewComment] = useState('');
  const [submittingComment, setSubmittingComment] = useState(false);
  const [rsvpLoading, setRsvpLoading] = useState(false);

  useEffect(() => {
    if (id) {
      fetchEventDetails();
      fetchComments();
      if (user) {
        fetchRSVPStatus();
      }
    }
  }, [id, user]);

  const fetchEventDetails = async () => {
    try {
      const response = await axios.get(`/events/${id}`);
      setEvent(response.data);
    } catch (error: any) {
      setError(error.response?.data?.error || 'Failed to fetch event details');
      toast.error('Failed to load event details');
    } finally {
      setLoading(false);
    }
  };

  const fetchComments = async () => {
    try {
      const response = await axios.get(`/events/${id}/comments`);
      setComments(response.data);
    } catch (error: any) {
      console.error('Failed to fetch comments:', error);
    }
  };

  const fetchRSVPStatus = async () => {
    try {
      const response = await axios.get(`/rsvp/${id}`);
      setRsvpStatus(response.data);
    } catch (error: any) {
      console.error('Failed to fetch RSVP status:', error);
    }
  };

  const handleRSVP = async () => {
    if (!user) {
      toast.error('Please log in to RSVP');
      navigate('/login');
      return;
    }

    setRsvpLoading(true);
    try {
      if (rsvpStatus?.rsvp_status === 'rsvpd') {
        await axios.delete(`/rsvp/${id}`);
        toast.success('RSVP cancelled successfully');
        setRsvpStatus({ rsvp_status: 'not_rsvpd' });
        if (event) {
          setEvent({ ...event, rsvp_count: event.rsvp_count - 1 });
        }
      } else {
        await axios.post('/rsvp', { event_id: parseInt(id!) });
        toast.success('RSVP successful!');
        setRsvpStatus({ rsvp_status: 'rsvpd', payment_status: event?.price === 0 ? 'free' : 'pending' });
        if (event) {
          setEvent({ ...event, rsvp_count: event.rsvp_count + 1 });
        }
      }
    } catch (error: any) {
      const message = error.response?.data?.error || 'RSVP operation failed';
      toast.error(message);
    } finally {
      setRsvpLoading(false);
    }
  };

  const handleCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      toast.error('Please log in to comment');
      navigate('/login');
      return;
    }

    if (!newComment.trim()) {
      toast.error('Comment cannot be empty');
      return;
    }

    setSubmittingComment(true);
    try {
      const response = await axios.post(`/events/${id}/comments`, { content: newComment });
      setComments([response.data.comment, ...comments]);
      setNewComment('');
      toast.success('Comment added successfully');
    } catch (error: any) {
      const message = error.response?.data?.error || 'Failed to add comment';
      toast.error(message);
    } finally {
      setSubmittingComment(false);
    }
  };

  const handleDeleteComment = async (commentId: number) => {
    try {
      await axios.delete(`/comments/${commentId}`);
      setComments(comments.filter(comment => comment.id !== commentId));
      toast.success('Comment deleted successfully');
    } catch (error: any) {
      const message = error.response?.data?.error || 'Failed to delete comment';
      toast.error(message);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
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

  if (error || !event) {
    return <LoadingError error={error || 'Event not found'} />;
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Event Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-3xl font-bold text-secondary-900">{event.title}</h1>
          <span className={`px-3 py-1 text-sm font-medium rounded-full ${getPaymentStatusColor(event.price === 0 ? 'free' : 'paid')}`}>
            {formatPrice(event.price)}
          </span>
        </div>
        
        {event.banner && (
          <img
            src={event.banner}
            alt={event.title}
            className="w-full h-64 object-cover rounded-lg mb-6"
          />
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2">
          {/* Event Details */}
          <div className="card p-6 mb-6">
            <h2 className="text-xl font-semibold text-secondary-900 mb-4">Event Details</h2>
            <p className="text-secondary-600 mb-6">{event.description}</p>
            
            <div className="space-y-3">
              <div className="flex items-center text-secondary-700">
                <CalendarIcon className="h-5 w-5 mr-3" />
                {formatDate(event.date)}
              </div>
              
              <div className="flex items-center text-secondary-700">
                <MapPinIcon className="h-5 w-5 mr-3" />
                {event.location}
              </div>
              
              <div className="flex items-center text-secondary-700">
                <UserGroupIcon className="h-5 w-5 mr-3" />
                {event.rsvp_count} people attending
              </div>
              
              <div className="flex items-center text-secondary-700">
                <UserIcon className="h-5 w-5 mr-3" />
                Organized by {event.organizer_name}
              </div>
            </div>
          </div>

          {/* Comments Section */}
          <div className="card p-6">
            <h2 className="text-xl font-semibold text-secondary-900 mb-4 flex items-center">
              <ChatBubbleLeftIcon className="h-5 w-5 mr-2" />
              Comments ({comments.length})
            </h2>

            {/* Add Comment */}
            {user && (
              <form onSubmit={handleCommentSubmit} className="mb-6">
                <textarea
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="Add a comment..."
                  className="input-field h-24 resize-none"
                  disabled={submittingComment}
                />
                <button
                  type="submit"
                  disabled={submittingComment || !newComment.trim()}
                  className="btn-primary mt-2"
                >
                  {submittingComment ? 'Posting...' : 'Post Comment'}
                </button>
              </form>
            )}

            {/* Comments List */}
            <div className="space-y-4">
              {comments.map((comment) => (
                <div key={comment.id} className="border-b border-secondary-200 pb-4 last:border-b-0">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center mb-2">
                        <span className="font-medium text-secondary-900">{comment.user_name}</span>
                        <span className="text-sm text-secondary-500 ml-2">
                          {new Date(comment.timestamp).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="text-secondary-700">{comment.content}</p>
                    </div>
                    
                    {user && (user.id === comment.user_id || user.role === 'organizer') && (
                      <button
                        onClick={() => handleDeleteComment(comment.id)}
                        className="text-red-600 hover:text-red-800 ml-2"
                      >
                        <TrashIcon className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
              
              {comments.length === 0 && (
                <p className="text-secondary-500 text-center py-4">No comments yet. Be the first to comment!</p>
              )}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="lg:col-span-1">
          <div className="card p-6 sticky top-6">
            <h3 className="text-lg font-semibold text-secondary-900 mb-4">Event Actions</h3>
            
            {/* RSVP Button */}
            <button
              onClick={handleRSVP}
              disabled={rsvpLoading}
              className={`w-full mb-4 ${
                rsvpStatus?.rsvp_status === 'rsvpd'
                  ? 'btn-danger'
                  : 'btn-primary'
              }`}
            >
              {rsvpLoading ? (
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mx-auto"></div>
              ) : rsvpStatus?.rsvp_status === 'rsvpd' ? (
                'Cancel RSVP'
              ) : (
                'RSVP to Event'
              )}
            </button>

            {/* Payment Status */}
            {rsvpStatus?.rsvp_status === 'rsvpd' && (
              <div className="mb-4">
                <p className="text-sm text-secondary-600 mb-2">Payment Status:</p>
                <span className={`px-2 py-1 text-xs font-medium rounded-full ${getPaymentStatusColor(rsvpStatus.payment_status || 'pending')}`}>
                  {rsvpStatus.payment_status === 'free' ? 'Free Event' : 
                   rsvpStatus.payment_status === 'paid' ? 'Paid' : 'Pending Payment'}
                </span>
              </div>
            )}

            {/* Event Info */}
            <div className="border-t border-secondary-200 pt-4">
              <h4 className="font-medium text-secondary-900 mb-2">Event Information</h4>
              <div className="space-y-2 text-sm text-secondary-600">
                <p><strong>Date:</strong> {formatDate(event.date)}</p>
                <p><strong>Location:</strong> {event.location}</p>
                <p><strong>Price:</strong> {formatPrice(event.price)}</p>
                <p><strong>Attendees:</strong> {event.rsvp_count}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EventDetail;