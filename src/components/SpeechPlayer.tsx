import React, { useState, useEffect } from 'react';
import { ContentToSpeechConverter, type SpeechSettings } from '../modules/contentToSpeechConverter';

interface SpeechPlayerProps {
  content: string;
  className?: string;
}

const SpeechPlayer: React.FC<SpeechPlayerProps> = ({ content, className = '' }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [isSupported, setIsSupported] = useState(false);
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [settings, setSettings] = useState<SpeechSettings>({
    rate: 1,
    pitch: 1,
    volume: 1,
  });
  const [showSettings, setShowSettings] = useState(false);
  const [converter] = useState(() => new ContentToSpeechConverter());

  useEffect(() => {
    // Check if speech synthesis is supported
    setIsSupported(ContentToSpeechConverter.isSupported());

    // Load available voices
    const loadVoices = () => {
      const availableVoices = converter.getAvailableVoices();
      setVoices(availableVoices);
    };

    loadVoices();

    // Set up callbacks
    const callbacks = {
      onStart: () => {
        setIsPlaying(true);
        setIsPaused(false);
      },
      onEnd: () => {
        setIsPlaying(false);
        setIsPaused(false);
      },
      onPause: () => {
        setIsPaused(true);
      },
      onResume: () => {
        setIsPaused(false);
      },
      onError: (error: SpeechSynthesisErrorEvent) => {
        console.error('Speech synthesis error:', error);
        setIsPlaying(false);
        setIsPaused(false);
      },
    };
    converter.updateSettings({}, callbacks);

    // Update settings when they change
    const currentSettings = converter.getSettings();
    setSettings(currentSettings);

    // Handle voices loaded event
    if ('speechSynthesis' in window) {
      window.speechSynthesis.onvoiceschanged = loadVoices;
    }

    return () => {
      if ('speechSynthesis' in window) {
        window.speechSynthesis.onvoiceschanged = null;
      }
    };
  }, [converter]);

  const handlePlay = async () => {
    try {
      await converter.convertToSpeech(content);
    } catch (error) {
      console.error('Error playing speech:', error);
    }
  };

  const handlePause = () => {
    converter.pauseSpeech();
  };

  const handleResume = () => {
    converter.resumeSpeech();
  };

  const handleStop = () => {
    converter.stopSpeech();
    setIsPlaying(false);
    setIsPaused(false);
  };

  const handleSettingChange = (key: keyof SpeechSettings, value: any) => {
    const newSettings = { ...settings, [key]: value };
    setSettings(newSettings);
    converter.updateSettings({ [key]: value });
  };

  const formatVoiceName = (voice: SpeechSynthesisVoice) => {
    return `${voice.name} (${voice.lang})`;
  };

  if (!isSupported) {
    return (
      <div className={`bg-yellow-50 border border-yellow-200 rounded-lg p-4 ${className}`}>
        <p className="text-yellow-800 text-sm">
          🚫 Text-to-speech is not supported in your browser.
        </p>
      </div>
    );
  }

  return (
    <div className={`bg-white border border-gray-200 rounded-lg shadow-sm p-4 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center">
          🎧 Text-to-Speech
        </h3>
        <button
          onClick={() => setShowSettings(!showSettings)}
          className="text-gray-500 hover:text-gray-700 p-1 rounded"
          title="Speech Settings"
        >
          ⚙️
        </button>
      </div>

      {/* Main Controls */}
      <div className="flex items-center space-x-3 mb-4">
        {!isPlaying && !isPaused && (
          <button
            onClick={handlePlay}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition duration-200"
          >
            <span>▶️</span>
            <span>Play</span>
          </button>
        )}

        {isPlaying && !isPaused && (
          <button
            onClick={handlePause}
            className="bg-yellow-600 hover:bg-yellow-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition duration-200"
          >
            <span>⏸️</span>
            <span>Pause</span>
          </button>
        )}

        {isPaused && (
          <button
            onClick={handleResume}
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition duration-200"
          >
            <span>▶️</span>
            <span>Resume</span>
          </button>
        )}

        {(isPlaying || isPaused) && (
          <button
            onClick={handleStop}
            className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition duration-200"
          >
            <span>⏹️</span>
            <span>Stop</span>
          </button>
        )}

        {/* Status Indicator */}
        <div className="flex items-center space-x-2 text-sm text-gray-600">
          {isPlaying && !isPaused && (
            <span className="flex items-center space-x-1">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span>Playing</span>
            </span>
          )}
          {isPaused && (
            <span className="flex items-center space-x-1">
              <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
              <span>Paused</span>
            </span>
          )}
        </div>
      </div>

      {/* Settings Panel */}
      {showSettings && (
        <div className="border-t border-gray-200 pt-4 space-y-4">
          {/* Voice Selection */}
          {voices.length > 0 && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Voice
              </label>
              <select
                value={settings.voice?.name || ''}
                onChange={(e) => {
                  const selectedVoice = voices.find(v => v.name === e.target.value);
                  if (selectedVoice) {
                    handleSettingChange('voice', selectedVoice);
                  }
                }}
                className="w-full p-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {voices.map((voice) => (
                  <option key={voice.name} value={voice.name}>
                    {formatVoiceName(voice)}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Rate Control */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Speed: {settings.rate.toFixed(1)}x
            </label>
            <input
              type="range"
              min="0.5"
              max="2"
              step="0.1"
              value={settings.rate}
              onChange={(e) => handleSettingChange('rate', parseFloat(e.target.value))}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
            />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>Slow</span>
              <span>Normal</span>
              <span>Fast</span>
            </div>
          </div>

          {/* Pitch Control */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Pitch: {settings.pitch.toFixed(1)}
            </label>
            <input
              type="range"
              min="0"
              max="2"
              step="0.1"
              value={settings.pitch}
              onChange={(e) => handleSettingChange('pitch', parseFloat(e.target.value))}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
            />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>Low</span>
              <span>Normal</span>
              <span>High</span>
            </div>
          </div>

          {/* Volume Control */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Volume: {Math.round(settings.volume * 100)}%
            </label>
            <input
              type="range"
              min="0"
              max="1"
              step="0.1"
              value={settings.volume}
              onChange={(e) => handleSettingChange('volume', parseFloat(e.target.value))}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
            />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>Quiet</span>
              <span>Normal</span>
              <span>Loud</span>
            </div>
          </div>
        </div>
      )}

      {/* Info */}
      <div className="mt-4 text-xs text-gray-500">
        <p>
          💡 The system will automatically extract text from HTML and read it aloud.
          Adjust the settings above for the best experience.
        </p>
      </div>

      <style>{`
        .slider::-webkit-slider-thumb {
          appearance: none;
          height: 20px;
          width: 20px;
          border-radius: 50%;
          background: #3b82f6;
          cursor: pointer;
        }

        .slider::-moz-range-thumb {
          height: 20px;
          width: 20px;
          border-radius: 50%;
          background: #3b82f6;
          cursor: pointer;
          border: none;
        }
      `}</style>
    </div>
  );
};

export default SpeechPlayer;