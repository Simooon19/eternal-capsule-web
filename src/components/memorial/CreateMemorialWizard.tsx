import React, { useState } from 'react';
import { Memorial } from '@/types/memorial';

interface CreateMemorialWizardProps {
  onComplete: (memorialData: Partial<Memorial>) => void;
  onCancel: () => void;
}

interface Step1Data {
  title: string;
  subtitle?: string;
  bornAt: {
    date: string;
    location: string;
  };
  diedAt: {
    date: string;
    location: string;
  };
}

interface Step2Data {
  privacy: 'public' | 'link-only' | 'password-protected';
  password?: string;
  tags: string[];
}

interface Step3Data {
  storyBlocks: any[];
  galleryFiles: File[];
}

export default function CreateMemorialWizard({ onComplete, onCancel }: CreateMemorialWizardProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [step1Data, setStep1Data] = useState<Step1Data>({
    title: '',
    bornAt: { date: '', location: '' },
    diedAt: { date: '', location: '' }
  });
  const [step2Data, setStep2Data] = useState<Step2Data>({
    privacy: 'public',
    tags: []
  });
  const [step3Data, setStep3Data] = useState<Step3Data>({
    storyBlocks: [],
    galleryFiles: []
  });

  const availableTags = [
    'veteran', 'musician', 'teacher', 'artist', 'doctor', 
    'parent', 'grandparent', 'sports', 'volunteer', 'business-owner'
  ];

  const nextStep = () => {
    if (currentStep < 3) {
      setCurrentStep(currentStep + 1);
    } else {
      handleComplete();
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleComplete = () => {
    const memorialData: Partial<Memorial> = {
      title: step1Data.title,
      subtitle: step1Data.subtitle,
      bornAt: {
        location: step1Data.bornAt.location,
        coordinates: { lat: 0, lng: 0 }
      },
      diedAt: {
        location: step1Data.diedAt.location,
        coordinates: { lat: 0, lng: 0 }
      },
      privacy: step2Data.privacy,
      password: step2Data.password,
      tags: step2Data.tags,
      storyBlocks: step3Data.storyBlocks,
      gallery: [],
      status: 'draft',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    onComplete(memorialData);
  };

  const isStep1Valid = () => {
    return step1Data.title && 
           step1Data.bornAt.date && 
           step1Data.bornAt.location &&
           step1Data.diedAt.date && 
           step1Data.diedAt.location;
  };

  const isStep2Valid = () => {
    return step2Data.privacy !== 'password-protected' || step2Data.password;
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="p-6 border-b border-gray-200 dark:border-gray-600">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              Create Memorial
            </h2>
            <button
              onClick={onCancel}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          
          {/* Progress indicator */}
          <div className="flex items-center mt-4">
            {[1, 2, 3].map((step) => (
              <div key={step} className="flex items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  step <= currentStep 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-gray-200 dark:bg-gray-600 text-gray-600 dark:text-gray-300'
                }`}>
                  {step}
                </div>
                {step < 3 && (
                  <div className={`w-16 h-1 mx-2 ${
                    step < currentStep ? 'bg-blue-600' : 'bg-gray-200 dark:bg-gray-600'
                  }`} />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Step content */}
        <div className="p-6">
          {currentStep === 1 && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold mb-4">Basic Information</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      value={step1Data.title}
                      onChange={(e) => setStep1Data({ ...step1Data, title: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                      placeholder="Enter the full name"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Subtitle (optional)
                    </label>
                    <input
                      type="text"
                      value={step1Data.subtitle || ''}
                      onChange={(e) => setStep1Data({ ...step1Data, subtitle: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                      placeholder="Life motto or description"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <h4 className="font-medium mb-2">Birth Information</h4>
                      <div className="space-y-2">
                        <input
                          type="date"
                          value={step1Data.bornAt.date}
                          onChange={(e) => setStep1Data({
                            ...step1Data,
                            bornAt: { ...step1Data.bornAt, date: e.target.value }
                          })}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                        />
                        <input
                          type="text"
                          value={step1Data.bornAt.location}
                          onChange={(e) => setStep1Data({
                            ...step1Data,
                            bornAt: { ...step1Data.bornAt, location: e.target.value }
                          })}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                          placeholder="Birth location"
                        />
                      </div>
                    </div>

                    <div>
                      <h4 className="font-medium mb-2">Death Information</h4>
                      <div className="space-y-2">
                        <input
                          type="date"
                          value={step1Data.diedAt.date}
                          onChange={(e) => setStep1Data({
                            ...step1Data,
                            diedAt: { ...step1Data.diedAt, date: e.target.value }
                          })}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                        />
                        <input
                          type="text"
                          value={step1Data.diedAt.location}
                          onChange={(e) => setStep1Data({
                            ...step1Data,
                            diedAt: { ...step1Data.diedAt, location: e.target.value }
                          })}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                          placeholder="Death location"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {currentStep === 2 && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold mb-4">Privacy & Tags</h3>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Privacy Setting
                    </label>
                    <div className="space-y-2">
                      {[
                        { value: 'public', label: 'Public', desc: 'Anyone can find and view this memorial' },
                        { value: 'link-only', label: 'Link Only', desc: 'Only people with the link can view' },
                        { value: 'password-protected', label: 'Password Protected', desc: 'Requires a password to view' }
                      ].map((option) => (
                        <label key={option.value} className="flex items-start space-x-3 p-3 border border-gray-200 dark:border-gray-600 rounded-md cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700">
                          <input
                            type="radio"
                            name="privacy"
                            value={option.value}
                            checked={step2Data.privacy === option.value}
                            onChange={(e) => setStep2Data({ ...step2Data, privacy: e.target.value as any })}
                            className="mt-1"
                          />
                          <div>
                            <div className="font-medium">{option.label}</div>
                            <div className="text-sm text-gray-500 dark:text-gray-400">{option.desc}</div>
                          </div>
                        </label>
                      ))}
                    </div>
                  </div>

                  {step2Data.privacy === 'password-protected' && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Password *
                      </label>
                      <input
                        type="password"
                        value={step2Data.password || ''}
                        onChange={(e) => setStep2Data({ ...step2Data, password: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                        placeholder="Enter access password"
                      />
                    </div>
                  )}

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Tags (optional)
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      {availableTags.map((tag) => (
                        <label key={tag} className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            checked={step2Data.tags.includes(tag)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setStep2Data({ ...step2Data, tags: [...step2Data.tags, tag] });
                              } else {
                                setStep2Data({ ...step2Data, tags: step2Data.tags.filter(t => t !== tag) });
                              }
                            }}
                          />
                          <span className="text-sm capitalize">{tag.replace('-', ' ')}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {currentStep === 3 && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold mb-4">Content (Optional)</h3>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  You can add photos and stories now, or skip and add them later from the memorial page.
                </p>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Upload Photos
                    </label>
                    <input
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={(e) => setStep3Data({ ...step3Data, galleryFiles: Array.from(e.target.files || []) })}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                    />
                    {step3Data.galleryFiles.length > 0 && (
                      <p className="text-sm text-gray-500 mt-1">
                        {step3Data.galleryFiles.length} photo(s) selected
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-200 dark:border-gray-600 flex justify-between">
          <button
            onClick={prevStep}
            disabled={currentStep === 1}
            className="px-4 py-2 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Previous
          </button>
          
          <button
            onClick={nextStep}
            disabled={
              (currentStep === 1 && !isStep1Valid()) ||
              (currentStep === 2 && !isStep2Valid())
            }
            className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {currentStep === 3 ? 'Create Memorial' : 'Next'}
          </button>
        </div>
      </div>
    </div>
  );
}