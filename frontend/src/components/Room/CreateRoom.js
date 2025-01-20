import React, { useState, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { gsap } from 'gsap';
import { createRoom } from '../../store/roomSlice';
import { useNavigate } from 'react-router-dom';
import useIsomorphicLayoutEffect from '../../hooks/useIsomorphicLayoutEffect';

const CreateRoom = () => {
  const navigate = useNavigate();
  const [roomData, setRoomData] = useState({
    name: '',
    invites: [],
    timeLimit: 30,
    gameMode: 'Puzzle',
    turnBased: false,
    image: null,
    imagePrompt: ''
  });
  const [inviteEmail, setInviteEmail] = useState('');
  const theme = useSelector((state) => state.theme.current);
  const dispatch = useDispatch();
  const formRef = useRef(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useIsomorphicLayoutEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline();
      tl.from(formRef.current, {
        opacity: 0,
        scale: 0.9,
        duration: 0.5,
        ease: 'back.out(1.7)'
      });
      tl.to(formRef.current.children, {
        opacity: 1,
        duration: 0.5,
        stagger: 0.1,
        ease: 'power1.out'
      }, "-=0.3");
    }, formRef);

    return () => ctx.revert();
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked, files } = e.target;
    setRoomData(prevData => ({
      ...prevData,
      [name]: type === 'checkbox' ? checked : type === 'file' ? files[0] : value
    }));
  };

  const handleInvitePlayer = (e) => {
    e.preventDefault();
    if (inviteEmail) {
      setRoomData(prevData => ({
        ...prevData,
        invites: [...prevData.invites, inviteEmail]
      }));
      setInviteEmail('');
    }
  };

  const handleRemoveInvite = (index) => {
    setRoomData(prevData => ({
      ...prevData,
      invites: prevData.invites.filter((_, i) => i !== index)
    }));
  };

  const handleCreateRoom = async (e) => {
    e.preventDefault();
    if (isSubmitting) return;
    
    try {
      setIsSubmitting(true);
      const result = await dispatch(createRoom(roomData)).unwrap();
      console.log('Room created:', result);
      navigate(`/rooms/${result._id}`);

    } catch (error) {
      console.error('Failed to create room:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div ref={formRef} className={`p-6 rounded-lg shadow-lg ${theme === 'dark' ? 'bg-gray-800 text-white' : 'bg-white text-gray-800'}`}>
      <h2 className="text-2xl font-bold mb-4">Create Game Room</h2>
      <form onSubmit={handleCreateRoom}>
        <div className="mb-4">
          <label className="block mb-2">Room Name</label>
          <input
            type="text"
            name="name"
            value={roomData.name}
            onChange={handleChange}
            className={`w-full p-2 border rounded ${theme === 'dark' ? 'text-gray-800' : 'text-gray-800'}`}
            required
          />
        </div>
        <div className="mb-4">
          <label className="block mb-2">Invite Players</label>
          <div className="flex">
            <input
              type="email"
              value={inviteEmail}
              onChange={(e) => setInviteEmail(e.target.value)}
              className={`flex-grow p-2 border rounded-l ${theme === 'dark' ? 'text-gray-800' : 'text-gray-800'}`}
              placeholder="Enter player's email"
            />
            <button
              type="button"
              onClick={handleInvitePlayer}
              className={`bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-r ${theme === 'dark' ? 'text-gray-800' : 'text-gray-800'}`}
            >
              Invite
            </button>
          </div>
        </div>
        {roomData.invites.length > 0 && (
          <div className="mb-4">
            <h3 className="font-bold mb-2">Invited Players:</h3>
            <ul>
              {roomData.invites.map((invite, index) => (
                <li key={index} className="flex justify-between items-center mb-2">
                  <span>{invite}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveInvite(index)}
                    className="text-red-500 hover:text-red-700"
                  >
                    Remove
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}
        <div className="mb-4">
          <label className="block mb-2">Time Limit (minutes)</label>
          <input
            type="number"
            name="timeLimit"
            value={roomData.timeLimit}
            onChange={handleChange}
            className={`w-full p-2 border rounded ${theme === 'dark' ? 'text-gray-800' : 'text-gray-800'}`}
            min="5"
            max="180"
            required
          />
        </div>
        <div className="mb-4">
          <label className="block mb-2">Game Mode</label>
          <select
            name="gameMode"
            value={roomData.gameMode}
            onChange={handleChange}
            className={`w-full p-2 border rounded ${theme === 'dark' ? 'text-gray-800' : 'text-gray-800'}`}
          >
            <option value="Puzzle">Puzzle</option>
            <option value="DrawablePuzzle">Drawable Puzzle</option>
            <option value="Drawable">Drawable</option>
          </select>
        </div>
        <div className="mb-4">
          <label className="flex items-center">
            <input
              type="checkbox"
              name="turnBased"
              checked={roomData.turnBased}
              onChange={handleChange}
              className="mr-2"
            />
            Turn-based game
          </label>
        </div>
        <div className="mb-4">
          <label className="block mb-2">Upload Image</label>
          <input
            type="file"
            name="image"
            onChange={handleChange}
            accept="image/*"
            className={`w-full p-2 border rounded ${theme === 'dark' ? 'text-gray-800' : 'text-gray-800'}`}
          />
        </div>
        <div className="mb-4">
          <label className="block mb-2">Image Generation Prompt</label>
          <input
            type="text"
            name="imagePrompt"
            value={roomData.imagePrompt}
            onChange={handleChange}
            className={`w-full p-2 border rounded ${theme === 'dark' ? 'text-gray-800' : 'text-gray-800'}`}
            placeholder="Enter prompt for image generation"
          />
        </div>
        <button 
          type="submit" 
          className={`bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded ${isSubmitting ? 'opacity-50 cursor-not-allowed' : ''}`}
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Creating...' : 'Create Room'}
        </button>
      </form>
    </div>
  );
};

export default CreateRoom;