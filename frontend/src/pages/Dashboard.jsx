import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import CertificatePreview, { THEMES, BORDER_STYLES } from '../components/CertificatePreview';
import { useModal } from '../context/ModalContext';
import DownloadFormatDropdown from '../components/DownloadFormatDropdown';
import { 
  Award, 
  SlidersHorizontal, 
  Users, 
  Upload, 
  FileText, 
  Palette, 
  CheckCircle2, 
  AlertCircle, 
  Loader2, 
  Download, 
  History, 
  Plus, 
  Trash2, 
  RefreshCw, 
  Calendar, 
  Building,
  GraduationCap,
  Briefcase,
  Trophy,
  Send,
  CheckCheck,
  X,
  Eye,
  ArrowRight,
  Image,
  Layers,
  Search
} from 'lucide-react';

const PRESET_LOGOS = [
  {
    id: 'academic',
    name: 'University Crest',
    url: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Cpath d='M50 15 L82 30 L50 45 L18 30 Z' fill='%23D4AF37' stroke='%2392400E' stroke-width='2'/%3E%3Cpath d='M30 40 V65 C30 75 50 85 50 85 C50 85 70 75 70 65 V40' fill='none' stroke='%23D4AF37' stroke-width='3'/%3E%3Ccircle cx='50' cy='60' r='10' fill='%231E3A8A'/%3E%3Cpolygon points='50,54 52,58 56,58 53,61 54,65 50,62 46,65 47,61 44,58 48,58' fill='%23D4AF37'/%3E%3C/svg%3E"
  },
  {
    id: 'tech',
    name: 'Tech Shield',
    url: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Cpath d='M50 12 L82 24 V52 C82 72 50 88 50 88 C50 88 18 72 18 52 V24 Z' fill='%230F172A' stroke='%233B82F6' stroke-width='3'/%3E%3Cpolygon points='50,30 55,42 68,42 57,50 61,62 50,54 39,62 43,50 32,42 45,42' fill='%233B82F6'/%3E%3Ccircle cx='50' cy='68' r='4' fill='%2360A5FA'/%3E%3C/svg%3E"
  },
  {
    id: 'global',
    name: 'Global Laurel',
    url: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Ccircle cx='50' cy='50' r='38' fill='%23064E3B' stroke='%2310B981' stroke-width='2.5'/%3E%3Ccircle cx='50' cy='50' r='32' fill='none' stroke='%23D1FAE5' stroke-width='1' stroke-dasharray='3 2'/%3E%3Cpolygon points='50,26 56,40 70,40 58,49 63,63 50,54 37,63 42,49 30,40 44,40' fill='%2310B981'/%3E%3C/svg%3E"
  },
  {
    id: 'merit',
    name: 'Excellence Crown',
    url: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Ccircle cx='50' cy='50' r='38' fill='%23881337' stroke='%23E11D48' stroke-width='2'/%3E%3Cpath d='M28 64 L28 44 L38 52 L50 36 L62 52 L72 44 L72 64 Z' fill='%23FBBF24' stroke='%23B45309' stroke-width='1.5'/%3E%3Ccircle cx='50' cy='34' r='3' fill='%23FBBF24'/%3E%3Ccircle cx='28' cy='42' r='3' fill='%23FBBF24'/%3E%3Ccircle cx='72' cy='42' r='3' fill='%23FBBF24'/%3E%3C/svg%3E"
  }
];

// Preset configurations with clean disciplined data and respective icons (No emojis)
const TEMPLATE_PRESETS = [
  {
    id: 'bootcamp',
    label: 'Bootcamp Completion',
    icon: GraduationCap,
    theme: 'royal_gold',
    border_style: 'classic_prestige',
    logo_url: PRESET_LOGOS[0].url,
    event_name: 'Full-Stack Web Development Bootcamp 2026',
    organization_name: 'CodeCrafters Engineering Institute',
    certificate_title: 'Certificate of Completion',
    description: 'For successfully demonstrating mastery in distributed architectures, React 19, and scalable Python cloud backends through 200+ hours of rigorous project building.',
    signatory_name: 'Dr. Arthur Pendelton',
    signatory_title: 'Dean of Computer Engineering',
    recipients: [
      { full_name: 'Alex Rivera', email: 'alex.rivera@example.com' },
      { full_name: 'Devon Vance', email: 'devon.vance@example.com' },
      { full_name: 'Maya Lin', email: 'maya.lin@example.com' },
      { full_name: 'Carlos Mendoza', email: 'carlos.m@example.com' },
      { full_name: 'Elena Rostova', email: 'elena.r@example.com' }
    ]
  },
  {
    id: 'hackathon',
    label: 'AI Hackathon Champion',
    icon: Trophy,
    theme: 'sapphire_elite',
    border_style: 'executive_frame',
    logo_url: PRESET_LOGOS[1].url,
    event_name: 'Global Generative AI Hackathon 2026',
    organization_name: 'Open Intelligence Foundation',
    certificate_title: 'Certificate of Excellence',
    description: 'In recognition of outstanding technical innovation, architectural execution, and securing top honors in the Multi-Agent Systems Grand Challenge.',
    signatory_name: 'Dr. Sarah Connor',
    signatory_title: 'Head of Global AI Research',
    recipients: [
      { full_name: 'Liam Zhang', email: 'liam.zhang@ai-labs.org' },
      { full_name: 'Chloe Bennett', email: 'chloe.b@build.dev' },
      { full_name: 'Rajesh Patel', email: 'rajesh.p@techhub.io' },
      { full_name: 'Amara Okafor', email: 'amara.okafor@innovate.co' }
    ]
  },
  {
    id: 'corporate',
    label: 'Executive Leadership',
    icon: Briefcase,
    theme: 'emerald_prestige',
    border_style: 'royal_flourish',
    logo_url: PRESET_LOGOS[2].url,
    event_name: 'Executive Strategic Leadership Summit',
    organization_name: 'Global Management Institute',
    certificate_title: 'Certificate of Achievement',
    description: 'Awarded for exceptional leadership development, cross-functional strategic decision-making, and organizational transformation mastery.',
    signatory_name: 'Victoria Sterling',
    signatory_title: 'Managing Director & CEO',
    recipients: [
      { full_name: 'Marcus Sterling', email: 'm.sterling@enterprise.com' },
      { full_name: 'Sophia Montgomery', email: 's.montgomery@enterprise.com' },
      { full_name: 'Julian Henderson', email: 'j.henderson@enterprise.com' }
    ]
  },
  {
    id: 'merit',
    label: 'Academic Distinction',
    icon: Award,
    theme: 'crimson_honor',
    border_style: 'architectural_gold',
    logo_url: PRESET_LOGOS[3].url,
    event_name: 'Annual Academic Honors & Dean’s List',
    organization_name: 'Apex Academy of Science & Arts',
    certificate_title: 'Certificate of Distinction',
    description: 'Conferred with highest commendation for maintaining an exemplary GPA and contributing distinguished scholarly research.',
    signatory_name: 'Prof. Alistair Finch',
    signatory_title: 'Provost & Academic Vice Chancellor',
    recipients: [
      { full_name: 'Grace Hopper-Smith', email: 'grace.h@academy.edu' },
      { full_name: 'Daniel Kim', email: 'daniel.k@academy.edu' },
      { full_name: 'Aisha Al-Mansoor', email: 'aisha.m@academy.edu' }
    ]
  }
];

