"use client";

import { useState } from 'react';

export default function ClientDialog({ trigger, children, title, description }) {
  const [isOpen, setIsOpen] = useState(false);
  
  const openDialog = () => setIsOpen(true);
  const closeDialog = () => setIsOpen(false);
  
  return (
    <>
      <div onClick={openDialog}>
        {trigger}
      </div>
      
      {isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg max-w-md w-full">
            {title && <h2 className="text-xl font-bold mb-2">{title}</h2>}
            {description && <p className="text-gray-600 mb-4">{description}</p>}
            
            <div className="mt-4">
              {typeof children === 'function' ? children({ close: closeDialog }) : children}
            </div>
            
            <div className="mt-6 flex justify-end">
              <button 
                onClick={closeDialog}
                className="px-4 py-2 bg-gray-200 rounded-md hover:bg-gray-300"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
