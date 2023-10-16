"use client";
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import React, { use, useState } from 'react';

const featureData = [
  {
    imageUrl: '/image1.png',
    text: 'Organize: your unstructured data (e.g. docs, pdfs, etc.).',
  },
  {
    imageUrl: '/image2.png',
    text: 'Browse: zoom in and out for a global view.',
  },
  {
    imageUrl: '/image3.png',
    text: 'Ask: get answers based on your data. ',
  },
];

const teamMembers = [
  // Team members in the "Leads" group
  {
    group: 'Leads',
    name: 'Niloufar Salehi',
    imageUrl: '/niloufar.jpg',
    linkedinUrl: 'https://www.linkedin.com/in/niloufar-salehi/',
  },
  {
    group: 'Leads',
    name: 'Afshin Nikzad',
    imageUrl: '/afshin.jpg',
    linkedinUrl: 'https://www.linkedin.com/in/afshin-nikzad/',
  },
  // Team members in the "UX" group
  {
    group: 'UX',
    name: 'Ace Chen',
    imageUrl: '/ace.jpg',
    linkedinUrl: 'https://www.linkedin.com/in/aceschen/',
  },
  {
    group: 'UX',
    name: 'Manasvi Shah',
    imageUrl: '/manasvi.jpg',
    linkedinUrl: 'https://www.linkedin.com/in/manasvi-shah/',
  },
  {
    group: 'UX',
    name: 'Tarun Mugunthan',
    imageUrl: '/tarun.jpg',
    linkedinUrl: 'https://www.linkedin.com/in/tarun-mugunthan/',
  },
  // Team members in the "Engineering" group
  {
    group: 'Engineering',
    name: 'Dana Feng',
    imageUrl: '/dana.jpg',
    linkedinUrl: 'https://www.linkedin.com/in/dana-feng/',
  },
  {
    group: 'Engineering',
    name: 'Francis Geng',
    imageUrl: '/francis.jpg',
    linkedinUrl: 'https://www.linkedin.com/in/fgeng/',
  },
  {
    group: 'Engineering',
    name: 'Andrew Wang',
    imageUrl: '/andrew.jpg',
    linkedinUrl: 'https://www.linkedin.com/in/awang0708/',
  },
  {
    group: 'Engineering',
    name: 'Yash Dave',
    imageUrl: '/yash.jpg',
    linkedinUrl: 'https://www.linkedin.com/in/yashdave003/',
  },
];

export default function Landing() {
  const [email, setEmail] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const supabase = createClientComponentClient();

  const handleEmailChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(event.target.value);
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    setEmail(''); // Clear the input

    const { data, error } = await supabase.from('waiting_list').insert([{ email }]);

    if (error) {
      console.error('Error inserting email:', error.message);
    } else {
      console.log('Email inserted successfully:', data);
      setIsSubmitted(true);
    }
    setIsSubmitted(true);
  };



  return (
    <div className="container mx-auto p-4">
      <div className="flex">
        <img src="/Yodeai-text.png" alt="Yodeai Logo" className="w-1/4  " />
      </div>

      <div className="grid md:grid-cols-2 grid-cols-1 gap-4 mb-8 mt-8">

        <div>
          <div>
            <p>Transform information overload to knowledge power.</p>
            <br />
            <p>
              A large amount of essential information gets buried in unstructured data - from extensive PDFs to scattered meeting notes and one-off spreadsheets.
            </p><br />
            <p>
              Yodeai uses the latest genAI to help you:
            </p>
          </div>
        </div>


        <div>
          {isSubmitted ? (
            <p>Thanks for signing up! We'll notify you when we're able to give you access.</p>
          ) : (
            <form onSubmit={handleSubmit} className="flex">
              <div className="mb-4 flex-1 mr-4">
                <label htmlFor="email" className="block text-sm font-medium">
                  Email Address:
                </label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={handleEmailChange}
                  className="mt-1 p-2 border rounded w-full"
                  required
                />
              </div>
              <div className="flex">
                <button type="submit" className="p-2 bg-blue-700 text-white rounded self-center">
                  Sign Up for Early Access
                </button>
              </div>
            </form>
          )}
        </div>
      </div>


      <div className="grid md:grid-cols-3 gap-4 mt-16 grid-cols-1">
        {featureData.map((item, index) => (
          <div key={index} className="text-center">
            <img
              src={item.imageUrl}
              alt={`Feature ${index + 1}`}
              className="mx-auto h-64"
            />
            <p>{item.text}</p>
          </div>
        ))}
      </div>


      {/* Team section */}
      <div className="mt-8">
        <h2 className="text-2xl mb-4">Team</h2>

        <div className="grid grid-cols-3 gap-4">
          {['Leads', 'UX', 'Engineering'].map((group) => (
            <div key={group}>
              <h3 className="text-xl mb-2">{group}</h3>
              <div className="flex flex-wrap">
                {teamMembers
                  .filter((member) => member.group === group)
                  .map((member, index) => (
                    <div key={index} className="text-center mr-4 mb-4">
                      <a
                        href={member.linkedinUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <img
                          src={member.imageUrl}
                          alt={member.name}
                          className="mx-auto h-20 w-20 rounded-full mb-2"
                        />
                        <p>{member.name}</p>
                      </a>
                    </div>
                  ))}
              </div>
            </div>
          ))}
        </div>
      </div>
      <p>Past contributors: Kabir Goel, Aiste Cechaviciute, Meera Vinod</p>

    </div >
  );
};