const TITLE_TO_INTENT_MAP = {
  'Certificate of Completion': 'for outstanding dedication, active participation, and successfully mastering',
  'Certificate of Achievement': 'for demonstrating exceptional skill, dedication, and excellence in',
  'Certificate of Excellence': 'in honor of outstanding performance, innovation, and leadership in',
  'Certificate of Appreciation': 'in grateful recognition of valuable contributions and dedicated service to',
  'Certificate of Recognition': 'in formal recognition of outstanding commitment and exemplary contributions to',
  'Certificate of Participation': 'for active attendance and valuable participation in all sessions of',
  'Certificate of Distinction': 'in recognition of extraordinary academic scholarship, exemplary character, and distinguished merit in'
};

const STANDARD_TITLE_OPTIONS = [
  'Certificate of Completion',
  'Certificate of Achievement',
  'Certificate of Excellence',
  'Certificate of Appreciation',
  'Certificate of Recognition',
  'Certificate of Participation',
  'Certificate of Distinction'
];

const DESCRIPTION_SUGGESTIONS = [
  'For successfully mastering the curriculum and demonstrating exceptional technical dedication.',
  'For outstanding commitment, creative problem-solving, and exemplary contributions.',
  'In recognition of active participation, collaboration, and successful program graduation.',
  'For demonstrated excellence in hands-on practical coursework and final project delivery.'
];

