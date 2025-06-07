import React, { useRef } from 'react';
import { gsap } from 'gsap';
import { useSelector } from 'react-redux';
import useIsomorphicLayoutEffect from '../../../hooks/useIsomorphicLayoutEffect';

const Profile = () => {
  const theme = useSelector((state) => state.theme.current);
  const { user } = useSelector((state) => state.auth);

  const profileRef = useRef(null);

  useIsomorphicLayoutEffect(() => {
    gsap.fromTo(profileRef.current.children, {
      opacity: 0,
      y: 20,
    }, {
      opacity: 1,
      y: 0,
      stagger: 0.1,
      duration: 0.5,
      ease: 'ease.in',
    });
  }, []);

  const createdContent = [
    { id: 1, title: 'Puzzle 1', type: 'Image Puzzle', date: '2023-05-01' },
    { id: 2, title: 'Puzzle 2', type: 'Path Game', date: '2023-05-05' },
    { id: 3, title: 'Puzzle 3', type: 'Drawable', date: '2023-05-10' },
  ];

  const previousSessions = [
    { id: 1, title: 'Game Room 1', date: '2023-05-02', score: 85 },
    { id: 2, title: 'Game Room 2', date: '2023-05-07', score: 92 },
    { id: 3, title: 'Game Room 3', date: '2023-05-12', score: 78 },
  ];

  return (
    <div className={`min-h-screen pt-24 pb-12 ${theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'}`}>
      <div ref={profileRef} className="container mx-auto px-4">
        <h1 className={`text-4xl font-bold mb-12 text-center ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
          Profile
        </h1>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-6xl mx-auto">
          <div className={`p-6 rounded-lg shadow-lg border transition-all duration-200 ${
            theme === 'dark' 
              ? 'bg-gray-800 border-gray-700 hover:border-gray-600' 
              : 'bg-white border-gray-200 hover:border-gray-300'
          }`}>
            <h2 className={`text-2xl font-bold mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              User Information
            </h2>
            <div className="space-y-3">
              <p className={theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}>
                <span className={`font-semibold ${theme === 'dark' ? 'text-blue-400' : 'text-blue-600'}`}>Name:</span> {user?.name || user?.displayName}
              </p>
              <p className={theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}>
                <span className={`font-semibold ${theme === 'dark' ? 'text-blue-400' : 'text-blue-600'}`}>Email:</span> {user?.email}
              </p>
            </div>
          </div>
          
          <div className={`p-6 rounded-lg shadow-lg border transition-all duration-200 ${
            theme === 'dark' 
              ? 'bg-gray-800 border-gray-700 hover:border-gray-600' 
              : 'bg-white border-gray-200 hover:border-gray-300'
          }`}>
            <h2 className={`text-2xl font-bold mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              Created Content
            </h2>
            <ul className="space-y-2">
              {createdContent.map((content) => (
                <li key={content.id} className={`p-3 rounded-md ${
                  theme === 'dark' ? 'bg-gray-700' : 'bg-gray-50'
                }`}>
                  <div className={`font-semibold ${theme === 'dark' ? 'text-green-400' : 'text-green-600'}`}>
                    {content.title}
                  </div>
                  <div className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                    {content.type} • {content.date}
                  </div>
                </li>
              ))}
            </ul>
          </div>
          
          <div className={`p-6 rounded-lg shadow-lg border transition-all duration-200 ${
            theme === 'dark' 
              ? 'bg-gray-800 border-gray-700 hover:border-gray-600' 
              : 'bg-white border-gray-200 hover:border-gray-300'
          }`}>
            <h2 className={`text-2xl font-bold mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              Previous Sessions
            </h2>
            <ul className="space-y-2">
              {previousSessions.map((session) => (
                <li key={session.id} className={`p-3 rounded-md ${
                  theme === 'dark' ? 'bg-gray-700' : 'bg-gray-50'
                }`}>
                  <div className="flex justify-between items-center">
                    <div className={`font-semibold ${theme === 'dark' ? 'text-purple-400' : 'text-purple-600'}`}>
                      {session.title}
                    </div>
                    <div className={`px-2 py-1 rounded-full text-xs font-semibold ${
                      session.score >= 90 
                        ? theme === 'dark' ? 'bg-green-900 text-green-300' : 'bg-green-100 text-green-800'
                        : session.score >= 80
                        ? theme === 'dark' ? 'bg-yellow-900 text-yellow-300' : 'bg-yellow-100 text-yellow-800'
                        : theme === 'dark' ? 'bg-red-900 text-red-300' : 'bg-red-100 text-red-800'
                    }`}>
                      {session.score}
                    </div>
                  </div>
                  <div className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                    {session.date}
                  </div>
                </li>
              ))}
            </ul>
          </div>
          
          <div className={`p-6 rounded-lg shadow-lg border transition-all duration-200 ${
            theme === 'dark' 
              ? 'bg-gray-800 border-gray-700 hover:border-gray-600' 
              : 'bg-white border-gray-200 hover:border-gray-300'
          }`}>
            <h2 className={`text-2xl font-bold mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              Friends
            </h2>
            <div className={`text-center py-8 ${
              theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
            }`}>
              <div className="text-4xl mb-4">👥</div>
              <p className="text-lg font-medium">Feature coming soon!</p>
              <p className="text-sm mt-2">Connect with friends to play together</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

/**
 * Profile Page component following Single Responsibility Principle
 * Displays user profile with proper theme integration and animations
 */
export const ProfilePage = () => {
  return <Profile />;
}; 