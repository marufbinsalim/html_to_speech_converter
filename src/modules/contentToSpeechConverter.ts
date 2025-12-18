/**
 * ContentToSpeechConverter Module
 *
 * This module handles conversion of text content to speech with HTML serialization,
 * playback functionality, and audio controls.
 */

export interface SpeechSettings {
  rate: number;
  pitch: number;
  volume: number;
  voice?: SpeechSynthesisVoice;
}

export interface SpeechCallbacks {
  onStart?: () => void;
  onEnd?: () => void;
  onPause?: () => void;
  onResume?: () => void;
  onError?: (error: SpeechSynthesisErrorEvent) => void;
}

export class ContentToSpeechConverter {
  private synthesis: SpeechSynthesis;
  private currentUtterance: SpeechSynthesisUtterance | null = null;
  private isPlaying: boolean = false;
  private isPaused: boolean = false;
  private availableVoices: SpeechSynthesisVoice[] = [];
  private settings: SpeechSettings;
  private callbacks: SpeechCallbacks;

  constructor(settings: Partial<SpeechSettings> = {}, callbacks: SpeechCallbacks = {}) {
    this.synthesis = window.speechSynthesis;
    this.settings = {
      rate: settings.rate || 1,
      pitch: settings.pitch || 1,
      volume: settings.volume || 1,
      voice: settings.voice,
    };
    this.callbacks = callbacks;
    this.loadVoices();
  }

  private loadVoices(): void {
    const loadVoicesList = () => {
      this.availableVoices = this.synthesis.getVoices();
      
      // If no voice is specified, try to set a default English voice
      if (!this.settings.voice && this.availableVoices.length > 0) {
        console.log(this.availableVoices);
        const englishVoice = this.availableVoices.find(voice =>
          voice.lang.startsWith('en')
        ) || this.availableVoices[0];
        this.settings.voice = englishVoice;
      }
    };

    loadVoicesList();
    
    // Some browsers load voices asynchronously
    if (this.synthesis.onvoiceschanged !== undefined) {
      this.synthesis.onvoiceschanged = loadVoicesList;
    }
  }

  /**
   * Extract and clean text from HTML content
   */
  private serializeHtmlToText(html: string): string {
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');
    
    // Remove script and style elements
    const scripts = doc.querySelectorAll('script, style');
    scripts.forEach(script => script.remove());
    
    // Get text content
    let text = doc.body.textContent || '';
    
    // Clean up whitespace
    text = text.replace(/\s+/g, ' ').trim(); 
    
    return text;
  }

  /**
   * Convert HTML content to speech
   */
  convertToSpeech(html: string): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        // Stop any current speech
        this.stopSpeech();
        
        const text = this.serializeHtmlToText(html);
        
        if (!text) {
          reject(new Error('No text content found to convert'));
          return;
        }

        const utterance = new SpeechSynthesisUtterance(text);
        
        // Apply settings
        utterance.rate = this.settings.rate;
        utterance.pitch = this.settings.pitch;
        utterance.volume = this.settings.volume;
        
        if (this.settings.voice) {
          utterance.voice = this.settings.voice;
        }

        // Set up event listeners
        utterance.onstart = () => {
          this.isPlaying = true;
          this.isPaused = false;
          this.callbacks.onStart?.();
        };

        utterance.onend = () => {
          this.isPlaying = false;
          this.isPaused = false;
          this.currentUtterance = null;
          this.callbacks.onEnd?.();
          resolve();
        };

        utterance.onerror = (event) => {
          this.isPlaying = false;
          this.isPaused = false;
          this.currentUtterance = null;
          this.callbacks.onError?.(event);
          reject(new Error(`Speech synthesis error: ${event.error}`));
        };

        utterance.onpause = () => {
          this.isPaused = true;
          this.callbacks.onPause?.();
        };

        utterance.onresume = () => {
          this.isPaused = false;
          this.callbacks.onResume?.();
        };

        this.currentUtterance = utterance;
        this.synthesis.speak(utterance);
        
      } catch (error) {
        reject(error);
      }
    });
  }

  /**
   * Stop current speech
   */
  stopSpeech(): void {
    if (this.synthesis.speaking) {
      this.synthesis.cancel();
    }
    this.isPlaying = false;
    this.isPaused = false;
    this.currentUtterance = null;
  }

  /**
   * Pause current speech
   */
  pauseSpeech(): void {
    if (this.synthesis.speaking && !this.synthesis.paused) {
      this.synthesis.pause();
    }
  }

  /**
   * Resume paused speech
   */
  resumeSpeech(): void {
    if (this.synthesis.paused) {
      this.synthesis.resume();
    }
  }

  /**
   * Update speech settings and callbacks
   */
  updateSettings(settings: Partial<SpeechSettings>, callbacks?: SpeechCallbacks): void {
    this.settings = { ...this.settings, ...settings };
    if (callbacks) {
      this.callbacks = { ...this.callbacks, ...callbacks };
    }
  }

  /**
   * Get available voices
   */
  getAvailableVoices(): SpeechSynthesisVoice[] {
    return this.availableVoices;
  }

  /**
   * Get current settings
   */
  getSettings(): SpeechSettings {
    return { ...this.settings };
  }

  /**
   * Get playback status
   */
  getStatus() {
    return {
      isPlaying: this.isPlaying,
      isPaused: this.isPaused,
      isSupported: 'speechSynthesis' in window,
    };
  }

  /**
   * Check if speech synthesis is supported
   */
  static isSupported(): boolean {
    return 'speechSynthesis' in window;
  }
}

// Export a default instance for convenience
export const contentToSpeechConverter = new ContentToSpeechConverter();