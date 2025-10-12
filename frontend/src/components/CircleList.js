import React, { useState } from 'react';
import axios from 'axios';
import { useAuth } from '../hooks/useAuth';
import toast from 'react-hot-toast';
import { Hash, Users, Plus, Check } from 'lucide-react';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const CircleList = ({ circles, compact = false }) => {
  const { user } = useAuth();
  const [joiningCircle, setJoiningCircle] = useState(null);
  const [joinedCircles, setJoinedCircles] = useState(new Set());

  const handleJoinToggle = async (circle) => {
    if (joiningCircle === circle.id) return;

    setJoiningCircle(circle.id);
    try {
      const token = localStorage.getItem('token');
      const isJoined = joinedCircles.has(circle.id);

      if (isJoined) {
        await axios.delete(`${API}/social/circles/${circle.id}/leave`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setJoinedCircles(prev => {
          const next = new Set(prev);
          next.delete(circle.id);
          return next;
        });
        toast.success(`Left ${circle.name}`);
      } else {
        await axios.post(`${API}/social/circles/${circle.id}/join`, {}, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setJoinedCircles(prev => new Set(prev).add(circle.id));
        toast.success(`Joined ${circle.name}!`);
      }
    } catch (error) {
      console.error('Error toggling circle membership:', error);
      toast.error('Failed to update circle membership');
    } finally {
      setJoiningCircle(null);
    }
  };

  if (compact) {
    return (
      <div className="circles-compact">
        {circles.slice(0, 5).map(circle => (
          <div key={circle.id} className="circle-compact-item">
            <Hash size={16} />
            <span className="circle-name">{circle.name}</span>
            <span className="circle-members">{circle.member_count}</span>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="circles-grid">
      {circles.map(circle => (
        <div key={circle.id} className="circle-card">
          <div className="circle-header">
            <div className="circle-icon">
              <Hash size={24} />
            </div>
            <h3 className="circle-title">{circle.name}</h3>
          </div>
          <p className="circle-description">{circle.description}</p>
          <div className="circle-footer">
            <div className="circle-stats">
              <Users size={16} />
              <span>{circle.member_count} members</span>
            </div>
            <button
              className={`circle-join-btn ${joinedCircles.has(circle.id) ? 'joined' : ''}`}
              onClick={() => handleJoinToggle(circle)}
              disabled={joiningCircle === circle.id}
            >
              {joiningCircle === circle.id ? (
                <div className="spinner-small"></div>
              ) : joinedCircles.has(circle.id) ? (
                <>
                  <Check size={16} />
                  Joined
                </>
              ) : (
                <>
                  <Plus size={16} />
                  Join
                </>
              )}
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default CircleList;
