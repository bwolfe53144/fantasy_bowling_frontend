import { useState, useEffect } from 'react';
import '../src/styles/LoadingScreen.css';

const LoadingScreen = () => {
  const images = [
    '/infinitephysix.png',
    '/rockstar.png',
    '/venomshock.png',
    '/ultimateinferno.png',
    '/3doffsetsolid.png',
    '/protonphysix.png',
    '/realitycheck.png',
    '/phase2.png'
  ];

  const [selectedImage] = useState(() => {
    const index = Math.floor(Math.random() * images.length);
    return images[index];
  });

  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const img = new Image();
    img.src = selectedImage;
    img.onload = () => setIsLoaded(true);
  }, [selectedImage]);

  if (!isLoaded) {
    // Optionally, you can return a small spinner or nothing
    return (
      <div className="loadImgContainer">
        <div>Loading ...</div>
      </div>
    );
  }

  return (
    <div className="loadImgContainer">
      <img className="loadImg" src={selectedImage} alt="bowling ball" />
      <div style={{ marginTop: '30px' }}>Loading ...</div>
    </div>
  );
};

export default LoadingScreen;