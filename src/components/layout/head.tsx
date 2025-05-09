import { useEffect, useState, useRef } from 'react';
import { Play, Pause, SkipForward, SkipBack, Volume2, VolumeX } from 'lucide-react';

export function HeadLayout() {
  const [time, setTime] = useState<string>(new Date().toLocaleTimeString());
  const [date, setDate] = useState<string>(new Date().toLocaleDateString('pt-BR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long'
  }));
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [currentSong, setCurrentSong] = useState<number>(0);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [volume, setVolume] = useState<number>(0.5);
  const [progress, setProgress] = useState<number>(0);
  const [duration, setDuration] = useState<number>(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const playlist = [
    { title: "Música 1", artist: "Artista 1", path: "/music/song1.mp3" },
    { title: "Música 2", artist: "Artista 2", path: "/music/song2.mp3" },
    { title: "Música 3", artist: "Artista 3", path: "/music/song3.mp3" },
  ];

  const formatTime = (time: number): string => {
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

  useEffect(() => {
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

  const togglePlay = () => setIsPlaying(prev => !prev);
  const toggleMute = () => setIsMuted(prev => !prev);
  
  const nextSong = () => {
    setCurrentSong(prev => (prev < playlist.length - 1 ? prev + 1 : 0));
  };
  
  const prevSong = () => {
    setCurrentSong(prev => (prev > 0 ? prev - 1 : playlist.length - 1));
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
    if (newVolume > 0 && isMuted) {
      setIsMuted(false);
    }
  };

  const handleProgressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newProgress = parseFloat(e.target.value);
    setProgress(newProgress);
    if (audioRef.current) {
      audioRef.current.currentTime = newProgress;
    }
  };

  return (
    <div className="relative w-screen h-screen bg-cover bg-center flex flex-col items-center justify-center text-white bg-[url(bg_img_peace.jpg)]">
      <div className="absolute inset-0 bg-black/60" />

      <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-20 overflow-hidden">
        <div className="flex items-center px-3 py-2 bg-white/10 backdrop-blur-md rounded-full shadow-lg border border-white/20 w-72 transition-all duration-300">
          <div className="flex items-center space-x-2">
            <button
              onClick={prevSong}
              className="text-gray-300 hover:text-white p-1"
            >
              <SkipBack size={16} />
            </button>
            
            <button
              onClick={togglePlay}
              className="bg-indigo-600 hover:bg-indigo-700 text-white p-1.5 rounded-full"
            >
              {isPlaying ? <Pause size={12} /> : <Play size={12} className="ml-0.5" />}
            </button>
            
            <button
              onClick={nextSong}
              className="text-gray-300 hover:text-white p-1"
            >
              <SkipForward size={16} />
            </button>
          </div>
          
          <div className="mx-2 flex-1">
            <div className="text-xs truncate font-medium">
              {playlist[currentSong].title} - {playlist[currentSong].artist}
            </div>
            <div className="flex items-center space-x-1 mt-1">
              <span className="text-xs">{formatTime(progress)}</span>
              <div className="flex-1 mx-1">
                <input
                  type="range"
                  min="0"
                  max={duration || 1}
                  value={progress}
                  onChange={handleProgressChange}
                  className="w-full h-1 bg-gray-600 rounded-full appearance-none cursor-pointer accent-indigo-500"
                />
              </div>
              <span className="text-xs overflow-hidden">{formatTime(duration)}</span>
            </div>
          </div>
          
          <div className="flex items-center">
            <button
              onClick={toggleMute}
              className="text-gray-300 hover:text-white"
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
              className="w-10 h-1 ml-1 bg-gray-600 rounded-lg appearance-none cursor-pointer"
            />
          </div>
        </div>
      </div>

      <audio ref={audioRef} />

      <div className="relative z-10 text-center">
        <h1 className="text-7xl font-extrabold font-[Poppins] drop-shadow-lg">
          {time}
        </h1>
        <p className="mt-1 text-xl font-medium text-indigo-200 capitalize">
          {date}
        </p>
        <div className="mt-8 px-6 py-4 bg-black/40 backdrop-blur-sm rounded-xl transition-all duration-300 hover:bg-black/60">
          <p className="text-2xl font-mono bg-gradient-to-r from-indigo-400 to-purple-500 bg-clip-text text-transparent">
            Bem-Vindo ao meu Portfólio
          </p>
          <p className="mt-2 text-gray-300">
            Explore meus projetos enquanto curte uma boa música
          </p>
        </div>
      </div>
    </div>
  );
}