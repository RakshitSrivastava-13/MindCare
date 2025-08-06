import React from 'react';
import { Shield, Brain, Clock, Users, Lock, Heart } from 'lucide-react';

interface FeatureCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
}

const FeatureCard: React.FC<FeatureCardProps> = ({ icon, title, description }) => (
  <div className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow duration-300">
    <div className="flex items-start space-x-4">
      <div className="text-primary-600">{icon}</div>
      <div>
        <h3 className="text-lg font-semibold mb-2">{title}</h3>
        <p className="text-gray-600">{description}</p>
      </div>
    </div>
  </div>
);

export default function Features() {
  const features = [
    {
      icon: <Brain className="w-6 h-6" />,
      title: "AI-Powered Support",
      description: "24/7 access to our intelligent mental health assistant for immediate support and guidance."
    },
    {
      icon: <Shield className="w-6 h-6" />,
      title: "Professional Care",
      description: "Connect with licensed mental health professionals for personalized treatment plans."
    },
    {
      icon: <Clock className="w-6 h-6" />,
      title: "Flexible Scheduling",
      description: "Book appointments at your convenience with our easy-to-use scheduling system."
    },
    {
      icon: <Users className="w-6 h-6" />,
      title: "Support Groups",
      description: "Join community support groups and connect with others on similar journeys."
    },
    {
      icon: <Lock className="w-6 h-6" />,
      title: "Privacy First",
      description: "Your data is protected with enterprise-grade security and encryption."
    },
    {
      icon: <Heart className="w-6 h-6" />,
      title: "Holistic Approach",
      description: "Comprehensive mental health care that addresses your unique needs."
    }
  ];

  return (
    <section className="py-16 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 sm:text-4xl">
            Comprehensive Mental Health Support
          </h2>
          <p className="mt-4 text-xl text-gray-600">
            Experience the future of mental health care with our innovative platform
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <FeatureCard key={index} {...feature} />
          ))}
        </div>
      </div>
    </section>
  );
} 