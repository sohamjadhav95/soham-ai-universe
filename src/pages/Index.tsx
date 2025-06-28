
import { useState, useEffect } from 'react';
import { ChevronDown, Download, ExternalLink, Github, Linkedin, Mail, Phone, Twitter, Instagram, Facebook, Code } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';

const Index = () => {
  const [activeSection, setActiveSection] = useState('home');

  const skills = [
    { name: 'Python', level: 90 },
    { name: 'Machine Learning', level: 85 },
    { name: 'Deep Learning', level: 80 },
    { name: 'NLP', level: 85 },
    { name: 'TensorFlow', level: 80 },
    { name: 'PyTorch', level: 75 },
    { name: 'SQL', level: 85 },
    { name: 'Data Engineering', level: 75 }
  ];

  const projects = [
    {
      title: 'NexaOS Flow',
      description: 'Voice Activated OS Controller with natural language-driven automation using Speech Recognition, NLP, and TTS.',
      tech: ['Python', 'NLP', 'Speech Recognition', 'TTS'],
      type: 'AI Automation'
    },
    {
      title: 'Copilot for Data Science',
      description: 'AI agent that automates 90% of analytics workflows using natural language, AutoML, and intelligent query execution.',
      tech: ['Python', 'AutoML', 'NLP', 'Data Analytics'],
      type: 'AI Agent'
    },
    {
      title: 'Tennis Match Predictor',
      description: 'ML model with 77% accuracy predicting ATP tennis outcomes using Elo ratings, form, and fatigue analysis.',
      tech: ['XGBoost', 'LightGBM', 'Python', 'ML'],
      type: 'Machine Learning'
    }
  ];

  const socialLinks = [
    { name: 'GitHub', icon: Github, url: 'https://github.com/sohamjadhav95' },
    { name: 'LinkedIn', icon: Linkedin, url: 'https://linkedin.com/in/sohamjadhav95' },
    { name: 'Twitter', icon: Twitter, url: 'https://twitter.com/sohamjadhav95' },
    { name: 'Instagram', icon: Instagram, url: 'https://instagram.com/sohamjadhav95' },
    { name: 'Facebook', icon: Facebook, url: 'https://facebook.com/sohamjadhav95' },
    { name: 'LeetCode', icon: Code, url: 'https://leetcode.com/sohamjadhav95' }
  ];

  useEffect(() => {
    const handleScroll = () => {
      const sections = ['home', 'about', 'skills', 'projects', 'experience', 'contact'];
      const current = sections.find(section => {
        const element = document.getElementById(section);
        if (element) {
          const rect = element.getBoundingClientRect();
          return rect.top <= 100 && rect.bottom >= 100;
        }
        return false;
      });
      if (current) setActiveSection(current);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    element?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-slate-950 text-white">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-slate-950/80 backdrop-blur-md border-b border-slate-800">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div className="text-xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              SJ
            </div>
            <div className="hidden md:flex space-x-8">
              {['Home', 'About', 'Skills', 'Projects', 'Experience', 'Contact'].map((item) => (
                <button
                  key={item}
                  onClick={() => scrollToSection(item.toLowerCase())}
                  className={`text-sm font-medium transition-colors ${
                    activeSection === item.toLowerCase()
                      ? 'text-blue-400'
                      : 'text-gray-300 hover:text-white'
                  }`}
                >
                  {item}
                </button>
              ))}
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section id="home" className="min-h-screen flex items-center justify-center relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 to-purple-600/20 animate-pulse"></div>
        <div className="container mx-auto px-4 text-center relative z-10">
          <div className="mb-8">
            <div className="w-48 h-48 mx-auto mb-8 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 p-1">
              <div className="w-full h-full bg-slate-900 rounded-full flex items-center justify-center">
                <div className="text-6xl font-bold text-blue-400">SJ</div>
              </div>
            </div>
          </div>
          <h1 className="text-5xl md:text-7xl font-bold mb-6">
            Soham <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-teal-400 bg-clip-text text-transparent">Jadhav</span>
          </h1>
          <p className="text-xl md:text-2xl text-gray-300 mb-4">
            Aspiring AI Engineer | AI & ML Enthusiast
          </p>
          <p className="text-lg text-gray-400 mb-8 max-w-2xl mx-auto">
            AI Engineer in the making | Building AI solutions that work | Passionate about automation and innovation
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-3">
              <Download className="mr-2 h-4 w-4" />
              Download Resume
            </Button>
            <Button 
              variant="outline" 
              className="border-blue-400 text-blue-400 hover:bg-blue-400 hover:text-white px-8 py-3"
              onClick={() => scrollToSection('projects')}
            >
              View My Work
            </Button>
          </div>
          <div className="animate-bounce">
            <ChevronDown className="mx-auto h-6 w-6 text-gray-400" />
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="py-20 bg-slate-900/50">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl font-bold text-center mb-12">
            About <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">Me</span>
          </h2>
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <p className="text-lg text-gray-300 mb-6 leading-relaxed">
                I'm Soham Jadhav, a final-year AI & DS student with hands-on experience in building intelligent systems, 
                automating data workflows, and creating user-centric AI tools. I'm driven by curiosity and a deep interest 
                in Generative AI, NLP, and real-time AI applications.
              </p>
              <div className="space-y-4">
                <div>
                  <h3 className="text-xl font-semibold text-blue-400 mb-2">Education</h3>
                  <p className="text-gray-300">B.E in AI & DS – MET's Institute of Engineering, Nashik (2022–2026)</p>
                  <p className="text-gray-400">HSC Science – K.K. Wagh Vidyabhavan Junior College (2020–2022)</p>
                </div>
              </div>
            </div>
            <div>
              <h3 className="text-xl font-semibold text-blue-400 mb-4">Certifications</h3>
              <div className="space-y-3">
                <Card className="bg-slate-800 border-slate-700">
                  <CardContent className="p-4">
                    <p className="text-white font-medium">IBM: AI Engineering Professional Certificate</p>
                  </CardContent>
                </Card>
                <Card className="bg-slate-800 border-slate-700">
                  <CardContent className="p-4">
                    <p className="text-white font-medium">IBM: Deep Learning with PyTorch, Keras, TensorFlow</p>
                  </CardContent>
                </Card>
                <Card className="bg-slate-800 border-slate-700">
                  <CardContent className="p-4">
                    <p className="text-white font-medium">HackerRank: Python & SQL (Advanced)</p>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Skills Section */}
      <section id="skills" className="py-20">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl font-bold text-center mb-12">
            Skills & <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">Expertise</span>
          </h2>
          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {skills.map((skill, index) => (
              <div key={skill.name} className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-white font-medium">{skill.name}</span>
                  <span className="text-blue-400">{skill.level}%</span>
                </div>
                <Progress value={skill.level} className="h-2 bg-slate-800" />
              </div>
            ))}
          </div>
          <div className="mt-12">
            <h3 className="text-2xl font-semibold text-center mb-6 text-blue-400">Core Competencies</h3>
            <div className="flex flex-wrap justify-center gap-3">
              {['AI Agents', 'NLP', 'Deep Learning', 'RAG', 'ML Deployment', 'Statistics', 'AutoML', 'XAI', 'Data Engineering'].map((comp) => (
                <Badge key={comp} className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-2">
                  {comp}
                </Badge>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Projects Section */}
      <section id="projects" className="py-20 bg-slate-900/50">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl font-bold text-center mb-12">
            Featured <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">Projects</span>
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {projects.map((project, index) => (
              <Card key={index} className="bg-slate-800 border-slate-700 hover:border-blue-500 transition-colors">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-white">{project.title}</CardTitle>
                    <Badge className="bg-blue-600">{project.type}</Badge>
                  </div>
                  <CardDescription className="text-gray-300">
                    {project.description}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2 mb-4">
                    {project.tech.map((tech) => (
                      <Badge key={tech} variant="outline" className="text-blue-400 border-blue-400">
                        {tech}
                      </Badge>
                    ))}
                  </div>
                  <Button variant="outline" className="w-full border-blue-400 text-blue-400 hover:bg-blue-400 hover:text-white">
                    <ExternalLink className="mr-2 h-4 w-4" />
                    View Project
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Experience Section */}
      <section id="experience" className="py-20">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl font-bold text-center mb-12">
            <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">Experience</span>
          </h2>
          <div className="max-w-2xl mx-auto">
            <Card className="bg-slate-800 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white">Co-Lead – Google Developers Groups (GDG), Nashik</CardTitle>
                <CardDescription className="text-blue-400">Sept 2024 – Present</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="text-gray-300 space-y-2">
                  <li>• Organized sessions on AI & ML for the developer community</li>
                  <li>• Mentored peers on AI, ML, and Generative AI tools and technologies</li>
                  <li>• Led workshops and technical discussions on cutting-edge AI developments</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-20 bg-slate-900/50">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl font-bold text-center mb-12">
            Get In <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">Touch</span>
          </h2>
          <div className="max-w-4xl mx-auto grid md:grid-cols-2 gap-12">
            <div>
              <h3 className="text-2xl font-semibold mb-6 text-blue-400">Contact Information</h3>
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <Mail className="h-5 w-5 text-blue-400" />
                  <span className="text-gray-300">soham.ai.engineer@gmail.com</span>
                </div>
                <div className="flex items-center space-x-3">
                  <Phone className="h-5 w-5 text-blue-400" />
                  <span className="text-gray-300">+91 777-600-2086</span>
                </div>
              </div>
              <div className="mt-8">
                <h4 className="text-lg font-semibold mb-4 text-white">Connect with me</h4>
                <div className="flex space-x-4">
                  {socialLinks.map((link) => (
                    <a
                      key={link.name}
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-3 bg-slate-800 rounded-full hover:bg-blue-600 transition-colors"
                    >
                      <link.icon className="h-5 w-5" />
                    </a>
                  ))}
                </div>
              </div>
            </div>
            <div>
              <h3 className="text-2xl font-semibold mb-6 text-blue-400">Services</h3>
              <div className="space-y-3">
                {[
                  'AI & ML Model Development',
                  'Natural Language Processing Applications',
                  'Data Automation & Analytics Tools',
                  'AI Copilot and Workflow Agents'
                ].map((service) => (
                  <Card key={service} className="bg-slate-800 border-slate-700">
                    <CardContent className="p-4">
                      <p className="text-white">{service}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 bg-slate-950 border-t border-slate-800">
        <div className="container mx-auto px-4 text-center">
          <p className="text-gray-400">
            © 2024 Soham Jadhav. All rights reserved. Built with passion for AI and innovation.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
