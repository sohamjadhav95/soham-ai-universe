import { useState, useEffect } from 'react';
import { ChevronDown, Download, ExternalLink, Github, Linkedin, Mail, Phone, Twitter, Instagram, Facebook, Code } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';

const Index = () => {
  const [activeSection, setActiveSection] = useState('home');
  const [scrollY, setScrollY] = useState(0);

  const skills = [{
    name: 'Python',
    level: 95
  }, {
    name: 'Machine Learning',
    level: 85
  }, {
    name: 'Deep Learning',
    level: 80
  }, {
    name: 'NLP',
    level: 75
  }, {
    name: 'TensorFlow',
    level: 80
  }, {
    name: 'PyTorch',
    level: 75
  }, {
    name: 'Database',
    level: 75
  }, {
    name: 'Data Engineering',
    level: 75
  }];

  const projects = [{
    title: 'Copilot for Data Science',
    description: 'AI agent that automates 90% of analytics workflows using natural language, AutoML, and intelligent query execution.',
    tech: ['Python', 'AutoML', 'NLP', 'Data Analytics'],
    type: 'AI Agent',
    image: 'https://i.postimg.cc/023DDBFs/Screenshot-2025-06-29-135302.png',
    github: 'https://github.com/sohamjadhav95/Copilot-For-Data-Science'
  }, {
    title: 'NexaOS Flow',
    description: 'Voice Activated OS Controller with natural language-driven automation using Speech Recognition, NLP, and TTS.',
    tech: ['Python', 'NLP', 'Speech Recognition', 'TTS'],
    type: 'AI Automation',
    image: 'https://i.postimg.cc/VL74TghG/4799410.jpg',
    github: 'https://github.com/sohamjadhav95/Neuro-Intelligence'
  }, {
    title: 'Tennis Match Predictor',
    description: 'ML model with 77% accuracy predicting ATP tennis outcomes using Elo ratings, form, and fatigue analysis.',
    tech: ['XGBoost', 'LightGBM', 'Python', 'ML'],
    type: 'Machine Learning',
    image: 'https://i.postimg.cc/QMg7Lxt8/6396.jpg',
    github: 'https://github.com/sohamjadhav95/AI-Powered-Tennis-Match-Outcome-Predictor'
  }];

  const socialLinks = [{
    name: 'GitHub',
    icon: Github,
    url: 'https://github.com/sohamjadhav95'
  }, {
    name: 'LinkedIn',
    icon: Linkedin,
    url: 'https://linkedin.com/in/sohamjadhav95'
  }, {
    name: 'Twitter',
    icon: Twitter,
    url: 'https://x.com/sohamjadhav_95'
  }, {
    name: 'Instagram',
    icon: Instagram,
    url: 'https://instagram.com/sohamjadhav95'
  }, {
    name: 'Facebook',
    icon: Facebook,
    url: 'https://facebook.com/sohamjadhav95'
  }, {
    name: 'LeetCode',
    icon: Code,
    url: 'https://leetcode.com/sohamjadhav95'
  }];

  const certificates = [{
    title: 'IBM: AI Engineering Professional Certificate',
    status: 'Pursuing Professional Certification',
    image: null,
    verification: null
  }, {
    title: 'IBM: Deep Learning with PyTorch, Keras, TensorFlow',
    status: 'Completed',
    image: 'https://i.postimg.cc/CdyMLkPW/IBM-Deep-Learning-with-Py-Torch-Keras-and-Tensorflow.png',
    verification: 'https://coursera.org/verify/professional-cert/LT6ZHJY82CPB'
  }, {
    title: 'HackerRank: Python (Advanced)',
    status: 'Completed',
    image: 'https://i.postimg.cc/gjhXDYfb/python-basic-certificate.png',
    verification: null
  }, {
    title: 'HackerRank: SQL (Advanced)',
    status: 'Completed',
    image: 'https://i.postimg.cc/zD4TRQ91/sql-advanced-certificate.png',
    verification: null
  }, {
    title: 'Career Essentials in Generative AI by Microsoft and LinkedIn',
    status: 'Completed',
    image: 'https://i.postimg.cc/QCgNCV2C/Certificate-Of-Completion-Career-Essentials-in-Generative-AI-by-Microsoft-and-Linked-In.png',
    verification: null
  }];

  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY);
      const sections = ['home', 'about', 'skills', 'projects', 'featured', 'contact'];
      const current = sections.find(section => {
        const element = document.getElementById(section);
        if (element) {
          const rect = element.getBoundingClientRect();
          return rect.top <= 100 && rect.bottom >= 100;
        }
        return false;
      });
      if (current) setActiveSection(current);

      // Animate elements on scroll
      const animateElements = document.querySelectorAll('.scroll-animate');
      animateElements.forEach(element => {
        const rect = element.getBoundingClientRect();
        const isVisible = rect.top < window.innerHeight && rect.bottom > 0;
        if (isVisible) {
          element.classList.add('animate-fade-in');
          element.classList.remove('opacity-0', 'translate-y-8');
        }
      });
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    element?.scrollIntoView({
      behavior: 'smooth'
    });
  };

  return <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-slate-950 text-white overflow-x-hidden">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-transparent backdrop-blur-md border-b border-white/10 transition-all duration-300">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div className="text-xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent animate-pulse">
              SJ
            </div>
            <div className="hidden md:flex space-x-8">
              {['Home', 'About', 'Skills', 'Projects', 'Featured', 'Contact'].map(item => <button key={item} onClick={() => scrollToSection(item.toLowerCase())} className={`text-sm font-medium transition-all duration-300 hover:scale-110 ${activeSection === item.toLowerCase() ? 'text-blue-400 drop-shadow-lg font-semibold' : 'text-white/90 hover:text-blue-300'}`}>
                  {item}
                </button>)}
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section id="home" className="min-h-screen flex items-center justify-center relative overflow-hidden pt-20">
        {/* Animated Background */}
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 via-purple-600/20 to-teal-600/20 animate-pulse"></div>
          <div className="absolute inset-0 opacity-40" style={{
          transform: `translateY(${scrollY * 0.5}px)`,
          background: 'radial-gradient(circle at 20% 80%, rgba(120, 119, 198, 0.4) 0%, transparent 50%), radial-gradient(circle at 80% 20%, rgba(255, 119, 198, 0.4) 0%, transparent 50%), radial-gradient(circle at 40% 40%, rgba(0, 255, 255, 0.2) 0%, transparent 50%)'
        }}></div>
          {/* Floating particles */}
          <div className="absolute inset-0">
            {[...Array(6)].map((_, i) => <div key={i} className="absolute w-2 h-2 bg-blue-400/30 rounded-full animate-pulse" style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            animationDelay: `${i * 0.5}s`,
            animationDuration: `${3 + Math.random() * 2}s`
          }}></div>)}
          </div>
        </div>

        <div className="container mx-auto px-4 text-center relative z-10">
          {/* Profile Picture */}
          <div className="mb-12 scroll-animate opacity-0 translate-y-8 transition-all duration-1000 mt-8">
            <div className="relative w-56 h-56 mx-auto group">
              {/* Animated ring */}
              <div className="absolute inset-0 rounded-full bg-gradient-to-r from-blue-500 via-purple-500 to-teal-500 p-1 animate-spin" style={{
              animationDuration: '3s'
            }}>
                <div className="w-full h-full bg-slate-950 rounded-full"></div>
              </div>
              {/* Profile image */}
              <div className="absolute inset-2 rounded-full overflow-hidden bg-gradient-to-br from-blue-500/20 to-purple-500/20 backdrop-blur-sm border border-white/10 group-hover:scale-105 transition-all duration-500">
                <img src="https://i.postimg.cc/44ccsfZW/59.png" alt="Soham Jadhav - AI Engineer" className="w-full h-full object-cover rounded-full group-hover:scale-110 transition-transform duration-700" />
              </div>
              {/* Glowing effect */}
              <div className="absolute inset-0 rounded-full bg-gradient-to-r from-blue-500/30 to-purple-500/30 blur-xl opacity-50 group-hover:opacity-80 transition-opacity duration-500"></div>
            </div>
          </div>

          {/* Name and Title */}
          <div className="space-y-6">
            <h1 className="text-6xl md:text-8xl font-bold scroll-animate opacity-0 translate-y-8 transition-all duration-1000 delay-200">
              <span className="block">Soham</span>
              <span className="block bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                Jadhav
              </span>
            </h1>
            
            <div className="scroll-animate opacity-0 translate-y-8 transition-all duration-1000 delay-400">
              <p className="text-2xl md:text-3xl text-blue-300 font-semibold mb-2 tracking-wide">
                Aspiring AI Engineer
              </p>
              <p className="text-xl md:text-2xl text-purple-300 font-medium">
                AI & ML Enthusiast
              </p>
            </div>

            <p className="text-lg md:text-xl text-gray-300 mb-8 max-w-3xl mx-auto leading-relaxed scroll-animate opacity-0 translate-y-8 transition-all duration-1000 delay-600">        AI Engineer in the making | Building AI solutions that work
