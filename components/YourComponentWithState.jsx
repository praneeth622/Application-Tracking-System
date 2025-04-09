"use client";

import { useState } from 'react';

export default function YourComponentWithState() {
  const [isOpen, setIsOpen] = useState(false);
  
  // Your component logic
  
  return (
    <div>
      <button onClick={() => setIsOpen(!isOpen)}>
        {isOpen ? 'Close' : 'Open'}
      </button>
      {isOpen && <div>Content shown when open</div>}
    </div>
  );
}
