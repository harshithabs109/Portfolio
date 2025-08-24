from flask import Flask, request, jsonify
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate
from flask_cors import CORS
from flask_jwt_extended import JWTManager, create_access_token, jwt_required, get_jwt_identity
from flask_bcrypt import Bcrypt
from datetime import datetime, timedelta
import os
from dotenv import load_dotenv

load_dotenv()

app = Flask(__name__)

# Configuration
app.config['SECRET_KEY'] = os.getenv('SECRET_KEY', 'your-secret-key-here')
app.config['SQLALCHEMY_DATABASE_URI'] = os.getenv('DATABASE_URL', 'postgresql://localhost/event_management')
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['JWT_SECRET_KEY'] = os.getenv('JWT_SECRET_KEY', 'jwt-secret-key')
app.config['JWT_ACCESS_TOKEN_EXPIRES'] = timedelta(hours=24)

# Initialize extensions
db = SQLAlchemy(app)
migrate = Migrate(app, db)
jwt = JWTManager(app)
bcrypt = Bcrypt(app)
CORS(app)

# Database Models
class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password = db.Column(db.String(255), nullable=False)
    role = db.Column(db.String(20), default='student')  # 'student' or 'organizer'
    profile_photo = db.Column(db.String(255))
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    # Relationships
    rsvps = db.relationship('RSVP', backref='user', lazy=True)
    comments = db.relationship('Comment', backref='user', lazy=True)
    events = db.relationship('Event', backref='organizer', lazy=True)

class Event(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(200), nullable=False)
    description = db.Column(db.Text, nullable=False)
    date = db.Column(db.DateTime, nullable=False)
    location = db.Column(db.String(200), nullable=False)
    price = db.Column(db.Float, default=0.0)
    banner = db.Column(db.String(255))
    organizer_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    # Relationships
    rsvps = db.relationship('RSVP', backref='event', lazy=True)
    comments = db.relationship('Comment', backref='event', lazy=True)

