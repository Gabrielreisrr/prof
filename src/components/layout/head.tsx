import { useEffect, useState, useRef } from 'react';
import { Play, Pause, SkipForward, SkipBack, Volume2, VolumeX, Moon, Sun } from 'lucide-react';

export default function HeadLayout() {
  const [time, setTime] = useState(new Date().toLocaleTimeString());
  const [date, setDate] = useState(new Date().toLocaleDateString('pt-BR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long'
  }));
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentSong, setCurrentSong] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState(0.5);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  
  const audioRef = useRef(null);
  const canvasRef = useRef(null);
  const containerRef = useRef(null);
  
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [darkMode, setDarkMode] = useState(false);
  const [particles, setParticles] = useState([]);
  const [isHovering, setIsHovering] = useState(false);

  const playlist = [
    { title: "Música 1", artist: "Artista 1", path: "/music/song1.mp3" },
    { title: "Música 2", artist: "Artista 2", path: "/music/song2.mp3" },
    { title: "Música 3", artist: "Artista 3", path: "/music/song3.mp3" },
  ];

  const formatTime = (time) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };

  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date();
      setTime(now.toLocaleTimeString());
      setDate(now.toLocaleDateString('pt-BR', {
        weekday: 'long',
        day: 'numeric',
        month: 'long'
      }));
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  // Configuração de áudio
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.src = playlist[currentSong].path;
      audioRef.current.volume = volume;
      
      const setAudioData = () => {
        if (audioRef.current) {
          setDuration(audioRef.current.duration);
        }
      };
      
      const updateProgress = () => {
        if (audioRef.current) {
          setProgress(audioRef.current.currentTime);
        }
      };

      const handleEnd = () => {
        if (currentSong < playlist.length - 1) {
          setCurrentSong(prev => prev + 1);
        } else {
          setCurrentSong(0);
        }
      };

      audioRef.current.addEventListener('loadedmetadata', setAudioData);
      audioRef.current.addEventListener('timeupdate', updateProgress);
      audioRef.current.addEventListener('ended', handleEnd);

      return () => {
        if (audioRef.current) {
          audioRef.current.removeEventListener('loadedmetadata', setAudioData);
          audioRef.current.removeEventListener('timeupdate', updateProgress);
          audioRef.current.removeEventListener('ended', handleEnd);
        }
      };
    }
  }, [currentSong]);

