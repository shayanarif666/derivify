// src/components/About.jsx
import React from "react";
import { FiLinkedin, FiMail, FiExternalLink } from "react-icons/fi";
import Header from "./Header";
import Footer from "./Footer";
import shayan from "../../public/shayan.png"

export default function About() {
  return (
    <>
      <div className="min-h-screen bg-slate-950 text-slate-100 selection:bg-blue-600/30">
        <Header />
        <section className="relative text-slate-100 h-full md:h-[85vh] flex items-center md:pb-0 pb-16">
          {/* top accent */}
          <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />

          <div className="mx-auto max-w-6xl px-4 py-14 lg:py-20">
            <div className="grid items-center gap-10 lg:grid-cols-12">
              {/* LEFT: intro */}
              <div className="lg:col-span-7">
                <span className="inline-block rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-slate-300">
                  About Me
                </span>

                <h1 className="mt-4 text-3xl font-bold tracking-tight sm:text-4xl">
                  Muhammad Shayan
                </h1>

                <p className="mt-2 text-sm text-slate-400">
                  MERN Stack Developer · JavaScript · React.js · Node.js · Express · MongoDB
                </p>

                <p className="mt-6 text-base leading-relaxed text-slate-300">
                  MERN Stack developer with over 1 year of experienced focused on building clean, user-friendly
                  interfaces and pragmatic backends. Recently, I completed a comprehensive MERN program
                  and have been sharpening my skills through real-world projects—turning product ideas
                  into working, maintainable web apps.
                </p>

                <p className="mt-4 text-base leading-relaxed text-slate-300">
                  My toolkit centers on <span className="font-semibold text-slate-100">React</span> for
                  fast, accessible UIs and <span className="font-semibold text-slate-100">Node/Express</span> for
                  APIs, with <span className="font-semibold text-slate-100">MongoDB</span> for data. I care about
                  component reuse, predictable state, REST best practices, and readable code. I’m actively
                  open to internships, freelance work, and collaboration.
                </p>

                {/* CTA */}
                <div className="mt-6 flex flex-wrap gap-3">
                  <a
                    href="https://www.linkedin.com/in/muhammad-shayan-5ba479302/"
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-500"
                  >
                    <FiLinkedin className="-ml-0.5" />
                    Connect on LinkedIn
                  </a>

                  <a
                    href="mailto:shayanarif666@gmail.com"
                    className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-slate-200 hover:bg-white/10"
                  >
                    <FiMail className="-ml-0.5" />
                    Email Me
                  </a>
                </div>

                {/* Skills */}
                <div className="mt-8">
                  <h2 className="text-sm font-semibold text-slate-200">Core Skills</h2>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {[
                      "JavaScript (ES6+)",
                      "React.js",
                      "Node.js",
                      "Express",
                      "MongoDB",
                      "REST APIs",
                      "Tailwind CSS",
                      "Git & GitHub",
                    ].map((tag) => (
                      <span
                        key={tag}
                        className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-slate-300"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* RIGHT: avatar / card */}
              <div className="lg:col-span-5">
                <div className="relative mx-auto max-w-sm rounded-2xl border border-white/10 bg-slate-900 p-6 shadow-xl shadow-black/30">
                  <div className="">
                    <img src={shayan} alt="" className="object-contain" />
                  </div>
                  <div className="mt-4 space-y-1">
                    <p className="text-lg font-semibold text-slate-100">
                      MERN Stack Developer
                    </p>
                    <p className="text-sm text-slate-400">
                      Crafting usable UI, clean APIs, and scalable MongoDB schemas.
                    </p>
                  </div>
                  <div className="mt-4 flex flex-wrap gap-2 text-xs text-slate-400">
                    <span className="rounded-full bg-white/5 px-2 py-1">React</span>
                    <span className="rounded-full bg-white/5 px-2 py-1">Node</span>
                    <span className="rounded-full bg-white/5 px-2 py-1">Express</span>
                    <span className="rounded-full bg-white/5 px-2 py-1">MongoDB</span>
                    <span className="rounded-full bg-white/5 px-2 py-1">Tailwind</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* bottom accent */}
          <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
        </section>
        <Footer />
      </div>
    </>
  );
}
