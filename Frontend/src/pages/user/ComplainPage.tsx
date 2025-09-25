import React, { useState, useMemo, useRef, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './ComplainPage.css';

interface CivicIssue {
  id: string;
  category: string;
  title: string;
  icon: string;
}

interface ReportData {
  selectedIssue: CivicIssue | null;
  photos: File[];
  videos: File[];
  textMessage: string;
  voiceMessage: File | null;
  messageType: 'text' | 'voice';
  selectedLanguage: string;
  location: {
    latitude: number;
    longitude: number;
    address: string;
    block?: string;
    ward?: string;
  } | null;
  userDetails: {
    name: string;
    aadhaar: string;
    phone: string;
  };
  aiClassification?: {
    labels: string[];
    confidence: number;
    suggestedCategory?: string;
  };
}

const VOICE_LANGUAGES = [
  { code: 'hi-IN', name: 'Hindi (हिन्दी)' },
  { code: 'en-IN', name: 'English' },
  { code: 'bh-IN', name: 'Bhojpuri (भोजपुरी)' },
  { code: 'mag-IN', name: 'Magahi (मगही)' },
  { code: 'sa-IN', name: 'Sanskrit (संस्कृत)' },
];

declare global {
  interface Window {
    google: any;
    initMap: () => void;
  }
}

const ComplainPage: React.FC = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState<'select' | 'report' | 'success'>('select');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedIssue, setSelectedIssue] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [generatedCode, setGeneratedCode] = useState<string>('');
  const [isAnalyzingImage, setIsAnalyzingImage] = useState(false);
  const [locationLoading, setLocationLoading] = useState(false);
  const [showCameraInterface, setShowCameraInterface] = useState(false);
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);
  
  // Google Maps
  const mapRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [map, setMap] = useState<any>(null);
  const [marker, setMarker] = useState<any>(null);
  
  // Report form data
  const [reportData, setReportData] = useState<ReportData>({
    selectedIssue: null,
    photos: [],
    videos: [],
    textMessage: '',
    voiceMessage: null,
    messageType: 'text',
    selectedLanguage: 'hi-IN',
    location: null,
    userDetails: {
      name: '',
      aadhaar: '',
      phone: ''
    }
  });

  // Refs for media capture
  const photoInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);
  const voiceRecorderRef = useRef<MediaRecorder | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);

  const civicIssues: CivicIssue[] = [
    // Infrastructure & Roads
    { id: '1-1', category: 'Infrastructure & Roads', title: 'Potholes and damaged roads', icon: '🛣️' },
    { id: '1-2', category: 'Infrastructure & Roads', title: 'Poor road conditions affecting traffic', icon: '🚗' },
    { id: '1-3', category: 'Infrastructure & Roads', title: 'Broken pavements and footpaths', icon: '🚶' },
    { id: '1-4', category: 'Infrastructure & Roads', title: 'Missing road signs and traffic signals', icon: '🚦' },
    { id: '1-5', category: 'Infrastructure & Roads', title: 'Waterlogging during rains', icon: '🌧️' },
    { id: '1-6', category: 'Infrastructure & Roads', title: 'Poor drainage systems', icon: '🚰' },

    // Water Supply & Sanitation
    { id: '2-1', category: 'Water Supply & Sanitation', title: 'Water shortage or irregular supply', icon: '💧' },
    { id: '2-2', category: 'Water Supply & Sanitation', title: 'Contaminated drinking water', icon: '🚱' },
    { id: '2-3', category: 'Water Supply & Sanitation', title: 'Broken water pipes and leakages', icon: '🔧' },
    { id: '2-4', category: 'Water Supply & Sanitation', title: 'Poor sewerage systems', icon: '🚽' },
    { id: '2-5', category: 'Water Supply & Sanitation', title: 'Overflowing manholes', icon: '⚠️' },
    { id: '2-6', category: 'Water Supply & Sanitation', title: 'Lack of public toilets', icon: '🚻' },

    // Waste Management
    { id: '3-1', category: 'Waste Management', title: 'Irregular garbage collection', icon: '🗑️' },
    { id: '3-2', category: 'Waste Management', title: 'Overflowing dustbins', icon: '🆘' },
    { id: '3-3', category: 'Waste Management', title: 'Improper waste segregation', icon: '♻️' },
    { id: '3-4', category: 'Waste Management', title: 'Illegal dumping of waste', icon: '🚫' },
    { id: '3-5', category: 'Waste Management', title: 'Open burning of garbage', icon: '🔥' },
    { id: '3-6', category: 'Waste Management', title: 'Lack of recycling facilities', icon: '🔄' },

    // Street Lighting & Safety
    { id: '4-1', category: 'Street Lighting & Safety', title: 'Non-functional street lights', icon: '💡' },
    { id: '4-2', category: 'Street Lighting & Safety', title: 'Dark streets affecting safety', icon: '🌙' },
    { id: '4-3', category: 'Street Lighting & Safety', title: 'Broken lamp posts', icon: '🏮' },
    { id: '4-4', category: 'Street Lighting & Safety', title: 'Inadequate lighting in public areas', icon: '🔦' },
    { id: '4-5', category: 'Street Lighting & Safety', title: 'Safety concerns in parks and public spaces', icon: '🏞️' },

    // Public Health & Environment
    { id: '5-1', category: 'Public Health & Environment', title: 'Air pollution from vehicles/industries', icon: '🏭' },
    { id: '5-2', category: 'Public Health & Environment', title: 'Noise pollution', icon: '🔊' },
    { id: '5-3', category: 'Public Health & Environment', title: 'Stray animals causing nuisance', icon: '🐕' },
    { id: '5-4', category: 'Public Health & Environment', title: 'Mosquito breeding in stagnant water', icon: '🦟' },
    { id: '5-5', category: 'Public Health & Environment', title: 'Poor sanitation in public areas', icon: '🧽' },
    { id: '5-6', category: 'Public Health & Environment', title: 'Illegal construction affecting environment', icon: '🏗️' },

    // Public Transportation
    { id: '6-1', category: 'Public Transportation', title: 'Poor bus services', icon: '🚌' },
    { id: '6-2', category: 'Public Transportation', title: 'Overcrowded public transport', icon: '👥' },
    { id: '6-3', category: 'Public Transportation', title: 'Lack of proper bus stops', icon: '🚏' },
    { id: '6-4', category: 'Public Transportation', title: 'Traffic congestion', icon: '🚥' },
    { id: '6-5', category: 'Public Transportation', title: 'Parking problems', icon: '🅿️' },
    { id: '6-6', category: 'Public Transportation', title: 'Poor road connectivity', icon: '🛤️' },

    // Civic Amenities
    { id: '7-1', category: 'Civic Amenities', title: 'Poor maintenance of public parks', icon: '🌳' },
    { id: '7-2', category: 'Civic Amenities', title: 'Lack of playgrounds for children', icon: '🎠' },
    { id: '7-3', category: 'Civic Amenities', title: 'Inadequate healthcare facilities', icon: '🏥' },
    { id: '7-4', category: 'Civic Amenities', title: 'Poor school infrastructure', icon: '🏫' },
    { id: '7-5', category: 'Civic Amenities', title: 'Missing public facilities', icon: '🏛️' },
  ];

  const categories = [
    'all',
    'Infrastructure & Roads',
    'Water Supply & Sanitation',
    'Waste Management',
    'Street Lighting & Safety',
    'Public Health & Environment',
    'Public Transportation',
    'Civic Amenities'
  ];

  const filteredIssues = useMemo(() => {
    return civicIssues.filter(issue => {
      const matchesSearch = issue.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           issue.category.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = selectedCategory === 'all' || issue.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [searchTerm, selectedCategory]);

  // Initialize Google Maps
  useEffect(() => {
    const initializeMap = () => {
      if (!window.google || !mapRef.current) return;

      const mapInstance = new window.google.maps.Map(mapRef.current, {
        zoom: 15,
        center: { lat: 23.3441, lng: 85.3096 }, // Default to Ranchi, Jharkhand
        mapTypeControl: false,
        streetViewControl: false,
        fullscreenControl: false,
      });

      setMap(mapInstance);

      mapInstance.addListener('click', (event: any) => {
        updateLocationFromCoords(event.latLng.lat(), event.latLng.lng());
      });
    };

    if (!window.google) {
      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=${process.env.REACT_APP_GOOGLE_MAPS_API_KEY}&libraries=places`;
      script.async = true;
      script.defer = true;
      window.initMap = initializeMap;
      script.onload = initializeMap;
      document.head.appendChild(script);
    } else {
      initializeMap();
    }
  }, [currentStep]);

  // Camera Interface Functions
  const startCamera = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: 'environment',
          width: { ideal: 1920 },
          height: { ideal: 1080 }
        }
      });
      
      setCameraStream(stream);
      setShowCameraInterface(true);
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      
      getCurrentLocation();
      
    } catch (error) {
      console.error('Error accessing camera:', error);
      alert('Please allow camera access to take photos with GPS location.');
    }
  }, []);

  const capturePhoto = useCallback(async () => {
    if (!videoRef.current || !canvasRef.current || !cameraStream) return;

    const canvas = canvasRef.current;
    const video = videoRef.current;
    const context = canvas.getContext('2d');
    
    if (!context) return;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    context.drawImage(video, 0, 0, canvas.width, canvas.height);
    
    canvas.toBlob(async (blob) => {
      if (!blob) return;
      
      const file = new File([blob], `photo_${Date.now()}.jpg`, { type: 'image/jpeg' });
      
      setIsAnalyzingImage(true);
      await analyzeImageWithVision(file);
      
      setReportData(prev => ({
        ...prev,
        photos: [...prev.photos, file].slice(0, 2)
      }));
      
      setIsAnalyzingImage(false);
      stopCamera();
      
    }, 'image/jpeg', 0.8);
  }, [cameraStream]);

  const stopCamera = useCallback(() => {
    if (cameraStream) {
      cameraStream.getTracks().forEach(track => track.stop());
      setCameraStream(null);
    }
    setShowCameraInterface(false);
  }, [cameraStream]);

  // Update location from coordinates
  const updateLocationFromCoords = useCallback(async (lat: number, lng: number) => {
    try {
      const geocoder = new window.google.maps.Geocoder();
      const response = await new Promise((resolve, reject) => {
        geocoder.geocode(
          { location: { lat, lng } },
          (results: any, status: any) => {
            if (status === 'OK') resolve(results);
            else reject(status);
          }
        );
      });

      const result = (response as any)[0];
      const address = result.formatted_address;
      
      let block = '';
      let ward = '';
      
      result.address_components.forEach((component: any) => {
        const types = component.types;
        if (types.includes('sublocality') || types.includes('neighborhood')) {
          block = component.long_name;
        }
        if (types.includes('administrative_area_level_3')) {
          ward = component.long_name;
        }
      });

      const locationData = {
        latitude: lat,
        longitude: lng,
        address,
        block: block || 'Unknown Block',
        ward: ward || 'Unknown Ward'
      };

      setReportData(prev => ({
        ...prev,
        location: locationData
      }));

      if (map) {
        if (marker) {
          marker.setMap(null);
        }
        const newMarker = new window.google.maps.Marker({
          position: { lat, lng },
          map: map,
          title: 'Complaint Location',
          icon: {
            url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
              <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="#ef4444">
                <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
              </svg>
            `),
            scaledSize: new window.google.maps.Size(40, 40),
          },
        });
        setMarker(newMarker);
        map.setCenter({ lat, lng });
      }

    } catch (error) {
      console.error('Error getting address:', error);
      setReportData(prev => ({
        ...prev,
        location: {
          latitude: lat,
          longitude: lng,
          address: `${lat.toFixed(6)}, ${lng.toFixed(6)}`,
          block: 'Unknown Block',
          ward: 'Unknown Ward'
        }
      }));
    }
  }, [map, marker]);

  // Get current location using GPS
  const getCurrentLocation = useCallback(() => {
    setLocationLoading(true);
    
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          updateLocationFromCoords(latitude, longitude);
          setLocationLoading(false);
        },
        (error) => {
          console.error('Error getting location:', error);
          alert('Please enable location services or click on the map to set location manually.');
          setLocationLoading(false);
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 60000
        }
      );
    } else {
      alert('Geolocation is not supported by this browser.');
      setLocationLoading(false);
    }
  }, [updateLocationFromCoords]);

  // Analyze image with Google Vision API
  const analyzeImageWithVision = useCallback(async (imageFile: File): Promise<any> => {
    try {
      setIsAnalyzingImage(true);
      
      const base64Image = await new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          const base64 = (reader.result as string).split(',')[1];
          resolve(base64);
        };
        reader.readAsDataURL(imageFile);
      });

      const response = await fetch('/api/analyze-image', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          image: base64Image,
          features: [
            { type: 'LABEL_DETECTION', maxResults: 10 },
            { type: 'OBJECT_LOCALIZATION', maxResults: 10 },
            { type: 'TEXT_DETECTION' }
          ]
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to analyze image');
      }

      const result = await response.json();
      const labels = result.labels || [];
      const suggestedCategory = suggestCategoryFromLabels(labels);
      
      const aiClassification = {
        labels: labels.map((label: any) => label.description),
        confidence: labels.length > 0 ? labels[0].score : 0,
        suggestedCategory
      };

      setReportData(prev => ({
        ...prev,
        aiClassification
      }));

      if (aiClassification.confidence > 0.7 && suggestedCategory) {
        setSelectedCategory(suggestedCategory);
        alert(`AI detected: ${labels[0]?.description}. Suggested category: ${suggestedCategory}`);
      }

      return result;

    } catch (error) {
      console.error('Error analyzing image:', error);
      alert('Failed to analyze image automatically. Please select category manually.');
    } finally {
      setIsAnalyzingImage(false);
    }
  }, []);

  const suggestCategoryFromLabels = useCallback((labels: any[]): string | undefined => {
    const labelTexts = labels.map(l => l.description?.toLowerCase() || '');
    
    const categoryMappings = {
      'Infrastructure & Roads': ['road', 'street', 'pothole', 'asphalt', 'pavement', 'sidewalk', 'pathway', 'traffic'],
      'Waste Management': ['garbage', 'trash', 'waste', 'litter', 'dustbin', 'dumpster', 'recycling'],
      'Water Supply & Sanitation': ['water', 'pipe', 'drainage', 'sewer', 'manhole', 'flooding'],
      'Street Lighting & Safety': ['light', 'lamp', 'pole', 'lighting', 'street light'],
      'Public Health & Environment': ['pollution', 'smoke', 'air', 'environment', 'stray animal', 'dog'],
      'Public Transportation': ['bus', 'transport', 'vehicle', 'traffic', 'parking'],
      'Civic Amenities': ['park', 'playground', 'building', 'facility', 'hospital', 'school']
    };

    for (const [category, keywords] of Object.entries(categoryMappings)) {
      if (keywords.some(keyword => labelTexts.some(label => label.includes(keyword)))) {
        return category;
      }
    }

    return undefined;
  }, []);

  // Video capture with GPS
  const handleVideoCapture = useCallback(async () => {
    if (!reportData.location) {
      getCurrentLocation();
    }
    
    if (videoInputRef.current) {
      videoInputRef.current.click();
    }
  }, [getCurrentLocation, reportData.location]);

  const handleVideoChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    setReportData(prev => ({
      ...prev,
      videos: [...prev.videos, ...files].slice(0, 1) // Max 1 video
    }));
  }, []);

  // Voice recording with language support
  const startVoiceRecording = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      const chunks: Blob[] = [];

      mediaRecorder.ondataavailable = (event) => {
        chunks.push(event.data);
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunks, { type: 'audio/wav' });
        const file = new File([blob], `voice_${reportData.selectedLanguage}_${Date.now()}.wav`, { type: 'audio/wav' });
        setReportData(prev => ({ ...prev, voiceMessage: file }));
        stream.getTracks().forEach(track => track.stop());
      };

      voiceRecorderRef.current = mediaRecorder;
      mediaRecorder.start();
      setIsRecording(true);

      const timer = setInterval(() => {
        setRecordingTime(prev => {
          if (prev >= 180) {
            stopVoiceRecording();
            return 0;
          }
          return prev + 1;
        });
      }, 1000);

      setTimeout(() => clearInterval(timer), 180000);
    } catch (error) {
      console.error('Error starting voice recording:', error);
      alert('Please allow microphone access to record voice message.');
    }
  }, [reportData.selectedLanguage]);

  const stopVoiceRecording = useCallback(() => {
    if (voiceRecorderRef.current && voiceRecorderRef.current.state !== 'inactive') {
      voiceRecorderRef.current.stop();
      setIsRecording(false);
      setRecordingTime(0);
    }
  }, []);

  // Generate unique code
  const generateTrackingCode = useCallback((name: string, aadhaar: string): string => {
    const nameCode = name.substring(0, 3).toUpperCase();
    const aadhaarCode = aadhaar.substring(8, 12);
    const timestamp = Date.now().toString().slice(-4);
    const randomLetters = Math.random().toString(36).substring(2, 4).toUpperCase();
    
    return `${nameCode}${aadhaarCode}${timestamp}${randomLetters}`;
  }, []);

  // Form handlers
  const handleIssueSelect = (issueId: string) => {
    setSelectedIssue(issueId);
  };

  const handleContinue = () => {
    if (selectedIssue) {
      const issue = civicIssues.find(i => i.id === selectedIssue);
      setReportData(prev => ({ ...prev, selectedIssue: issue || null }));
      setCurrentStep('report');
      getCurrentLocation();
    }
  };

  const handleSubmitReport = async () => {
    // Validate required fields
    if (!reportData.userDetails.name || !reportData.userDetails.aadhaar || !reportData.userDetails.phone) {
      alert('Please fill in all required user details.');
      return;
    }

    if (!reportData.location) {
      alert('Please allow location access or set location manually on the map.');
      return;
    }

    // Validate message (either text or voice)
    if (reportData.messageType === 'text' && !reportData.textMessage.trim()) {
      alert('Please provide a text description of the issue.');
      return;
    }

    if (reportData.messageType === 'voice' && !reportData.voiceMessage) {
      alert('Please record a voice message describing the issue.');
      return;
    }

    if (reportData.photos.length === 0 && reportData.videos.length === 0) {
      alert('Please provide at least one photo or video as evidence.');
      return;
    }

    setIsSubmitting(true);

    try {
      const trackingCode = generateTrackingCode(reportData.userDetails.name, reportData.userDetails.aadhaar);
      
      const formData = new FormData();
      formData.append('issue', JSON.stringify(reportData.selectedIssue));
      formData.append('location', JSON.stringify(reportData.location));
      formData.append('userDetails', JSON.stringify(reportData.userDetails));
      formData.append('messageType', reportData.messageType);
      formData.append('selectedLanguage', reportData.selectedLanguage);
      formData.append('textMessage', reportData.textMessage);
      formData.append('trackingCode', trackingCode);
      formData.append('aiClassification', JSON.stringify(reportData.aiClassification));
      
      reportData.photos.forEach((photo, index) => {
        formData.append(`photo_${index}`, photo);
      });
      
      reportData.videos.forEach((video, index) => {
        formData.append(`video_${index}`, video);
      });
      
      if (reportData.voiceMessage) {
        formData.append('voiceMessage', reportData.voiceMessage);
      }

      // Simulate API call to submit report
      await new Promise(resolve => setTimeout(resolve, 2000));

      console.log('Report submitted:', {
        trackingCode,
        reportData,
        submittedAt: new Date().toISOString()
      });

      setGeneratedCode(trackingCode);
      setCurrentStep('success');
    } catch (error) {
      console.error('Error submitting report:', error);
      alert('Failed to submit report. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoBack = () => {
    if (currentStep === 'report') {
      setCurrentStep('select');
    } else {
      navigate(-1);
    }
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="complain-page">
      {/* Camera Interface Overlay */}
      {showCameraInterface && (
        <div className="camera-overlay">
          <div className="camera-interface">
            <div className="camera-header">
              <button className="camera-close" onClick={stopCamera}>✕</button>
              <h3>Take GPS Photo</h3>
              <div className="camera-gps-indicator">
                {locationLoading ? '🌍 Getting GPS...' : '📍 GPS Ready'}
              </div>
            </div>
            
            <div className="camera-view">
              <video ref={videoRef} autoPlay playsInline className="camera-video" />
              <canvas ref={canvasRef} style={{ display: 'none' }} />
            </div>
            
            <div className="camera-controls">
              <div className="camera-instruction">Tap to capture photo with GPS location</div>
              <button 
                className="capture-button" 
                onClick={capturePhoto}
                disabled={locationLoading}
              >
                📸
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Back Button */}
      <button className="back-button" onClick={handleGoBack}>
        <span className="back-icon">←</span>
        <span className="back-text">Back</span>
      </button>

      {/* Step Indicator */}
      <div className="step-indicator">
        <div className={`step ${currentStep === 'select' ? 'active' : currentStep === 'report' || currentStep === 'success' ? 'completed' : ''}`}>
          <span className="step-number">1</span>
          <span className="step-label">Select Issue</span>
        </div>
        <div className="step-line"></div>
        <div className={`step ${currentStep === 'report' ? 'active' : currentStep === 'success' ? 'completed' : ''}`}>
          <span className="step-number">2</span>
          <span className="step-label">Report Details</span>
        </div>
        <div className="step-line"></div>
        <div className={`step ${currentStep === 'success' ? 'active' : ''}`}>
          <span className="step-number">3</span>
          <span className="step-label">Confirmation</span>
        </div>
      </div>

      {/* Issue Selection Step */}
      {currentStep === 'select' && (
        <>
          <section className="hero-section-modern">
            <div className="hero-background"></div>
            <div className="hero-content">
              <div className="complain-hero-content">
                <div className="hero-header">
                  <h1 className="hero-title">Report Civic Issues</h1>
                  <p className="hero-subtitle">
                    Help make your community better by reporting civic issues with AI-powered classification and GPS location.
                  </p>
                  <div className="hero-stats">
                    <div className="stat">
                      <span className="stat-number">15,420</span>
                      <span className="stat-label">Issues Resolved</span>
                    </div>
                    <div className="stat">
                      <span className="stat-number">7.2 days</span>
                      <span className="stat-label">Avg. Resolution Time</span>
                    </div>
                    <div className="stat">
                      <span className="stat-number">94%</span>
                      <span className="stat-label">Satisfaction Rate</span>
                    </div>
                  </div>
                </div>

                <div className="hero-search-section">
                  <div className="search-container">
                    <div className="search-box">
                      <span className="search-icon">🔍</span>
                      <input
                        type="text"
                        placeholder="Search for civic issues..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="search-input"
                      />
                    </div>
                  </div>

                  <div className="category-filter">
                    <div className="filter-scroll">
                      {categories.map((category) => (
                        <button
                          key={category}
                          className={`filter-btn ${selectedCategory === category ? 'active' : ''}`}
                          onClick={() => setSelectedCategory(category)}
                        >
                          {category === 'all' ? 'All Categories' : category}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <main className="main-content">
            <div className="container">
              <div className="issues-section">
                <h2 className="section-title">
                  Select Your Issue 
                  <span className="issue-count">({filteredIssues.length} issues found)</span>
                </h2>

                <div className="issues-grid">
                  {filteredIssues.map((issue, index) => (
                    <div
                      key={issue.id}
                      className={`issue-card ${selectedIssue === issue.id ? 'selected' : ''}`}
                      onClick={() => handleIssueSelect(issue.id)}
                      style={{ animationDelay: `${index * 0.05}s` }}
                    >
                      <div className="issue-icon">{issue.icon}</div>
                      <div className="issue-content">
                        <h3 className="issue-title">{issue.title}</h3>
                        <p className="issue-category">{issue.category}</p>
                      </div>
                      <div className="issue-select">
                        {selectedIssue === issue.id && (
                          <span className="checkmark">✓</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                {filteredIssues.length === 0 && (
                  <div className="no-results">
                    <span className="no-results-icon">🔍</span>
                    <h3>No issues found</h3>
                    <p>Try adjusting your search terms or category filter</p>
                  </div>
                )}
              </div>

              {selectedIssue && (
                <div className="continue-section">
                  <button className="btn-primary continue-btn" onClick={handleContinue}>
                    Continue with Selected Issue
                    <span className="btn-icon">→</span>
                  </button>
                </div>
              )}
            </div>
          </main>
        </>
      )}

      {/* Report Details Step */}
      {currentStep === 'report' && (
        <main className="report-section">
          <div className="report-container">
            <div className="report-header">
              <div className="selected-issue-preview">
                <span className="issue-icon-large">{reportData.selectedIssue?.icon}</span>
                <div>
                  <h2 className="report-title">Report Details</h2>
                  <p className="selected-issue-text">{reportData.selectedIssue?.title}</p>
                  <span className="issue-category-badge">{reportData.selectedIssue?.category}</span>
                  {reportData.aiClassification && (
                    <div className="ai-classification">
                      <span className="ai-badge">🤖 AI Detected: {reportData.aiClassification.labels[0]}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="report-form">
              {/* Location Section with Google Maps */}
              <div className="form-section">
                <h3 className="section-title">📍 Location (GPS + Maps)</h3>
                
                <div className="location-controls">
                  <button
                    type="button"
                    className={`location-btn ${locationLoading ? 'loading' : ''}`}
                    onClick={getCurrentLocation}
                    disabled={locationLoading}
                  >
                    {locationLoading ? (
                      <>
                        <span className="loading-spinner">🌍</span>
                        Getting Location...
                      </>
                    ) : (
                      <>
                        <span className="location-icon">📍</span>
                        Get Current Location
                      </>
                    )}
                  </button>
                  <p className="location-help">Or click on the map to set location manually</p>
                </div>

                <div className="map-container">
                  <div ref={mapRef} className="google-map"></div>
                </div>

                {reportData.location && (
                  <div className="location-info">
                    <div className="location-detected">
                      <span className="location-icon">✅</span>
                      <div className="location-details">
                        <p className="location-address">{reportData.location.address}</p>
                        <div className="location-meta">
                          <span className="location-block">Block: {reportData.location.block}</span>
                          <span className="location-ward">Ward: {reportData.location.ward}</span>
                        </div>
                        <p className="location-coords">
                          Lat: {reportData.location.latitude.toFixed(6)}, 
                          Lng: {reportData.location.longitude.toFixed(6)}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* User Details Section */}
              <div className="form-section">
                <h3 className="section-title">👤 Your Details</h3>
                <div className="user-details-grid">
                  <div className="input-group">
                    <label htmlFor="name">Full Name *</label>
                    <input
                      id="name"
                      type="text"
                      placeholder="Enter your full name"
                      value={reportData.userDetails.name}
                      onChange={(e) => setReportData(prev => ({
                        ...prev,
                        userDetails: { ...prev.userDetails, name: e.target.value }
                      }))}
                      required
                    />
                  </div>
                  <div className="input-group">
                    <label htmlFor="aadhaar">Aadhaar Number *</label>
                    <input
                      id="aadhaar"
                      type="text"
                      placeholder="XXXX XXXX XXXX"
                      maxLength={12}
                      value={reportData.userDetails.aadhaar}
                      onChange={(e) => {
                        const value = e.target.value.replace(/\D/g, '');
                        setReportData(prev => ({
                          ...prev,
                          userDetails: { ...prev.userDetails, aadhaar: value }
                        }));
                      }}
                      required
                    />
                  </div>
                  <div className="input-group">
                    <label htmlFor="phone">Phone Number *</label>
                    <input
                      id="phone"
                      type="tel"
                      placeholder="+91 XXXXX XXXXX"
                      maxLength={10}
                      value={reportData.userDetails.phone}
                      onChange={(e) => {
                        const value = e.target.value.replace(/\D/g, '');
                        setReportData(prev => ({
                          ...prev,
                          userDetails: { ...prev.userDetails, phone: value }
                        }));
                      }}
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Evidence Section */}
              <div className="form-section">
                <h3 className="section-title">📸 Add Evidence (AI-Powered)</h3>
                
                {isAnalyzingImage && (
                  <div className="ai-analyzing">
                    <span className="ai-icon">🤖</span>
                    <span>AI is analyzing your image...</span>
                    <span className="loading-spinner">⏳</span>
                  </div>
                )}
                
                {/* Photo Upload */}
                <div className="evidence-group">
                  <h4 className="evidence-title">Photos (with AI Classification)</h4>
                  <div className="evidence-actions">
                    <button
                      type="button"
                      className="media-btn photo-btn"
                      onClick={startCamera}
                      disabled={isAnalyzingImage || reportData.photos.length >= 2}
                    >
                      <span className="media-icon">📷</span>
                      Take GPS Photo + AI Analysis
                    </button>
                    <span className="media-count">{reportData.photos.length}/2</span>
                  </div>
                  
                  {reportData.photos.length > 0 && (
                    <div className="media-preview">
                      {reportData.photos.map((photo, index) => (
                        <div key={index} className="photo-preview">
                          <img src={URL.createObjectURL(photo)} alt={`Photo ${index + 1}`} />
                          <button
                            type="button"
                            className="remove-media"
                            onClick={() => setReportData(prev => ({
                              ...prev,
                              photos: prev.photos.filter((_, i) => i !== index)
                            }))}
                          >
                            ✕
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* AI Classification Results */}
                  {reportData.aiClassification && (
                    <div className="ai-results">
                      <h5 className="ai-results-title">🤖 AI Analysis Results:</h5>
                      <div className="ai-labels">
                        {reportData.aiClassification.labels.slice(0, 5).map((label, index) => (
                          <span key={index} className="ai-label">{label}</span>
                        ))}
                      </div>
                      <div className="ai-confidence">
                        Confidence: {(reportData.aiClassification.confidence * 100).toFixed(1)}%
                      </div>
                      {reportData.aiClassification.suggestedCategory && (
                        <div className="ai-suggestion">
                          Suggested Category: {reportData.aiClassification.suggestedCategory}
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Video Upload */}
                <div className="evidence-group">
                  <h4 className="evidence-title">Videos (GPS Tagged)</h4>
                  <div className="evidence-actions">
                    <button
                      type="button"
                      className="media-btn video-btn"
                      onClick={handleVideoCapture}
                      disabled={reportData.videos.length >= 1}
                    >
                      <span className="media-icon">🎥</span>
                      Record GPS Video
                    </button>
                    <span className="media-count">{reportData.videos.length}/1</span>
                  </div>
                  
                  <input
                    ref={videoInputRef}
                    type="file"
                    accept="video/*"
                    capture="environment"
                    onChange={handleVideoChange}
                    style={{ display: 'none' }}
                  />
                  
                  {reportData.videos.length > 0 && (
                    <div className="media-preview">
                      {reportData.videos.map((video, index) => (
                        <div key={index} className="video-preview">
                          <video controls>
                            <source src={URL.createObjectURL(video)} type={video.type} />
                          </video>
                          <button
                            type="button"
                            className="remove-media"
                            onClick={() => setReportData(prev => ({
                              ...prev,
                              videos: prev.videos.filter((_, i) => i !== index)
                            }))}
                          >
                            ✕
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Message Section */}
              <div className="form-section">
                <h3 className="section-title">💬 Describe the Issue</h3>
                
                {/* Message Type Selection */}
                <div className="message-type-selection">
                  <h4 className="message-title">Choose how to describe the problem:</h4>
                  <div className="message-type-options">
                    <button
                      type="button"
                      className={`message-type-btn ${reportData.messageType === 'text' ? 'active' : ''}`}
                      onClick={() => setReportData(prev => ({ 
                        ...prev, 
                        messageType: 'text',
                        voiceMessage: null 
                      }))}
                    >
                      <span className="message-type-icon">✍️</span>
                      Write Text
                    </button>
                    <button
                      type="button"
                      className={`message-type-btn ${reportData.messageType === 'voice' ? 'active' : ''}`}
                      onClick={() => setReportData(prev => ({ 
                        ...prev, 
                        messageType: 'voice',
                        textMessage: '' 
                      }))}
                    >
                      <span className="message-type-icon">🎙️</span>
                      Record Voice
                    </button>
                  </div>
                </div>

                {/* Text Message */}
                {reportData.messageType === 'text' && (
                  <div className="message-group">
                    <h4 className="message-title">Text Description</h4>
                    <textarea
                      placeholder="Describe the issue in detail. Include when you noticed it, how it affects you, and any other relevant information..."
                      value={reportData.textMessage}
                      onChange={(e) => setReportData(prev => ({
                        ...prev,
                        textMessage: e.target.value
                      }))}
                      className="text-message-input"
                      rows={5}
                    />
                  </div>
                )}

                {/* Voice Message with Language Selection */}
                {reportData.messageType === 'voice' && (
                  <div className="message-group">
                    <h4 className="message-title">Voice Message</h4>
                    
                    {/* Language Selection */}
                    <div className="language-selection">
                      <label htmlFor="language">Select Recording Language:</label>
                      <select
                        id="language"
                        value={reportData.selectedLanguage}
                        onChange={(e) => setReportData(prev => ({ 
                          ...prev, 
                          selectedLanguage: e.target.value,
                          voiceMessage: null // Reset voice message when language changes
                        }))}
                        className="language-select"
                      >
                        {VOICE_LANGUAGES.map(lang => (
                          <option key={lang.code} value={lang.code}>
                            {lang.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="voice-controls">
                      {!isRecording && !reportData.voiceMessage && (
                        <button
                          type="button"
                          className="voice-btn start-recording"
                          onClick={startVoiceRecording}
                        >
                          <span className="voice-icon">🎙️</span>
                          Start Recording in {VOICE_LANGUAGES.find(l => l.code === reportData.selectedLanguage)?.name}
                        </button>
                      )}
                      
                      {isRecording && (
                        <div className="recording-controls">
                          <button
                            type="button"
                            className="voice-btn stop-recording"
                            onClick={stopVoiceRecording}
                          >
                            <span className="voice-icon">⏹️</span>
                            Stop Recording
                          </button>
                          <span className="recording-time">{formatTime(recordingTime)}</span>
                          <div className="recording-indicator">
                            <span className="recording-dot"></span>
                            Recording in {VOICE_LANGUAGES.find(l => l.code === reportData.selectedLanguage)?.name}...
                          </div>
                        </div>
                      )}
                      
                      {reportData.voiceMessage && (
                        <div className="voice-message-preview">
                          <div className="voice-message-info">
                            <span>Language: {VOICE_LANGUAGES.find(l => l.code === reportData.selectedLanguage)?.name}</span>
                          </div>
                          <audio controls>
                            <source src={URL.createObjectURL(reportData.voiceMessage)} type="audio/wav" />
                          </audio>
                          <button
                            type="button"
                            className="remove-voice"
                            onClick={() => setReportData(prev => ({ ...prev, voiceMessage: null }))}
                          >
                            Remove & Re-record
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Submit Button */}
              <div className="submit-section">
                <button
                  type="button"
                  className={`btn-primary submit-btn ${isSubmitting ? 'loading' : ''}`}
                  onClick={handleSubmitReport}
                  disabled={isSubmitting || isAnalyzingImage}
                >
                  {isSubmitting ? (
                    <>
                      <span className="loading-spinner">⏳</span>
                      Submitting to Sub-Admin...
                    </>
                  ) : (
                    <>
                      Submit Report
                      <span className="btn-icon">📤</span>
                    </>
                  )}
                </button>
                
                {reportData.location && (
                  <p className="submit-info">
                    Report will be sent to: <strong>{reportData.location.block}</strong> Sub-Admin
                  </p>
                )}
              </div>
            </div>
          </div>
        </main>
      )}

      {/* Success Step */}
      {currentStep === 'success' && (
        <main className="success-section">
          <div className="success-container">
            <div className="success-content">
              <div className="success-icon">✅</div>
              <h1 className="success-title">Report Submitted Successfully!</h1>
              <p className="success-message">
                Your AI-analyzed report has been sent to the {reportData.location?.block || 'appropriate'} sub-admin for processing.
              </p>
              
              <div className="tracking-code-section">
                <h3 className="tracking-title">Your Tracking Code</h3>
                <div className="tracking-code">
                  <span className="code-text">{generatedCode}</span>
                  <button
                    className="copy-code-btn"
                    onClick={() => {
                      navigator.clipboard.writeText(generatedCode);
                      alert('Code copied to clipboard!');
                    }}
                  >
                    📋 Copy
                  </button>
                </div>
                <p className="tracking-instructions">
                  Save this code to track your complaint status. You can use it in the "Check Status" section.
                </p>
              </div>

              <div className="report-summary">
                <h3 className="summary-title">Report Summary</h3>
                <div className="summary-details">
                  <div className="summary-item">
                    <span className="summary-label">Issue:</span>
                    <span className="summary-value">{reportData.selectedIssue?.title}</span>
                  </div>
                  <div className="summary-item">
                    <span className="summary-label">Category:</span>
                    <span className="summary-value">{reportData.selectedIssue?.category}</span>
                  </div>
                  <div className="summary-item">
                    <span className="summary-label">Location:</span>
                    <span className="summary-value">{reportData.location?.address}</span>
                  </div>
                  <div className="summary-item">
                    <span className="summary-label">Block/Ward:</span>
                    <span className="summary-value">{reportData.location?.block} / {reportData.location?.ward}</span>
                  </div>
                  <div className="summary-item">
                    <span className="summary-label">Message Type:</span>
                    <span className="summary-value">
                      {reportData.messageType === 'voice' 
                        ? `Voice (${VOICE_LANGUAGES.find(l => l.code === reportData.selectedLanguage)?.name})`
                        : 'Text Description'
                      }
                    </span>
                  </div>
                  <div className="summary-item">
                    <span className="summary-label">AI Analysis:</span>
                    <span className="summary-value">
                      {reportData.aiClassification ? 
                        `Detected: ${reportData.aiClassification.labels[0]} (${(reportData.aiClassification.confidence * 100).toFixed(1)}% confidence)` 
                        : 'Not analyzed'
                      }
                    </span>
                  </div>
                  <div className="summary-item">
                    <span className="summary-label">Submitted:</span>
                    <span className="summary-value">{new Date().toLocaleString()}</span>
                  </div>
                  <div className="summary-item">
                    <span className="summary-label">Evidence:</span>
                    <span className="summary-value">
                      {reportData.photos.length} photo(s), {reportData.videos.length} video(s)
                      {reportData.voiceMessage && ', 1 voice message'}
                      {reportData.textMessage && ', text description'}
                    </span>
                  </div>
                </div>
              </div>

              <div className="next-steps">
                <h3 className="steps-title">What happens next?</h3>
                <div className="steps-list">
                  <div className="step-item">
                    <span className="step-number">1</span>
                    <span className="step-text">Report sent to {reportData.location?.block} sub-admin</span>
                  </div>
                  <div className="step-item">
                    <span className="step-number">2</span>
                    <span className="step-text">Sub-admin reviews AI classification and location data</span>
                  </div>
                  <div className="step-item">
                    <span className="step-number">3</span>
                    <span className="step-text">Issue assigned to relevant department for action</span>
                  </div>
                  <div className="step-item">
                    <span className="step-number">4</span>
                    <span className="step-text">You'll receive SMS updates and can track progress online</span>
                  </div>
                </div>
              </div>

              <div className="success-actions">
                <button
                  className="btn-primary"
                  onClick={() => navigate('/user/check-status')}
                >
                  Track This Complaint
                </button>
                <button
                  className="btn-secondary"
                  onClick={() => {
                    setCurrentStep('select');
                    setSelectedIssue('');
                    setReportData({
                      selectedIssue: null,
                      photos: [],
                      videos: [],
                      textMessage: '',
                      voiceMessage: null,
                      messageType: 'text',
                      selectedLanguage: 'hi-IN',
                      location: null,
                      userDetails: { name: '', aadhaar: '', phone: '' }
                    });
                  }}
                >
                  Report Another Issue
                </button>
                <button
                  className="btn-secondary"
                  onClick={() => navigate('/dashboard')}
                >
                  Back to Dashboard
                </button>
              </div>
            </div>
          </div>
        </main>
      )}
    </div>
  );
};

export default ComplainPage;
