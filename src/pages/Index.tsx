
import { useState, useEffect } from 'react';
import { ChevronDown, Download, ExternalLink, Github, Linkedin, Mail, Phone, Twitter, Instagram, Facebook, Code } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';

const Index = () => {
  const [activeSection, setActiveSection] = useState('home');
  const [scrollY, setScrollY] = useState(0);

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
      type: 'AI Automation',
      image: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=800&h=400&fit=crop'
    },
    {
      title: 'Copilot for Data Science',
      description: 'AI agent that automates 90% of analytics workflows using natural language, AutoML, and intelligent query execution.',
      tech: ['Python', 'AutoML', 'NLP', 'Data Analytics'],
      type: 'AI Agent',
      image: 'https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=800&h=400&fit=crop'
    },
    {
      title: 'Tennis Match Predictor',
      description: 'ML model with 77% accuracy predicting ATP tennis outcomes using Elo ratings, form, and fatigue analysis.',
      tech: ['XGBoost', 'LightGBM', 'Python', 'ML'],
      type: 'Machine Learning',
      image: 'https://images.unsplash.com/photo-1488590528505-98d2b5aba04b?w=800&h=400&fit=crop'
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
      setScrollY(window.scrollY);
      
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
    element?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-slate-950 text-white overflow-x-hidden">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-slate-950/70 backdrop-blur-xl border-b border-slate-800/50 transition-all duration-300">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div className="text-xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent animate-pulse">
              SJ
            </div>
            <div className="hidden md:flex space-x-8">
              {['Home', 'About', 'Skills', 'Projects', 'Experience', 'Contact'].map((item) => (
                <button
                  key={item}
                  onClick={() => scrollToSection(item.toLowerCase())}
                  className={`text-sm font-medium transition-all duration-300 hover:scale-110 ${
                    activeSection === item.toLowerCase()
                      ? 'text-blue-400 drop-shadow-lg'
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
        <div 
          className="absolute inset-0 opacity-30"
          style={{
            transform: `translateY(${scrollY * 0.5}px)`,
            background: 'radial-gradient(circle at 20% 80%, rgba(120, 119, 198, 0.3) 0%, transparent 50%), radial-gradient(circle at 80% 20%, rgba(255, 119, 198, 0.3) 0%, transparent 50%)',
          }}
        ></div>
        <div className="container mx-auto px-4 text-center relative z-10">
          <div className="mb-8 scroll-animate opacity-0 translate-y-8 transition-all duration-1000">
            <div className="w-48 h-48 mx-auto mb-8 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 p-1 animate-scale-in hover:scale-110 transition-transform duration-500">
              <div className="w-full h-full bg-slate-900/80 backdrop-blur-sm rounded-full flex items-center justify-center">
                <div className="text-6xl font-bold text-blue-400 animate-fade-in">SJ</div>
              </div>
            </div>
          </div>
          <h1 className="text-5xl md:text-7xl font-bold mb-6 scroll-animate opacity-0 translate-y-8 transition-all duration-1000 delay-200">
            Soham <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-teal-400 bg-clip-text text-transparent animate-pulse">Jadhav</span>
          </h1>
          <p className="text-xl md:text-2xl text-gray-300 mb-4 scroll-animate opacity-0 translate-y-8 transition-all duration-1000 delay-400">
            Aspiring AI Engineer | AI & ML Enthusiast
          </p>
          <p className="text-lg text-gray-400 mb-8 max-w-2xl mx-auto scroll-animate opacity-0 translate-y-8 transition-all duration-1000 delay-600">
            AI Engineer in the making | Building AI solutions that work | Passionate about automation and innovation
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12 scroll-animate opacity-0 translate-y-8 transition-all duration-1000 delay-800">
            <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-3 transform hover:scale-110 transition-all duration-300 shadow-lg hover:shadow-2xl">
              <Download className="mr-2 h-4 w-4" />
              Download Resume
            </Button>
            <Button 
              variant="outline" 
              className="border-blue-400 text-blue-400 hover:bg-blue-400 hover:text-white px-8 py-3 transform hover:scale-110 transition-all duration-300 backdrop-blur-sm bg-slate-800/30"
              onClick={() => scrollToSection('projects')}
            >
              View My Work
            </Button>
          </div>
          <div className="animate-bounce">
            <ChevronDown className="mx-auto h-6 w-6 text-gray-400 hover:text-blue-400 transition-colors duration-300" />
          </div>
        </div>
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
                <Card className="bg-slate-800/50 backdrop-blur-sm border-slate-700/50 hover:bg-slate-800/70 transition-all duration-300 transform hover:scale-105">
                  <CardContent className="p-4">
                    <p className="text-white font-medium">IBM: AI Engineering Professional Certificate</p>
                  </CardContent>
                </Card>
                <Card className="bg-slate-800/50 backdrop-blur-sm border-slate-700/50 hover:bg-slate-800/70 transition-all duration-300 transform hover:scale-105">
                  <CardContent className="p-4">
                    <p className="text-white font-medium">IBM: Deep Learning with PyTorch, Keras, TensorFlow</p>
                  </CardContent>
                </Card>
                <Card className="bg-slate-800/50 backdrop-blur-sm border-slate-700/50 hover:bg-slate-800/70 transition-all duration-300 transform hover:scale-105">
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
          <h2 className="text-4xl font-bold text-center mb-12 scroll-animate opacity-0 translate-y-8 transition-all duration-1000">
            Skills & <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">Expertise</span>
          </h2>
          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {skills.map((skill, index) => (
              <div key={skill.name} className="space-y-2 scroll-animate opacity-0 translate-y-8 transition-all duration-1000" style={{ transitionDelay: `${index * 100}ms` }}>
                <div className="flex justify-between">
                  <span className="text-white font-medium">{skill.name}</span>
                  <span className="text-blue-400">{skill.level}%</span>
                </div>
                <Progress value={skill.level} className="h-3 bg-slate-800/50 backdrop-blur-sm overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-blue-600 to-purple-600 transition-all duration-1000 ease-out rounded-full"
                    style={{ width: `${skill.level}%` }}
                  />
                </Progress>
              </div>
            ))}
          </div>
          <div className="mt-12 scroll-animate opacity-0 translate-y-8 transition-all duration-1000 delay-800">
            <h3 className="text-2xl font-semibold text-center mb-6 text-blue-400">Core Competencies</h3>
            <div className="flex flex-wrap justify-center gap-3">
              {['AI Agents', 'NLP', 'Deep Learning', 'RAG', 'ML Deployment', 'Statistics', 'AutoML', 'XAI', 'Data Engineering'].map((comp, index) => (
                <Badge 
                  key={comp} 
                  className="bg-gradient-to-r from-blue-600/80 to-purple-600/80 backdrop-blur-sm text-white px-4 py-2 hover:scale-110 transition-all duration-300"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  {comp}
                </Badge>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Projects Section */}
      <section id="projects" className="py-20 bg-slate-900/30 backdrop-blur-sm">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl font-bold text-center mb-16 scroll-animate opacity-0 translate-y-8 transition-all duration-1000">
            Featured <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">Projects</span>
          </h2>
          <div className="max-w-4xl mx-auto space-y-16">
            {projects.map((project, index) => (
              <div 
                key={index} 
                className={`scroll-animate opacity-0 translate-y-8 transition-all duration-1000 ${
                  index % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'
                } flex flex-col md:flex gap-8 items-center`}
                style={{ transitionDelay: `${index * 200}ms` }}
              >
                <div className="md:w-1/2">
                  <div className="relative overflow-hidden rounded-xl group">
                    <img 
                      src={project.image} 
                      alt={project.title}
                      className="w-full h-64 object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  </div>
                </div>
                <div className="md:w-1/2 space-y-4">
                  <div className="flex items-center gap-3">
                    <h3 className="text-2xl font-bold text-white">{project.title}</h3>
                    <Badge className="bg-blue-600/80 backdrop-blur-sm text-white px-3 py-1">
                      {project.type}
                    </Badge>
                  </div>
                  <p className="text-gray-300 text-lg leading-relaxed">
                    {project.description}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {project.tech.map((tech) => (
                      <Badge 
                        key={tech} 
                        variant="outline" 
                        className="text-blue-400 border-blue-400/50 bg-slate-800/30 backdrop-blur-sm hover:bg-blue-400/20 transition-colors duration-300"
                      >
                        {tech}
                      </Badge>
                    ))}
                  </div>
                  <Button 
                    variant="outline" 
                    className="mt-4 border-blue-400 text-blue-400 hover:bg-blue-400 hover:text-white transform hover:scale-105 transition-all duration-300 backdrop-blur-sm bg-slate-800/30"
                  >
                    <ExternalLink className="mr-2 h-4 w-4" />
                    View Project
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Experience Section */}
      <section id="experience" className="py-20">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl font-bold text-center mb-12 scroll-animate opacity-0 translate-y-8 transition-all duration-1000">
            <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">Experience</span>
          </h2>
          <div className="max-w-2xl mx-auto scroll-animate opacity-0 translate-y-8 transition-all duration-1000 delay-200">
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
                  {socialLinks.map((link, index) => (
                    <a
                      key={link.name}
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-3 bg-slate-800/50 backdrop-blur-sm rounded-full hover:bg-blue-600/80 transition-all duration-300 transform hover:scale-110 hover:rotate-6"
                      style={{ animationDelay: `${index * 100}ms` }}
                    >
                      <link.icon className="h-5 w-5" />
                    </a>
                  ))}
                </div>
              </div>
            </div>
            <div className="scroll-animate opacity-0 translate-y-8 transition-all duration-1000 delay-400">
              <h3 className="text-2xl font-semibold mb-6 text-blue-400">Services</h3>
              <div className="space-y-3">
                {[
                  'AI & ML Model Development',
                  'Natural Language Processing Applications',
                  'Data Automation & Analytics Tools',
                  'AI Copilot and Workflow Agents'
                ].map((service, index) => (
                  <Card 
                    key={service} 
                    className="bg-slate-800/50 backdrop-blur-sm border-slate-700/50 hover:bg-slate-800/70 transition-all duration-300 transform hover:scale-105"
                    style={{ transitionDelay: `${index * 100}ms` }}
                  >
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
      <footer className="py-8 bg-slate-950/80 backdrop-blur-sm border-t border-slate-800/50">
        <div className="container mx-auto px-4 text-center">
          <p className="text-gray-400 hover:text-gray-300 transition-colors duration-300">
            © 2024 Soham Jadhav. All rights reserved. Built with passion for AI and innovation.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