class RSVP(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    event_id = db.Column(db.Integer, db.ForeignKey('event.id'), nullable=False)
    payment_status = db.Column(db.String(20), default='pending')  # 'pending', 'paid', 'free'
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

class Comment(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    event_id = db.Column(db.Integer, db.ForeignKey('event.id'), nullable=False)
    content = db.Column(db.Text, nullable=False)
    timestamp = db.Column(db.DateTime, default=datetime.utcnow)

# Authentication Routes
@app.route('/api/register', methods=['POST'])
def register():
    data = request.get_json()
    
    if not data or not data.get('email') or not data.get('password') or not data.get('name'):
        return jsonify({'error': 'Missing required fields'}), 400
    
    if User.query.filter_by(email=data['email']).first():
        return jsonify({'error': 'Email already registered'}), 400
    
    hashed_password = bcrypt.generate_password_hash(data['password']).decode('utf-8')
    
    user = User(
        name=data['name'],
        email=data['email'],
        password=hashed_password,
        role=data.get('role', 'student')
    )
    
    db.session.add(user)
    db.session.commit()
    
    access_token = create_access_token(identity=user.id)
    
    return jsonify({
        'message': 'User registered successfully',
        'access_token': access_token,
        'user': {
            'id': user.id,
            'name': user.name,
            'email': user.email,
            'role': user.role
        }
    }), 201

@app.route('/api/login', methods=['POST'])
def login():
    data = request.get_json()
    
    if not data or not data.get('email') or not data.get('password'):
        return jsonify({'error': 'Missing email or password'}), 400
    
    user = User.query.filter_by(email=data['email']).first()
    
    if not user or not bcrypt.check_password_hash(user.password, data['password']):
        return jsonify({'error': 'Invalid email or password'}), 401
    
    access_token = create_access_token(identity=user.id)
    
    return jsonify({
        'message': 'Login successful',
        'access_token': access_token,
        'user': {
            'id': user.id,
            'name': user.name,
            'email': user.email,
            'role': user.role
        }
    })

@app.route('/api/profile', methods=['GET'])
@jwt_required()
def get_profile():
    user_id = get_jwt_identity()
    user = User.query.get(user_id)
    
    if not user:
        return jsonify({'error': 'User not found'}), 404
    
    return jsonify({
        'id': user.id,
        'name': user.name,
        'email': user.email,
        'role': user.role,
        'profile_photo': user.profile_photo
    })

# Event Routes
@app.route('/api/events', methods=['GET'])
def get_events():
    events = Event.query.order_by(Event.date.asc()).all()
    
    events_data = []
    for event in events:
        organizer = User.query.get(event.organizer_id)
        events_data.append({
            'id': event.id,
            'title': event.title,
            'description': event.description,
            'date': event.date.isoformat(),
            'location': event.location,
            'price': event.price,
            'banner': event.banner,
            'organizer_name': organizer.name if organizer else 'Unknown',
            'rsvp_count': len(event.rsvps)
        })
    
    return jsonify(events_data)

@app.route('/api/events', methods=['POST'])
@jwt_required()
def create_event():
    user_id = get_jwt_identity()
    user = User.query.get(user_id)
    
    if user.role != 'organizer':
        return jsonify({'error': 'Only organizers can create events'}), 403
    
    data = request.get_json()
    
    if not data or not data.get('title') or not data.get('description') or not data.get('date') or not data.get('location'):
        return jsonify({'error': 'Missing required fields'}), 400
    
    try:
        event_date = datetime.fromisoformat(data['date'].replace('Z', '+00:00'))
    except ValueError:
        return jsonify({'error': 'Invalid date format'}), 400
    
    event = Event(
        title=data['title'],
        description=data['description'],
        date=event_date,
        location=data['location'],
        price=data.get('price', 0.0),
        banner=data.get('banner'),
        organizer_id=user_id
    )
    
    db.session.add(event)
    db.session.commit()
    
    return jsonify({
        'message': 'Event created successfully',
        'event': {
            'id': event.id,
            'title': event.title,
            'description': event.description,
            'date': event.date.isoformat(),
            'location': event.location,
            'price': event.price,
            'banner': event.banner
        }
    }), 201

@app.route('/api/events/<int:event_id>', methods=['GET'])
def get_event(event_id):
    event = Event.query.get_or_404(event_id)
    organizer = User.query.get(event.organizer_id)
    
    return jsonify({
        'id': event.id,
        'title': event.title,
        'description': event.description,
        'date': event.date.isoformat(),
        'location': event.location,
        'price': event.price,
        'banner': event.banner,
        'organizer_name': organizer.name if organizer else 'Unknown',
        'rsvp_count': len(event.rsvps)
    })

@app.route('/api/events/<int:event_id>', methods=['PUT'])
@jwt_required()
def update_event(event_id):
    user_id = get_jwt_identity()
    event = Event.query.get_or_404(event_id)
    
    if event.organizer_id != user_id:
        return jsonify({'error': 'Only the organizer can update this event'}), 403
    
    data = request.get_json()
    
    if data.get('title'):
        event.title = data['title']
    if data.get('description'):
        event.description = data['description']
    if data.get('date'):
        try:
            event.date = datetime.fromisoformat(data['date'].replace('Z', '+00:00'))
        except ValueError:
            return jsonify({'error': 'Invalid date format'}), 400
    if data.get('location'):
        event.location = data['location']
    if data.get('price') is not None:
        event.price = data['price']
    if data.get('banner'):
        event.banner = data['banner']
    
    db.session.commit()
    
    return jsonify({'message': 'Event updated successfully'})

@app.route('/api/events/<int:event_id>', methods=['DELETE'])
@jwt_required()
def delete_event(event_id):
    user_id = get_jwt_identity()
    event = Event.query.get_or_404(event_id)
    
    if event.organizer_id != user_id:
        return jsonify({'error': 'Only the organizer can delete this event'}), 403
    
    db.session.delete(event)
    db.session.commit()
    
    return jsonify({'message': 'Event deleted successfully'})

# RSVP Routes
@app.route('/api/rsvp', methods=['POST'])
@jwt_required()
def create_rsvp():
    user_id = get_jwt_identity()
    data = request.get_json()
    
    if not data or not data.get('event_id'):
        return jsonify({'error': 'Event ID is required'}), 400
    
    event = Event.query.get_or_404(data['event_id'])
    
    # Check if user already RSVP'd
    existing_rsvp = RSVP.query.filter_by(user_id=user_id, event_id=data['event_id']).first()
    if existing_rsvp:
        return jsonify({'error': 'Already RSVP\'d to this event'}), 400
    
    rsvp = RSVP(
        user_id=user_id,
        event_id=data['event_id'],
        payment_status='free' if event.price == 0 else 'pending'
    )
    
    db.session.add(rsvp)
    db.session.commit()
    
    return jsonify({'message': 'RSVP created successfully'}), 201

@app.route('/api/rsvp/<int:event_id>', methods=['DELETE'])
@jwt_required()
def cancel_rsvp(event_id):
    user_id = get_jwt_identity()
    
    rsvp = RSVP.query.filter_by(user_id=user_id, event_id=event_id).first()
    if not rsvp:
        return jsonify({'error': 'RSVP not found'}), 404
    
    db.session.delete(rsvp)
    db.session.commit()
    
    return jsonify({'message': 'RSVP cancelled successfully'})

@app.route('/api/rsvp/<int:event_id>', methods=['GET'])
@jwt_required()
def get_rsvp_status(event_id):
    user_id = get_jwt_identity()
    
    rsvp = RSVP.query.filter_by(user_id=user_id, event_id=event_id).first()
    
    if not rsvp:
        return jsonify({'rsvp_status': 'not_rsvpd'})
    
    return jsonify({
        'rsvp_status': 'rsvpd',
        'payment_status': rsvp.payment_status
    })

# Comment Routes
@app.route('/api/events/<int:event_id>/comments', methods=['GET'])
def get_comments(event_id):
    comments = Comment.query.filter_by(event_id=event_id).order_by(Comment.timestamp.desc()).all()
    
    comments_data = []
    for comment in comments:
        user = User.query.get(comment.user_id)
        comments_data.append({
            'id': comment.id,
            'content': comment.content,
            'timestamp': comment.timestamp.isoformat(),
            'user_name': user.name if user else 'Unknown',
            'user_id': comment.user_id
        })
    
    return jsonify(comments_data)

@app.route('/api/events/<int:event_id>/comments', methods=['POST'])
@jwt_required()
def create_comment(event_id):
    user_id = get_jwt_identity()
    data = request.get_json()
    
    if not data or not data.get('content'):
        return jsonify({'error': 'Comment content is required'}), 400
    
    comment = Comment(
        user_id=user_id,
        event_id=event_id,
        content=data['content']
    )
    
    db.session.add(comment)
    db.session.commit()
    
    user = User.query.get(user_id)
    
    return jsonify({
        'message': 'Comment added successfully',
        'comment': {
            'id': comment.id,
            'content': comment.content,
            'timestamp': comment.timestamp.isoformat(),
            'user_name': user.name if user else 'Unknown',
            'user_id': comment.user_id
        }
    }), 201

@app.route('/api/comments/<int:comment_id>', methods=['DELETE'])
@jwt_required()
def delete_comment(comment_id):
    user_id = get_jwt_identity()
    comment = Comment.query.get_or_404(comment_id)
    
    if comment.user_id != user_id:
        return jsonify({'error': 'Only the comment author can delete this comment'}), 403
    
    db.session.delete(comment)
    db.session.commit()
    
    return jsonify({'message': 'Comment deleted successfully'})

# Organizer Routes
@app.route('/api/organizer/events', methods=['GET'])
@jwt_required()
def get_organizer_events():
    user_id = get_jwt_identity()
    user = User.query.get(user_id)
    
    if user.role != 'organizer':
        return jsonify({'error': 'Only organizers can access this endpoint'}), 403
    
    events = Event.query.filter_by(organizer_id=user_id).order_by(Event.date.asc()).all()
    
    events_data = []
    for event in events:
        events_data.append({
            'id': event.id,
            'title': event.title,
            'description': event.description,
            'date': event.date.isoformat(),
            'location': event.location,
            'price': event.price,
            'banner': event.banner,
            'rsvp_count': len(event.rsvps)
        })
    
    return jsonify(events_data)

@app.route('/api/organizer/events/<int:event_id>/rsvps', methods=['GET'])
@jwt_required()
def get_event_rsvps(event_id):
    user_id = get_jwt_identity()
    event = Event.query.get_or_404(event_id)
    
    if event.organizer_id != user_id:
        return jsonify({'error': 'Only the organizer can view RSVPs for this event'}), 403
    
    rsvps = RSVP.query.filter_by(event_id=event_id).all()
    
    rsvps_data = []
    for rsvp in rsvps:
        user = User.query.get(rsvp.user_id)
        rsvps_data.append({
            'id': rsvp.id,
            'user_name': user.name if user else 'Unknown',
            'user_email': user.email if user else 'Unknown',
            'payment_status': rsvp.payment_status,
            'created_at': rsvp.created_at.isoformat()
        })
    
    return jsonify(rsvps_data)

if __name__ == '__main__':
    with app.app_context():
        db.create_all()
    app.run(debug=True, host='0.0.0.0', port=5000)