Passionate about AI and Innovation</p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-6 justify-center mb-16 scroll-animate opacity-0 translate-y-8 transition-all duration-1000 delay-800">
              <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-10 py-4 text-lg font-semibold transform hover:scale-110 hover:-translate-y-1 transition-all duration-300 shadow-lg hover:shadow-2xl hover:shadow-blue-500/25 border-0 backdrop-blur-sm">
                <Download className="mr-3 h-5 w-5" />
                Download Resume
              </Button>
              <Button variant="outline" className="border-2 border-blue-400/50 text-blue-400 hover:bg-blue-400/10 hover:border-blue-400 hover:text-blue-300 px-10 py-4 text-lg font-semibold transform hover:scale-110 hover:-translate-y-1 transition-all duration-300 backdrop-blur-sm bg-slate-800/20 hover:bg-slate-800/40" onClick={() => scrollToSection('projects')}>
                View My Work
              </Button>
            </div>

            {/* Scroll indicator */}
            <div className="scroll-animate opacity-0 translate-y-8 transition-all duration-1000 delay-1000">
              <div className="flex flex-col items-center space-y-2 animate-bounce">
                <span className="text-sm text-gray-400 tracking-widest uppercase">Scroll Down</span>
                <ChevronDown className="h-6 w-6 text-blue-400 animate-pulse" />
              </div>
            </div>
          </div>
        </div>

        {/* Decorative gradient orbs */}
        <div className="absolute top-20 left-20 w-32 h-32 bg-blue-500/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-20 w-40 h-40 bg-purple-500/20 rounded-full blur-3xl animate-pulse" style={{
        animationDelay: '1s'
      }}></div>
      </section>

      {/* About Section */}
      <section id="about" className="py-20 bg-slate-900/30 backdrop-blur-sm">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl font-bold text-center mb-12 scroll-animate opacity-0 translate-y-8 transition-all duration-1000">
            About <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">Me</span>
          </h2>
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="scroll-animate opacity-0 translate-y-8 transition-all duration-1000 delay-200">
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
            <div className="scroll-animate opacity-0 translate-y-8 transition-all duration-1000 delay-400">
              <h3 className="text-xl font-semibold text-blue-400 mb-4">Certifications</h3>
              <div className="space-y-3">
                {certificates.map((cert, index) => (
                  <Card key={cert.title} className="bg-slate-800/50 backdrop-blur-sm border-slate-700/50 hover:bg-slate-800/70 transition-all duration-300 transform hover:scale-105">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <p className="text-white font-medium text-sm">{cert.title}</p>
                          <p className="text-gray-400 text-xs mt-1">{cert.status}</p>
                        </div>
                        <div className="flex items-center gap-2 ml-4">
                          {cert.image && (
                            <img 
                              src={cert.image} 
                              alt={cert.title} 
                              className="w-12 h-12 object-cover rounded border border-slate-600"
                            />
                          )}
                          {cert.verification && (
                            <Button variant="outline" size="sm" asChild className="text-xs px-2 py-1 h-auto">
                              <a href={cert.verification} target="_blank" rel="noopener noreferrer">
                                Verify
                              </a>
                            </Button>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Skills Section */}
      <section id="skills" className="py-20">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl font-bold text-center mb-12 scroll-animate opacity-0 translate-y-8 transition-all duration-1000">
            Skills & <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">Expertise</span>
          </h2>
          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {skills.map((skill, index) => <div key={skill.name} className="space-y-3 scroll-animate opacity-0 translate-y-8 transition-all duration-1000" style={{
            transitionDelay: `${index * 100}ms`
          }}>
                <div className="flex justify-between">
                  <span className="text-white font-medium text-lg">{skill.name}</span>
                  <span className="text-cyan-400 font-bold text-lg">{skill.level}%</span>
                </div>
                <div className="relative">
                  <div className="h-4 bg-slate-800/70 backdrop-blur-sm rounded-full border border-slate-700/50 overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-500 transition-all duration-1000 ease-out rounded-full shadow-lg shadow-cyan-400/40" 
                      style={{ width: `${skill.level}%` }} 
                    />
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-r from-cyan-400/30 to-purple-500/30 rounded-full blur-sm pointer-events-none"></div>
                </div>
              </div>)}
          </div>
          {/* Core Competencies */}
          <div className="mt-12 scroll-animate opacity-0 translate-y-8 transition-all duration-1000 delay-800">
            <h3 className="text-2xl font-semibold text-center mb-6 text-blue-400">Core Competencies</h3>
            <div className="flex flex-wrap justify-center gap-3">
              {['AI Agents', 'NLP', 'Deep Learning', 'RAG', 'ML Deployment', 'Statistics', 'AutoML', 'XAI', 'Data Engineering'].map((comp, index) => <Badge key={comp} className="bg-gradient-to-r from-blue-600/80 to-purple-600/80 backdrop-blur-sm text-white px-4 py-2 hover:scale-110 transition-all duration-300" style={{
              animationDelay: `${index * 100}ms`
            }}>
                  {comp}
                </Badge>)}
            </div>
          </div>
        </div>
      </section>

      {/* Projects Section - Zigzag Layout */}
      <section id="projects" className="py-20 bg-slate-900/30 backdrop-blur-sm">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl font-bold text-center mb-16 scroll-animate opacity-0 translate-y-8 transition-all duration-1000">
            Featured <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">Projects</span>
          </h2>
          <div className="max-w-6xl mx-auto">
            {projects.map((project, index) => (
              <div key={project.title} className={`mb-20 scroll-animate opacity-0 translate-y-8 transition-all duration-1000 ${index % 2 === 0 ? '' : 'md:flex-row-reverse'}`} style={{
                transitionDelay: `${index * 200}ms`
              }}>
                <div className="grid md:grid-cols-2 gap-12 items-center">
                  {/* Project Image */}
                  <div className="relative overflow-hidden rounded-xl group">
                    <img 
                      src={project.image} 
                      alt={project.title} 
                      className="w-full h-80 object-cover transition-transform duration-500 group-hover:scale-110" 
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  </div>
                  
                  {/* Project Details */}
                  <div className="space-y-6">
                    <div className="flex items-center gap-3">
                      <h3 className="text-3xl font-bold text-white">{project.title}</h3>
                      <Badge className="bg-blue-600/80 backdrop-blur-sm text-white px-3 py-1">
                        {project.type}
                      </Badge>
                    </div>
                    <p className="text-gray-300 text-lg leading-relaxed">
                      {project.description}
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {project.tech.map(tech => (
                        <Badge key={tech} variant="outline" className="text-blue-400 border-blue-400/50 bg-slate-800/30 backdrop-blur-sm hover:bg-blue-400/20 transition-colors duration-300">
                          {tech}
                        </Badge>
                      ))}
                    </div>
                    <div className="flex gap-4">
                      <Button variant="outline" className="border-blue-400 text-blue-400 hover:bg-blue-400 hover:text-white transform hover:scale-105 transition-all duration-300 backdrop-blur-sm bg-slate-800/30" asChild>
                        <a href={project.github} target="_blank" rel="noopener noreferrer">
                          <Github className="mr-2 h-4 w-4" />
                          View Code
                        </a>
                      </Button>
                      <Button variant="outline" className="border-purple-400 text-purple-400 hover:bg-purple-400 hover:text-white transform hover:scale-105 transition-all duration-300 backdrop-blur-sm bg-slate-800/30">
                        <ExternalLink className="mr-2 h-4 w-4" />
                        Live Demo
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Section - Zigzag Layout */}
      <section id="featured" className="py-20">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl font-bold text-center mb-12 scroll-animate opacity-0 translate-y-8 transition-all duration-1000">
            <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">Featured</span>
          </h2>
          <div className="max-w-6xl mx-auto">
            <div className="grid md:grid-cols-2 gap-12 items-center scroll-animate opacity-0 translate-y-8 transition-all duration-1000 delay-200">
              {/* Featured Image/Visual */}
              <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-blue-500/20 to-purple-500/20 p-8 backdrop-blur-sm border border-slate-700/50">
                <div className="text-center">
                  <div className="w-32 h-32 mx-auto mb-6 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                    <span className="text-4xl font-bold text-white">GDG</span>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-center gap-2 text-blue-400">
                      <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
                      <span className="text-sm uppercase tracking-wide">Leadership Role</span>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Featured Details */}
              <div className="space-y-6">
                <Card className="bg-slate-800/50 backdrop-blur-sm border-slate-700/50 hover:bg-slate-800/70 transition-all duration-300 transform hover:scale-105">
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
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-20 bg-slate-900/30 backdrop-blur-sm">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl font-bold text-center mb-12 scroll-animate opacity-0 translate-y-8 transition-all duration-1000">
            Get In <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">Touch</span>
          </h2>
          <div className="max-w-4xl mx-auto grid md:grid-cols-2 gap-12">
            <div className="scroll-animate opacity-0 translate-y-8 transition-all duration-1000 delay-200">
              <h3 className="text-2xl font-semibold mb-6 text-blue-400">Contact Information</h3>
              <div className="space-y-4">
                <div className="flex items-center space-x-3 hover:text-blue-400 transition-colors duration-300">
                  <Mail className="h-5 w-5 text-blue-400" />
                  <span className="text-gray-300">soham.ai.engineer@gmail.com</span>
                </div>
                <div className="flex items-center space-x-3 hover:text-blue-400 transition-colors duration-300">
                  <Phone className="h-5 w-5 text-blue-400" />
                  <span className="text-gray-300">+91 777-600-2086</span>
                </div>
              </div>
              <div className="mt-8">
                <h4 className="text-lg font-semibold mb-4 text-white">Connect with me</h4>
                <div className="flex space-x-4">
                  {socialLinks.map((link, index) => <a key={link.name} href={link.url} target="_blank" rel="noopener noreferrer" className="p-3 bg-slate-800/50 backdrop-blur-sm rounded-full hover:bg-blue-600/80 transition-all duration-300 transform hover:scale-110 hover:rotate-6" style={{
                  animationDelay: `${index * 100}ms`
                }}>
                      <link.icon className="h-5 w-5" />
                    </a>)}
                </div>
              </div>
            </div>
            <div className="scroll-animate opacity-0 translate-y-8 transition-all duration-1000 delay-400">
              <h3 className="text-2xl font-semibold mb-6 text-blue-400">Areas of Interest</h3>
              <div className="space-y-3">
                {['Machine Learning & AI Research', 'Natural Language Processing', 'Computer Vision Applications', 'Generative AI & LLMs', 'Data Science & Analytics', 'AI-Powered Automation'].map((area, index) => <Card key={area} className="bg-slate-800/50 backdrop-blur-sm border-slate-700/50 hover:bg-slate-800/70 transition-all duration-300 transform hover:scale-105" style={{
                transitionDelay: `${index * 100}ms`
              }}>
                    <CardContent className="p-4">
                      <p className="text-white">{area}</p>
                    </CardContent>
                  </Card>)}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 bg-slate-950/80 backdrop-blur-sm border-t border-slate-800/50">
        <div className="container mx-auto px-4 text-center">
          <p className="text-gray-400 hover:text-gray-300 transition-colors duration-300">
            © 2024 Soham Jadhav. All rights reserved. Built with passion for AI and innovation.
          </p>
        </div>
      </footer>
    </div>;
};

export default Index;
