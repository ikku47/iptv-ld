import React from "react"
import { Button } from "@/components/ui/button"
import { Upload } from "lucide-react"

interface FileUploadProps {
  onFileUpload: (event: React.ChangeEvent<HTMLInputElement>) => void
  onTriggerUpload: () => void
  fileInputRef: React.RefObject<HTMLInputElement>
}

export const FileUpload: React.FC<FileUploadProps> = ({
  onFileUpload,
  onTriggerUpload,
  fileInputRef
}) => {
  return (
    <div className="text-center">
      <input 
        type="file" 
        accept=".m3u,.m3u8" 
        onChange={onFileUpload} 
        ref={fileInputRef} 
        className="hidden" 
      />
      <Button
        onClick={onTriggerUpload}
        className="bg-green-600 hover:bg-green-700 text-white border border-green-500 px-6 py-2 rounded-lg font-mono text-sm transition-all duration-200 hover:shadow-lg hover:shadow-green-500/20"
      >
        <Upload className="w-4 h-4 mr-2" />
        LOAD PLAYLIST.M3U
      </Button>
    </div>
  )
}
