import React from 'react';

const AboutPage: React.FC = () => {
  return (
    <main className="flex flex-col gap-8 items-center justify-center min-h-[50vh]">
      <div className="glass-panel p-8 max-w-[600px] w-full text-center">
        <h1 className="text-[2.5rem] font-extrabold mb-4">About Us</h1>
        <p className="text-text-light mb-8">Lost & Found Portal - IIM Bodhgaya.</p>
      </div>
    </main>
  );
};

export default AboutPage;
