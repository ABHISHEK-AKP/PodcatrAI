import React, { use, useRef, useState } from 'react'
import { Button } from './ui/button'
import { cn } from '@/lib/utils';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { GenerateThumbnailProps } from '@/types';
import { Loader } from 'lucide-react';
import { Input } from './ui/input';
import Image from 'next/image';
import { toast } from "sonner"
import { useAction, useMutation } from 'convex/react';
import { useUploadFiles } from '@xixixao/uploadstuff/react';
import { api } from '@/convex/_generated/api';
import { v4 as uuidv4 } from 'uuid';

const GenerateThumbnail = ({setImage, setImageStorageId, image, imagePrompt, setImagePrompt}: GenerateThumbnailProps) => {
  const [isAIThumbnail, setIsAIThumbnail] = useState(false);
  const [isImageLoading, setIsImageLoading] = useState(false)
  const generateUploadUrl = useMutation(api.files.generateUploadUrl);
  const {startUpload} = useUploadFiles(generateUploadUrl);
  const getImageUrl = useMutation(api.podcast.getUrl);
  const handleGenerateThumbnail = useAction(api.openai.generateThumbnailAction);
  
  const generateImage = async () => {
    try{
      const response = await handleGenerateThumbnail({prompt: imagePrompt});
      const blob = new Blob([response], { type: 'image/png' });
      handleImage(blob, `thumbnail-${uuidv4()}.png`);
    }
    catch(error){
      console.log(error);
      toast.error("Error generating image");
    }
  }
  const handleImage = async (blob: Blob, fileName: string) => {
    setIsImageLoading(true);
    setImage('');
    try{
      const file = new File([blob],fileName,{type: 'image/png'});
      const uploaded = await startUpload([file]);
      console.log("Uploaded result:", uploaded);
      const uploadedFile = uploaded?.[0]?.response as any;
      if (!uploadedFile?.storageId) {
        throw new Error("Upload failed, no storageId returned.");
      }
      const storageId = uploadedFile.storageId;
      setImageStorageId(storageId);
      const imageUrl = await getImageUrl({storageId});
      setImage(imageUrl!);
      setIsImageLoading(false);
      toast.success("Thumbnail generated successfully");
    }catch(error){
      console.log(error);
      toast.error("Error generating image");
    }
  }
  const uploadImage = async (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    try{
      const files = e.target.files;
      if(!files) return;
      const file = files[0];
      const blob = await file.arrayBuffer()
      .then((ab)=> new Blob([ab]));
      handleImage(blob, file.name);
    }
    catch(error){
      console.log(error);
      toast.error("Error uploading image");
    }
  }

  const imageRef = useRef<HTMLImageElement>(null);
  return (
    <>
    <div className='generate-thumbnail'>
      <Button type='button'
      variant='plain'
      className={cn('',{'bg-black':isAIThumbnail})}
      onClick={()=>setIsAIThumbnail(true)}>Use AI to generate thumbnail</Button>
      <Button type='button'
      variant='plain'
      className={cn('',{'bg-black':!isAIThumbnail})}
      onClick={()=>setIsAIThumbnail(false)}>Upload custom image</Button>
    </div>
    {isAIThumbnail ?(<div className='flex flex-col gap-5'>
      <div className='mt-5flex flex-col gap-2.5'>
            <Label className='text-16 font-bold text-white-1'>
                AI Prompt to Generate Thumbnail
            </Label>
            <Textarea className='input-class font-light focus-visible:ring-offset-orange-1'
            placeholder='Provide text to generate a thumbnail'
            rows={5}
            value={imagePrompt}
            onChange={(e)=>setImagePrompt(e.target.value)}></Textarea>
        </div>
        <div className='mt-5 w-full max-w-[200px]'>
        <Button type="submit" 
        className='text-16  bg-orange-1 py-4 font-bold text-white-1'
        onClick={generateImage}>
          {isImageLoading?(<>
          
          Generating<Loader size={20} className='animate-spin'></Loader></>)
          :('Generate thumbnail')}</Button>
        </div>
    </div>):
    (<div className='image_div' onClick={()=>imageRef?.current?.click()}>
    <Input
    type='file'className='hidden'
    ref={imageRef}
    onChange={
      (e)=>uploadImage(e)
    }/> 
    {!isImageLoading?(<Image
    src="/icons/upload-image.svg"
    width={40} height={40}
    alt="upload image"/>)
    :(<div className='text-16 flex-center font-medium text-white-1'>
       Uploading<Loader size={20} className='animate-spin'></Loader>
       </div>
      )}
      <div  className='flex flex-col items-center gap-1'>
        <h2 className='text-12 font-bold text-orange-1'>
          Click to upload
        </h2>
        <p className='text-12 font-normal text-gray-1'>SVG, PNG, JPG or GIF (max 1080px x 1080px)</p>
      </div>
    </div>)}
    {image && (
      <div className='flex-center w-full'>
        <Image 
        src ={image}
        width={200} height={200}
        className='mt-5'
        alt="thumbnail"/>
      </div>
    )}
    </>
  )
}

export default GenerateThumbnail