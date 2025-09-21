import React, { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { GraduationCap, Search, Mail, ExternalLink } from 'lucide-react';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

// Hardcoded professor data
const PROFESSORS_DATA = [
  {
    id: '1',
    user_name: 'Dr. Sarah Chen',
    user_university: 'University of Toronto',
    department: 'Biochemistry',
    research_areas: ['Cancer Biology', 'Molecular Genetics', 'Drug Discovery'],
    lab_description: 'Our lab focuses on understanding the molecular mechanisms of cancer progression and developing novel therapeutic targets. We use cutting-edge techniques including CRISPR gene editing, proteomics, and high-throughput screening.',
    contact_email: 's.chen@utoronto.ca',
    website: 'https://chenlab.utoronto.ca',
    accepting_students: true
  },
  {
    id: '2',
    user_name: 'Dr. Michael Rodriguez',
    user_university: 'McGill University',
    department: 'Neuroscience',
    research_areas: ['Alzheimer\'s Disease', 'Neurodegeneration', 'Synaptic Plasticity'],
    lab_description: 'We investigate the cellular and molecular mechanisms underlying neurodegenerative diseases, with a particular focus on Alzheimer\'s disease. Our research combines behavioral studies, electrophysiology, and advanced imaging techniques.',
    contact_email: 'm.rodriguez@mcgill.ca',
    website: 'https://rodriguez-neurolab.mcgill.ca',
    accepting_students: true
  },
  {
    id: '3',
    user_name: 'Dr. Jennifer Park',
    user_university: 'University of British Columbia',
    department: 'Immunology',
    research_areas: ['Autoimmune Diseases', 'T Cell Biology', 'Vaccine Development'],
    lab_description: 'Our research focuses on understanding immune system dysfunction in autoimmune diseases and developing new immunotherapeutic approaches. We work with both mouse models and human patient samples.',
    contact_email: 'j.park@ubc.ca',
    website: 'https://parkimmunolab.ubc.ca',
    accepting_students: false
  },
  {
    id: '4',
    user_name: 'Dr. Robert Thompson',
    user_university: 'McMaster University',
    department: 'Cardiovascular Research',
    research_areas: ['Heart Disease', 'Cardiac Regeneration', 'Stem Cell Therapy'],
    lab_description: 'We study cardiac regeneration and repair mechanisms following heart injury. Our lab uses stem cell technologies, tissue engineering, and molecular biology approaches to develop new treatments for heart disease.',
    contact_email: 'r.thompson@mcmaster.ca',
    website: 'https://thompsonlab.mcmaster.ca',
    accepting_students: true
  },
  {
    id: '5',
    user_name: 'Dr. Amanda Liu',
    user_university: 'University of Western Ontario',
    department: 'Infectious Diseases',
    research_areas: ['Virology', 'Antimicrobial Resistance', 'Global Health'],
    lab_description: 'Our lab studies emerging infectious diseases and antimicrobial resistance. We focus on understanding pathogen-host interactions and developing new diagnostic tools and therapeutic strategies.',
    contact_email: 'a.liu@uwo.ca',
    website: 'https://liulab.uwo.ca',
    accepting_students: true
  },
  {
    id: '6',
    user_name: 'Dr. David Wilson',
    user_university: 'Queen\'s University',
    department: 'Oncology',
    research_areas: ['Breast Cancer', 'Precision Medicine', 'Biomarker Discovery'],
    lab_description: 'We focus on identifying and validating biomarkers for breast cancer prognosis and treatment response. Our research aims to advance precision medicine approaches in oncology.',
    contact_email: 'd.wilson@queensu.ca',
    website: 'https://wilsononcology.queensu.ca',
    accepting_students: true
  },
  {
    id: '7',
    user_name: 'Dr. Lisa Brown',
    user_university: 'University of Ottawa',
    department: 'Regenerative Medicine',
    research_areas: ['Tissue Engineering', 'Biomaterials', 'Wound Healing'],
    lab_description: 'Our laboratory develops innovative biomaterials and tissue engineering approaches for wound healing and tissue regeneration. We combine materials science with cell biology to create next-generation therapies.',
    contact_email: 'l.brown@uottawa.ca',
    website: 'https://brownregenlab.uottawa.ca',
    accepting_students: false
  },
  {
    id: '8',
    user_name: 'Dr. James Kim',
    user_university: 'University of Alberta',
    department: 'Pharmacology',
    research_areas: ['Drug Metabolism', 'Toxicology', 'Personalized Medicine'],
    lab_description: 'We study drug metabolism and toxicology with a focus on genetic factors that influence drug response. Our goal is to advance personalized medicine by understanding individual variations in drug efficacy and safety.',
    contact_email: 'j.kim@ualberta.ca',
    website: 'https://kimpharmlab.ualberta.ca',
    accepting_students: true
  }
];

const ProfessorNetworkPage = () => {
  const [professors, setProfessors] = useState(PROFESSORS_DATA);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAvailableOnly, setShowAvailableOnly] = useState(true);

  useEffect(() => {
    filterProfessors();
  }, [searchTerm, showAvailableOnly]);

  const filterProfessors = () => {
    let filtered = PROFESSORS_DATA;
    
    // Filter by search term (research areas, name, university, department)
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(prof => 
        prof.user_name.toLowerCase().includes(term) ||
        prof.user_university.toLowerCase().includes(term) ||
        prof.department.toLowerCase().includes(term) ||
        prof.research_areas.some(area => area.toLowerCase().includes(term))
      );
    }
    
    // Filter by accepting students
    if (showAvailableOnly) {
      filtered = filtered.filter(prof => prof.accepting_students);
    }
    
    setProfessors(filtered);
  };

  const ProfessorCard = ({ professor }) => (
    <div className="professor-card">
      <div className="professor-header">
        <div>
          <h3 className="professor-name">{professor.user_name}</h3>
          <div className="professor-meta">
            <span className="professor-university">{professor.user_university}</span>
            <span className="professor-department">{professor.department}</span>
          </div>
        </div>
        {professor.accepting_students && (
          <span className="accepting-badge">Accepting Students</span>
        )}
      </div>
      
      <div className="professor-research">
        <h4>Research Areas</h4>
        <div className="research-tags">
          {professor.research_areas.map((area, index) => (
            <span key={index} className="research-tag">{area}</span>
          ))}
        </div>
      </div>
      
      <p className="lab-description">{professor.lab_description}</p>
      
      <div className="professor-contact">
        <a href={`mailto:${professor.contact_email}`} className="contact-link">
          <Mail size={16} />
          Contact
        </a>
        {professor.website && (
          <a href={professor.website} target="_blank" rel="noopener noreferrer" className="website-link">
            <ExternalLink size={16} />
            Website
          </a>
        )}
      </div>
    </div>
  );

  return (
    <div className="page">
      <div className="page-header">
        <div className="page-icon">
          <GraduationCap size={32} />
        </div>
        <div>
          <h1 className="page-title">Professor Network</h1>
          <p className="page-description">
            Connect with faculty members for research opportunities, mentorship, and career guidance.
          </p>
        </div>
      </div>

      <div className="page-content">
        <div className="professor-controls">
          <div className="search-box">
            <Search size={20} />
            <input
              type="text"
              placeholder="Search by research area..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
          </div>
          
          <label className="checkbox-label">
            <input
              type="checkbox"
              checked={showAvailableOnly}
              onChange={(e) => setShowAvailableOnly(e.target.checked)}
            />
            Only show professors accepting students
          </label>
        </div>

        {loading ? (
          <div className="loading">Loading professors...</div>
        ) : (
          <>
            <div className="professors-grid">
              {professors.map((professor) => (
                <ProfessorCard key={professor.id} professor={professor} />
              ))}
            </div>

            {professors.length === 0 && (
              <div className="empty-state">
                <GraduationCap size={48} />
                <h3>No professors found</h3>
                <p>Check back later for new research opportunities!</p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default ProfessorNetworkPage;