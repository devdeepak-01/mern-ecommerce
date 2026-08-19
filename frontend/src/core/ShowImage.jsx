import React, { useState } from 'react';
import { API } from '../config';

const ShowImage = ({ item, url = 'product', height = 220 }) => {
  const [imgError, setImgError] = useState(false);

  const getImageSrc = () => {
    if (item && item.imageUrl && item.imageUrl.trim() !== '') {
      return item.imageUrl.trim();
    }
    if (item && item._id) {
      return `${API}/${url}/photo/${item._id}`;
    }
    return '/images/image-placeholder.svg';
  };

  const handleImageError = () => {
    setImgError(true);
  };

  const imageSrc = getImageSrc();

  return (
    <div
      style={{
        width: '100%',
        height: `${height}px`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#F8F9FA',
        borderBottom: '1px solid #E1E5EA',
        overflow: 'hidden',
        borderRadius: '10px 10px 0 0',
        flexShrink: 0,
        position: 'relative',
      }}
    >
      {imgError || !imageSrc ? (
        // Clean fallback placeholder when image fails to load
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            color: '#CBD5E1',
          }}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="48"
            height="48"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#CBD5E1"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
            <circle cx="8.5" cy="8.5" r="1.5" />
            <polyline points="21 15 16 10 5 21" />
          </svg>
          <span style={{ fontSize: '11px', color: '#94A3B8', fontFamily: 'Inter, sans-serif' }}>
            No image
          </span>
        </div>
      ) : (
        <img
          src={imageSrc}
          alt={item?.name || 'Product image'}
          onError={handleImageError}
          style={{
            maxWidth: '100%',
            maxHeight: '100%',
            width: '100%',
            height: '100%',
            objectFit: 'contain',
            padding: '12px',
            boxSizing: 'border-box',
          }}
        />
      )}
    </div>
  );
};

export default ShowImage;