=  useEffect(() => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.play();
      } else {
        audioRef.current.pause();
      }
    }
  }, [isPlaying, currentSong]);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = isMuted ? 0 : volume;
    }
  }, [volume, isMuted]);

  useEffect(() => {
    if (!canvasRef.current || !containerRef.current) return;

    const initParticles = () => {
      const newParticles = [];
      for (let i = 0; i < 100; i++) {
        newParticles.push({
          x: Math.random() * window.innerWidth,
          y: Math.random() * window.innerHeight,
          size: Math.random() * 3 + 1,
          color: darkMode ? 
            `rgba(${Math.floor(Math.random() * 90 + 60)}, ${Math.floor(Math.random() * 30 + 20)}, ${Math.floor(Math.random() * 150 + 100)}, 0.8)` : 
            `rgba(${Math.floor(Math.random() * 50 + 20)}, ${Math.floor(Math.random() * 100 + 150)}, ${Math.floor(Math.random() * 100 + 150)}, 0.8)`,
          velocity: {
            x: Math.random() * 2 - 1,
            y: Math.random() * 2 - 1
          }
        });
      }
      setParticles(newParticles);
    };

    initParticles();

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    
    let animationFrameId;
    
    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      particles.forEach((particle, i) => {
        particle.x += particle.velocity.x;
        particle.y += particle.velocity.y;
        
        if (particle.x < 0 || particle.x > canvas.width) {
          particle.velocity.x *= -1;
        }
        if (particle.y < 0 || particle.y > canvas.height) {
          particle.velocity.y *= -1;
        }
        
        if (isHovering) {
          const dx = mousePosition.x - particle.x;
          const dy = mousePosition.y - particle.y;
          const distance = Math.sqrt(dx * dx + dy * dy);
          
          if (distance < 150) {
            particle.velocity.x += dx * 0.001;
            particle.velocity.y += dy * 0.001;
          }
        }
        
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
        ctx.fillStyle = particle.color;
        ctx.fill();
      });
      
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const distance = Math.sqrt(dx * dx + dy * dy);
          
          if (distance < 100) {
            ctx.beginPath();
            ctx.strokeStyle = darkMode ? `rgba(60, 30, 130, ${1 - distance / 100})` : `rgba(30, 80, 130, ${1 - distance / 100})`;
            ctx.lineWidth = 0.5;
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.stroke();
          }
        }
      }
      
      animationFrameId = window.requestAnimationFrame(render);
    };
    
    render();
    
    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    
    // Atualizar posição do mouse
    const handleMouseMove = (e) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };
    
    window.addEventListener('resize', handleResize);
    window.addEventListener('mousemove', handleMouseMove);
    
    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
      window.cancelAnimationFrame(animationFrameId);
    };
  }, [darkMode, mousePosition, isHovering, particles]);

  // Funções de controle do player
  const togglePlay = () => setIsPlaying(prev => !prev);
  const toggleMute = () => setIsMuted(prev => !prev);
  const toggleDarkMode = () => setDarkMode(prev => !prev);
  
  const nextSong = () => {
    setCurrentSong(prev => (prev < playlist.length - 1 ? prev + 1 : 0));
  };
  
  const prevSong = () => {
    setCurrentSong(prev => (prev > 0 ? prev - 1 : playlist.length - 1));
  };

  const handleVolumeChange = (e) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
    if (newVolume > 0 && isMuted) {
      setIsMuted(false);
    }
  };

  const handleProgressChange = (e) => {
    const newProgress = parseFloat(e.target.value);
    setProgress(newProgress);
    if (audioRef.current) {
      audioRef.current.currentTime = newProgress;
    }
  };

  return (
    <div 
      ref={containerRef}
      className={`relative w-screen h-screen overflow-hidden ${darkMode ? 'bg-gray-900' : 'bg-indigo-900'}`}
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
    >
      {/* Canvas para efeitos interativos */}
      <canvas ref={canvasRef} className="absolute inset-0 z-0" />
      
      {/* Controle de tema */}
      <button 
        onClick={toggleDarkMode} 
        className="fixed top-4 right-4 z-30 bg-gray-800/50 hover:bg-gray-700/70 backdrop-blur-md p-2 rounded-full transition-all shadow-lg"
      >
        {darkMode ? <Sun size={20} className="text-yellow-400" /> : <Moon size={20} className="text-indigo-200" />}
      </button>

      {/* Player de música */}
      <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-20 transition-all duration-300">
        <div className={`flex items-center px-3 py-2 ${darkMode ? 'bg-gray-800/40' : 'bg-indigo-800/40'} backdrop-blur-md rounded-full shadow-lg border border-white/20 w-80 hover:w-96 transition-all duration-300`}>
          <div className="flex items-center space-x-2">
            <button
              onClick={prevSong}
              className="text-gray-300 hover:text-white p-1 transition-transform hover:scale-110"
            >
              <SkipBack size={16} />
            </button>
            
            <button
              onClick={togglePlay}
              className={`${darkMode ? 'bg-purple-700 hover:bg-purple-600' : 'bg-indigo-600 hover:bg-indigo-500'} text-white p-2 rounded-full transition-transform hover:scale-110`}
            >
              {isPlaying ? <Pause size={14} /> : <Play size={14} className="ml-0.5" />}
            </button>
            
            <button
              onClick={nextSong}
              className="text-gray-300 hover:text-white p-1 transition-transform hover:scale-110"
            >
              <SkipForward size={16} />
            </button>
          </div>
          
          <div className="mx-2 flex-1">
            <div className={`text-xs truncate font-medium ${darkMode ? 'text-purple-200' : 'text-indigo-100'}`}>
              {playlist[currentSong].title} - {playlist[currentSong].artist}
            </div>
            <div className="flex items-center space-x-1 mt-1">
              <span className="text-xs text-gray-300">{formatTime(progress)}</span>
              <div className="flex-1 mx-1 group">
                <input
                  type="range"
                  min="0"
                  max={duration || 1}
                  value={progress}
                  onChange={handleProgressChange}
                  className={`w-full h-1 rounded-full appearance-none cursor-pointer ${
                    darkMode ? 'bg-gray-600 accent-purple-500' : 'bg-indigo-700 accent-indigo-400'
                  } group-hover:h-2 transition-all`}
                />
              </div>
              <span className="text-xs text-gray-300 overflow-hidden">{formatTime(duration)}</span>
            </div>
          </div>
          
          <div className="flex items-center">
            <button
              onClick={toggleMute}
              className="text-gray-300 hover:text-white transition-transform hover:scale-110"
            >
              {isMuted ? <VolumeX size={16} /> : <Volume2 size={16} />}
            </button>
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={volume}
              onChange={handleVolumeChange}
              className={`w-12 h-1 ml-1 rounded-lg appearance-none cursor-pointer ${
                darkMode ? 'bg-gray-600 accent-purple-500' : 'bg-indigo-700 accent-indigo-400'
              }`}
            />
          </div>
        </div>
      </div>

      <audio ref={audioRef} />

      {/* Conteúdo principal */}
      <div className="relative z-10 h-full flex flex-col items-center justify-center text-center">
        <div 
          className={`transform transition-all duration-500 hover:scale-105 ${isHovering ? 'translate-y-0' : 'translate-y-4'}`}
        >
          <h1 className={`text-8xl font-extrabold font-mono drop-shadow-lg ${
            darkMode ? 'text-purple-200' : 'text-indigo-100'
          }`}>
            {time}
          </h1>
          <p className={`mt-1 text-xl font-medium capitalize ${
            darkMode ? 'text-purple-300' : 'text-indigo-200'
          }`}>
            {date}
          </p>
        </div>
        
        <div 
          className={`mt-16 px-8 py-6 backdrop-blur-md rounded-xl transition-all duration-500 hover:scale-105 ${
            darkMode ? 'bg-gray-800/30 border-l-4 border-purple-500' : 'bg-indigo-800/30 border-l-4 border-indigo-400'
          } max-w-md`}
        >
          <p className={`text-3xl font-bold ${
            darkMode ? 'bg-gradient-to-r from-purple-400 to-pink-500' : 'bg-gradient-to-r from-indigo-400 to-blue-500'
          } bg-clip-text text-transparent`}>
            Bem-Vindo ao meu Portfólio
          </p>
          <p className="mt-3 text-lg text-gray-300">
            Explore meus projetos enquanto curte uma boa música
          </p>
          <div className="mt-6 flex justify-center gap-4">
            <button className={`px-6 py-2 rounded-md font-medium transform transition-all hover:-translate-y-1 hover:shadow-lg ${
              darkMode ? 'bg-purple-600 hover:bg-purple-500 text-white' : 'bg-indigo-600 hover:bg-indigo-500 text-white'
            }`}>
              Projetos
            </button>
            <button className={`px-6 py-2 rounded-md font-medium transform transition-all hover:-translate-y-1 hover:shadow-lg ${
              darkMode ? 'bg-gray-800 hover:bg-gray-700 text-purple-200' : 'bg-indigo-800 hover:bg-indigo-700 text-indigo-200'
            }`}>
              Contato
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}