import React from 'react';

const AboutPage: React.FC = () => {
  return (
    <main className="flex flex-col items-center py-4">
      <div className="glass-panel p-6 md:p-12 max-w-[800px] w-full rounded-[24px]">
        <div className="text-center mb-10">
          <h1 className="text-[2.2rem] md:text-[3rem] font-extrabold mb-2 text-primary">About Lost & Found</h1>
          <p className="text-[1.2rem] font-bold text-secondary">Lost something? Found something? Let's bring it back home.</p>
        </div>

        <div className="flex flex-col gap-8 text-text-dark leading-relaxed text-[1.05rem]">
          <section>
            <p className="mb-4">
              Campus life moves fast. Between classes, library sessions, hostel life, and events, it's easy to misplace something important. Our Lost & Found Portal is designed to make finding lost belongings and returning found items easier for the IIM Bodh Gaya community.
            </p>
          </section>

          <section>
            <h2 className="text-[1.5rem] md:text-[1.8rem] font-extrabold text-primary mb-3">A Campus That Looks Out for Its Own</h2>
            <p className="mb-4">
              This platform provides a common place for students to report lost belongings, share details of items they've found, and browse listings to help reunite people with their possessions.
            </p>
            <p>
              Whether it's an ID card, a set of keys, a water bottle, a notebook, or something more valuable, every small effort to return a lost item makes our campus a little more connected.
            </p>
          </section>

          <section>
            <h2 className="text-[1.5rem] md:text-[1.8rem] font-extrabold text-primary mb-4">How It Works</h2>
            <div className="flex flex-col gap-5">
              <div>
                <h3 className="text-[1.2rem] font-bold text-primary">1. Report an Item</h3>
                <p>Lost something? Submit a report with its details, location, and an image if available. Found something? Post it on the portal to help its owner identify it.</p>
              </div>
              <div>
                <h3 className="text-[1.2rem] font-bold text-primary">2. Browse Listings</h3>
                <p>Explore reported lost and found items to see whether your missing belonging has been listed.</p>
              </div>
              <div>
                <h3 className="text-[1.2rem] font-bold text-primary">3. Connect and Coordinate</h3>
                <p>Use the available contact details to connect with the person who reported an item and coordinate its return.</p>
              </div>
              <div>
                <h3 className="text-[1.2rem] font-bold text-primary">4. Mark It as Collected</h3>
                <p>Once an item has been returned, the person who reported it can mark the listing as collected, keeping the portal up to date.</p>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-[1.5rem] md:text-[1.8rem] font-extrabold text-primary mb-3">Built for Our Campus</h2>
            <p className="mb-4">
              Designed around the needs of the IIM Bodh Gaya student community, the portal aims to make the process of reporting, finding, and returning belongings simple and accessible.
            </p>
            <p>
              By bringing scattered notices and word-of-mouth searches into one place, we hope to save time, reduce frustration, and encourage a stronger culture of responsibility and mutual support.
            </p>
          </section>

          <section className="bg-white/50 p-8 rounded-[20px] border border-white/80 text-center shadow-sm my-2">
            <h2 className="text-[1.5rem] md:text-[1.8rem] font-extrabold text-primary mb-3">Our Guiding Principle</h2>
            <p className="text-[1.3rem] font-extrabold text-[#e0a800] mb-4">Find it. Report it. Return it.</p>
            <p className="mb-4">
              A lost item may seem small, but returning it can make someone's entire day. Every report, every search, and every honest effort counts.
            </p>
            <p className="mb-4">
              Let's make IIM Bodh Gaya a campus where looking out for one another comes naturally.
            </p>
            <p className="font-extrabold text-primary text-[1.1rem]">One campus. One community. Nothing left behind.</p>
          </section>

          <hr className="border-t border-black/10 my-4" />

          <section>
            <h2 className="text-[2rem] font-extrabold text-primary mb-2 text-center">About the IT Committee</h2>
            <p className="text-[1.1rem] font-bold text-secondary text-center mb-8">Technology that brings our campus together.</p>
            <p className="mb-4">
              The IT Committee at IIM Bodh Gaya works towards enhancing the campus experience through technology, innovation, and digital solutions. By identifying everyday challenges and building practical tools, the committee aims to make campus life more seamless, connected, and efficient.
            </p>
            <p className="mb-4">
              The Lost & Found Portal is one such initiative — a simple, community-driven platform designed to help students report lost belongings, list items they have found, and reconnect misplaced possessions with their rightful owners.
            </p>
            <p className="mb-8">
              We believe technology is most meaningful when it solves real problems. Through initiatives like this, we strive to make everyday campus experiences a little easier, one solution at a time.
            </p>
            <div className="text-center">
              <span className="font-extrabold text-primary bg-primary/5 py-2 px-6 rounded-full inline-block">
                Built by the IT Committee, for the IIM Bodh Gaya community.
              </span>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
};

export default AboutPage;
