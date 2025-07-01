import { action } from "./_generated/server";
import { v } from "convex/values";
import OpenAI from "openai";
import { SpeechCreateParams } from "openai/resources/audio/speech.mjs";
const openai= new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,})
export const generateAudioAction = action({
  args: { input: v.string(), voice: v.string() },
  handler: async(_, {voice, input}) => {
    const mp3 = await openai.audio.speech.create({
        model: "gpt-4o-mini-tts",
        voice: voice as SpeechCreateParams['voice'],
        input: input,
      });
      const buffer = await mp3.arrayBuffer();
    return buffer;
  },
});
export const generateThumbnailAction = action({
    args: { prompt: v.string()},
    handler: async(_, {prompt})=>{
        if (!prompt || prompt.trim().length < 10) {
            throw new Error("Prompt must be at least 10 characters.");
          }
      
          console.log("🧠 Prompt sent to OpenAI:", prompt);
        try{

            const response =await openai.images.generate({
                model:'dall-e-3',
                prompt,
                size:'1024x1024',
                quality: 'standard',
            })
            if (!response.data || response.data.length === 0) {
                throw new Error("OpenAI did not return any image data.");
              }
            const url = response.data[0].url;
            if(!url){
                throw new Error('Error generating thumbnail'); 
            }
            const imageResponse = await fetch(url);
            const buffer = await imageResponse.arrayBuffer();
            return buffer;
        }
        catch(error:any){
            console.log(error); 
            throw new Error('Error generating thumbnail'+(error?.message ||'Unknown error'));
        }
    }
});
