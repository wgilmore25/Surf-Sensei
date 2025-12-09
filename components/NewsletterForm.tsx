
import React, { useEffect } from 'react';

const NewsletterForm: React.FC = () => {
  useEffect(() => {
    // Load the Beehiiv embed script
    const script = document.createElement('script');
    script.src = "https://subscribe-forms.beehiiv.com/embed.js";
    script.async = true;
    document.body.appendChild(script);

    return () => {
      // Cleanup script if component unmounts
      if (document.body.contains(script)) {
        document.body.removeChild(script);
      }
    };
  }, []);

  return (
    <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl p-4 shadow-xl">
      <div className="text-center mb-2">
        <h3 className="text-lg font-bold text-cyan-300">Join the Tribe</h3>
        <p className="text-slate-400 text-xs mt-1">
          Weekly forecasts, AI tips, and local insights.
        </p>
      </div>
      <div className="w-full flex justify-center">
        <iframe 
          src="https://subscribe-forms.beehiiv.com/960ff8b1-ba61-4dc6-b360-a178f11453ad" 
          data-test-id="beehiiv-embed" 
          frameBorder="0" 
          scrolling="no" 
          className="beehiiv-embed"
          style={{
            margin: 0, 
            borderRadius: '0px', 
            backgroundColor: 'transparent', 
            width: '100%',
            minHeight: '300px' // Ensure enough height so input/button aren't cut off
          }}
          title="Newsletter Subscribe"
        />
      </div>
    </div>
  );
};

export default NewsletterForm;
