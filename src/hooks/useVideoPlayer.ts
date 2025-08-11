import { useState, useRef, useEffect, useCallback } from "react"
import Hls from "hls.js"
import { Channel } from "@/types/iptv"

export const useVideoPlayer = () => {
  const [isLoading, setIsLoading] = useState(false)
  const [isTvOn, setIsTvOn] = useState(false)
  const [volume, setVolume] = useState(0.5)
  const [isMuted, setIsMuted] = useState(false)
  const [videoError, setVideoError] = useState<string | null>(null)
  const [videoReady, setVideoReady] = useState(false)
  
  const videoRef = useRef<HTMLVideoElement>(null)
  const hlsRef = useRef<Hls | null>(null)

  const destroyHls = useCallback(() => {
    if (hlsRef.current) {
      hlsRef.current.destroy()
      hlsRef.current = null
    }
  }, [])

  const handleVideoLoad = useCallback(() => {
    setIsLoading(false)
    if (videoRef.current) {
      videoRef.current.volume = volume
      videoRef.current.muted = isMuted
    }
  }, [volume, isMuted])

  const handleVideoCanPlay = useCallback(() => {
    setIsLoading(false)
  }, [])

  const handleVideoError = useCallback((error: Event) => {
    console.error("Video error:", error)
    setIsLoading(false)
    
    const video = videoRef.current
    if (video) {
      console.error("Video error details:", {
        error: video.error,
        networkState: video.networkState,
        readyState: video.readyState,
        src: video.src
      })
      
      if (video.error) {
        switch (video.error.code) {
          case 1:
            setVideoError("Video loading aborted")
            break
          case 2:
            setVideoError("Network error - check your connection")
            break
          case 3:
            setVideoError("Video decoding failed")
            break
          case 4:
            setVideoError("Video not supported")
            break
          default:
            setVideoError("Video playback error")
        }
      } else {
        setVideoError("Unable to load video stream")
      }
    }
  }, [])

  const playChannel = useCallback(async (channel: Channel) => {
    setIsLoading(true)
    setVideoError(null)

    const video = videoRef.current
    if (!video) {
      console.error("Video element not found")
      setVideoError("Video player not available")
      setIsLoading(false)
      return
    }

    destroyHls()

    video.pause()
    video.currentTime = 0
    video.src = ""

    const isHlsStream = channel.url.includes('.m3u8') || channel.url.includes('application/x-mpegURL')
    
    if (isHlsStream && Hls.isSupported()) {
      try {
        const hls = new Hls({
          debug: false,
          enableWorker: true,
          lowLatencyMode: true,
          backBufferLength: 90
        })
        
        hlsRef.current = hls
        
        hls.loadSource(channel.url)
        hls.attachMedia(video)
        
        hls.on(Hls.Events.MANIFEST_PARSED, () => {
          console.log("HLS manifest parsed, attempting to play")
          video.play().catch(error => {
            console.error("HLS autoplay failed:", error)
          })
        })
        
        hls.on(Hls.Events.ERROR, (event, data) => {
          console.error("HLS error:", data)
          if (data.fatal) {
            setVideoError(`HLS Error: ${data.details}`)
            setIsLoading(false)
          }
        })
        
      } catch (error) {
        console.error("HLS initialization failed:", error)
        setVideoError("Failed to initialize HLS player")
        setIsLoading(false)
      }
    } else {
      try {
        video.src = channel.url
        video.load()
        await video.play()
      } catch (error) {
        console.error("Native video play failed:", error)
        setVideoError("Failed to play video stream")
        setIsLoading(false)
      }
    }
  }, [destroyHls])

  const toggleMute = useCallback(() => {
    setIsMuted(!isMuted)
    if (videoRef.current) {
      videoRef.current.muted = !isMuted
    }
  }, [isMuted])

  const handleVolumeChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = Number.parseFloat(e.target.value)
    setVolume(newVolume)
    if (videoRef.current) {
      videoRef.current.volume = newVolume
    }
  }, [])

  const toggleTv = useCallback(() => {
    setIsTvOn(!isTvOn)
  }, [isTvOn])

  const turnOnTv = useCallback(() => {
    setIsTvOn(true)
  }, [])

  useEffect(() => {
    const video = videoRef.current
    if (video) {
      setVideoReady(true)
      console.log("Video element ready")
      
      const logEvent = (eventName: string) => (event?: Event) => {
        console.log(`[Video Event] ${eventName}`, event)
      }

      video.addEventListener("loadeddata", handleVideoLoad)
      video.addEventListener("loadeddata", logEvent("loadeddata"))
      video.addEventListener("canplay", handleVideoCanPlay)
      video.addEventListener("canplay", logEvent("canplay"))
      video.addEventListener("error", handleVideoError)
      video.addEventListener("error", logEvent("error"))
      video.addEventListener("loadstart", () => {
        setIsLoading(true)
        console.log("[Video Event] loadstart")
      })
      video.addEventListener("waiting", () => {
        setIsLoading(true)
        console.log("[Video Event] waiting")
      })
      video.addEventListener("playing", () => {
        setIsLoading(false)
        console.log("[Video Event] playing")
      })

      return () => {
        video.removeEventListener("loadeddata", handleVideoLoad)
        video.removeEventListener("loadeddata", logEvent("loadeddata"))
        video.removeEventListener("canplay", handleVideoCanPlay)
        video.removeEventListener("canplay", logEvent("canplay"))
        video.removeEventListener("error", handleVideoError)
        video.removeEventListener("error", logEvent("error"))
        video.removeEventListener("loadstart", () => {
          setIsLoading(true)
          console.log("[Video Event] loadstart")
        })
        video.removeEventListener("waiting", () => {
          setIsLoading(true)
          console.log("[Video Event] waiting")
        })
        video.removeEventListener("playing", () => {
          setIsLoading(false)
          console.log("[Video Event] playing")
        })
        
        destroyHls()
      }
    }
  }, [handleVideoLoad, handleVideoCanPlay, handleVideoError, destroyHls])

  return {
    videoRef,
    isLoading,
    isTvOn,
    isMuted,
    videoError,
    videoReady,
    playChannel,
    toggleMute,
    toggleTv,
    turnOnTv,
    setVideoError
  }
}
