"use client"
import React, { useState } from 'react'

 
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
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
const formSchema = z.object({
  username: z.string().min(2, {
    message: "Username must be at least 2 characters.",
  }),
})

const CreatePodcast = () => {
  const voiceCategories=['alloy','shimmer','nova','echo','fable','onyx'];
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      username: "",
    },
  })
  const [voiceType, setVoiceType] = useState<string |null>(null)
  function onSubmit(values: z.infer<typeof formSchema>) {
    // Do something with the form values.
    // ✅ This will be type-safe and validated.
    console.log(values)
  }
  return (
    <section className='flex flex-col mt-10'>
      <h1 className='text-20 font-bold text-white-1'>Create Podcast</h1>
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="mt-12 flex w-full flex-col">
        <div className="flex flex-col gap-[30px] border-b border-black-5 pb-10">
        <FormField
          control={form.control}
          name="podCastTitle"
          render={({ field }) => (
            <FormItem className='flex flex-col gap-2.5'>
              <FormLabel className='text-16 font-boold text-white-1'>Username</FormLabel>
              <FormControl>
                <Input className="input-class focus-visible:ring-orange-1" placeholder="Abhishek's Podcast" {...field} />
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
  <SelectTrigger className={cn('text-16 w-full border-none bg-black-1 text-gray-1')}>
    <SelectValue placeholder="Select Ai Voice" className='placeholder:text-gray-1' />
  </SelectTrigger>
  <SelectContent className='text-16 border-none bg-black-1 font-bold text-white-1 focus:ring-orange-1'>
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
        </div>
        <Button type="submit">Submit</Button>
      </form>
    </Form>
    </section>
  )
}

export default CreatePodcast