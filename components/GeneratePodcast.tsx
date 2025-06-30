import { GeneratePodcastProps } from '@/types'
import React, { useState } from 'react'
import { Label } from './ui/label'
import { Textarea } from './ui/textarea'
import { Button } from './ui/button'
import { Loader } from 'lucide-react'
import { set } from 'react-hook-form'
import { useAction, useMutation } from 'convex/react'
import { api } from '@/convex/_generated/api'
import {v4 as uuidv4} from 'uuid'
import { useUploadFiles } from '@xixixao/uploadstuff/react'

const useGeneratePodcast = ({setAudio,voiceType, voicePrompt,setAudioStorageId}:GeneratePodcastProps) => {
    const [isGenerating, setIsGenerating] = useState(false);

    const generateUploadUrl = useMutation(api.files.generateUploadUrl);

    const {startUpload} = useUploadFiles(generateUploadUrl);

    const getAudioUrl = useMutation(api.podcast.getUrl);

    const getPodcastAudio = useAction(api.openai.generateAudioAction);
    const generatePodcast = async () => {
        setIsGenerating(true);
        setAudio('');
        if(!voicePrompt){
            setIsGenerating(false);
        }
        try{
            const response = await getPodcastAudio({
                voice: voiceType,
                input: voicePrompt
            })

            const blob = new Blob([response], { type: 'audio/mpeg' });
            const fileName = `podcast-${uuidv4()}.mp3`;
            const file = new File([blob],fileName,{type: 'sudio/mpeg'});
            const uploaded = await startUpload([file]);
            const storageId = (uploaded[0].response as any).id;
            setAudioStorageId(storageId);
            const audioUrl = await getAudioUrl({storageId});
            setAudio(audioUrl!);
            setIsGenerating(false);
        }
        catch(error){
            console.log('Error generating podcast',error);
            setIsGenerating(false);
        }
    }
    return {
        isGenerating,
        generatePodcast
    }
}

const GeneratePodcast = (props:GeneratePodcastProps) => {
        const {isGenerating, generatePodcast} = useGeneratePodcast(props);
  return (
    <div>
        <div className='flex flex-col gap-2.5'>
            <Label className='text-16 font-bold text-white-1'>
                AI Prompt to Generate Podcast
            </Label>
            <Textarea className='input-class font-light focus-visible:ring-offset-orange-1'
            placeholder='Enter a prompt to generate a podcast'
            rows={5}
            value={props.voicePrompt}
            onChange={(e)=>props.setVoicePrompt(e.target.value)}></Textarea>
        </div>
        <div className='mt-5 w-full max-w-[200px]'>
        <Button type="submit" 
        className='text-16  bg-orange-1 py-4 font-bold text-white-1'>
          {isGenerating?(<>
          
          Generating<Loader size={20} className='animate-spin'></Loader></>)
          :('Generate podcast')}</Button>
        </div>
        {props.audio && (
          <audio controls 
          src={props.audio}
          autoPlay
          className='mt-5'
          onLoadedMetadata={(e)=>props.setAudioDuration(e.currentTarget.duration)} />
        )}
    </div>
  )
}

export default GeneratePodcast