import React, { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { Users, Search } from 'lucide-react';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const StudentNetworkPage = () => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchStudents();
  }, [searchTerm]);

  const fetchStudents = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (searchTerm) params.append('research_interest', searchTerm);
      
      const response = await axios.get(`${API}/student-network?${params}`);
      setStudents(response.data);
    } catch (error) {
      toast.error('Error fetching student network');
    } finally {
      setLoading(false);
    }
  };

  const StudentCard = ({ student }) => (
    <div className="student-card">
      <div className="student-header">
        <h3 className="student-name">{student.user_name}</h3>
        <div className="student-meta">
          <span className="student-university">{student.user_university}</span>
          <span className="student-program">{student.user_program}</span>
        </div>
      </div>
      
      <div className="student-interests">
        <h4>Research Interests</h4>
        <div className="interest-tags">
          {student.research_interests.map((interest, index) => (
            <span key={index} className="interest-tag">{interest}</span>
          ))}
        </div>
      </div>
      
      <div className="student-skills">
        <h4>Skills</h4>
        <div className="skill-tags">
          {student.skills.map((skill, index) => (
            <span key={index} className="skill-tag">{skill}</span>
          ))}
        </div>
      </div>
      
      <div className="student-looking-for">
        <strong>Looking for:</strong> {student.looking_for.join(', ')}
      </div>
    </div>
  );

  return (
    <div className="page">
      <div className="page-header">
        <div className="page-icon">
          <Users size={32} />
        </div>
        <div>
          <h1 className="page-title">Student Network</h1>
          <p className="page-description">
            Connect with like-minded undergraduate students passionate about research and medical careers.
          </p>
        </div>
      </div>

      <div className="page-content">
        <div className="network-search">
          <div className="search-box">
            <Search size={20} />
            <input
              type="text"
              placeholder="Search by research interest..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
          </div>
        </div>

        {loading ? (
          <div className="loading">Loading students...</div>
        ) : (
          <>
            <div className="students-grid">
              {students.map((student) => (
                <StudentCard key={student.id} student={student} />
              ))}
            </div>

            {students.length === 0 && (
              <div className="empty-state">
                <Users size={48} />
                <h3>No students found</h3>
                <p>Join the network to connect with other students!</p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default StudentNetworkPage;