import React from 'react';
import Link from 'next/link';

export default function Home() {
  return (
    <div className="min-h-screen bg-black text-white">
      {/* Navigation */}
      <nav className="sticky top-0 bg-black/95 backdrop-blur border-b border-gray-800 z-50">
        <div className="max-w-6xl mx-auto px-6 py-4 flex justify-between items-center">
          <a href="/" className="text-xl font-bold">tomala</a>
          <div className="flex gap-8 text-sm">
            <a href="#about" className="hover:text-gray-400 transition">About</a>
            <a href="#projects" className="hover:text-gray-400 transition">Projects</a>
            <a href="#contact" className="hover:text-gray-400 transition">Contact</a>
            <a href="/to-do-list" className="hover:text-blue-400 transition">Tasks</a>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="max-w-6xl mx-auto px-6 py-32 text-center">
        <div className="space-y-6">
          <h1 className="text-6xl md:text-7xl font-bold">
            Tomasz Pyzik
          </h1>
          <p className="text-2xl text-gray-400">
            Student • Consultant • Builder
          </p>
          <p className="text-lg text-gray-500 max-w-2xl mx-auto">
            First-year IBEB student at EUR. Building Rotterdam Consulting Club. 
            Exploring fintech at Weegree. Aiming for BCG → HEC/LSE → MBB.
          </p>
          <div className="flex gap-4 justify-center pt-6">
            <a href="#contact" className="px-8 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg font-medium transition">
              Get in Touch
            </a>
            <a href="/tasks" className="px-8 py-3 border border-gray-600 hover:border-gray-400 rounded-lg font-medium transition">
              My Tasks
            </a>
          </div>
        </div>
      </section>

      {/* About */}
      <section id="about" className="bg-gray-900/50 py-24 border-t border-gray-800">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="text-4xl font-bold mb-12">About</h2>
          <div className="grid md:grid-cols-2 gap-12">
            <div>
              <h3 className="text-xl font-semibold mb-4 text-blue-400">Education</h3>
              <p className="text-gray-300 leading-relaxed">
                1st year IBEB student at Erasmus School of Economics (EUR) in Rotterdam. 
                Member of Faculty/School Council. Passionate about economics, strategy, and solving real problems.
              </p>
            </div>
            <div>
              <h3 className="text-xl font-semibold mb-4 text-blue-400">Current Focus</h3>
              <p className="text-gray-300 leading-relaxed">
                President of Rotterdam Consulting Club — building a premier consulting community at EUR. 
                Working on fintech automation at Weegree. Co-founding Lightboys. Targeting consulting internship at BCG.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Projects */}
      <section id="projects" className="py-24 border-t border-gray-800">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="text-4xl font-bold mb-12">What I'm Building</h2>
          <div className="grid md:grid-cols-2 gap-8">
            
            <div className="bg-gray-900/50 p-8 rounded-lg border border-gray-800 hover:border-gray-600 transition">
              <h3 className="text-xl font-bold mb-2">Rotterdam Consulting Club</h3>
              <p className="text-gray-400 mb-4">
                President & organizer. Building partnerships with top consulting firms, 
                recruiting talent, and creating a community for aspiring consultants.
              </p>
              <span className="text-sm text-blue-400">Leadership • Community</span>
            </div>

            <div className="bg-gray-900/50 p-8 rounded-lg border border-gray-800 hover:border-gray-600 transition">
              <h3 className="text-xl font-bold mb-2">Weegree</h3>
              <p className="text-gray-400 mb-4">
                Fintech automation. Building banking reconciliation systems and working on RAZ (Optima) project. 
                Real-world fintech experience.
              </p>
              <span className="text-sm text-blue-400">FinTech • Automation</span>
            </div>

            <div className="bg-gray-900/50 p-8 rounded-lg border border-gray-800 hover:border-gray-600 transition">
              <h3 className="text-xl font-bold mb-2">Lightboys Sp. z o.o.</h3>
              <p className="text-gray-400 mb-4">
                Co-founder. Building tech solutions and exploring entrepreneurship in Poland. 
                Learning how to scale from zero.
              </p>
              <span className="text-sm text-blue-400">Startups • Poland</span>
            </div>

            <div className="bg-gray-900/50 p-8 rounded-lg border border-gray-800 hover:border-gray-600 transition">
              <h3 className="text-xl font-bold mb-2">Lambert Magazine</h3>
              <p className="text-gray-400 mb-4">
                Co-editor of a Polish publication on economics and finance. 
                Weekly editorial meetings, shaping economic discourse.
              </p>
              <span className="text-sm text-blue-400">Media • Economics</span>
            </div>
          </div>
        </div>
      </section>

      {/* Contact */}
      <section id="contact" className="bg-gray-900/50 py-24 border-t border-gray-800">
        <div className="max-w-6xl mx-auto px-6 text-center">
          <h2 className="text-4xl font-bold mb-6">Let's Talk</h2>
          <p className="text-gray-400 mb-8 text-lg">
            Open to ideas, collaborations, and coffee chats in Rotterdam.
          </p>
          <div className="flex flex-col sm:flex-row gap-6 justify-center">
            <a 
              href="mailto:pyzik.tomek@gmail.com" 
              className="px-8 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg font-medium transition"
            >
              Email
            </a>
            <a 
              href="https://linkedin.com/in/tomaszpyzik" 
              target="_blank"
              rel="noopener noreferrer"
              className="px-8 py-3 border border-gray-600 hover:border-gray-400 rounded-lg font-medium transition"
            >
              LinkedIn
            </a>
            <a 
              href="/to-do-list" 
              className="px-8 py-3 border border-gray-600 hover:border-gray-400 rounded-lg font-medium transition"
            >
              My Tasks
            </a>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-800 py-12 text-center text-gray-500">
        <p>Built with ❤️ in Rotterdam</p>
      </footer>
    </div>
  );
}
