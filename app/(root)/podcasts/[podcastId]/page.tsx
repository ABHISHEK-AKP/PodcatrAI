'use client'
import EmptyState from '@/components/EmptyState';
import LoaderSpinner from '@/components/LoaderSpinner';
import PodcastCard from '@/components/PodcastCard';
import PodCastDetailPlayer from '@/components/PodCastDetailPlayer';
import { api } from '@/convex/_generated/api';
import { Id } from '@/convex/_generated/dataModel';
import { useUser } from '@clerk/nextjs';
import { useQuery } from 'convex/react';
import Image from 'next/image';
import { useParams } from 'next/navigation';
import React from 'react'
import {use} from 'react'

const PodcastDetails = ({params}:{params:{podcastId: Id<'podcasts'>}}) => {
  const {user} = useUser();
  const { podcastId } = use(params);
  const podcast = useQuery(api.podcast.getPodcastById,{podcastId});
  const similarPodcasts = useQuery(api.podcast.getPodcastByVoiceType,{podcastId});
  const isOwner = user?.id === podcast?.authorId;
  if(!similarPodcasts || !podcast) return <LoaderSpinner/>
  return (
    <section className='flex w-full flex-col'>
      <header className='mt-9 flex items-center justify-between'>
        <h1 className='text-20 font-bold text-white-1'>
          Currently Playing
        </h1>
        <figure className='flex gap-3'>
          <Image src="/icons/headphone.svg" alt="headphone" width={24} height={24}/>
          <h2 className='text-16 font-bold text-white-1'>{podcast?.views}</h2>
        </figure>
      </header>
      <PodCastDetailPlayer 
      isOwner={isOwner}
      podcastId={podcast._id}
      audioUrl={podcast?.audioURL}
      imageUrl={podcast?.imageURL}
      podcastTitle={podcast?.podcastTitle}
      authorImageUrl={podcast?.authorImageURL}
      authorId={podcast?.authorId}
      author={podcast?.author}
      imageStorageId={podcast?.imageStorageId}
      audioStorageId={podcast?.audioStorageId}
      />
      <p className='text-white-2 text-16 pb-8 pt-[45px] font-medium max-md:text-center'>{podcast?.podcastDescription}</p>
      <div className='flex flex-col gap-8'>
        <div className='flex flex-col gap-4'>
          <h1 className='text-18 font-bold text-white-1'>Transcription</h1>
          <p className='text-white-2 text-16 font-medium'>{podcast?.voicePrompt}</p>
        </div>
        <div className='flex flex-col gap-4'>
          <h1 className='text-18 font-bold text-white-1'>Thumbnail Prompt</h1>
          <p className='text-white-2 text-16 font-medium'>{podcast?.imagePrompt}</p>
        </div>
      </div>
      <section className='mt-8 flex flex-col gap-5'>
        <h1 className='text-20 font-bold text-white-1'>Similar Podcasts</h1>
        {similarPodcasts && similarPodcasts.length>0?(<div className='podcast_grid'>
        {similarPodcasts?.map(({_id,podcastTitle,podcastDescription,imageURL})=>(
          <PodcastCard 
          key={_id}
          imgUrl={imageURL}
          title={podcastTitle}
          description={podcastDescription}
          podcastId={_id}/>
        ))}
        </div>)
        :(<EmptyState
        title="No Similar Podcasts found"
        buttonLink="/dicover"
        buttonText="Dicover more podcasts"/>)}
      </section>
    </section>
  )
}

export default PodcastDetails;