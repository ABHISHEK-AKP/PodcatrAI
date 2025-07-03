"use client"
import React, { useState } from 'react'

 
import { zodResolver } from "@hookform/resolvers/zod"
import { set, useForm } from "react-hook-form"
import { z } from "zod"
 
import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils'
import { Textarea } from '@/components/ui/textarea'
import GeneratePodcast from '@/components/GeneratePodcast'
import GenerateThumbnail from '@/components/GenerateThumbnail'
import { Loader } from 'lucide-react'
import { toast } from 'sonner'
import { useMutation } from 'convex/react'
import { api } from '@/convex/_generated/api'
import { Id } from '@/convex/_generated/dataModel'
import { useRouter } from 'next/navigation'

const CreatePodcast = () => {
  const router=useRouter();
  const voiceCategories=['alloy','shimmer','nova','echo','fable','onyx'];
  const [imageStorageId, setImageStorageId] = useState<Id<"_storage"> | null>(null);
  const [imagePrompt, setImagePrompt] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  
  const [audioStorageId, setAudioStorageId] = useState('');
  const [audioUrl, setAudioUrl] = useState('');
  const [audioDuration, setAudioDuration] = useState(0);
  
  const [voiceType, setVoiceType] = useState<string |null>(null)
  const [voicePrompt, setVoicePrompt] = useState('');
  
  const [isSubmitting, setIsSubmitting]=useState(false);

  const createPodcast = useMutation(api.podcast.createPodcast);
  const formSchema = z.object({
    podcastTitle: z.string().min(2),
    podcastDescription: z.string().min(2),
  })

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      podcastTitle: "",
      podcastDescription: "",
    },
  })
  async function onSubmit(data: z.infer<typeof formSchema>) {
    try {
      setIsSubmitting(true);
      if(!audioUrl || !imageUrl || !voiceType){
        toast("Please generate audio and thumbnail");
        setIsSubmitting(false);
        throw new Error("Please generate audio and thumbnail");
      }
      await createPodcast({
        podcastTitle : data.podcastTitle,
        podcastDescription : data.podcastDescription,
        audioURL:audioUrl,
        imageURL:imageUrl,
        voiceType,
        imagePrompt,
        voicePrompt,
        views:0,
        audioDuration,
        audioStorageId,
        imageStorageId
      }) 
      toast.success("Podcast created successfully");
      setIsSubmitting(false);
      router.push("/");
    } catch (error) {
      console.log(error);
      toast.error("Error submitting podcast");
      setIsSubmitting(false);
    }
  }
  return (
    <section className='flex flex-col mt-10'>
      <h1 className='text-20 font-bold text-white-1'>Create Podcast</h1>
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="mt-12 flex w-full flex-col">
        <div className="flex flex-col gap-[30px] border-b border-black-5 pb-10">
        <FormField
          control={form.control}
          name="podcastTitle"
          render={({ field }) => (
            <FormItem className='flex flex-col gap-2.5'>
              <FormLabel className='text-16 font-boold text-white-1'>Title</FormLabel>
              <FormControl>
                <Input className="input-class focus-visible:ring-offset-orange-1" placeholder="Abhishek's Podcast" {...field} />
              </FormControl>
              <FormMessage className='text-white-1'/>
            </FormItem>
          )}
        />
        <div className="flex flex-col gap-2.5">
          <Label className='text-16 font-bold text-white-1'>
            Select Ai Voice
          </Label>
          <Select onValueChange={(value) => setVoiceType(value)}>
  <SelectTrigger className={cn('text-16 w-full border-none bg-black-1 text-gray-1 focus:ring-offset-orange-1')}>
    <SelectValue placeholder="Select Ai Voice" className='placeholder:text-gray-1' />
  </SelectTrigger>
  <SelectContent className='text-16 border-none bg-black-1 font-bold text-white-1 focus:ring-offset-orange-1'>
    {voiceCategories.map((category) => (
      <SelectItem key={category} value={category} className='capitalize focus:bg-orange-1'>
        {category}
      </SelectItem>
    ))}
  </SelectContent>
  {voiceType && (
        <audio 
        src={`/${voiceType}.mp3`}
        autoPlay
        className='hidden'/>
      )}
</Select>
        </div>
        <FormField
          control={form.control}
          name="podcastDescription"
          render={({ field }) => (
            <FormItem className='flex flex-col gap-2.5'>
              <FormLabel className='text-16 font-boold text-white-1'>Description</FormLabel>
              <FormControl>
                <Textarea className="input-class focus-visible:ring-offset-orange-1" placeholder="Write a short podcast" {...field} />
              </FormControl>
              <FormMessage className='text-white-1'/>
            </FormItem>
          )}
        />
        </div>
        <div className="flex flex-col pt-10">
          <GeneratePodcast
          setAudioStorageId={setAudioStorageId}
          setAudio={setAudioUrl}
          voiceType={voiceType!}
          audio={audioUrl}
          voicePrompt={voicePrompt}
          setVoicePrompt={setVoicePrompt}
          setAudioDuration={setAudioDuration}
          />
          <GenerateThumbnail
          setImage = {setImageUrl}
          setImageStorageId={setImageStorageId}
          image={imageUrl}
          imagePrompt={imagePrompt}
          setImagePrompt={setImagePrompt}/>
          </div>
          <div className='mt-10 w-full'>
        <Button type="submit" className='text-16 w-full bg-orange-1 py-4 font-extrabold text-white-1 transition-all durartion-500 hover:bg-black-1'>
          {isSubmitting?(<>
          
          Submitting<Loader size={20} className='animate-spin'></Loader></>)
          :('Submit & Publish podcast')}</Button>
        </div>
      </form>
    </Form>
    </section>
  )
}

export default CreatePodcast