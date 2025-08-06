"use client"

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { ChevronDown } from "lucide-react";
import Features from "./components/Features";

export default function HomePage() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative h-screen bg-[#232323]">
        <div className="absolute inset-0">
          <Image
            src="/images/hero-bg.jpg"
            alt="Mental Health Support"
            fill
            className="object-cover brightness-50"
            priority
          />
        </div>
        <div className="relative h-full flex flex-col justify-center px-8 max-w-6xl mx-auto">
          <h1 className="text-5xl md:text-6xl text-white font-serif mb-6">
            Transform Your Mental<br />Health Journey Today
          </h1>
          <p className="text-white/90 text-xl max-w-2xl mb-8">
            Begin your path to emotional well-being with our innovative mental health platform. Experience personalized support that adapts to your unique needs.
          </p>
          <div className="flex gap-4">
            <button className="px-8 py-3 bg-white text-black rounded-full hover:bg-gray-100 transition">
              Learn More
            </button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-[#b9939b]">
        <div className="max-w-6xl mx-auto px-8">
          <h2 className="text-3xl text-center text-white font-serif mb-16">
            Discover the Essential Features of Our Mental Health Platform
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <Image
                src="/images/support.jpg"
                alt="24/7 Support"
                width={400}
                height={300}
                className="w-full h-64 object-cover rounded-lg mb-6"
              />
              <h3 className="text-xl text-white font-serif mb-4">Your 24/7 Companion for Mental Health Support and Guidance</h3>
              <p className="text-white/90 mb-6">Access professional mental health support anytime, anywhere. Our AI-powered companion is here to listen, guide, and support you through your journey.</p>
              <button className="text-white border border-white px-6 py-2 rounded-full hover:bg-white hover:text-[#b9939b] transition">
                Learn More →
              </button>
            </div>
            <div className="text-center">
              <Image
                src="/images/conversation.jpg"
                alt="Personalized Care"
                width={400}
                height={300}
                className="w-full h-64 object-cover rounded-lg mb-6"
              />
              <h3 className="text-xl text-white font-serif mb-4">Experience Tailored Conversations for Your Unique Needs</h3>
              <p className="text-white/90 mb-6">Every conversation is personalized to your specific needs and concerns. Get customized support that evolves with your mental health journey.</p>
              <Link href="/auth" className="text-white border border-white px-6 py-2 rounded-full hover:bg-white hover:text-[#b9939b] transition">
                Sign Up →
              </Link>
            </div>
            <div className="text-center">
              <Image
                src="/images/privacy.jpg"
                alt="Privacy"
                width={400}
                height={300}
                className="w-full h-64 object-cover rounded-lg mb-6"
              />
              <h3 className="text-xl text-white font-serif mb-4">Confidentiality You Can Trust for Peace of Mind</h3>
              <p className="text-white/90 mb-6">Your privacy matters. All conversations are encrypted and confidential, ensuring a safe space for you to express yourself freely.</p>
              <button className="text-white border border-white px-6 py-2 rounded-full hover:bg-white hover:text-[#b9939b] transition">
                Get Started →
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Split Section */}
      <section className="py-20 bg-white">
        <div className="max-w-6xl mx-auto px-8">
          <div className="flex flex-col md:flex-row items-center gap-12">
            <div className="flex-1">
              <span className="text-sm font-semibold text-gray-600">Empower</span>
              <h2 className="text-3xl font-serif mb-6">Unlock Your Path to Better Mental Health</h2>
              <p className="text-gray-600 mb-8">
                Our mental health platform offers a comprehensive approach to emotional well-being. Experience personalized support that adapts to your unique needs.
              </p>
              <div className="grid grid-cols-2 gap-8 mb-8">
                <div>
                  <h4 className="font-bold mb-2">Instant Support</h4>
                  <p className="text-gray-600">Get immediate assistance whenever you need it.</p>
                </div>
                <div>
                  <h4 className="font-bold mb-2">Live Chat</h4>
                  <p className="text-gray-600">Connect with professionals in real-time.</p>
                </div>
              </div>
              <div className="flex gap-4">
                <button className="px-6 py-2 border border-black rounded-full hover:bg-gray-100 transition">
                  Learn More
                </button>
                <Link href="/auth" className="px-6 py-2 bg-black text-white rounded-full hover:bg-gray-800 transition">
                  Sign Up
                </Link>
              </div>
            </div>
            <div className="flex-1">
              <Image
                src="/images/chat-interface.jpg"
                alt="Chat Interface"
                width={600}
                height={400}
                className="rounded-lg shadow-xl"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-6xl mx-auto px-8">
          <h2 className="text-3xl text-center font-serif mb-4">
            Comprehensive Mental Health Services<br />for You
          </h2>
          <p className="text-center text-gray-600 mb-16 max-w-3xl mx-auto">
            Our services include a friendly chatbot for immediate support and easy access to professional doctor appointments. 
            We prioritize your mental well-being with convenient solutions tailored to your needs.
          </p>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                title: 'Chatbot Support Available 24/7',
                description: 'Get instant responses and guidance at any time.',
                image: '/images/chatbot.jpg',
                action: 'Learn More'
              },
              {
                title: 'Schedule Appointments with Qualified Professionals',
                description: 'Book your visit with our experienced doctors.',
                image: '/images/appointment.jpg',
                action: 'Book Now'
              },
              {
                title: 'Personalized Care Tailored to Your Needs',
                description: 'Experience care designed just for you.',
                image: '/images/personalized.jpg',
                action: 'Learn More'
              }
            ].map((service, index) => (
              <div key={index} className="bg-white rounded-xl shadow-lg p-8">
                <Image
                  src={service.image}
                  alt={service.title}
                  width={400}
                  height={300}
                  className="w-full h-48 object-cover rounded-lg mb-6"
                />
                <h3 className="text-xl font-serif mb-4">{service.title}</h3>
                <p className="text-gray-600 mb-6">{service.description}</p>
                <button className="px-6 py-2 border border-black rounded-full hover:bg-gray-100 transition">
                  {service.action}
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Timeline Section */}
      <section className="py-20 bg-white text-center">
        <div className="max-w-4xl mx-auto px-8">
          <div className="flex items-center justify-center mb-8">
            <Image
              src="/images/timeline.png"
              alt="Timeline"
              width={40}
              height={40}
              className="rounded-full"
            />
          </div>
          <p className="text-xl italic mb-4">
            "Your first step to a stronger mental health is by having a strong support system. Let us be yours."
          </p>
          <p className="text-gray-600">Mental Health Platform</p>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-[#1e3a5f] text-white">
        <div className="max-w-4xl mx-auto px-8 text-center">
          <h2 className="text-3xl font-serif mb-6">Take the First Step</h2>
          <p className="mb-8">Start your journey to better mental health by making connections with our platform and team.</p>
          <div className="flex justify-center gap-4">
            <button className="px-8 py-3 bg-white text-[#1e3a5f] rounded-full hover:bg-gray-100 transition">
              Get Started
            </button>
            <button className="px-8 py-3 border border-white rounded-full hover:bg-white/10 transition">
              Learn More
            </button>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 bg-white">
        <div className="max-w-4xl mx-auto px-8">
          <h2 className="text-3xl mb-12">FAQs</h2>
          <div className="space-y-6">
            {[
              {
                question: 'How does the chatbot work?',
                answer: 'Our AI-powered chatbot uses advanced natural language processing to understand your needs and provide relevant support and guidance. It\'s available 24/7 and can help with various mental health concerns.'
              },
              {
                question: 'Is my data confidential?',
                answer: 'Yes, we take privacy very seriously. All conversations are encrypted and stored securely. Your personal information is never shared without your explicit consent.'
              },
              {
                question: 'What if I need help?',
                answer: 'If you need immediate assistance, our support team is available 24/7. For emergencies, please contact your local emergency services or crisis hotline.'
              },
              {
                question: 'Can I use insurance?',
                answer: 'Yes, we accept most major insurance providers. Contact our support team to verify your coverage and learn about payment options.'
              }
            ].map((faq, index) => (
              <div key={index} className="border-b border-gray-200 pb-6">
                <button className="w-full flex items-center justify-between text-left">
                  <span className="text-lg font-medium">{faq.question}</span>
                  <ChevronDown className="w-5 h-5" />
                </button>
                <p className="mt-4 text-gray-600">{faq.answer}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Newsletter Section */}
      <section className="py-12 bg-black text-white">
        <div className="max-w-6xl mx-auto px-8 flex justify-between items-center">
          <h3 className="text-lg">Stay Informed on Mental Health</h3>
          <div className="flex gap-4">
            <input
              type="email"
              placeholder="Enter your email"
              className="px-4 py-2 rounded-full bg-white/10 border border-white/20 text-white placeholder-white/60"
            />
            <button className="px-6 py-2 bg-white text-black rounded-full hover:bg-gray-100 transition">
              Subscribe
            </button>
          </div>
        </div>
      </section>
    </div>
  );
} 