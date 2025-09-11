// components/CommunitiesPage.jsx
import React from 'react';

const CommunitiesPage = () => {
  return (
    <div className="min-h-screen bg-[#111111] text-white p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold">Communities</h1>
        <div className="flex space-x-4">
          <button className="flex items-center space-x-2 px-4 py-2 rounded-lg border border-gray-700 hover:bg-gray-800">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path></svg>
            <span>Preview</span>
          </button>
          <button className="flex items-center space-x-2 px-4 py-2 rounded-lg bg-purple-600 hover:bg-purple-700">
            <span>Update status</span>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
          </button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex border-b border-gray-700 mb-6">
        {['Curriculum', 'Settings', 'Pricing', 'Drip schedule'].map((tab) => (
          <button
            key={tab}
            className={`px-4 py-2 text-sm font-medium ${
              tab === 'Curriculum' ? 'border-b-2 border-purple-600 text-purple-600' : 'text-gray-400 hover:text-gray-200'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Main Content Area */}
      <div className="flex gap-6">
        {/* Left Sidebar - Curriculum */}
        <div className="w-1/3 bg-[#1C1C1C] rounded-lg p-4 max-h-[calc(100vh-180px)] overflow-y-auto custom-scrollbar">
          <h2 className="text-lg font-medium mb-4">Curriculum</h2>

          {/* Individual Section */}
          <div className="mb-4">
            <div className="flex justify-between items-center py-2 px-3 bg-gray-800 rounded-md mb-2">
              <span className="text-sm font-medium">Introduction To Monetizing on Instagram</span>
              <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
            </div>
            {/* Lessons within the section */}
            <div className="ml-4 space-y-2">
              {[
                'Priming Your IG Profile',
                'How to Grow Your Instagram...',
                'What NOT to Post on Instagram',
              ].map((lesson, index) => (
                <div key={index} className="flex items-center justify-between text-sm text-gray-300 py-1">
                  <div className="flex items-center space-x-2">
                    <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16m-7 6h7"></path></svg>
                    <span>{lesson}</span>
                  </div>
                  <svg className="w-4 h-4 text-gray-500 hover:text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                </div>
              ))}
              <button className="flex items-center space-x-2 text-purple-500 hover:text-purple-400 text-sm mt-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path></svg>
                <span>Add lesson</span>
              </button>
            </div>
          </div>

          {/* Another Section (TikTok / Reels Training) */}
          <div className="mb-4">
            <div className="flex justify-between items-center py-2 px-3 bg-gray-800 rounded-md mb-2 border border-purple-600">
              <span className="text-sm font-medium">Tik Tok / Reels Training</span>
              <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
            </div>
            <div className="ml-4 space-y-2">
              {[
                'How to Make a Tik Tok',
                'How to Create Viral TikTok/Re...',
                'How to Convert Videos into P...',
                'How to Increase Your Watch T...',
                'How to Convert Videos into P...',
                'How to Increase Your Watch T...',
              ].map((lesson, index) => (
                <div key={index} className="flex items-center justify-between text-sm text-gray-300 py-1">
                  <div className="flex items-center space-x-2">
                    <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16m-7 6h7"></path></svg>
                    <span>{lesson}</span>
                  </div>
                  <svg className="w-4 h-4 text-gray-500 hover:text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                </div>
              ))}
            </div>
          </div>

          {/* Bottom actions */}
          <div className="mt-6 flex justify-between">
            <button className="flex items-center space-x-2 px-4 py-2 rounded-lg border border-gray-700 text-purple-500 hover:bg-gray-800 text-sm">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path></svg>
              <span>Chapter</span>
            </button>
            <button className="flex items-center space-x-2 px-4 py-2 rounded-lg border border-gray-700 text-purple-500 hover:bg-gray-800 text-sm">
              <svg className="w-4 h-4 transform rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"></path></svg>
              <span>Upload content</span>
            </button>
          </div>
        </div>

        {/* Right Content Area - Lessons Details */}
        <div className="flex-1 bg-[#1C1C1C] rounded-lg p-6 relative">
          <h2 className="text-xl font-semibold mb-6">Lessons</h2>

          {/* Lesson Type Buttons */}
          <div className="grid grid-cols-3 gap-6 mb-8">
            <button className="flex flex-col items-center justify-center p-6 bg-gray-800 rounded-lg border border-purple-600 text-purple-600 hover:bg-gray-700">
              <svg className="w-8 h-8 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"></path></svg>
              <span>Video</span>
            </button>
            <button className="flex flex-col items-center justify-center p-6 bg-gray-800 rounded-lg border border-gray-700 text-gray-400 hover:bg-gray-700">
              <svg className="w-8 h-8 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 2H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
              <span>Text</span>
            </button>
            <button className="flex flex-col items-center justify-center p-6 bg-gray-800 rounded-lg border border-gray-700 text-gray-400 hover:bg-gray-700">
              <svg className="w-8 h-8 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 13h6m-3-3v6m5 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
              <span>PDF</span>
            </button>
          </div>

          {/* Upgrade Section */}
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-black bg-opacity-80 rounded-lg text-white">
            <p className="text-lg mb-6">Upragfe to unlock more lesson types</p>
            <button className="flex items-center space-x-2 px-6 py-3 rounded-full bg-purple-600 hover:bg-purple-700 font-semibold text-lg">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
              <span>Upgrade</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CommunitiesPage;
