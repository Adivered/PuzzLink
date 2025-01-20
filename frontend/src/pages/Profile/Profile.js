import React, { useRef } from 'react';
import { gsap } from 'gsap';
import { useSelector } from 'react-redux';
import useIsomorphicLayoutEffect from '../../hooks/useIsomorphicLayoutEffect';

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
    <div ref={profileRef} className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold mb-8">Profile</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className={`p-6 rounded-lg shadow-lg ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'}`}>
          <h2 className="text-2xl font-bold mb-4">User Information</h2>
          <p><strong>Name:</strong> {user.displayName}</p>
          <p><strong>Email:</strong> {user.email}</p>
        </div>
        <div className={`p-6 rounded-lg shadow-lg ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'}`}>
          <h2 className="text-2xl font-bold mb-4">Created Content</h2>
          <ul>
            {createdContent.map((content) => (
              <li key={content.id} className="mb-2">
                <strong>{content.title}</strong> - {content.type} ({content.date})
              </li>
            ))}
          </ul>
        </div>
        <div className={`p-6 rounded-lg shadow-lg ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'}`}>
          <h2 className="text-2xl font-bold mb-4">Previous Sessions</h2>
          <ul>
            {previousSessions.map((session) => (
              <li key={session.id} className="mb-2">
                <strong>{session.title}</strong> - Score: {session.score} ({session.date})
              </li>
            ))}
          </ul>
        </div>
        <div className={`p-6 rounded-lg shadow-lg ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'}`}>
          <h2 className="text-2xl font-bold mb-4">Friends</h2>
          <p>Feature coming soon!</p>
        </div>
      </div>
    </div>
  );
};

export default Profile;