// High-Performance Virtual Recipient List (Seamlessly renders 1 lakh / 100,000+ records)
const VirtualRecipientList = ({
  recipients = [],
  currentIndex = 0,
  onSelectRecipient,
  onRemoveRecipient
}) => {
  const containerRef = useRef(null);
  const [scrollTop, setScrollTop] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [jumpInput, setJumpInput] = useState('');

  const ROW_HEIGHT = 44; // px
  const VIEWPORT_HEIGHT = 300; // px
  const MAX_DOM_HEIGHT = 15000000;

  // Filter items if search query is provided
  const filteredItems = useMemo(() => {
    if (!searchQuery.trim()) return recipients;
    const q = searchQuery.toLowerCase().trim();
    return recipients.filter(r => 
      r.full_name.toLowerCase().includes(q) || 
      (r.email && r.email.toLowerCase().includes(q))
    );
  }, [recipients, searchQuery]);

  const rawTotalHeight = filteredItems.length * ROW_HEIGHT;
  const scale = rawTotalHeight > MAX_DOM_HEIGHT ? MAX_DOM_HEIGHT / rawTotalHeight : 1;
  const scrollSpacerHeight = rawTotalHeight * scale;

  // Virtual window calculation
  const virtualScrollTop = scrollTop / scale;
  const startIndex = Math.max(0, Math.floor(virtualScrollTop / ROW_HEIGHT) - 6);
  const visibleCount = Math.ceil(VIEWPORT_HEIGHT / ROW_HEIGHT) + 14;
  const endIndex = Math.min(filteredItems.length, startIndex + visibleCount);
  const visibleItems = filteredItems.slice(startIndex, endIndex);
  const offsetY = (startIndex * ROW_HEIGHT) * scale;

  const handleScroll = (e) => {
    setScrollTop(e.currentTarget.scrollTop);
  };

  const handleJumpTo = (targetIdx) => {
    if (!containerRef.current || filteredItems.length === 0) return;
    const clamped = Math.max(0, Math.min(filteredItems.length - 1, targetIdx));
    const targetScroll = clamped * ROW_HEIGHT * scale;
    containerRef.current.scrollTop = targetScroll;
    setScrollTop(targetScroll);
  };

  const onJumpSubmit = (e) => {
    e.preventDefault();
    const num = parseInt(jumpInput, 10);
    if (!isNaN(num) && num >= 1) {
      handleJumpTo(num - 1);
    }
  };

  return (
    <div className="space-y-2">
      {/* List Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-slate-800">
            Validated Recipients
          </span>
          <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 font-semibold">
            {recipients.length.toLocaleString()} total
          </span>
        </div>

        {/* Search & Jump Controls */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <div className="relative">
            <Search size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search name or email..."
              className="pl-7 pr-2.5 py-1 text-[11px] rounded-md border border-slate-300 bg-white text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500 w-36 sm:w-44 placeholder:text-slate-400"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-1.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5 cursor-pointer"
              >
                <X size={11} />
              </button>
            )}
          </div>

          {filteredItems.length > 50 && (
            <form onSubmit={onJumpSubmit} className="flex items-center gap-1">
              <input
                type="number"
                min="1"
                max={filteredItems.length}
                value={jumpInput}
                onChange={(e) => setJumpInput(e.target.value)}
                placeholder={`#`}
                className="w-14 px-1.5 py-1 text-[11px] rounded-md border border-slate-300 bg-white text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500 text-center"
              />
              <button
                type="submit"
                className="px-2 py-1 text-[11px] rounded-md bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300 font-medium cursor-pointer"
              >
                Go
              </button>
            </form>
          )}

          {filteredItems.length > 100 && (
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => handleJumpTo(0)}
                className="px-1.5 py-1 text-[10px] rounded bg-slate-100 hover:bg-slate-200 text-slate-600 border border-slate-200 cursor-pointer"
                title="Jump to first record"
              >
                Top
              </button>
              <button
                type="button"
                onClick={() => handleJumpTo(Math.floor(filteredItems.length / 2))}
                className="px-1.5 py-1 text-[10px] rounded bg-slate-100 hover:bg-slate-200 text-slate-600 border border-slate-200 cursor-pointer"
                title="Jump to middle record"
              >
                Mid
              </button>
              <button
                type="button"
                onClick={() => handleJumpTo(filteredItems.length - 1)}
                className="px-1.5 py-1 text-[10px] rounded bg-slate-100 hover:bg-slate-200 text-slate-600 border border-slate-200 cursor-pointer"
                title="Jump to last record"
              >
                End
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Virtual Scroll Viewport - Displays ALL records seamlessly */}
      <div
        ref={containerRef}
        onScroll={handleScroll}
        style={{ height: `${VIEWPORT_HEIGHT}px` }}
        className="overflow-y-auto rounded-lg border border-slate-200 bg-white custom-scrollbar relative"
      >
        {recipients.length === 0 ? (
          <div className="h-full flex items-center justify-center p-6 text-center text-xs text-slate-400">
            No recipients added yet. Enter names or upload a CSV file above.
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center p-6 text-center text-xs text-slate-500 gap-1.5">
            <span>No recipients found matching "{searchQuery}"</span>
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="text-blue-600 hover:underline cursor-pointer"
            >
              Clear search filter
            </button>
          </div>
        ) : (
          <div style={{ height: `${scrollSpacerHeight}px`, position: 'relative', width: '100%' }}>
            <div
              style={{
                transform: `translateY(${offsetY}px)`,
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
              }}
            >
              {visibleItems.map((rec) => {
                const isSelected = currentIndex === rec.id;
                return (
                  <div
                    key={rec.id}
                    style={{ height: `${ROW_HEIGHT}px` }}
                    className={`flex items-center justify-between px-3 text-xs transition-colors border-b border-slate-100 ${
                      isSelected ? 'bg-blue-50 text-blue-900 font-medium' : 'text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <div
                      className="flex items-center gap-2.5 flex-1 min-w-0 cursor-pointer"
                      onClick={() => onSelectRecipient(rec.id)}
                    >
                      <span className="shrink-0 text-[10px] font-mono text-slate-400 tabular-nums select-none min-w-[44px]">
                        #{rec.id + 1}
                      </span>
                      <span className="font-semibold text-slate-800 truncate">{rec.full_name}</span>
                      {rec.email && (
                        <span className="text-[10px] text-slate-500 truncate hidden sm:inline">&lt;{rec.email}&gt;</span>
                      )}
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        type="button"
                        onClick={() => onSelectRecipient(rec.id)}
                        className={`px-2 py-0.5 rounded text-[10px] font-medium transition-colors cursor-pointer flex items-center gap-1 ${
                          isSelected
                            ? 'bg-blue-600 text-white'
                            : 'bg-slate-100 hover:bg-blue-600 hover:text-white text-slate-700'
                        }`}
                        title={`Preview certificate for ${rec.full_name}`}
                      >
                        <Eye size={11} />
                        <span>{isSelected ? 'Viewing' : 'View'}</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => onRemoveRecipient(rec.id)}
                        className="p-1 text-slate-400 hover:text-red-600 transition-colors cursor-pointer"
                        title={`Remove ${rec.full_name}`}
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Real-time Position & Status Bar */}
      {filteredItems.length > 0 && (
        <div className="flex items-center justify-between text-[11px] text-slate-500 px-1 pt-0.5">
          <span>
            Viewing <strong>#{startIndex + 1}</strong> to <strong>#{Math.min(filteredItems.length, endIndex)}</strong> of{' '}
            <strong>{filteredItems.length.toLocaleString()}</strong> records
          </span>
          <span className="text-slate-400">
            Scroll smoothly to view all records in real time
          </span>
        </div>
      )}
    </div>
  );
};

const Dashboard = () => {
  const navigate = useNavigate();
  const { showConfirm, showAlert } = useModal();
  const [activeTab, setActiveTab] = useState('content'); // 'content' | 'design' | 'recipients'
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [currentRecipientIndex, setCurrentRecipientIndex] = useState(0);
  const [selectedTheme, setSelectedTheme] = useState('royal_gold');
  const [recentJobs, setRecentJobs] = useState([]);
  const [showRecentModal, setShowRecentModal] = useState(false);
  const [isCustomTitle, setIsCustomTitle] = useState(false);
  const [isUploadingCSV, setIsUploadingCSV] = useState(false);
  
  // Form State
  const [formData, setFormData] = useState({
    certificate_title: 'Certificate of Completion',
    event_name: 'Full-Stack Web Development Bootcamp 2026',
    organization_name: 'CodeCrafters Engineering Institute',
    issue_date: new Date().toISOString().split('T')[0],
    presentation_text: 'for outstanding dedication, active participation, and successfully mastering',
    description: 'For successfully demonstrating mastery in distributed architectures, React 19, and scalable Python cloud backends through 200+ hours of rigorous project building.',
    signatory_name: 'Dr. Arthur Pendelton',
    signatory_title: 'Dean of Computer Engineering',
    border_style: 'classic_prestige',
    logo_url: '',
    recipients_text: 'Alex Rivera, alex.rivera@example.com\nDevon Vance, devon.vance@example.com\nMaya Lin, maya.lin@example.com\nCarlos Mendoza, carlos.m@example.com\nElena Rostova, elena.r@example.com'
  });

  const handleLogoUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        showAlert({
          title: "File Size Limit Exceeded",
          message: "Logo file size must be less than 5MB. Please upload an image under 5MB.",
          type: "warning"
        });
        return;
      }
      const reader = new FileReader();
      reader.onload = () => {
        setFormData(prev => ({
          ...prev,
          logo_url: reader.result
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveLogo = async () => {
    const confirmed = await showConfirm({
      title: 'Remove Organization Logo?',
      message: 'Are you sure you want to remove the current organization logo from this certificate template?',
      confirmText: 'Remove Logo',
      cancelText: 'Keep Logo',
      type: 'warning'
    });
    if (!confirmed) return;

    setFormData(prev => ({
      ...prev,
      logo_url: ''
    }));
  };

  const handleClearAllRecipients = async () => {
    if (!formData.recipients_text.trim()) return;

    const count = parsedRecipients.length;
    const confirmed = await showConfirm({
      title: 'Clear All Recipients?',
      message: `Are you sure you want to delete and clear all ${count} recipients from the list? All entered names and details will be removed.`,
      confirmText: 'Clear All',
      cancelText: 'Cancel',
      type: 'danger'
    });
    if (!confirmed) return;

    setFormData(prev => ({
      ...prev,
      recipients_text: ''
    }));
    setCurrentRecipientIndex(0);
  };

  // Fetch recent batches on mount
  useEffect(() => {
    fetchRecentJobs();
  }, []);

  const fetchRecentJobs = async () => {
    try {
      const jobs = await api.listJobs(10);
      setRecentJobs(jobs || []);
    } catch (err) {
      console.warn("Could not load recent jobs:", err);
    }
  };

  const handleDeleteBatch = async (jobId, eventName) => {
    const confirmed = await showConfirm({
      title: 'Delete Batch Job?',
      message: `Are you sure you want to delete the batch "${eventName}" (ID: ${jobId.substring(0, 8)})?\n\nThis will permanently delete all associated recipient certificates and generated files from storage.`,
      confirmText: 'Delete Batch',
      cancelText: 'Cancel',
      type: 'danger'
    });
    if (!confirmed) return;

    try {
      await api.deleteJob(jobId);
      setRecentJobs(prev => prev.filter(j => j.id !== jobId));
      showAlert({
        title: "Batch Deleted",
        message: `Batch "${eventName}" has been permanently removed.`,
        type: "success"
      });
    } catch (err) {
      showAlert({
        title: "Failed to Delete Batch",
        message: err.response?.data?.detail || err.message,
        type: "error"
      });
    }
  };

  // Parse text into structured recipient array
  const parsedRecipients = useMemo(() => {
    const lines = formData.recipients_text.split('\n').filter(l => l.trim());
    return lines.map((line, idx) => {
      const parts = line.split(',');
      const fullName = parts[0]?.trim() || '';
      const email = parts[1]?.trim() || null;
      return {
        id: idx,
        full_name: fullName,
        email: email
      };
    }).filter(r => r.full_name);
  }, [formData.recipients_text]);

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  // Load a full Preset Template
  const applyPreset = (preset) => {
    setSelectedTheme(preset.theme);
    setIsCustomTitle(!STANDARD_TITLE_OPTIONS.includes(preset.certificate_title));
    setFormData({
      ...formData,
      certificate_title: preset.certificate_title,
      border_style: preset.border_style || 'classic_prestige',
      logo_url: preset.logo_url || PRESET_LOGOS[0].url,
      event_name: preset.event_name,
      organization_name: preset.organization_name,
      presentation_text: preset.presentation_text || TITLE_TO_INTENT_MAP[preset.certificate_title] || 'for outstanding dedication, active participation, and successfully mastering',
      description: preset.description,
      signatory_name: preset.signatory_name,
      signatory_title: preset.signatory_title,
      recipients_text: preset.recipients.map(r => r.email ? `${r.full_name}, ${r.email}` : r.full_name).join('\n')
    });
    setCurrentRecipientIndex(0);
  };

  // Add sample recipients
  const addSampleRecipients = (count = 5) => {
    const samples = [
      'David Miller, david.m@example.com',
      'Jessica Taylor, jessica.t@example.com',
      'Lucas Vance, lucas.v@example.com',
      'Hannah Abbott, hannah.a@example.com',
      'Zackariah Morris, zack.m@example.com',
      'Natalie Portman, natalie.p@example.com',
      'Liam Gallagher, liam.g@example.com',
      'Samantha Reed, sam.r@example.com'
    ];
    const toAdd = samples.slice(0, count).join('\n');
    setFormData(prev => ({
      ...prev,
      recipients_text: prev.recipients_text ? `${prev.recipients_text}\n${toAdd}` : toAdd
    }));
  };

  // Handle CSV file upload with active visual loader & feedback
  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingCSV(true);

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const content = event.target?.result;
        if (typeof content === 'string') {
          let lines = content.split(/\r?\n/).filter(l => l.trim());
          if (lines[0]?.toLowerCase().includes('name')) {
            lines = lines.slice(1);
          }
          const validLines = lines.filter(l => l.trim());
          setFormData(prev => ({
            ...prev,
            recipients_text: validLines.join('\n')
          }));
          showAlert({
            title: "CSV Uploaded Successfully",
            message: `Loaded ${validLines.length} recipient records from "${file.name}".`,
            type: "success"
          });
        }
      } catch (err) {
        showAlert({
          title: "Failed to Process CSV",
          message: err.message || "An error occurred while reading the file.",
          type: "error"
        });
      } finally {
        setIsUploadingCSV(false);
        e.target.value = '';
      }
    };
    reader.onerror = () => {
      showAlert({
        title: "File Read Error",
        message: "Failed to read the selected file. Please verify it is a valid CSV or TXT file.",
        type: "error"
      });
      setIsUploadingCSV(false);
      e.target.value = '';
    };
    reader.readAsText(file);
  };

  // Remove individual recipient
  const removeRecipient = async (indexToRemove) => {
    const target = parsedRecipients.find(r => r.id === indexToRemove) || parsedRecipients[indexToRemove];
    const name = target?.full_name || 'this recipient';

    const confirmed = await showConfirm({
      title: 'Remove Recipient?',
      message: `Are you sure you want to delete "${name}" from the recipient list?`,
      confirmText: 'Remove',
      cancelText: 'Cancel',
      type: 'danger'
    });
    if (!confirmed) return;

    const actualIdx = target?.id ?? indexToRemove;
    const lines = formData.recipients_text.split('\n').filter(l => l.trim());
    const updated = lines.filter((_, idx) => idx !== actualIdx).join('\n');
    setFormData(prev => ({
      ...prev,
      recipients_text: updated
    }));
    if (lines.length <= 1) {
      setCurrentRecipientIndex(0);
    } else if (currentRecipientIndex >= lines.length - 1) {
      setCurrentRecipientIndex(Math.max(0, lines.length - 2));
    }
  };

  // One-Click Bulk Generation Execution
  const handleGenerate = async (e) => {
    if (e) e.preventDefault();
    setError(null);

    try {
      if (!formData.certificate_title || !formData.certificate_title.trim()) {
        setActiveTab('content');
        throw new Error("Please enter or select a Certificate Title.");
      }
      if (!formData.organization_name || !formData.organization_name.trim()) {
        setActiveTab('content');
        throw new Error("Please enter an Issuing Organization name.");
      }
      if (!formData.event_name || !formData.event_name.trim()) {
        setActiveTab('content');
        throw new Error("Please enter the Event / Course Title.");
      }
      if (!formData.presentation_text || !formData.presentation_text.trim()) {
        setActiveTab('content');
        throw new Error("Please enter the Presentation Statement / Award Intent.");
      }
      if (!formData.issue_date || !formData.issue_date.trim()) {
        setActiveTab('content');
        throw new Error("Please select the Date of Issuance.");
      }
      if (!formData.description || !formData.description.trim()) {
        setActiveTab('content');
        throw new Error("Please enter a Citation / Achievement Note.");
      }
      if (!formData.signatory_name || !formData.signatory_name.trim()) {
        setActiveTab('content');
        throw new Error("Please enter the Signatory Full Name.");
      }
      if (!formData.signatory_title || !formData.signatory_title.trim()) {
        setActiveTab('content');
        throw new Error("Please enter the Signatory Designation / Title.");
      }
      if (parsedRecipients.length === 0) {
        setActiveTab('recipients');
        throw new Error("Please add at least one recipient to generate certificates.");
      }
      if (parsedRecipients.length > 1000000) {
        setActiveTab('recipients');
        throw new Error("Batch size exceeds maximum limit of 1,000,000 (10 lakhs) recipients.");
      }

      setLoading(true);

      const jobPayload = {
        certificate_title: formData.certificate_title.trim(),
        theme_key: selectedTheme || 'royal_gold',
        border_style: formData.border_style || 'classic_prestige',
        signatory_name: formData.signatory_name.trim(),
        signatory_title: formData.signatory_title.trim(),
        logo_url: formData.logo_url || null,
        event_name: formData.event_name.trim(),
        organization_name: formData.organization_name.trim(),
        issue_date: formData.issue_date.trim(),
        description: formData.description.trim(),
        presentation_text: formData.presentation_text.trim(),
        recipients: parsedRecipients
          .filter(r => r.full_name && r.full_name.trim())
          .map(r => ({
            full_name: r.full_name.trim(),
            email: r.email?.trim() || null
          }))
      };

      const job = await api.createJob(jobPayload);
      navigate(`/jobs/${job.id}`);
    } catch (err) {
      let errorMsg = 'An error occurred while initiating generation.';
      if (err.response?.data?.detail) {
        if (Array.isArray(err.response.data.detail)) {
          errorMsg = err.response.data.detail
            .map(d => `${d.loc ? d.loc.filter(l => l !== 'body').join('.') : 'field'}: ${d.msg}`)
            .join('; ');
        } else if (typeof err.response.data.detail === 'string') {
          errorMsg = err.response.data.detail;
        }
      } else if (err.message) {
        errorMsg = err.message;
      }
      showAlert({
        title: "Generation Failed",
        message: errorMsg,
        type: "error"
      });
      setError(errorMsg);
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Bar: Disciplined Presets Header - Clean Light UI */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <SlidersHorizontal size={18} className="text-blue-600" />
            <h2 className="text-sm font-bold tracking-wide uppercase text-slate-900">
              Instant Template Presets
            </h2>
            <span className="text-xs text-slate-500 hidden sm:inline">&mdash; Select a preset to load sample content & styling:</span>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {TEMPLATE_PRESETS.map((preset) => {
            const Icon = preset.icon;
            return (
              <button
                key={preset.id}
                type="button"
                onClick={() => applyPreset(preset)}
                className="group flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-50 hover:bg-slate-100 border border-slate-200 text-xs font-semibold text-slate-700 hover:text-slate-900 transition-colors shadow-none cursor-pointer"
              >
                <Icon size={14} className="text-blue-600" />
                <span>{preset.label}</span>
              </button>
            );
          })}

          {recentJobs.length > 0 && (
            <button
              type="button"
              onClick={() => setShowRecentModal(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-50 hover:bg-blue-100 border border-blue-200 text-xs font-semibold text-blue-700 hover:text-blue-900 transition-colors cursor-pointer ml-auto"
            >
              <History size={14} />
              <span>History ({recentJobs.length})</span>
            </button>
          )}
        </div>
      </div>

      {/* Main Two-Panel Studio Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* LEFT COLUMN: Input & Customization Control Center (Light Theme) */}
        <div className="lg:col-span-6 xl:col-span-5 flex flex-col bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
          {/* Customization Tabs Header */}
          <div className="flex items-center border-b border-slate-200 bg-slate-50 px-2 pt-2">
            <button
              type="button"
              onClick={() => setActiveTab('content')}
              className={`flex-1 py-2.5 px-3 text-xs font-bold rounded-t-lg transition-colors flex items-center justify-center gap-2 border-b-2 cursor-pointer ${
                activeTab === 'content'
                  ? 'border-blue-600 text-blue-700 bg-white'
                  : 'border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <FileText size={15} className={activeTab === 'content' ? 'text-blue-600' : 'text-slate-500'} />
              <span>1. Content</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('design')}
              className={`flex-1 py-2.5 px-3 text-xs font-bold rounded-t-lg transition-colors flex items-center justify-center gap-2 border-b-2 cursor-pointer ${
                activeTab === 'design'
                  ? 'border-blue-600 text-blue-700 bg-white'
                  : 'border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Palette size={15} className={activeTab === 'design' ? 'text-blue-600' : 'text-slate-500'} />
              <span>2. Theme</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('recipients')}
              className={`flex-1 py-2.5 px-3 text-xs font-bold rounded-t-lg transition-colors flex items-center justify-center gap-2 border-b-2 cursor-pointer ${
                activeTab === 'recipients'
                  ? 'border-blue-600 text-blue-700 bg-white'
                  : 'border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Users size={15} className={activeTab === 'recipients' ? 'text-blue-600' : 'text-slate-500'} />
              <span className="flex items-center gap-1.5">
                <span>3. Recipients</span>
                <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-blue-100 text-blue-800 font-mono">
                  {parsedRecipients.length}
                </span>
              </span>
            </button>
          </div>

          {/* Tab Contents Area */}
          <div className="p-5 sm:p-6 space-y-4 max-h-[calc(100vh-270px)] overflow-y-auto custom-scrollbar">
            {error && (
              <div className="p-3.5 bg-red-50 border border-red-200 text-red-800 rounded-lg text-xs flex items-start gap-2.5">
                <AlertCircle size={16} className="text-red-600 flex-shrink-0 mt-0.5" />
                <div className="leading-relaxed">{error}</div>
              </div>
            )}

            {/* TAB 1: CONTENT & DETAILS */}
            {activeTab === 'content' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between pb-1 text-[11px] text-slate-500 border-b border-slate-100">
                  <span>Certificate Details</span>
                  <span className="text-slate-400 font-medium"><span className="text-red-500 font-bold">*</span> All fields are mandatory</span>
                </div>

                {/* Certificate Title */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-700 flex items-center justify-between">
                    <span>Certificate Title <span className="text-red-500 font-bold">*</span></span>
                    <span className="text-[10px] text-slate-500 font-normal">Header text</span>
                  </label>
                  <select
                    required
                    value={
                      isCustomTitle || !STANDARD_TITLE_OPTIONS.includes(formData.certificate_title)
                        ? 'OTHER'
                        : formData.certificate_title
                    }
                    onChange={(e) => {
                      const val = e.target.value;
                      if (val === 'OTHER') {
                        setIsCustomTitle(true);
                        if (STANDARD_TITLE_OPTIONS.includes(formData.certificate_title)) {
                          setFormData(prev => ({ ...prev, certificate_title: '' }));
                        }
                      } else {
                        setIsCustomTitle(false);
                        const matchedIntent = TITLE_TO_INTENT_MAP[val];
                        setFormData(prev => ({ 
                          ...prev, 
                          certificate_title: val,
                          ...(matchedIntent ? { presentation_text: matchedIntent } : {})
                        }));
                      }
                    }}
                    className="w-full rounded-lg bg-white border border-slate-300 px-3 py-2 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors cursor-pointer"
                  >
                    {STANDARD_TITLE_OPTIONS.map((title) => (
                      <option key={title} value={title}>{title}</option>
                    ))}
                    <option value="OTHER">Other (Enter Custom Title)...</option>
                  </select>

                  {/* CUSTOM TITLE INPUT FIELD */}
                  {(isCustomTitle || !STANDARD_TITLE_OPTIONS.includes(formData.certificate_title)) && (
                    <div className="pt-1 space-y-1">
                      <div className="flex items-center justify-between text-[11px] text-blue-700 font-medium">
                        <span>Custom Certificate Title <span className="text-red-500 font-bold">*</span></span>
                        <span className="text-[10px] text-slate-400">Whatever you want</span>
                      </div>
                      <input
                        required
                        type="text"
                        name="certificate_title"
                        value={formData.certificate_title}
                        onChange={handleInputChange}
                        placeholder="e.g. Diploma of Honor, Award of Merit, Leadership Citation..."
                        autoFocus
                        className="w-full rounded-lg bg-white border border-blue-400 px-3 py-2 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                      />
                    </div>
                  )}
                </div>

                {/* Organization & Event in 2-Columns */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                      <Building size={13} className="text-slate-500" />
                      <span>Issuing Organization <span className="text-red-500 font-bold">*</span></span>
                    </label>
                    <input
                      required
                      name="organization_name"
                      value={formData.organization_name}
                      onChange={handleInputChange}
                      placeholder="e.g. Stanford AI Lab"
                      className="w-full rounded-lg bg-white border border-slate-300 px-3 py-2 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                      <GraduationCap size={13} className="text-slate-500" />
                      <span>Event / Course Name <span className="text-red-500 font-bold">*</span></span>
                    </label>
                    <input
                      required
                      name="event_name"
                      value={formData.event_name}
                      onChange={handleInputChange}
                      placeholder="e.g. Cloud Mastery Workshop"
                      className="w-full rounded-lg bg-white border border-slate-300 px-3 py-2 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    />
                  </div>
                </div>

                {/* Presentation Statement / Award Intent */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                      <Award size={13} className="text-slate-500" />
                      <span>Presentation Statement / Award Intent <span className="text-red-500 font-bold">*</span></span>
                    </label>
                    <span className="text-[10px] text-slate-400">Precedes course/event name</span>
                  </div>
                  <input
                    required
                    name="presentation_text"
                    value={formData.presentation_text}
                    onChange={handleInputChange}
                    placeholder="e.g. for outstanding dedication, active participation, and successfully mastering"
                    className="w-full rounded-lg bg-white border border-slate-300 px-3 py-2 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  />
                  {/* Quick-Pick Intent Presets */}
                  <div className="flex items-center gap-1.5 pt-1 overflow-x-auto text-[10px]">
                    <span className="text-slate-400 shrink-0">Presets:</span>
                    {[
                      { label: "Mastering", text: "for outstanding dedication, active participation, and successfully mastering" },
                      { label: "Completion", text: "for outstanding participation and successful completion of" },
                      { label: "Appreciation", text: "in grateful recognition of valuable contributions and dedicated service to" },
                      { label: "Excellence", text: "in recognition of exceptional performance, technical innovation, and excellence in" },
                      { label: "Attendance", text: "for active attendance and valuable participation in all sessions of" }
                    ].map((p, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setFormData(prev => ({ ...prev, presentation_text: p.text }))}
                        className="px-2 py-0.5 rounded bg-slate-100 hover:bg-slate-200 text-slate-600 hover:text-slate-900 transition-colors shrink-0 cursor-pointer border border-slate-200"
                        title={p.text}
                      >
                        {p.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Issue Date */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                      <Calendar size={13} className="text-slate-500" />
                      <span>Date of Issuance <span className="text-red-500 font-bold">*</span></span>
                    </label>
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, issue_date: new Date().toISOString().split('T')[0] })}
                      className="text-[10px] text-blue-600 hover:text-blue-800 font-medium cursor-pointer"
                    >
                      Set Today
                    </button>
                  </div>
                  <input
                    required
                    type="date"
                    name="issue_date"
                    value={formData.issue_date}
                    onChange={handleInputChange}
                    className="w-full rounded-lg bg-white border border-slate-300 px-3 py-2 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors cursor-pointer"
                  />
                </div>

                {/* Citation / Description */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-semibold text-slate-700">
                      Citation / Achievement Note <span className="text-red-500 font-bold">*</span>
                    </label>
                    <span className="text-[10px] text-slate-400">Max 250 characters</span>
                  </div>
                  <textarea
                    required
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    rows="3"
                    placeholder="Enter what the recipient accomplished..."
                    className="w-full rounded-lg bg-white border border-slate-300 px-3 py-2 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors resize-none"
                  />
                  {/* Quick suggestion pills */}
                  <div className="flex flex-wrap gap-1.5 pt-0.5">
                    <span className="text-[10px] text-slate-500 self-center">Templates:</span>
                    {DESCRIPTION_SUGGESTIONS.map((sugg, i) => (
                      <button
                        key={i}
                        type="button"
                        onClick={() => setFormData({ ...formData, description: sugg })}
                        className="text-[10px] px-2 py-0.5 rounded bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200 transition-colors cursor-pointer"
                      >
                        Note {i + 1}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Signatory Authority */}
                <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-200 space-y-2.5">
                  <span className="text-xs font-bold text-slate-800 block">
                    Signatory Authority
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-[11px] font-medium text-slate-600">Signatory Full Name <span className="text-red-500 font-bold">*</span></label>
                      <input
                        required
                        name="signatory_name"
                        value={formData.signatory_name}
                        onChange={handleInputChange}
                        placeholder="e.g. Dr. Arthur Pendelton"
                        className="w-full rounded-md bg-white border border-slate-300 px-2.5 py-1.5 text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-blue-500"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[11px] font-medium text-slate-600">Designation / Title <span className="text-red-500 font-bold">*</span></label>
                      <input
                        required
                        name="signatory_title"
                        value={formData.signatory_title}
                        onChange={handleInputChange}
                        placeholder="e.g. Dean of Engineering"
                        className="w-full rounded-md bg-white border border-slate-300 px-2.5 py-1.5 text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 2: DESIGN & THEMES */}
            {activeTab === 'design' && (
              <div className="space-y-4">
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 mb-1">
                    Select Certificate Color Theme
                  </h3>
                  <p className="text-xs text-slate-500 mb-3">
                    Select styling for borders, foil accents, and official seals.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {Object.entries(THEMES).map(([key, t]) => (
                    <button
                      key={key}
                      type="button"
                      onClick={() => setSelectedTheme(key)}
                      className={`p-3 rounded-lg border text-left transition-colors cursor-pointer ${
                        selectedTheme === key
                          ? 'border-blue-600 bg-blue-50/50 shadow-sm ring-1 ring-blue-600'
                          : 'border-slate-200 bg-white hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-bold text-slate-800">{t.name}</span>
                        {selectedTheme === key && (
                          <CheckCheck size={14} className="text-blue-600" />
                        )}
                      </div>
                      
                      {/* Color Palette Indicators */}
                      <div className="flex items-center gap-1.5">
                        <div className="w-4 h-4 rounded-full border border-slate-300" style={{ backgroundColor: t.outerBorder }} title="Border Color" />
                        <div className="w-4 h-4 rounded-full border border-slate-300" style={{ backgroundColor: t.innerBorder }} title="Inner Foil" />
                        <div className="w-4 h-4 rounded-full border border-slate-300" style={{ backgroundColor: t.nameColor }} title="Display Name" />
                        <div className="w-4 h-4 rounded-full border border-slate-300" style={{ backgroundColor: t.sealBg }} title="Seal Color" />
                      </div>
                    </button>
                  ))}
                </div>

                {/* BORDER FRAME TEMPLATES (TOP-BOTTOM-RIGHT-LEFT) */}
                <div className="pt-3 border-t border-slate-200">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 mb-1 flex items-center gap-1.5">
                    <Layers size={14} className="text-blue-600" />
                    <span>Border Frame Template (Top-Bottom-Right-Left)</span>
                  </h3>
                  <p className="text-xs text-slate-500 mb-3">
                    Choose perimeter architecture, corners, and border guidelines.
                  </p>

                  <div className="space-y-2">
                    {Object.entries(BORDER_STYLES).map(([bKey, bObj]) => (
                      <button
                        key={bKey}
                        type="button"
                        onClick={() => setFormData(prev => ({ ...prev, border_style: bKey }))}
                        className={`w-full p-2.5 rounded-lg border text-left transition-colors cursor-pointer flex items-center justify-between ${
                          formData.border_style === bKey
                            ? 'border-blue-600 bg-blue-50/50 shadow-xs ring-1 ring-blue-600'
                            : 'border-slate-200 bg-white hover:bg-slate-50'
                        }`}
                      >
                        <div>
                          <div className="text-xs font-bold text-slate-800">{bObj.name}</div>
                          <div className="text-[10px] text-slate-500">{bObj.desc}</div>
                        </div>
                        {formData.border_style === bKey && (
                          <CheckCheck size={15} className="text-blue-600 flex-shrink-0" />
                        )}
                      </button>
                    ))}
                  </div>
                </div>

                {/* ORGANIZATION LOGO MANAGEMENT */}
                <div className="pt-3 border-t border-slate-200">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 mb-1 flex items-center gap-1.5">
                    <Image size={14} className="text-blue-600" />
                    <span>Organization / Institution Logo</span>
                  </h3>
                  <p className="text-xs text-slate-500 mb-3">
                    Upload official company or school logo (Max 5MB), or pick an executive crest.
                  </p>

                  <div className="flex items-center gap-3 mb-3">
                    <label className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold cursor-pointer transition-colors shadow-xs">
                      <Upload size={13} />
                      <span>Upload Logo (Max 5MB - PNG, SVG, JPG)</span>
                      <input 
                        type="file" 
                        accept="image/*" 
                        onChange={handleLogoUpload} 
                        className="hidden" 
                      />
                    </label>

                    {formData.logo_url && (
                      <button
                        type="button"
                        onClick={handleRemoveLogo}
                        className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-semibold cursor-pointer transition-colors"
                      >
                        <Trash2 size={12} />
                        <span>Remove</span>
                      </button>
                    )}
                  </div>

                  {/* Preset Logos */}
                  <div className="space-y-1.5">
                    <span className="text-[11px] font-semibold text-slate-600 block">Or select an institutional crest:</span>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      {PRESET_LOGOS.map((pl) => (
                        <button
                          key={pl.id}
                          type="button"
                          onClick={() => setFormData(prev => ({ ...prev, logo_url: pl.url }))}
                          className={`p-2 rounded-lg border text-center transition-colors cursor-pointer flex flex-col items-center gap-1.5 ${
                            formData.logo_url === pl.url
                              ? 'border-blue-600 bg-blue-50/60 ring-1 ring-blue-600'
                              : 'border-slate-200 bg-white hover:bg-slate-50'
                          }`}
                        >
                          <img src={pl.url} alt={pl.name} className="w-7 h-7 object-contain" />
                          <span className="text-[10px] font-semibold text-slate-700">{pl.name}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Additional Design Options */}
                <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-200 space-y-2 mt-4">
                  <span className="text-xs font-bold text-slate-800 block">Certificate Specifications</span>
                  <div className="grid grid-cols-2 gap-2.5 text-xs">
                    <div className="p-2 rounded bg-white border border-slate-200 text-slate-700">
                      <span className="text-slate-400 block text-[10px] uppercase">Page Layout</span>
                      <span className="font-semibold text-slate-900">A4 Landscape</span>
                    </div>
                    <div className="p-2 rounded bg-white border border-slate-200 text-slate-700">
                      <span className="text-slate-400 block text-[10px] uppercase">File Format</span>
                      <span className="font-semibold text-slate-900">Vector PDF (High DPI)</span>
                    </div>
                    <div className="p-2 rounded bg-white border border-slate-200 text-slate-700">
                      <span className="text-slate-400 block text-[10px] uppercase">Naming Format</span>
                      <span className="font-semibold text-slate-900">[Name]_[Event].pdf</span>
                    </div>
                    <div className="p-2 rounded bg-white border border-slate-200 text-slate-700">
                      <span className="text-slate-400 block text-[10px] uppercase">Seal Type</span>
                      <span className="font-semibold text-slate-900">Official Medallion</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 3: RECIPIENTS & BULK IMPORT */}
            {activeTab === 'recipients' && (
              <div className="space-y-4">
                {/* Recipients Header & Quick Sample Buttons */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                  <div>
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 flex items-center gap-1.5">
                      <Users size={14} className="text-blue-600" />
                      <span>Recipients List</span>
                    </h3>
                    <p className="text-[11px] text-slate-500">
                      Enter names manually or upload a CSV file (up to 1,000,000 / 10 lakhs supported).
                    </p>
                  </div>

                  <div className="flex items-center gap-1.5 self-end sm:self-auto">
                    <button
                      type="button"
                      onClick={() => addSampleRecipients(5)}
                      disabled={isUploadingCSV}
                      className="px-2.5 py-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium transition-colors border border-slate-300 cursor-pointer disabled:opacity-50"
                    >
                      +5 Sample
                    </button>
                    <label className={`px-2.5 py-1 rounded text-xs font-medium transition-colors border flex items-center gap-1.5 ${
                      isUploadingCSV 
                        ? 'bg-blue-50 text-blue-700 border-blue-300 pointer-events-none cursor-wait' 
                        : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-300 cursor-pointer'
                    }`}>
                      {isUploadingCSV ? (
                        <>
                          <Loader2 size={12} className="animate-spin text-blue-600" />
                          <span>Uploading CSV...</span>
                        </>
                      ) : (
                        <>
                          <Upload size={12} />
                          <span>Upload CSV</span>
                        </>
                      )}
                      <input 
                        type="file" 
                        accept=".csv, .txt" 
                        onChange={handleFileUpload} 
                        disabled={isUploadingCSV}
                        className="hidden" 
                      />
                    </label>
                    <button
                      type="button"
                      onClick={handleClearAllRecipients}
                      disabled={isUploadingCSV}
                      className="p-1 rounded text-slate-400 hover:text-red-600 hover:bg-slate-100 transition-colors cursor-pointer disabled:opacity-50"
                      title="Clear all recipients"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>

                {/* Textarea Input */}
                <div className="space-y-1">
                  <div className="text-[11px] text-slate-600 flex items-center justify-between">
                    <span>Format: <code>Full Name, Email (optional)</code> per line</span>
                    <span className="font-mono text-emerald-700 font-semibold">{parsedRecipients.length.toLocaleString()} Valid</span>
                  </div>
                  <div className="relative">
                    <textarea
                      required
                      name="recipients_text"
                      value={formData.recipients_text}
                      onChange={handleInputChange}
                      rows="5"
                      disabled={isUploadingCSV}
                      placeholder={"Alice Cooper, alice@example.com\nBob Vance, bob@example.com\nCharlie Brown"}
                      className="w-full font-mono rounded-lg bg-white border border-slate-300 px-3 py-2 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors resize-y disabled:bg-slate-50"
                    />
                    {isUploadingCSV && (
                      <div className="absolute inset-0 bg-white/80 backdrop-blur-2xs rounded-lg flex flex-col items-center justify-center gap-2 border border-blue-200">
                        <Loader2 size={24} className="animate-spin text-blue-600" />
                        <span className="text-xs font-semibold text-slate-700">Uploading & parsing recipient records...</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Virtualized All-Recipient List (Seamlessly displays 1 lakh / 100,000+ records) */}
                <VirtualRecipientList
                  recipients={parsedRecipients}
                  currentIndex={currentRecipientIndex}
                  onSelectRecipient={setCurrentRecipientIndex}
                  onRemoveRecipient={removeRecipient}
                />
              </div>
            )}
          </div>

          {/* Bottom Fixed Action Footer in Left Panel */}
          <div className="p-4 border-t border-slate-200 bg-slate-50 flex flex-col gap-3">
            <div className="flex items-center text-xs text-slate-600">
              <span className="flex items-center gap-1.5">
                <CheckCircle2 size={14} className="text-emerald-600" />
                <span>Ready to generate <strong>{parsedRecipients.length}</strong> certificates</span>
              </span>
            </div>

            <div className="flex items-center gap-3">
              {/* Primary One-Click Generate Button (Disciplined solid color, no gradient) */}
              <button
                type="button"
                onClick={handleGenerate}
                disabled={loading || parsedRecipients.length === 0}
                className="w-full flex items-center justify-center gap-2 px-6 py-3 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                {loading ? (
                  <>
                    <Loader2 size={16} className="animate-spin text-white" />
                    <span>Processing Batch ({parsedRecipients.length})...</span>
                  </>
                ) : (
                  <>
                    <Send size={16} className="text-white" />
                    <span>Generate All Certificates ({parsedRecipients.length})</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Real-Time Interactive Certificate Preview */}
        <div className="lg:col-span-6 xl:col-span-7 sticky top-24">
          <CertificatePreview
            certificateData={formData}
            currentRecipientIndex={currentRecipientIndex}
            onRecipientChange={setCurrentRecipientIndex}
            recipientsList={parsedRecipients}
            themeKey={selectedTheme}
            borderStyle={formData.border_style}
          />
        </div>
      </div>

      {/* Recent Batches Modal - Clean Light UI */}
      {showRecentModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
          <div className="w-full max-w-2xl bg-white border border-slate-200 rounded-xl shadow-xl overflow-hidden flex flex-col max-h-[80vh]">
            <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <History size={18} className="text-blue-600" />
                <h3 className="font-bold text-base text-slate-900">Recent Generation Batches</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowRecentModal(false)}
                className="text-slate-400 hover:text-slate-700 p-1 rounded-md hover:bg-slate-100 cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-3 custom-scrollbar">
              {recentJobs.length === 0 ? (
                <div className="text-center py-8 text-slate-500 text-sm">
                  No previous certificate batches found.
                </div>
              ) : (
                recentJobs.map((job) => (
                  <div
                    key={job.id}
                    className="p-4 rounded-lg bg-white border border-slate-200 hover:border-slate-300 transition-colors flex items-center justify-between gap-4"
                  >
                    <div className="space-y-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-slate-900 truncate">{job.event_name}</span>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          job.status === 'COMPLETED' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                          job.status === 'PROCESSING' ? 'bg-blue-50 text-blue-700 animate-pulse border border-blue-200' :
                          job.status === 'FAILED' ? 'bg-red-50 text-red-700 border border-red-200' :
                          'bg-slate-100 text-slate-700'
                        }`}>
                          {job.status}
                        </span>
                      </div>
                      <div className="text-xs text-slate-500 flex items-center gap-3">
                        <span>{job.organization_name}</span>
                        <span>&bull;</span>
                        <span>{job.completed_count} / {job.total_count} Certificates</span>
                        <span>&bull;</span>
                        <span>{new Date(job.created_at).toLocaleDateString()}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 flex-shrink-0">
                      <button
                        type="button"
                        onClick={() => {
                          setShowRecentModal(false);
                          navigate(`/jobs/${job.id}`);
                        }}
                        className="px-3 py-1.5 rounded-md bg-slate-100 hover:bg-slate-200 text-xs font-semibold text-slate-700 hover:text-slate-900 transition-colors cursor-pointer flex items-center gap-1.5"
                      >
                        <Eye size={13} className="text-slate-500" />
                        <span>View Job</span>
                      </button>
                      {job.completed_count > 0 && (
                        <DownloadFormatDropdown 
                          jobId={job.id}
                          isZip={true}
                          buttonText="ZIP"
                          variant="primary"
                          size="sm"
                        />
                      )}
                      <button
                        type="button"
                        onClick={() => handleDeleteBatch(job.id, job.event_name)}
                        className="px-2.5 py-1.5 rounded-md bg-rose-50 hover:bg-rose-100 text-xs font-semibold text-rose-700 border border-rose-200 transition-colors cursor-pointer flex items-center gap-1"
                        title="Delete Batch"
                      >
                        <Trash2 size={12} className="text-rose-600" />
                        <span>Delete</span>
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="p-3 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs">
              <span className="text-slate-500">Need full batch management & history?</span>
              <button
                type="button"
                onClick={() => {
                  setShowRecentModal(false);
                  navigate('/jobs');
                }}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold transition-colors cursor-pointer"
              >
                <span>Open Jobs Directory</span>
                <ArrowRight size={13} />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
